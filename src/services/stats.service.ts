import { supabase } from '../lib/supabase';
import { CerisesService } from './cerises.service';
import { FriendsService } from './friends.service';
import { ChallengesService } from './challenges.service';
import { ShopService } from './shop.service';

// Types and interfaces
export interface UserStats {
  userId: string;
  totalCerises: number;
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  averagePlayTime: number;
  friendsCount: number;
  challengesSent: number;
  challengesReceived: number;
  challengesWon: number;
  challengesLost: number;
  winRate: number;
  shopPurchases: number;
  totalSpent: number;
  favoriteGame: string;
  achievements: Achievement[];
  recentActivity: Activity[];
  weeklyProgress: WeeklyProgress;
  monthlyProgress: MonthlyProgress;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface Activity {
  id: string;
  type: 'GAME_PLAYED' | 'PURCHASE' | 'FRIEND_ADDED' | 'CHALLENGE_SENT' | 'CHALLENGE_WON';
  description: string;
  timestamp: string;
  value?: number;
  gameType?: string;
}

export interface WeeklyProgress {
  week: string;
  gamesPlayed: number;
  score: number;
  cerisesEarned: number;
  challengesWon: number;
  friendsAdded: number;
}

export interface MonthlyProgress {
  month: string;
  gamesPlayed: number;
  score: number;
  cerisesEarned: number;
  challengesWon: number;
  friendsAdded: number;
  shopPurchases: number;
}

export interface GameStats {
  gameType: string;
  totalPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalTime: number;
  averageTime: number;
  winRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  pseudo: string;
  totalScore: number;
  gamesPlayed: number;
  winRate: number;
  avatar?: string;
}

// Constants
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ACHIEVEMENTS_LIMIT = 20;
const ACTIVITY_LIMIT = 50;

// Error messages
const ERROR_MESSAGES = {
  INVALID_USER_ID: 'Invalid user ID',
  GET_STATS_FAILED: 'Failed to get user statistics',
  GET_ACHIEVEMENTS_FAILED: 'Failed to get user achievements',
  GET_ACTIVITY_FAILED: 'Failed to get user activity',
  GET_GAME_STATS_FAILED: 'Failed to get game statistics',
  GET_LEADERBOARD_FAILED: 'Failed to get leaderboard',
  GET_PROGRESS_FAILED: 'Failed to get progress data'
} as const;

export class StatsService {
  private cerisesService: CerisesService;
  private friendsService: FriendsService;
  private challengesService: ChallengesService;
  private shopService: ShopService;

  constructor() {
    this.cerisesService = new CerisesService();
    this.friendsService = new FriendsService();
    this.challengesService = new ChallengesService();
    this.shopService = new ShopService();
  }

  /**
   * Get comprehensive user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    this.validateUserId(userId);

    try {
      // Charger les données de base avec gestion d'erreur individuelle
      const cerisesBalance = await this.cerisesService.getUserCerises(userId).catch(() => 0);
      const friends = await this.friendsService.getFriends(userId).catch(() => [] as any[]);
      const challenges = await this.challengesService.getUserChallenges(userId, 'sent').catch(() => [] as any[]);
      const purchases = await this.shopService.getUserPurchases(userId).catch(() => [] as any[]);
      const gameStats = await this.getGameStats(userId).catch(() => [] as GameStats[]);
      const achievements = await this.getUserAchievements(userId).catch(() => [] as Achievement[]);
      const recentActivity = await this.getUserActivity(userId).catch(() => [] as Activity[]);
      const weeklyProgress = await this.getWeeklyProgress(userId).catch(() => ({
        week: new Date().toISOString(),
        gamesPlayed: 0,
        score: 0,
        cerisesEarned: 0,
        challengesWon: 0,
        friendsAdded: 0
      }));
      const monthlyProgress = await this.getMonthlyProgress(userId).catch(() => ({
        month: new Date().toISOString(),
        gamesPlayed: 0,
        score: 0,
        cerisesEarned: 0,
        challengesWon: 0,
        friendsAdded: 0,
        shopPurchases: 0
      }));

      const totalGamesPlayed = gameStats.reduce((sum, stat) => sum + stat.totalPlayed, 0);
      const totalScore = gameStats.reduce((sum, stat) => sum + stat.totalScore, 0);
      const averageScore = totalGamesPlayed > 0 ? totalScore / totalGamesPlayed : 0;
      const bestScore = Math.max(...gameStats.map(stat => stat.bestScore), 0);
      const totalPlayTime = gameStats.reduce((sum, stat) => sum + stat.totalTime, 0);
      const averagePlayTime = totalGamesPlayed > 0 ? totalPlayTime / totalGamesPlayed : 0;

      const challengesWon = challenges.filter(c => c.status === 'COMPLETED' && c.results?.winner_id === userId).length;
      const challengesLost = challenges.filter(c => c.status === 'COMPLETED' && c.results?.winner_id !== userId).length;
      const winRate = (challengesWon + challengesLost) > 0 ? (challengesWon / (challengesWon + challengesLost)) * 100 : 0;

      // Calculer le total dépensé
      let totalSpent = 0;
      if (Array.isArray(purchases)) {
        for (const purchase of purchases) {
          totalSpent += purchase.item?.price || 0;
        }
      }
      const favoriteGame = this.getFavoriteGame(gameStats);

      return {
        userId,
        totalCerises: cerisesBalance,
        totalGamesPlayed,
        totalScore,
        averageScore,
        bestScore,
        totalPlayTime,
        averagePlayTime,
        friendsCount: friends.length,
        challengesSent: challenges.filter(c => c.challenger_id === userId).length,
        challengesReceived: challenges.filter(c => c.challenged_id === userId).length,
        challengesWon,
        challengesLost,
        winRate,
        shopPurchases: purchases.length,
        totalSpent,
        favoriteGame,
        achievements,
        recentActivity,
        weeklyProgress,
        monthlyProgress
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_STATS_FAILED);
    }
  }

  /**
   * Get game-specific statistics
   */
  async getGameStats(userId: string): Promise<GameStats[]> {
    this.validateUserId(userId);

    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      const gameTypes = ['TOP10', 'GRILLE', 'CLUB'];
      const gameStats: GameStats[] = [];

      for (const gameType of gameTypes) {
        const results = data?.filter(r => r.game_type === gameType) || [];
        
        if (results.length > 0) {
          const totalPlayed = results.length;
          const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
          const averageScore = totalScore / totalPlayed;
          const bestScore = Math.max(...results.map(r => r.score || 0));
          const totalTime = results.reduce((sum, r) => sum + (r.time_taken || 0), 0);
          const averageTime = totalTime / totalPlayed;
          const winRate = results.filter(r => r.won).length / totalPlayed * 100;

          gameStats.push({
            gameType,
            totalPlayed,
            totalScore,
            averageScore,
            bestScore,
            totalTime,
            averageTime,
            winRate
          });
        }
      }

      return gameStats;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_GAME_STATS_FAILED);
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    this.validateUserId(userId);

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .limit(ACHIEVEMENTS_LIMIT);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(item => ({
        id: item.id,
        name: item.achievement?.name || 'Unknown Achievement',
        description: item.achievement?.description || '',
        icon: item.achievement?.icon || '🏆',
        unlockedAt: item.unlocked_at,
        rarity: item.achievement?.rarity || 'COMMON'
      }));
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_ACHIEVEMENTS_FAILED);
    }
  }

  /**
   * Get user activity feed
   */
  async getUserActivity(userId: string): Promise<Activity[]> {
    this.validateUserId(userId);

    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(ACTIVITY_LIMIT);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(item => ({
        id: item.id,
        type: item.type,
        description: item.description,
        timestamp: item.timestamp,
        value: item.value,
        gameType: item.game_type
      }));
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_ACTIVITY_FAILED);
    }
  }

  /**
   * Get weekly progress
   */
  async getWeeklyProgress(userId: string): Promise<WeeklyProgress> {
    this.validateUserId(userId);

    try {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() + 6));

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startOfWeek.toISOString())
        .lte('timestamp', endOfWeek.toISOString());

      if (error) {
        throw new Error(error.message);
      }

      const activities = data || [];
      const week = `${startOfWeek.toISOString().split('T')[0]} to ${endOfWeek.toISOString().split('T')[0]}`;

      return {
        week,
        gamesPlayed: activities.filter(a => a.type === 'GAME_PLAYED').length,
        score: activities.reduce((sum, a) => sum + (a.value || 0), 0),
        cerisesEarned: activities.filter(a => a.type === 'CERISES_EARNED').reduce((sum, a) => sum + (a.value || 0), 0),
        challengesWon: activities.filter(a => a.type === 'CHALLENGE_WON').length,
        friendsAdded: activities.filter(a => a.type === 'FRIEND_ADDED').length
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_PROGRESS_FAILED);
    }
  }

  /**
   * Get monthly progress
   */
  async getMonthlyProgress(userId: string): Promise<MonthlyProgress> {
    this.validateUserId(userId);

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startOfMonth.toISOString())
        .lte('timestamp', endOfMonth.toISOString());

      if (error) {
        throw new Error(error.message);
      }

      const activities = data || [];
      const month = startOfMonth.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });

      return {
        month,
        gamesPlayed: activities.filter(a => a.type === 'GAME_PLAYED').length,
        score: activities.reduce((sum, a) => sum + (a.value || 0), 0),
        cerisesEarned: activities.filter(a => a.type === 'CERISES_EARNED').reduce((sum, a) => sum + (a.value || 0), 0),
        challengesWon: activities.filter(a => a.type === 'CHALLENGE_WON').length,
        friendsAdded: activities.filter(a => a.type === 'FRIEND_ADDED').length,
        shopPurchases: activities.filter(a => a.type === 'PURCHASE').length
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_PROGRESS_FAILED);
    }
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(limit: number = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
    this.validateLimit(limit);

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          pseudo,
          avatar_url,
          total_score,
          games_played,
          win_rate
        `)
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        pseudo: user.pseudo || 'Anonymous',
        totalScore: user.total_score || 0,
        gamesPlayed: user.games_played || 0,
        winRate: user.win_rate || 0,
        avatar: user.avatar_url
      }));
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_LEADERBOARD_FAILED);
    }
  }

  /**
   * Get favorite game from stats
   */
  private getFavoriteGame(gameStats: GameStats[]): string {
    if (gameStats.length === 0) return 'Aucun';
    
    const favorite = gameStats.reduce((prev, current) => 
      current.totalPlayed > prev.totalPlayed ? current : prev
    );
    
    return favorite.gameType;
  }

  /**
   * Validate user ID
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_USER_ID);
    }
  }

  /**
   * Validate limit parameter
   */
  private validateLimit(limit: number): void {
    if (limit < 1 || limit > MAX_LIMIT) {
      throw new Error(`Limit must be between 1 and ${MAX_LIMIT}`);
    }
  }
}

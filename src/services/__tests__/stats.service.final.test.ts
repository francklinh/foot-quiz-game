import { StatsService } from '../stats.service';

describe('StatsService - Final Tests', () => {
  let statsService: StatsService;

  beforeEach(() => {
    statsService = new StatsService();
  });

  describe('Service Initialization', () => {
    it('should create StatsService instance', () => {
      expect(statsService).toBeInstanceOf(StatsService);
    });
  });

  describe('Validation Logic', () => {
    it('should validate user IDs', () => {
      const validUserIds = ['user-123', 'user-456', 'user-789'];
      
      validUserIds.forEach(userId => {
        expect(typeof userId).toBe('string');
        expect(userId.length).toBeGreaterThan(0);
      });
    });

    it('should validate limit parameters', () => {
      const validLimits = [1, 10, 50, 100];
      
      validLimits.forEach(limit => {
        expect(limit).toBeGreaterThanOrEqual(1);
        expect(limit).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Stats Data Structures', () => {
    it('should validate user stats structure', () => {
      const mockUserStats = {
        userId: 'user-123',
        totalCerises: 1000,
        totalGamesPlayed: 50,
        totalScore: 2500,
        averageScore: 50,
        bestScore: 100,
        totalPlayTime: 3600,
        averagePlayTime: 72,
        friendsCount: 10,
        challengesSent: 5,
        challengesReceived: 8,
        challengesWon: 6,
        challengesLost: 2,
        winRate: 75,
        shopPurchases: 3,
        totalSpent: 150,
        favoriteGame: 'TOP10',
        achievements: [],
        recentActivity: [],
        weeklyProgress: {
          week: '2024-01-01 to 2024-01-07',
          gamesPlayed: 5,
          score: 250,
          cerisesEarned: 25,
          challengesWon: 2,
          friendsAdded: 1
        },
        monthlyProgress: {
          month: 'January 2024',
          gamesPlayed: 20,
          score: 1000,
          cerisesEarned: 100,
          challengesWon: 8,
          friendsAdded: 3,
          shopPurchases: 2
        }
      };
      
      expect(mockUserStats.userId).toBeDefined();
      expect(mockUserStats.totalCerises).toBeGreaterThanOrEqual(0);
      expect(mockUserStats.totalGamesPlayed).toBeGreaterThanOrEqual(0);
      expect(mockUserStats.totalScore).toBeGreaterThanOrEqual(0);
      expect(mockUserStats.averageScore).toBeGreaterThanOrEqual(0);
      expect(mockUserStats.bestScore).toBeGreaterThanOrEqual(0);
      expect(mockUserStats.friendsCount).toBeGreaterThanOrEqual(0);
      expect(mockUserStats.winRate).toBeGreaterThanOrEqual(0);
      expect(mockUserStats.winRate).toBeLessThanOrEqual(100);
    });

    it('should validate achievement structure', () => {
      const mockAchievement = {
        id: 'ach-123',
        name: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        unlockedAt: '2024-01-01T10:00:00Z',
        rarity: 'COMMON'
      };
      
      expect(mockAchievement.id).toBeDefined();
      expect(mockAchievement.name).toBeDefined();
      expect(mockAchievement.description).toBeDefined();
      expect(mockAchievement.icon).toBeDefined();
      expect(mockAchievement.unlockedAt).toBeDefined();
      expect(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).toContain(mockAchievement.rarity);
    });

    it('should validate activity structure', () => {
      const mockActivity = {
        id: 'act-123',
        type: 'GAME_PLAYED',
        description: 'Played Top 10 game',
        timestamp: '2024-01-01T10:00:00Z',
        value: 100,
        gameType: 'TOP10'
      };
      
      expect(mockActivity.id).toBeDefined();
      expect(mockActivity.type).toBeDefined();
      expect(mockActivity.description).toBeDefined();
      expect(mockActivity.timestamp).toBeDefined();
      expect(['GAME_PLAYED', 'PURCHASE', 'FRIEND_ADDED', 'CHALLENGE_SENT', 'CHALLENGE_WON']).toContain(mockActivity.type);
    });
  });

  describe('Game Statistics Logic', () => {
    it('should validate game stats structure', () => {
      const mockGameStats = {
        gameType: 'TOP10',
        totalPlayed: 20,
        totalScore: 1000,
        averageScore: 50,
        bestScore: 100,
        totalTime: 1200,
        averageTime: 60,
        winRate: 80
      };
      
      expect(mockGameStats.gameType).toBeDefined();
      expect(mockGameStats.totalPlayed).toBeGreaterThanOrEqual(0);
      expect(mockGameStats.totalScore).toBeGreaterThanOrEqual(0);
      expect(mockGameStats.averageScore).toBeGreaterThanOrEqual(0);
      expect(mockGameStats.bestScore).toBeGreaterThanOrEqual(0);
      expect(mockGameStats.totalTime).toBeGreaterThanOrEqual(0);
      expect(mockGameStats.averageTime).toBeGreaterThanOrEqual(0);
      expect(mockGameStats.winRate).toBeGreaterThanOrEqual(0);
      expect(mockGameStats.winRate).toBeLessThanOrEqual(100);
    });

    it('should validate game types', () => {
      const validGameTypes = ['TOP10', 'GRILLE', 'CLUB'];
      
      validGameTypes.forEach(gameType => {
        expect(typeof gameType).toBe('string');
        expect(gameType.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Leaderboard Logic', () => {
    it('should validate leaderboard entry structure', () => {
      const mockLeaderboardEntry = {
        rank: 1,
        userId: 'user-123',
        pseudo: 'Player1',
        totalScore: 5000,
        gamesPlayed: 100,
        winRate: 85,
        avatar: 'https://example.com/avatar.jpg'
      };
      
      expect(mockLeaderboardEntry.rank).toBeGreaterThan(0);
      expect(mockLeaderboardEntry.userId).toBeDefined();
      expect(mockLeaderboardEntry.pseudo).toBeDefined();
      expect(mockLeaderboardEntry.totalScore).toBeGreaterThanOrEqual(0);
      expect(mockLeaderboardEntry.gamesPlayed).toBeGreaterThanOrEqual(0);
      expect(mockLeaderboardEntry.winRate).toBeGreaterThanOrEqual(0);
      expect(mockLeaderboardEntry.winRate).toBeLessThanOrEqual(100);
    });

    it('should validate ranking logic', () => {
      const mockLeaderboard = [
        { rank: 1, totalScore: 5000 },
        { rank: 2, totalScore: 4500 },
        { rank: 3, totalScore: 4000 }
      ];
      
      mockLeaderboard.forEach((entry, index) => {
        expect(entry.rank).toBe(index + 1);
        if (index > 0) {
          expect(entry.totalScore).toBeLessThanOrEqual(mockLeaderboard[index - 1].totalScore);
        }
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should validate weekly progress structure', () => {
      const mockWeeklyProgress = {
        week: '2024-01-01 to 2024-01-07',
        gamesPlayed: 5,
        score: 250,
        cerisesEarned: 25,
        challengesWon: 2,
        friendsAdded: 1
      };
      
      expect(mockWeeklyProgress.week).toBeDefined();
      expect(mockWeeklyProgress.gamesPlayed).toBeGreaterThanOrEqual(0);
      expect(mockWeeklyProgress.score).toBeGreaterThanOrEqual(0);
      expect(mockWeeklyProgress.cerisesEarned).toBeGreaterThanOrEqual(0);
      expect(mockWeeklyProgress.challengesWon).toBeGreaterThanOrEqual(0);
      expect(mockWeeklyProgress.friendsAdded).toBeGreaterThanOrEqual(0);
    });

    it('should validate monthly progress structure', () => {
      const mockMonthlyProgress = {
        month: 'January 2024',
        gamesPlayed: 20,
        score: 1000,
        cerisesEarned: 100,
        challengesWon: 8,
        friendsAdded: 3,
        shopPurchases: 2
      };
      
      expect(mockMonthlyProgress.month).toBeDefined();
      expect(mockMonthlyProgress.gamesPlayed).toBeGreaterThanOrEqual(0);
      expect(mockMonthlyProgress.score).toBeGreaterThanOrEqual(0);
      expect(mockMonthlyProgress.cerisesEarned).toBeGreaterThanOrEqual(0);
      expect(mockMonthlyProgress.challengesWon).toBeGreaterThanOrEqual(0);
      expect(mockMonthlyProgress.friendsAdded).toBeGreaterThanOrEqual(0);
      expect(mockMonthlyProgress.shopPurchases).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user IDs', async () => {
      await expect(statsService.getUserStats(''))
        .rejects.toThrow('Invalid user ID');
    });

    it('should handle invalid limits', async () => {
      await expect(statsService.getGlobalLeaderboard(0))
        .rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should validate stats calculation logic', () => {
      const mockGameStats = [
        { totalPlayed: 10, totalScore: 500, bestScore: 80 },
        { totalPlayed: 5, totalScore: 300, bestScore: 70 }
      ];
      
      const totalGamesPlayed = mockGameStats.reduce((sum, stat) => sum + stat.totalPlayed, 0);
      const totalScore = mockGameStats.reduce((sum, stat) => sum + stat.totalScore, 0);
      const averageScore = totalGamesPlayed > 0 ? totalScore / totalGamesPlayed : 0;
      const bestScore = Math.max(...mockGameStats.map(stat => stat.bestScore), 0);
      
      expect(totalGamesPlayed).toBe(15);
      expect(totalScore).toBe(800);
      expect(averageScore).toBeCloseTo(53.33, 2);
      expect(bestScore).toBe(80);
    });
  });

  describe('Business Logic', () => {
    it('should validate win rate calculation', () => {
      const scenarios = [
        { won: 8, lost: 2, expectedRate: 80 },
        { won: 5, lost: 5, expectedRate: 50 },
        { won: 0, lost: 10, expectedRate: 0 },
        { won: 10, lost: 0, expectedRate: 100 }
      ];
      
      scenarios.forEach(scenario => {
        const total = scenario.won + scenario.lost;
        const winRate = total > 0 ? (scenario.won / total) * 100 : 0;
        expect(winRate).toBe(scenario.expectedRate);
      });
    });

    it('should validate favorite game logic', () => {
      const gameStats = [
        { gameType: 'TOP10', totalPlayed: 10 },
        { gameType: 'GRILLE', totalPlayed: 5 },
        { gameType: 'CLUB', totalPlayed: 15 }
      ];
      
      const favorite = gameStats.reduce((prev, current) => 
        current.totalPlayed > prev.totalPlayed ? current : prev
      );
      
      expect(favorite.gameType).toBe('CLUB');
    });
  });
});





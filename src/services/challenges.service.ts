import { supabase } from '../lib/supabase';

// Types and interfaces
export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  game_type: GameType;
  
  // Statuts
  status: ChallengeStatus;
  challenger_status: PlayerChallengeStatus;
  challenged_status: PlayerChallengeStatus;
  
  // Scores (directement dans la table)
  challenger_score: number | null;
  challenged_score: number | null;
  challenger_time: number | null;
  challenged_time: number | null;
  winner_id: string | null;
  
  // Métadonnées
  question_id?: string;
  created_at: string;
  completed_at?: string;
  expires_at: string;
  
  // Relations
  challenger?: UserInfo;
  challenged?: UserInfo;
  winner?: UserInfo;
  
  // Résultats (pour compatibilité)
  results?: ChallengeResults;
}

export interface ChallengeResults {
  challenger_score: number;
  challenged_score: number;
  challenger_time?: number;
  challenged_time?: number;
  winner_id: string;
}

export interface ChallengeStats {
  total_challenges: number;
  wins: number;
  losses: number;
  win_rate: number;
  average_score: number;
  best_score: number;
}

export interface ChallengeLeaderboardEntry {
  user_id: string;
  wins: number;
  losses: number;
  win_rate: number;
  total_challenges: number;
  user?: UserInfo;
}

export interface UserInfo {
  id: string;
  pseudo: string;
  email: string;
}

export type GameType = 'TOP10' | 'GRILLE' | 'CLUB';
export type ChallengeStatus = 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled' | 'PENDING' | 'ACCEPTED' | 'COMPLETED';
export type PlayerChallengeStatus = 'pending' | 'active' | 'completed';

// Constants
const MIN_SCORE = 0;
const MAX_SCORE = 100;
const MIN_TIME = 1;
const MAX_TIME = 3600; // 1 hour in seconds
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Error messages
const ERROR_MESSAGES = {
  INVALID_USER_ID: 'Invalid user ID',
  SELF_CHALLENGE: 'Cannot challenge yourself',
  INVALID_GAME_TYPE: 'Invalid game type',
  INVALID_SCORE: 'Invalid score',
  INVALID_TIME: 'Invalid time',
  CHALLENGE_NOT_FOUND: 'Challenge not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  CREATE_CHALLENGE_FAILED: 'Failed to create challenge',
  ACCEPT_CHALLENGE_FAILED: 'Failed to accept challenge',
  REJECT_CHALLENGE_FAILED: 'Failed to reject challenge',
  COMPLETE_CHALLENGE_FAILED: 'Failed to complete challenge',
  GET_CHALLENGES_FAILED: 'Failed to get challenges',
  GET_LEADERBOARD_FAILED: 'Failed to get leaderboard',
  GET_STATS_FAILED: 'Failed to get challenge stats',
  GET_ACTIVE_FAILED: 'Failed to get active challenges',
  CAN_CHALLENGE_FAILED: 'Failed to check if can challenge',
  GET_CHALLENGE_FAILED: 'Failed to get challenge'
} as const;

export class ChallengesService {
  /**
   * Create a new challenge
   */
  async createChallenge(
    challengerId: string,
    challengedId: string,
    gameType: GameType,
    expiresAt: string
  ): Promise<Challenge> {
    this.validateUserId(challengerId);
    this.validateUserId(challengedId);
    this.validateGameType(gameType);
    this.validateDifferentUsers(challengerId, challengedId);

    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: challengerId,
          challenged_id: challengedId,
          game_type: gameType,
          status: 'pending',
          challenger_status: 'pending',
          challenged_status: 'pending',
          expires_at: expiresAt
        })
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.CREATE_CHALLENGE_FAILED);
    }
  }

  /**
   * Accept a challenge
   */
  async acceptChallenge(challengeId: string): Promise<Challenge> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update({
          status: 'ACCEPTED',
          accepted_at: new Date().toISOString()
        })
        .eq('id', challengeId)
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Challenge not found');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error('Failed to accept challenge');
    }
  }

  /**
   * Reject a challenge
   */
  async rejectChallenge(challengeId: string): Promise<Challenge> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update({
          status: 'REJECTED'
        })
        .eq('id', challengeId)
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Challenge not found');
      }

      return data;
    } catch (error) {
      throw new Error('Failed to reject challenge');
    }
  }

  /**
   * Get user challenges (sent or received)
   */
  async getUserChallenges(
    userId: string, 
    type: 'sent' | 'received'
  ): Promise<Challenge[]> {
    try {
      const query = supabase
        .from('challenges')
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .order('created_at', { ascending: false });

      let result;
      if (type === 'sent') {
        result = await query.eq('challenger_id', userId);
      } else {
        result = await query.eq('challenged_id', userId);
      }

      const { data, error } = await result;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get user challenges');
    }
  }

  /**
   * Play a challenge - Record player's score and update status
   */
  async playChallenge(
    challengeId: string,
    playerId: string,
    score: number,
    timeTaken: number
  ): Promise<Challenge> {
    this.validateChallengeId(challengeId);
    this.validateUserId(playerId);
    this.validateScore(score);
    this.validateTime(timeTaken);

    try {
      // 1. Récupérer le défi actuel
      const challenge = await this.getChallengeById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // 2. Vérifier que le joueur participe au défi
      const isChallenger = challenge.challenger_id === playerId;
      const isChallenged = challenge.challenged_id === playerId;
      
      if (!isChallenger && !isChallenged) {
        throw new Error('Player is not part of this challenge');
      }

      // 3. Préparer les données de mise à jour
      const updateData: any = {};
      
      if (isChallenger) {
        updateData.challenger_score = score;
        updateData.challenger_time = timeTaken;
        updateData.challenger_status = 'completed';
      } else {
        updateData.challenged_score = score;
        updateData.challenged_time = timeTaken;
        updateData.challenged_status = 'completed';
      }

      // 4. Déterminer le gagnant si l'autre joueur a déjà joué
      const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
      const otherStatus = isChallenger ? challenge.challenged_status : challenge.challenger_status;
      
      if (otherScore !== null || otherStatus === 'completed') {
        // L'autre joueur a déjà joué
        if (score > (otherScore || 0)) {
          updateData.winner_id = playerId;
        } else if (score < (otherScore || 0)) {
          updateData.winner_id = isChallenger ? challenge.challenged_id : challenge.challenger_id;
        }
        // Égalité : winner_id reste null
        // Le trigger mettra automatiquement status = 'completed'
      }
      // Sinon, le trigger mettra status = 'in_progress'

      // 5. Mettre à jour le défi
      const { data, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challengeId)
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          ),
          winner:users!challenges_winner_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Challenge not found after update');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to play challenge');
    }
  }

  /**
   * Complete a challenge with results (DEPRECATED - Use playChallenge instead)
   * @deprecated Use playChallenge() instead
   */
  async completeChallenge(
    challengeId: string, 
    results: ChallengeResults
  ): Promise<Challenge> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update({
          status: 'completed',
          challenger_score: results.challenger_score,
          challenged_score: results.challenged_score,
          challenger_time: results.challenger_time,
          challenged_time: results.challenged_time,
          winner_id: results.winner_id,
          completed_at: new Date().toISOString()
        })
        .eq('id', challengeId)
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Challenge not found');
      }

      return data;
    } catch (error) {
      throw new Error('Failed to complete challenge');
    }
  }

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(limit: number = 10): Promise<ChallengeLeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('challenge_leaderboard')
        .select(`
          *,
          user:users!challenge_leaderboard_user_id_fkey(
            id,
            pseudo
          )
        `)
        .order('win_rate', { ascending: false })
        .order('wins', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get leaderboard');
    }
  }

  /**
   * Get user challenge statistics
   */
  async getUserChallengeStats(userId: string): Promise<ChallengeStats> {
    try {
      const { data, error } = await supabase
        .from('challenge_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.message !== 'No rows found') {
        throw new Error(error.message);
      }

      if (!data) {
        // Return default stats for new user
        return {
          total_challenges: 0,
          wins: 0,
          losses: 0,
          win_rate: 0,
          average_score: 0,
          best_score: 0
        };
      }

      return data;
    } catch (error) {
      throw new Error('Failed to get challenge stats');
    }
  }

  /**
   * Get active challenges for a user
   */
  async getActiveChallenges(userId: string): Promise<Challenge[]> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get active challenges');
    }
  }

  /**
   * Check if user can challenge another user
   */
  async canChallenge(challengerId: string, challengedId: string): Promise<boolean> {
    try {
      // Check if there's already a pending challenge between these users
      const { data, error } = await supabase
        .from('challenges')
        .select('id')
        .or(`and(challenger_id.eq.${challengerId},challenged_id.eq.${challengedId}),and(challenger_id.eq.${challengedId},challenged_id.eq.${challengerId})`)
        .in('status', ['pending', 'in_progress'])
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      return !data || data.length === 0;
    } catch (error) {
      throw new Error('Failed to check challenge eligibility');
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(challengeId: string): Promise<Challenge | null> {
    this.validateChallengeId(challengeId);
    
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger:users!challenges_challenger_id_fkey(
            id,
            pseudo,
            email
          ),
          challenged:users!challenges_challenged_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .eq('id', challengeId)
        .single();

      if (error) {
        if (error.message === 'No rows found') {
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_CHALLENGE_FAILED);
    }
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
   * Validate challenge ID
   */
  private validateChallengeId(challengeId: string): void {
    if (!challengeId || typeof challengeId !== 'string' || challengeId.trim().length === 0) {
      throw new Error('Invalid challenge ID');
    }
  }

  /**
   * Validate game type
   */
  private validateGameType(gameType: string): void {
    const validGameTypes = ['TOP10', 'GRILLE', 'CLUB'];
    if (!validGameTypes.includes(gameType)) {
      throw new Error(ERROR_MESSAGES.INVALID_GAME_TYPE);
    }
  }

  /**
   * Validate score
   */
  private validateScore(score: number): void {
    if (score < MIN_SCORE || score > MAX_SCORE) {
      throw new Error(ERROR_MESSAGES.INVALID_SCORE);
    }
  }

  /**
   * Validate time
   */
  private validateTime(time: number): void {
    if (time < MIN_TIME || time > MAX_TIME) {
      throw new Error(ERROR_MESSAGES.INVALID_TIME);
    }
  }

  /**
   * Validate different users
   */
  private validateDifferentUsers(userId1: string, userId2: string): void {
    if (userId1 === userId2) {
      throw new Error(ERROR_MESSAGES.SELF_CHALLENGE);
    }
  }

  /**
   * Validate limit parameter
   */
  private validateLimit(limit: number): number {
    if (limit < 1 || limit > MAX_LIMIT) {
      return DEFAULT_LIMIT;
    }
    return limit;
  }

  /**
   * Build challenge query with relations
   */
  private buildChallengeQuery() {
    return supabase
      .from('challenges')
      .select(`
        *,
        challenger:users!challenges_challenger_id_fkey(
          id,
          pseudo,
          email
        ),
        challenged:users!challenges_challenged_id_fkey(
          id,
          pseudo,
          email
        )
      `);
  }
}

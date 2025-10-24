import { supabase } from '../lib/supabase';

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  game_type: 'TOP10' | 'GRILLE' | 'CLUB';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  expires_at: string;
  results?: ChallengeResults;
  challenger?: {
    id: string;
    pseudo: string;
    email: string;
  };
  challenged?: {
    id: string;
    pseudo: string;
    email: string;
  };
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
  user?: {
    id: string;
    pseudo: string;
  };
}

export class ChallengesService {
  /**
   * Create a new challenge
   */
  async createChallenge(
    challengerId: string,
    challengedId: string,
    gameType: 'TOP10' | 'GRILLE' | 'CLUB',
    expiresAt: string
  ): Promise<Challenge> {
    if (challengerId === challengedId) {
      throw new Error('Cannot challenge yourself');
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: challengerId,
          challenged_id: challengedId,
          game_type: gameType,
          status: 'PENDING',
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
      throw new Error('Failed to create challenge');
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
   * Complete a challenge with results
   */
  async completeChallenge(
    challengeId: string, 
    results: ChallengeResults
  ): Promise<Challenge> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update({
          status: 'COMPLETED',
          results,
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
        .in('status', ['PENDING', 'ACCEPTED'])
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
        .in('status', ['PENDING', 'ACCEPTED'])
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
      throw new Error('Failed to get challenge');
    }
  }
}

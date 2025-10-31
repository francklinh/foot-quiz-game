import { supabase } from '../lib/supabase';

// ============================================
// Types et Interfaces
// ============================================

export interface MultiplayerChallenge {
  id: string;
  creator_id: string;
  game_type: GameType;
  status: ChallengeStatus;
  winner_ids: string | null;
  question_id?: string;
  max_participants: number | null;
  min_participants: number;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  
  // Relations
  creator?: UserInfo;
  participants?: ChallengeParticipant[];
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  status: ParticipantStatus;
  score: number | null;
  time_taken: number | null;
  rank: number | null;
  joined_at: string;
  started_at?: string;
  completed_at?: string;
  
  // Relations
  user?: UserInfo;
}

export interface ChallengeDetails {
  challenge_id: string;
  creator_id: string;
  game_type: GameType;
  challenge_status: ChallengeStatus;
  winner_ids: string | null;
  question_id?: string;
  max_participants: number | null;
  min_participants: number;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  total_participants: number;
  completed_count: number;
  active_count: number;
  pending_count: number;
  creator_name: string;
  creator_email: string;
}

export interface UserInfo {
  id: string;
  pseudo: string;
  email: string;
}

export type GameType = 'TOP10' | 'GRILLE' | 'CLUB' | 'COMING_SOON';
export type ChallengeStatus = 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
export type ParticipantStatus = 'pending' | 'active' | 'completed' | 'declined';

// ============================================
// Service
// ============================================

export class MultiplayerChallengesService {
  /**
   * Créer un nouveau défi multi-joueurs
   */
  async createChallenge(
    creatorId: string,
    participantIds: string[],
    gameType: GameType,
    expiresAt: string,
    options?: {
      questionId?: string;
      maxParticipants?: number;
      minParticipants?: number;
    }
  ): Promise<MultiplayerChallenge> {
    if (participantIds.length === 0) {
      throw new Error('At least one participant is required');
    }

    try {
      // 1. Créer le défi
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          creator_id: creatorId,
          game_type: gameType,
          status: 'pending',
          expires_at: expiresAt,
          question_id: options?.questionId,
          max_participants: options?.maxParticipants,
          min_participants: options?.minParticipants || 2
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      // 2. Ajouter le créateur comme participant
      const participantsToAdd = [creatorId, ...participantIds.filter(id => id !== creatorId)];
      
      const participantsData = participantsToAdd.map(userId => ({
        challenge_id: challenge.id,
        user_id: userId,
        status: 'pending' as ParticipantStatus
      }));

      const { error: participantsError } = await supabase
        .from('challenge_participants')
        .insert(participantsData);

      if (participantsError) throw participantsError;

      // 3. Récupérer le défi complet
      return await this.getChallengeById(challenge.id);
    } catch (error) {
      console.error('Failed to create challenge:', error);
      throw new Error('Failed to create challenge');
    }
  }

  /**
   * Récupérer un défi par ID avec tous ses participants
   */
  async getChallengeById(challengeId: string): Promise<MultiplayerChallenge> {
    try {
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:users!challenges_creator_id_fkey(id, pseudo, email)
        `)
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      const { data: participants, error: participantsError } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:users(id, pseudo, email)
        `)
        .eq('challenge_id', challengeId)
        .order('rank', { ascending: true, nullsFirst: false })
        .order('score', { ascending: false });

      if (participantsError) throw participantsError;

      return {
        ...challenge,
        participants: participants || []
      };
    } catch (error) {
      console.error('Failed to get challenge:', error);
      throw new Error('Failed to get challenge');
    }
  }

  /**
   * Enregistrer le score d'un participant
   */
  async playChallenge(
    challengeId: string,
    userId: string,
    score: number,
    timeTaken: number
  ): Promise<ChallengeParticipant> {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .update({
          status: 'completed',
          score: score,
          time_taken: timeTaken,
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString() // On assume qu'il vient de commencer
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .select(`
          *,
          user:users(id, pseudo, email)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to play challenge:', error);
      throw new Error('Failed to play challenge');
    }
  }

  /**
   * Marquer un participant comme actif (en train de jouer)
   */
  async startPlaying(challengeId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to start playing:', error);
      throw new Error('Failed to start playing');
    }
  }

  /**
   * Décliner une invitation à un défi
   */
  async declineChallenge(challengeId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .update({
          status: 'declined'
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to decline challenge:', error);
      throw new Error('Failed to decline challenge');
    }
  }

  /**
   * Récupérer les défis d'un utilisateur
   */
  async getUserChallenges(userId: string, filters?: {
    status?: ChallengeStatus[];
    gameType?: GameType;
    limit?: number;
  }): Promise<MultiplayerChallenge[]> {
    try {
      // Étape 1: Récupérer les IDs des défis où l'utilisateur participe
      const { data: participations, error: participationError } = await supabase
        .from('challenge_participants')
        .select('challenge_id')
        .eq('user_id', userId);

      if (participationError) throw participationError;

      const participantChallengeIds = participations?.map(p => p.challenge_id) || [];

      // Étape 2: Récupérer tous les défis (créés par l'utilisateur OU où il participe)
      let query = supabase
        .from('challenges')
        .select(`
          *,
          creator:users!challenges_creator_id_fkey(id, pseudo, email)
        `)
        .order('created_at', { ascending: false });

      // Filtrer par créateur OU participant
      if (participantChallengeIds.length > 0) {
        query = query.or(`creator_id.eq.${userId},id.in.(${participantChallengeIds.join(',')})`);
      } else {
        // Si aucune participation, seulement les défis créés
        query = query.eq('creator_id', userId);
      }

      if (filters?.status) {
        query = query.in('status', filters.status);
      }

      if (filters?.gameType) {
        query = query.eq('game_type', filters.gameType);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data: challenges, error: challengeError } = await query;

      if (challengeError) throw challengeError;

      // Dédupliquer les défis (au cas où un défi apparaîtrait plusieurs fois)
      const uniqueChallenges = Array.from(
        new Map((challenges || []).map(ch => [ch.id, ch])).values()
      );

      // Étape 3: Pour chaque défi, récupérer les participants
      const challengesWithParticipants = await Promise.all(
        uniqueChallenges.map(async (challenge) => {
          const { data: participants, error: participantsError } = await supabase
            .from('challenge_participants')
            .select(`
              *,
              user:users(id, pseudo, email)
            `)
            .eq('challenge_id', challenge.id)
            .order('rank', { ascending: true, nullsFirst: false })
            .order('score', { ascending: false });

          if (participantsError) {
            console.warn(`Failed to load participants for challenge ${challenge.id}:`, participantsError);
            return { ...challenge, participants: [] };
          }

          return {
            ...challenge,
            participants: participants || []
          };
        })
      );

      return challengesWithParticipants;
    } catch (error) {
      console.error('Failed to get user challenges:', error);
      throw new Error('Failed to get user challenges');
    }
  }

  /**
   * Récupérer les détails agrégés d'un défi
   */
  async getChallengeDetails(challengeId: string): Promise<ChallengeDetails | null> {
    try {
      const { data, error } = await supabase
        .from('challenge_details')
        .select('*')
        .eq('challenge_id', challengeId)
        .single();

      if (error) {
        if (error.message === 'No rows found') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get challenge details:', error);
      throw new Error('Failed to get challenge details');
    }
  }

  /**
   * Ajouter un participant à un défi existant
   */
  async addParticipant(challengeId: string, userId: string): Promise<ChallengeParticipant> {
    try {
      // Vérifier que le défi n'est pas complet
      const challenge = await this.getChallengeById(challengeId);
      
      if (challenge.status !== 'pending') {
        throw new Error('Cannot add participant to a challenge that has already started');
      }

      if (challenge.max_participants && challenge.participants && challenge.participants.length >= challenge.max_participants) {
        throw new Error('Challenge is full');
      }

      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          status: 'pending'
        })
        .select(`
          *,
          user:users(id, pseudo, email)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to add participant:', error);
      throw new Error('Failed to add participant');
    }
  }

  /**
   * Annuler un défi (seulement par le créateur, seulement si pending)
   */
  async cancelChallenge(challengeId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'cancelled' })
        .eq('id', challengeId)
        .eq('creator_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      console.error('Failed to cancel challenge:', error);
      throw new Error('Failed to cancel challenge');
    }
  }

  /**
   * Récupérer le classement d'un défi
   */
  async getChallengeRankings(challengeId: string): Promise<ChallengeParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:users(id, pseudo, email)
        `)
        .eq('challenge_id', challengeId)
        .eq('status', 'completed')
        .order('rank', { ascending: true, nullsFirst: false })
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get rankings:', error);
      throw new Error('Failed to get rankings');
    }
  }

  /**
   * Vérifier si un utilisateur peut jouer à un défi
   */
  async canUserPlay(challengeId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('status')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (error) return false;

      return data.status === 'pending' || data.status === 'active';
    } catch (error) {
      return false;
    }
  }
}



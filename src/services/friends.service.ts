import { supabase } from '../lib/supabase';

// Types and interfaces
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
  accepted_at?: string;
  friend?: UserInfo;
  user?: UserInfo;
}

export interface User {
  id: string;
  pseudo: string;
  email: string;
}

export interface UserInfo {
  id: string;
  pseudo: string;
  email: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type FriendshipType = 'friends' | 'pending' | 'none';

// Constants
const MIN_SEARCH_LENGTH = 1;
const MAX_SEARCH_LENGTH = 50;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Error messages
const ERROR_MESSAGES = {
  INVALID_USER_ID: 'Invalid user ID',
  SELF_FRIEND_REQUEST: 'Cannot send friend request to yourself',
  FRIEND_REQUEST_EXISTS: 'Friend request already exists',
  FRIENDSHIP_NOT_FOUND: 'Friendship not found',
  GET_FRIENDS_FAILED: 'Failed to get friends',
  SEND_REQUEST_FAILED: 'Failed to send friend request',
  ACCEPT_REQUEST_FAILED: 'Failed to accept friend request',
  REJECT_REQUEST_FAILED: 'Failed to reject friend request',
  REMOVE_FRIEND_FAILED: 'Failed to remove friend',
  GET_PENDING_FAILED: 'Failed to get pending requests',
  SEARCH_USERS_FAILED: 'Failed to search users',
  CHECK_FRIENDSHIP_FAILED: 'Failed to check friendship status',
  GET_STATUS_FAILED: 'Failed to get friendship status'
} as const;

export class FriendsService {
  /**
   * Get user's friends list
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      // Récupérer les amitiés où l'utilisateur est l'initiateur (user_id)
      const { data: sentFriendships, error: sentError } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:users!friendships_friend_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (sentError) {
        throw new Error(sentError.message);
      }

      // Récupérer les amitiés où l'utilisateur est le destinataire (friend_id)
      const { data: receivedFriendships, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          *,
          user:users!friendships_user_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (receivedError) {
        throw new Error(receivedError.message);
      }

      // Combiner les deux listes et normaliser les données
      const allFriendships: Friend[] = [
        ...(sentFriendships || []),
        ...(receivedFriendships || []).map(f => ({
          ...f,
          friend: f.user, // Pour les friendships reçues, l'ami est dans 'user'
        }))
      ];

      return allFriendships;
    } catch (error) {
      throw new Error('Failed to get friends');
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friend> {
    this.validateUserId(fromUserId);
    this.validateUserId(toUserId);
    this.validateDifferentUsers(fromUserId, toUserId);

    console.log('📤 Envoi demande d\'ami:', { fromUserId, toUserId });

    try {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: fromUserId,
          friend_id: toUserId,
          status: 'pending'
        })
        .select(`
          *,
          friend:users!friendships_friend_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .single();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          throw new Error(ERROR_MESSAGES.FRIEND_REQUEST_EXISTS);
        }
        throw new Error(error.message);
      }

      console.log('✅ Demande d\'ami envoyée:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur sendFriendRequest:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.SEND_REQUEST_FAILED);
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(friendshipId: string): Promise<Friend> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', friendshipId)
        .select(`
          *,
          friend:users!friendships_friend_id_fkey(
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
        throw new Error('Friendship not found');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error('Failed to accept friend request');
    }
  }

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(friendshipId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error('Failed to reject friend request');
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error('Failed to remove friend');
    }
  }

  /**
   * Get pending friend requests for a user
   */
  async getPendingRequests(userId: string): Promise<Friend[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user:users!friendships_user_id_fkey(
            id,
            pseudo,
            email
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get pending requests');
    }
  }

  /**
   * Search users by pseudo
   */
  async searchUsers(searchQuery: string, limit: number = DEFAULT_LIMIT): Promise<User[]> {
    this.validateSearchQuery(searchQuery);
    const validatedLimit = this.validateLimit(limit);

    try {
      console.log('🔍 Recherche dans la base:', searchQuery);
      
      // Rechercher par pseudo ou email dans la table users
      const { data, error } = await supabase
        .from('users')
        .select('id, pseudo, email')
        .or(`pseudo.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%`)
        .order('pseudo', { ascending: true })
        .limit(validatedLimit);

      if (error) {
        console.error('❌ Erreur recherche:', error);
        throw new Error(error.message);
      }

      console.log('✅ Résultats trouvés:', data?.length || 0, 'utilisateurs');
      return data || [];
    } catch (error) {
      console.error('❌ Erreur searchUsers:', error);
      throw new Error(ERROR_MESSAGES.SEARCH_USERS_FAILED);
    }
  }

  /**
   * Check if two users are friends
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${userId1},friend_id.eq.${userId2}),and(user_id.eq.${userId2},friend_id.eq.${userId1})`)
        .eq('status', 'accepted')
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      return data && data.length > 0;
    } catch (error) {
      throw new Error('Failed to check friendship status');
    }
  }

  /**
   * Get friendship status between two users
   */
  async getFriendshipStatus(userId1: string, userId2: string): Promise<FriendshipType> {
    this.validateUserId(userId1);
    this.validateUserId(userId2);
    
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(user_id.eq.${userId1},friend_id.eq.${userId2}),and(user_id.eq.${userId2},friend_id.eq.${userId1})`)
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return 'none';
      }

      const friendship = data[0];
      if (friendship.status === 'accepted') {
        return 'friends';
      } else if (friendship.status === 'pending') {
        return 'pending';
      }

      return 'none';
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_STATUS_FAILED);
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
   * Validate search query
   */
  private validateSearchQuery(query: string): void {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid search query');
    }
    
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < MIN_SEARCH_LENGTH || trimmedQuery.length > MAX_SEARCH_LENGTH) {
      throw new Error(`Search query must be between ${MIN_SEARCH_LENGTH} and ${MAX_SEARCH_LENGTH} characters`);
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
   * Check if users are the same
   */
  private validateDifferentUsers(userId1: string, userId2: string): void {
    if (userId1 === userId2) {
      throw new Error(ERROR_MESSAGES.SELF_FRIEND_REQUEST);
    }
  }

  /**
   * Build friendship query with relations
   */
  private buildFriendshipQuery() {
    return supabase
      .from('friendships')
      .select(`
        *,
        friend:users!friendships_friend_id_fkey(
          id,
          pseudo,
          email
        ),
        user:users!friendships_user_id_fkey(
          id,
          pseudo,
          email
        )
      `);
  }
}

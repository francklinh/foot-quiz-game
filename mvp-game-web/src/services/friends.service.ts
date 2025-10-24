import { supabase } from '../lib/supabase';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  accepted_at?: string;
  friend?: {
    id: string;
    pseudo: string;
    email: string;
  };
  user?: {
    id: string;
    pseudo: string;
    email: string;
  };
}

export interface User {
  id: string;
  pseudo: string;
  email: string;
}

export class FriendsService {
  /**
   * Get user's friends list
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const { data, error } = await supabase
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
        .eq('status', 'ACCEPTED')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get friends');
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friend> {
    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    try {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: fromUserId,
          friend_id: toUserId,
          status: 'PENDING'
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
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          throw new Error('Friend request already exists');
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw new Error('Failed to send friend request');
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
          status: 'ACCEPTED',
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
        .eq('status', 'PENDING')
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
  async searchUsers(searchQuery: string, limit: number = 10): Promise<User[]> {
    try {
      if (!searchQuery.trim()) {
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, pseudo, email')
        .ilike('pseudo', `%${searchQuery}%`)
        .order('pseudo', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to search users');
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
        .eq('status', 'ACCEPTED')
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
  async getFriendshipStatus(userId1: string, userId2: string): Promise<'FRIENDS' | 'PENDING' | 'NONE'> {
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
        return 'NONE';
      }

      const friendship = data[0];
      if (friendship.status === 'ACCEPTED') {
        return 'FRIENDS';
      } else if (friendship.status === 'PENDING') {
        return 'PENDING';
      }

      return 'NONE';
    } catch (error) {
      throw new Error('Failed to get friendship status');
    }
  }
}

import { FriendsService } from '../friends.service';

// Mock the entire supabase module
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('FriendsService', () => {
  let friendsService: FriendsService;

  beforeEach(() => {
    friendsService = new FriendsService();
    jest.clearAllMocks();
  });

  describe('Get Friends List', () => {
    it('should get user friends list', async () => {
      // Arrange
      const userId = 'user-123';
      const mockFriends = [
        {
          id: 'friend-1',
          user_id: userId,
          friend_id: 'friend-456',
          status: 'ACCEPTED',
          created_at: '2024-01-01T10:00:00Z',
          friend: {
            id: 'friend-456',
            pseudo: 'FriendUser',
            email: 'friend@example.com'
          }
        }
      ];

      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: mockFriends,
        error: null
      });

      // Act
      const result = await friendsService.getFriends(userId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('friendships');
      expect(result).toEqual(mockFriends);
    });

    it('should return empty array if no friends', async () => {
      // Arrange
      const userId = 'user-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: [],
        error: null
      });

      // Act
      const result = await friendsService.getFriends(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 'user-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act & Assert
      await expect(friendsService.getFriends(userId)).rejects.toThrow('Failed to get friends');
    });
  });

  describe('Send Friend Request', () => {
    it('should send friend request successfully', async () => {
      // Arrange
      const fromUserId = 'user-123';
      const toUserId = 'user-456';
      const mockRequest = {
        id: 'request-1',
        user_id: fromUserId,
        friend_id: toUserId,
        status: 'PENDING',
        created_at: '2024-01-01T10:00:00Z'
      };

      const { supabase } = require('../../lib/supabase');
      supabase.from().insert().select().single().mockResolvedValue({
        data: mockRequest,
        error: null
      });

      // Act
      const result = await friendsService.sendFriendRequest(fromUserId, toUserId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('friendships');
      expect(result).toEqual(mockRequest);
    });

    it('should not allow self-friend request', async () => {
      // Arrange
      const userId = 'user-123';

      // Act & Assert
      await expect(friendsService.sendFriendRequest(userId, userId)).rejects.toThrow('Cannot send friend request to yourself');
    });

    it('should handle duplicate friend requests', async () => {
      // Arrange
      const fromUserId = 'user-123';
      const toUserId = 'user-456';
      const { supabase } = require('../../lib/supabase');
      supabase.from().insert().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Duplicate key value violates unique constraint' }
      });

      // Act & Assert
      await expect(friendsService.sendFriendRequest(fromUserId, toUserId)).rejects.toThrow('Friend request already exists');
    });
  });

  describe('Accept Friend Request', () => {
    it('should accept friend request', async () => {
      // Arrange
      const friendshipId = 'friendship-123';
      const mockUpdatedFriendship = {
        id: friendshipId,
        status: 'ACCEPTED',
        accepted_at: '2024-01-01T10:00:00Z'
      };

      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: mockUpdatedFriendship,
        error: null
      });

      // Act
      const result = await friendsService.acceptFriendRequest(friendshipId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('friendships');
      expect(result).toEqual(mockUpdatedFriendship);
    });

    it('should handle non-existent friendship', async () => {
      // Arrange
      const friendshipId = 'nonexistent';
      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Friendship not found' }
      });

      // Act & Assert
      await expect(friendsService.acceptFriendRequest(friendshipId)).rejects.toThrow('Friendship not found');
    });
  });

  describe('Reject Friend Request', () => {
    it('should reject friend request', async () => {
      // Arrange
      const friendshipId = 'friendship-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().delete().eq().mockResolvedValue({
        data: null,
        error: null
      });

      // Act
      await friendsService.rejectFriendRequest(friendshipId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('friendships');
    });

    it('should handle deletion errors', async () => {
      // Arrange
      const friendshipId = 'friendship-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().delete().eq().mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' }
      });

      // Act & Assert
      await expect(friendsService.rejectFriendRequest(friendshipId)).rejects.toThrow('Failed to reject friend request');
    });
  });

  describe('Remove Friend', () => {
    it('should remove friend successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const friendId = 'friend-456';
      const { supabase } = require('../../lib/supabase');
      supabase.from().delete().eq().mockResolvedValue({
        data: null,
        error: null
      });

      // Act
      await friendsService.removeFriend(userId, friendId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('friendships');
    });

    it('should handle removal errors', async () => {
      // Arrange
      const userId = 'user-123';
      const friendId = 'friend-456';
      const { supabase } = require('../../lib/supabase');
      supabase.from().delete().eq().mockResolvedValue({
        data: null,
        error: { message: 'Removal failed' }
      });

      // Act & Assert
      await expect(friendsService.removeFriend(userId, friendId)).rejects.toThrow('Failed to remove friend');
    });
  });

  describe('Get Pending Requests', () => {
    it('should get pending friend requests', async () => {
      // Arrange
      const userId = 'user-123';
      const mockRequests = [
        {
          id: 'request-1',
          user_id: 'user-456',
          friend_id: userId,
          status: 'PENDING',
          created_at: '2024-01-01T10:00:00Z',
          user: {
            id: 'user-456',
            pseudo: 'RequestUser',
            email: 'request@example.com'
          }
        }
      ];

      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: mockRequests,
        error: null
      });

      // Act
      const result = await friendsService.getPendingRequests(userId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('friendships');
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array if no pending requests', async () => {
      // Arrange
      const userId = 'user-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: [],
        error: null
      });

      // Act
      const result = await friendsService.getPendingRequests(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Search Users', () => {
    it('should search users by pseudo', async () => {
      // Arrange
      const searchQuery = 'john';
      const mockUsers = [
        {
          id: 'user-1',
          pseudo: 'john_doe',
          email: 'john@example.com'
        },
        {
          id: 'user-2',
          pseudo: 'johnny',
          email: 'johnny@example.com'
        }
      ];

      const { supabase } = require('../../lib/supabase');
      supabase.from().order().limit().mockResolvedValue({
        data: mockUsers,
        error: null
      });

      // Act
      const result = await friendsService.searchUsers(searchQuery);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array for empty search', async () => {
      // Arrange
      const searchQuery = '';
      const { supabase } = require('../../lib/supabase');
      supabase.from().order().limit().mockResolvedValue({
        data: [],
        error: null
      });

      // Act
      const result = await friendsService.searchUsers(searchQuery);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle search errors', async () => {
      // Arrange
      const searchQuery = 'test';
      const { supabase } = require('../../lib/supabase');
      supabase.from().order().limit().mockResolvedValue({
        data: null,
        error: { message: 'Search failed' }
      });

      // Act & Assert
      await expect(friendsService.searchUsers(searchQuery)).rejects.toThrow('Failed to search users');
    });
  });
});





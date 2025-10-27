import { ChallengesService } from '../challenges.service';

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
      limit: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('ChallengesService', () => {
  let challengesService: ChallengesService;

  beforeEach(() => {
    challengesService = new ChallengesService();
    jest.clearAllMocks();
  });

  describe('Create Challenge', () => {
    it('should create a new challenge successfully', async () => {
      // Arrange
      const challengeData = {
        challenger_id: 'user-123',
        challenged_id: 'user-456',
        game_type: 'TOP10',
        status: 'PENDING',
        expires_at: '2024-01-02T10:00:00Z'
      };

      const mockChallenge = {
        id: 'challenge-1',
        ...challengeData,
        created_at: '2024-01-01T10:00:00Z'
      };

      const { supabase } = require('../../lib/supabase');
      supabase.from().insert().select().single().mockResolvedValue({
        data: mockChallenge,
        error: null
      });

      // Act
      const result = await challengesService.createChallenge(
        challengeData.challenger_id,
        challengeData.challenged_id,
        challengeData.game_type,
        challengeData.expires_at
      );

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenges');
      expect(result).toEqual(mockChallenge);
    });

    it('should not allow self-challenge', async () => {
      // Arrange
      const userId = 'user-123';

      // Act & Assert
      await expect(challengesService.createChallenge(userId, userId, 'TOP10', '2024-01-02T10:00:00Z'))
        .rejects.toThrow('Cannot challenge yourself');
    });

    it('should handle database errors', async () => {
      // Arrange
      const { supabase } = require('../../lib/supabase');
      supabase.from().insert().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act & Assert
      await expect(challengesService.createChallenge('user-123', 'user-456', 'TOP10', '2024-01-02T10:00:00Z'))
        .rejects.toThrow('Failed to create challenge');
    });
  });

  describe('Accept Challenge', () => {
    it('should accept a challenge successfully', async () => {
      // Arrange
      const challengeId = 'challenge-123';
      const mockUpdatedChallenge = {
        id: challengeId,
        status: 'ACCEPTED',
        accepted_at: '2024-01-01T10:00:00Z'
      };

      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: mockUpdatedChallenge,
        error: null
      });

      // Act
      const result = await challengesService.acceptChallenge(challengeId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenges');
      expect(result).toEqual(mockUpdatedChallenge);
    });

    it('should handle non-existent challenge', async () => {
      // Arrange
      const challengeId = 'nonexistent';
      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Challenge not found' }
      });

      // Act & Assert
      await expect(challengesService.acceptChallenge(challengeId))
        .rejects.toThrow('Challenge not found');
    });
  });

  describe('Reject Challenge', () => {
    it('should reject a challenge successfully', async () => {
      // Arrange
      const challengeId = 'challenge-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: { id: challengeId, status: 'REJECTED' },
        error: null
      });

      // Act
      const result = await challengesService.rejectChallenge(challengeId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenges');
      expect(result.status).toBe('REJECTED');
    });

    it('should handle rejection errors', async () => {
      // Arrange
      const challengeId = 'challenge-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      // Act & Assert
      await expect(challengesService.rejectChallenge(challengeId))
        .rejects.toThrow('Failed to reject challenge');
    });
  });

  describe('Get User Challenges', () => {
    it('should get challenges sent by user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockChallenges = [
        {
          id: 'challenge-1',
          challenger_id: userId,
          challenged_id: 'user-456',
          game_type: 'TOP10',
          status: 'PENDING',
          created_at: '2024-01-01T10:00:00Z'
        }
      ];

      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: mockChallenges,
        error: null
      });

      // Act
      const result = await challengesService.getUserChallenges(userId, 'sent');

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenges');
      expect(result).toEqual(mockChallenges);
    });

    it('should get challenges received by user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockChallenges = [
        {
          id: 'challenge-1',
          challenger_id: 'user-456',
          challenged_id: userId,
          game_type: 'TOP10',
          status: 'PENDING',
          created_at: '2024-01-01T10:00:00Z'
        }
      ];

      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: mockChallenges,
        error: null
      });

      // Act
      const result = await challengesService.getUserChallenges(userId, 'received');

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenges');
      expect(result).toEqual(mockChallenges);
    });

    it('should return empty array if no challenges', async () => {
      // Arrange
      const userId = 'user-123';
      const { supabase } = require('../../lib/supabase');
      supabase.from().order().mockResolvedValue({
        data: [],
        error: null
      });

      // Act
      const result = await challengesService.getUserChallenges(userId, 'sent');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Complete Challenge', () => {
    it('should complete a challenge with results', async () => {
      // Arrange
      const challengeId = 'challenge-123';
      const results = {
        challenger_score: 8,
        challenged_score: 6,
        challenger_time: 120,
        challenged_time: 150
      };

      const mockCompletedChallenge = {
        id: challengeId,
        status: 'COMPLETED',
        results,
        completed_at: '2024-01-01T10:00:00Z'
      };

      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: mockCompletedChallenge,
        error: null
      });

      // Act
      const result = await challengesService.completeChallenge(challengeId, results);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenges');
      expect(result).toEqual(mockCompletedChallenge);
    });

    it('should handle completion errors', async () => {
      // Arrange
      const challengeId = 'challenge-123';
      const results = { challenger_score: 8, challenged_score: 6 };
      const { supabase } = require('../../lib/supabase');
      supabase.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      // Act & Assert
      await expect(challengesService.completeChallenge(challengeId, results))
        .rejects.toThrow('Failed to complete challenge');
    });
  });

  describe('Get Challenge Leaderboard', () => {
    it('should get challenge leaderboard', async () => {
      // Arrange
      const mockLeaderboard = [
        {
          user_id: 'user-1',
          wins: 10,
          losses: 2,
          win_rate: 0.83,
          total_challenges: 12
        },
        {
          user_id: 'user-2',
          wins: 8,
          losses: 4,
          win_rate: 0.67,
          total_challenges: 12
        }
      ];

      const { supabase } = require('../../lib/supabase');
      supabase.from().order().limit().mockResolvedValue({
        data: mockLeaderboard,
        error: null
      });

      // Act
      const result = await challengesService.getChallengeLeaderboard(10);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenge_leaderboard');
      expect(result).toEqual(mockLeaderboard);
    });

    it('should handle leaderboard errors', async () => {
      // Arrange
      const { supabase } = require('../../lib/supabase');
      supabase.from().order().limit().mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      // Act & Assert
      await expect(challengesService.getChallengeLeaderboard(10))
        .rejects.toThrow('Failed to get leaderboard');
    });
  });

  describe('Get Challenge Statistics', () => {
    it('should get user challenge statistics', async () => {
      // Arrange
      const userId = 'user-123';
      const mockStats = {
        total_challenges: 15,
        wins: 10,
        losses: 5,
        win_rate: 0.67,
        average_score: 7.2,
        best_score: 10
      };

      const { supabase } = require('../../lib/supabase');
      supabase.from().eq().single().mockResolvedValue({
        data: mockStats,
        error: null
      });

      // Act
      const result = await challengesService.getUserChallengeStats(userId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('challenge_stats');
      expect(result).toEqual(mockStats);
    });

    it('should return default stats for new user', async () => {
      // Arrange
      const userId = 'new-user';
      const { supabase } = require('../../lib/supabase');
      supabase.from().eq().single().mockResolvedValue({
        data: null,
        error: { message: 'No data found' }
      });

      // Act
      const result = await challengesService.getUserChallengeStats(userId);

      // Assert
      expect(result).toEqual({
        total_challenges: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        average_score: 0,
        best_score: 0
      });
    });
  });
});





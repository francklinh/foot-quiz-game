// src/services/__tests__/admin-games.service.test.ts
import { AdminGamesService } from '../admin-games.service';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: '1', name: 'Test Game', type: 'TOP10' },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: { id: '1', name: 'Updated Game' },
          error: null
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

describe('AdminGamesService', () => {
  let service: AdminGamesService;

  beforeEach(() => {
    service = new AdminGamesService();
    jest.clearAllMocks();
  });

  describe('Game Types Management', () => {
    it('should get all game types', async () => {
      const result = await service.getGameTypes();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should create a new game type', async () => {
      const gameType = {
        name: 'TOP10',
        description: 'Top 10 ranking game',
        rules: 'Find the top 10 players',
        scoring_system: 'Points based on ranking'
      };

      const result = await service.createGameType(gameType);
      expect(result).toBeDefined();
      expect(result.name).toBe('TOP10');
    });

    it('should update a game type', async () => {
      const gameTypeId = '1';
      const updates = {
        name: 'TOP10 Updated',
        description: 'Updated description'
      };

      const result = await service.updateGameType(gameTypeId, updates);
      expect(result).toBeDefined();
    });

    it('should delete a game type', async () => {
      const gameTypeId = '1';
      const result = await service.deleteGameType(gameTypeId);
      expect(result).toBe(true);
    });
  });

  describe('Game Configuration Management', () => {
    it('should get game configurations', async () => {
      const result = await service.getGameConfigurations();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should create a game configuration', async () => {
      const config = {
        game_type_id: '1',
        title: 'Ligue 1 Top Scorers 2024',
        description: 'Find the top scorers in Ligue 1',
        difficulty: 'medium',
        time_limit: 300,
        max_players: 10,
        is_active: true
      };

      const result = await service.createGameConfiguration(config);
      expect(result).toBeDefined();
      expect(result.title).toBe('Ligue 1 Top Scorers 2024');
    });

    it('should update a game configuration', async () => {
      const configId = '1';
      const updates = {
        title: 'Updated Title',
        difficulty: 'hard'
      };

      const result = await service.updateGameConfiguration(configId, updates);
      expect(result).toBeDefined();
    });

    it('should delete a game configuration', async () => {
      const configId = '1';
      const result = await service.deleteGameConfiguration(configId);
      expect(result).toBe(true);
    });
  });

  describe('Game Rules Management', () => {
    it('should get game rules', async () => {
      const gameTypeId = '1';
      const result = await service.getGameRules(gameTypeId);
      expect(result).toBeDefined();
    });

    it('should update game rules', async () => {
      const gameTypeId = '1';
      const rules = {
        description: 'New rules description',
        scoring: 'New scoring system',
        time_limit: 600,
        max_attempts: 3
      };

      const result = await service.updateGameRules(gameTypeId, rules);
      expect(result).toBeDefined();
    });
  });

  describe('Game Statistics', () => {
    it('should get game usage statistics', async () => {
      const result = await service.getGameUsageStats();
      expect(result).toBeDefined();
      expect(result.total_games).toBeDefined();
      expect(result.popular_games).toBeDefined();
    });

    it('should get game performance metrics', async () => {
      const gameId = '1';
      const result = await service.getGamePerformanceMetrics(gameId);
      expect(result).toBeDefined();
      expect(result.completion_rate).toBeDefined();
      expect(result.average_score).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const { supabase } = require('../../lib/supabase');
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        }))
      });

      await expect(service.getGameTypes()).rejects.toThrow();
    });

    it('should validate required fields for game creation', async () => {
      const invalidGameType = {
        name: '',
        description: 'Test'
      };

      await expect(service.createGameType(invalidGameType)).rejects.toThrow();
    });
  });
});

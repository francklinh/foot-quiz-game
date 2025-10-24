// src/services/__tests__/admin-games.service.simple.test.ts
import { AdminGamesService } from '../admin-games.service';

// Mock Supabase avec une approche plus simple
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

describe('AdminGamesService - Simple Tests', () => {
  let service: AdminGamesService;

  beforeEach(() => {
    service = new AdminGamesService();
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AdminGamesService);
    });

    it('should have all required methods', () => {
      expect(typeof service.getGameTypes).toBe('function');
      expect(typeof service.createGameType).toBe('function');
      expect(typeof service.updateGameType).toBe('function');
      expect(typeof service.deleteGameType).toBe('function');
      expect(typeof service.getGameConfigurations).toBe('function');
      expect(typeof service.createGameConfiguration).toBe('function');
      expect(typeof service.updateGameConfiguration).toBe('function');
      expect(typeof service.deleteGameConfiguration).toBe('function');
      expect(typeof service.getGameRules).toBe('function');
      expect(typeof service.updateGameRules).toBe('function');
      expect(typeof service.getGameUsageStats).toBe('function');
      expect(typeof service.getGamePerformanceMetrics).toBe('function');
    });
  });

  describe('Validation', () => {
    it('should validate game type data', async () => {
      const invalidData = {
        name: '',
        description: 'Test',
        rules: 'Test rules',
        scoring_system: 'Test scoring'
      };

      await expect(service.createGameType(invalidData)).rejects.toThrow();
    });

    it('should validate game configuration data', async () => {
      const invalidData = {
        game_type_id: '',
        title: 'Test',
        description: 'Test description',
        difficulty: 'easy',
        time_limit: 300,
        max_players: 10,
        is_active: true
      };

      await expect(service.createGameConfiguration(invalidData)).rejects.toThrow();
    });

    it('should validate difficulty levels', async () => {
      const invalidData = {
        game_type_id: '1',
        title: 'Test',
        description: 'Test description',
        difficulty: 'invalid',
        time_limit: 300,
        max_players: 10,
        is_active: true
      };

      await expect(service.createGameConfiguration(invalidData)).rejects.toThrow();
    });

    it('should validate time limits', async () => {
      const invalidData = {
        game_type_id: '1',
        title: 'Test',
        description: 'Test description',
        difficulty: 'easy',
        time_limit: 10, // Too low
        max_players: 10,
        is_active: true
      };

      await expect(service.createGameConfiguration(invalidData)).rejects.toThrow();
    });

    it('should validate max players', async () => {
      const invalidData = {
        game_type_id: '1',
        title: 'Test',
        description: 'Test description',
        difficulty: 'easy',
        time_limit: 300,
        max_players: 0, // Too low
        is_active: true
      };

      await expect(service.createGameConfiguration(invalidData)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing game type ID', async () => {
      await expect(service.updateGameType('', { name: 'Test' })).rejects.toThrow();
    });

    it('should handle missing configuration ID', async () => {
      await expect(service.updateGameConfiguration('', { title: 'Test' })).rejects.toThrow();
    });

    it('should handle missing rules game type ID', async () => {
      await expect(service.getGameRules('')).rejects.toThrow();
    });

    it('should handle missing performance game ID', async () => {
      await expect(service.getGamePerformanceMetrics('')).rejects.toThrow();
    });
  });

  describe('Mock Integration', () => {
    it('should call supabase.from for getGameTypes', async () => {
      const { supabase } = require('../../lib/supabase');
      await service.getGameTypes();
      expect(supabase.from).toHaveBeenCalledWith('game_types');
    });

    it('should call supabase.from for getGameConfigurations', async () => {
      const { supabase } = require('../../lib/supabase');
      await service.getGameConfigurations();
      expect(supabase.from).toHaveBeenCalledWith('game_configurations');
    });

    it('should call supabase.from for getGameRules', async () => {
      const { supabase } = require('../../lib/supabase');
      await service.getGameRules('1');
      expect(supabase.from).toHaveBeenCalledWith('game_rules');
    });
  });
});

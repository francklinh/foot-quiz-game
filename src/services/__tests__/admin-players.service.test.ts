// src/services/__tests__/admin-players.service.test.ts
import { AdminPlayersService } from '../admin-players.service';

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
            data: { id: '1', name: 'Test Player', position: 'Attaquant' },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: { id: '1', name: 'Updated Player' },
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

describe('AdminPlayersService', () => {
  let service: AdminPlayersService;

  beforeEach(() => {
    service = new AdminPlayersService();
    jest.clearAllMocks();
  });

  describe('Player Management', () => {
    it('should get all players with filters', async () => {
      const filters = {
        position: 'Attaquant',
        nationality: 'France',
        is_active: true
      };

      const result = await service.getPlayers(filters);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get a player by ID', async () => {
      const playerId = '1';
      const result = await service.getPlayerById(playerId);
      expect(result).toBeDefined();
      expect(result.id).toBe(playerId);
    });

    it('should create a new player', async () => {
      const player = {
        name: 'Kylian Mbappé',
        position: 'Attaquant',
        nationality: 'France',
        current_club: 'Real Madrid',
        club_history: [
          { club: 'PSG', start_year: 2017, end_year: 2024 }
        ],
        is_active: true,
        is_verified: true
      };

      const result = await service.createPlayer(player);
      expect(result).toBeDefined();
      expect(result.name).toBe('Kylian Mbappé');
      expect(result.position).toBe('Attaquant');
    });

    it('should update a player', async () => {
      const playerId = '1';
      const updates = {
        name: 'Kylian Mbappé Updated',
        position: 'Milieu',
        current_club: 'Barcelona'
      };

      const result = await service.updatePlayer(playerId, updates);
      expect(result).toBeDefined();
    });

    it('should delete a player', async () => {
      const playerId = '1';
      const result = await service.deletePlayer(playerId);
      expect(result).toBe(true);
    });

    it('should archive a player', async () => {
      const playerId = '1';
      const result = await service.archivePlayer(playerId);
      expect(result).toBe(true);
    });

    it('should verify a player', async () => {
      const playerId = '1';
      const result = await service.verifyPlayer(playerId);
      expect(result).toBe(true);
    });
  });

  describe('Player Search and Filtering', () => {
    it('should search players by name', async () => {
      const searchTerm = 'Mbappé';
      const result = await service.searchPlayers(searchTerm);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get players by position', async () => {
      const position = 'Attaquant';
      const result = await service.getPlayersByPosition(position);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get players by nationality', async () => {
      const nationality = 'France';
      const result = await service.getPlayersByNationality(nationality);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get players by club', async () => {
      const club = 'Real Madrid';
      const result = await service.getPlayersByClub(club);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Player Statistics', () => {
    it('should get player statistics', async () => {
      const playerId = '1';
      const result = await service.getPlayerStatistics(playerId);
      expect(result).toBeDefined();
      expect(result.total_games).toBeDefined();
      expect(result.average_score).toBeDefined();
    });

    it('should get player performance by game type', async () => {
      const playerId = '1';
      const gameType = 'TOP10';
      const result = await service.getPlayerPerformanceByGameType(playerId, gameType);
      expect(result).toBeDefined();
    });
  });

  describe('Bulk Operations', () => {
    it('should import players from CSV', async () => {
      const csvData = [
        { name: 'Player 1', position: 'Attaquant', nationality: 'France' },
        { name: 'Player 2', position: 'Milieu', nationality: 'Spain' }
      ];

      const result = await service.importPlayersFromCSV(csvData);
      expect(result).toBeDefined();
      expect(result.success_count).toBe(2);
      expect(result.error_count).toBe(0);
    });

    it('should export players to CSV', async () => {
      const filters = { is_active: true };
      const result = await service.exportPlayersToCSV(filters);
      expect(result).toBeDefined();
      expect(result.csv_data).toBeDefined();
    });

    it('should bulk update players', async () => {
      const playerIds = ['1', '2', '3'];
      const updates = { is_verified: true };
      const result = await service.bulkUpdatePlayers(playerIds, updates);
      expect(result).toBeDefined();
      expect(result.updated_count).toBe(3);
    });

    it('should bulk delete players', async () => {
      const playerIds = ['1', '2', '3'];
      const result = await service.bulkDeletePlayers(playerIds);
      expect(result).toBeDefined();
      expect(result.deleted_count).toBe(3);
    });
  });

  describe('Validation', () => {
    it('should validate player data', async () => {
      const invalidPlayer = {
        name: '',
        position: 'Invalid Position'
      };

      await expect(service.createPlayer(invalidPlayer)).rejects.toThrow();
    });

    it('should validate position values', async () => {
      const player = {
        name: 'Test Player',
        position: 'Invalid Position'
      };

      await expect(service.createPlayer(player)).rejects.toThrow();
    });

    it('should validate nationality format', async () => {
      const player = {
        name: 'Test Player',
        position: 'Attaquant',
        nationality: 'Invalid Country Code'
      };

      await expect(service.createPlayer(player)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        }))
      });

      await expect(service.getPlayers()).rejects.toThrow();
    });

    it('should handle duplicate player names', async () => {
      const player = {
        name: 'Duplicate Player',
        position: 'Attaquant'
      };

      // Mock duplicate error
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'duplicate key value violates unique constraint' }
            }))
          }))
        }))
      });

      await expect(service.createPlayer(player)).rejects.toThrow();
    });
  });
});





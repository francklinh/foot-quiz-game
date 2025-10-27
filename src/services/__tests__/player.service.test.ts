import { PlayerService } from '../player.service';

// Mock Supabase
const mockQuery = {
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
};

const mockSupabase = {
  from: jest.fn(() => mockQuery),
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('PlayerService', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    playerService = new PlayerService();
    jest.clearAllMocks();
  });

  describe('Player Search', () => {
    test('should search players by name', async () => {
      // Arrange
      const searchQuery = 'Mbappé';
      const mockPlayers = [
        {
          id: 'player-1',
          name: 'Kylian Mbappé',
          current_club: 'Real Madrid',
          nationality: 'France',
          position: 'Attaquant',
        },
      ];

      mockQuery.limit.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      // Act
      const result = await playerService.searchPlayers(searchQuery);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('players');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().select().ilike).toHaveBeenCalledWith('name', `%${searchQuery}%`);
      expect(mockSupabase.from().select().ilike().limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockPlayers);
    });

    test('should handle search errors', async () => {
      // Arrange
      const searchQuery = 'Invalid';
      mockQuery.limit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      // Act & Assert
      await expect(playerService.searchPlayers(searchQuery)).rejects.toThrow('Database error');
    });

    test('should return empty array for empty search', async () => {
      // Arrange
      const searchQuery = '';
      mockQuery.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      const result = await playerService.searchPlayers(searchQuery);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Player by ID', () => {
    test('should get player by ID', async () => {
      // Arrange
      const playerId = 'player-123';
      const mockPlayer = {
        id: playerId,
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      };

      mockQuery.single.mockResolvedValue({
        data: mockPlayer,
        error: null,
      });

      // Act
      const result = await playerService.getPlayerById(playerId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('players');
      expect(result).toEqual(mockPlayer);
    });

    test('should return null for non-existent player', async () => {
      // Arrange
      const playerId = 'non-existent';
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      // Act
      const result = await playerService.getPlayerById(playerId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Player Validation', () => {
    test('should validate player for TOP10 game', async () => {
      // Arrange
      const player = {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      };

      // Act
      const isValid = playerService.validatePlayerForGame(player, 'TOP10');

      // Assert
      expect(isValid).toBe(true);
    });

    test('should validate player for GRILLE game', async () => {
      // Arrange
      const player = {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      };

      // Act
      const isValid = playerService.validatePlayerForGame(player, 'GRILLE');

      // Assert
      expect(isValid).toBe(true);
    });

    test('should validate player for CLUB game', async () => {
      // Arrange
      const player = {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      };

      // Act
      const isValid = playerService.validatePlayerForGame(player, 'CLUB');

      // Assert
      expect(isValid).toBe(true);
    });

    test('should reject invalid player data', async () => {
      // Arrange
      const invalidPlayer = {
        id: 'player-1',
        name: '',
        current_club: '',
        nationality: '',
        position: '',
      };

      // Act
      const isValid = playerService.validatePlayerForGame(invalidPlayer, 'TOP10');

      // Assert
      expect(isValid).toBe(false);
    });
  });
});

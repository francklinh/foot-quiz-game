import { PlayerService } from '../player.service';

describe('PlayerService - Simple Tests', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    playerService = new PlayerService();
  });

  describe('Player Validation', () => {
    test('should validate player for TOP10 game', () => {
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

    test('should validate player for GRILLE game', () => {
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

    test('should validate player for CLUB game', () => {
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

    test('should reject invalid player data', () => {
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

    test('should reject player with missing required fields', () => {
      // Arrange
      const incompletePlayer = {
        id: 'player-1',
        name: 'Kylian Mbappé',
        // Missing current_club, nationality, position
      } as any;

      // Act
      const isValid = playerService.validatePlayerForGame(incompletePlayer, 'TOP10');

      // Assert
      expect(isValid).toBe(false);
    });

    test('should reject player for unknown game type', () => {
      // Arrange
      const player = {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      };

      // Act
      const isValid = playerService.validatePlayerForGame(player, 'UNKNOWN');

      // Assert
      expect(isValid).toBe(false);
    });
  });
});





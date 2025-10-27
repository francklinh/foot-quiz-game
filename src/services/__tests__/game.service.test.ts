import { GameService } from '../game.service';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
  });

  describe('TOP10 Game Logic', () => {
    test('should calculate TOP10 score correctly', () => {
      // Arrange
      const correctAnswers = [
        { position: 1, player: 'Kylian Mbappé', isCorrect: true },
        { position: 2, player: 'Wissam Ben Yedder', isCorrect: true },
        { position: 3, player: 'Alexandre Lacazette', isCorrect: false },
      ];

      // Act
      const score = gameService.calculateTop10Score(correctAnswers);

      // Assert
      expect(score).toBe(2); // Only 2 correct answers
    });

    test('should calculate TOP10 score with position bonus', () => {
      // Arrange
      const correctAnswers = [
        { position: 1, player: 'Kylian Mbappé', isCorrect: true },
        { position: 2, player: 'Wissam Ben Yedder', isCorrect: true },
        { position: 3, player: 'Alexandre Lacazette', isCorrect: true },
      ];

      // Act
      const score = gameService.calculateTop10Score(correctAnswers);

      // Assert
      expect(score).toBe(3); // All correct
    });

    test('should handle empty answers', () => {
      // Arrange
      const correctAnswers: any[] = [];

      // Act
      const score = gameService.calculateTop10Score(correctAnswers);

      // Assert
      expect(score).toBe(0);
    });
  });

  describe('GRILLE Game Logic', () => {
    test('should validate grid intersection correctly', () => {
      // Arrange
      const gridData = {
        'France-Ligue1': 'Kylian Mbappé',
        'France-PremierLeague': 'N\'Golo Kanté',
        'Brazil-LaLiga': 'Vinícius Júnior',
      };

      // Act
      const isValid = gameService.validateGridIntersection(gridData, 'France', 'Ligue1', 'Kylian Mbappé');

      // Assert
      expect(isValid).toBe(true);
    });

    test('should reject invalid grid intersection', () => {
      // Arrange
      const gridData = {
        'France-Ligue1': 'Kylian Mbappé',
        'France-PremierLeague': 'N\'Golo Kanté',
      };

      // Act
      const isValid = gameService.validateGridIntersection(gridData, 'France', 'Ligue1', 'Lionel Messi');

      // Assert
      expect(isValid).toBe(false);
    });

    test('should calculate grid completion score', () => {
      // Arrange
      const gridData = {
        'France-Ligue1': 'Kylian Mbappé',
        'France-PremierLeague': 'N\'Golo Kanté',
        'Brazil-LaLiga': 'Vinícius Júnior',
        'Brazil-Ligue1': '',
        'Brazil-PremierLeague': '',
        'Argentina-LaLiga': '',
        'Argentina-Ligue1': '',
        'Argentina-PremierLeague': '',
      };

      // Act
      const score = gameService.calculateGridScore(gridData);

      // Assert
      expect(score).toBe(3); // 3 out of 9 cells filled
    });
  });

  describe('CLUB Game Logic', () => {
    test('should validate club guess correctly', () => {
      // Arrange
      const player = {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      };
      const guess = 'Real Madrid';

      // Act
      const isCorrect = gameService.validateClubGuess(player, guess);

      // Assert
      expect(isCorrect).toBe(true);
    });

    test('should reject incorrect club guess', () => {
      // Arrange
      const player = {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      };
      const guess = 'PSG';

      // Act
      const isCorrect = gameService.validateClubGuess(player, guess);

      // Assert
      expect(isCorrect).toBe(false);
    });

    test('should calculate time-based score', () => {
      // Arrange
      const timeRemaining = 45; // seconds
      const isCorrect = true;

      // Act
      const score = gameService.calculateTimeBasedScore(timeRemaining, isCorrect);

      // Assert
      expect(score).toBe(45); // 1 point per second remaining
    });

    test('should return 0 score for incorrect answer', () => {
      // Arrange
      const timeRemaining = 45;
      const isCorrect = false;

      // Act
      const score = gameService.calculateTimeBasedScore(timeRemaining, isCorrect);

      // Assert
      expect(score).toBe(0);
    });
  });

  describe('Cerises Calculation', () => {
    test('should calculate cerises based on score', () => {
      // Arrange
      const score = 75;
      const gameType = 'TOP10';

      // Act
      const cerises = gameService.calculateCerises(score, gameType);

      // Assert
      expect(cerises).toBe(75); // 1 cerise per point
    });

    test('should apply bonus for perfect score', () => {
      // Arrange
      const score = 100;
      const gameType = 'TOP10';

      // Act
      const cerises = gameService.calculateCerises(score, gameType);

      // Assert
      expect(cerises).toBe(150); // 100 + 50% bonus
    });

    test('should apply different multipliers per game type', () => {
      // Arrange
      const score = 50;

      // Act
      const top10Cerises = gameService.calculateCerises(score, 'TOP10');
      const grilleCerises = gameService.calculateCerises(score, 'GRILLE');
      const clubCerises = gameService.calculateCerises(score, 'CLUB');

      // Assert
      expect(top10Cerises).toBe(50);
      expect(grilleCerises).toBe(75); // 1.5x multiplier
      expect(clubCerises).toBe(100); // 2x multiplier
    });
  });
});





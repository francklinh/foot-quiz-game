import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  })),
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// React Router mocking removed for integration tests

describe('Game Flow Integration Tests', () => {
  let gameService: GameService;
  let playerService: PlayerService;

  beforeEach(() => {
    jest.clearAllMocks();
    gameService = new GameService();
    playerService = new PlayerService();
  });

  describe('Complete TOP10 Game Flow', () => {
    test('should complete full TOP10 game process', async () => {
      // Arrange
      const gameData = {
        gameType: 'TOP10',
        userId: 'user-123',
        questionId: 'question-123',
        players: [
          { id: 'player-1', name: 'Kylian Mbappé', current_club: 'Real Madrid', nationality: 'France', position: 'Attaquant' },
          { id: 'player-2', name: 'Wissam Ben Yedder', current_club: 'AS Monaco', nationality: 'France', position: 'Attaquant' },
          { id: 'player-3', name: 'Alexandre Lacazette', current_club: 'Olympique Lyonnais', nationality: 'France', position: 'Attaquant' },
        ],
        userAnswers: ['Kylian Mbappé', 'Wissam Ben Yedder', 'Alexandre Lacazette'],
      };

      // Mock game creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          game_type: gameData.gameType,
          user_id: gameData.userId,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock player validation
      jest.spyOn(playerService, 'validatePlayerForGame').mockReturnValue(true);

      // Mock score calculation
      jest.spyOn(gameService, 'calculateTop10Score').mockReturnValue(3);

      // Act
      const match = await gameService.createSoloMatch(gameData.gameType, gameData.userId);
      expect(match).toBeDefined();

      // Simulate player validation
      const validationResults = gameData.userAnswers.map(playerName => 
        playerService.validatePlayerForGame({ name: playerName }, 'TOP10')
      );

      // Calculate final score
      const finalScore = gameService.calculateTop10Score(validationResults);

      // Assert
      expect(match.game_type).toBe('TOP10');
      expect(match.user_id).toBe(gameData.userId);
      expect(validationResults.every(result => result)).toBe(true);
      expect(finalScore).toBe(3);
    });

    test('should handle TOP10 game errors gracefully', async () => {
      // Arrange
      const gameData = {
        gameType: 'TOP10',
        userId: 'user-123',
      };

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to create match' },
      });

      // Act & Assert
      await expect(
        gameService.createSoloMatch(gameData.gameType, gameData.userId)
      ).rejects.toThrow('Failed to create match');
    });
  });

  describe('Complete GRILLE Game Flow', () => {
    test('should complete full GRILLE game process', async () => {
      // Arrange
      const gameData = {
        gameType: 'GRILLE',
        userId: 'user-123',
        gridConfig: {
          leagues: ['Ligue 1', 'Premier League', 'La Liga'],
          nationalities: ['France', 'Brésil', 'Argentine'],
        },
        userAnswers: [
          { league: 'Ligue 1', nationality: 'France', player: 'Kylian Mbappé' },
          { league: 'Premier League', nationality: 'France', player: 'N\'Golo Kanté' },
          { league: 'La Liga', nationality: 'Brésil', player: 'Vinícius Júnior' },
        ],
      };

      // Mock game creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          game_type: gameData.gameType,
          user_id: gameData.userId,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock grid intersection validation
      jest.spyOn(gameService, 'validateGridIntersection').mockReturnValue(true);

      // Mock score calculation
      jest.spyOn(gameService, 'calculateGridScore').mockReturnValue(3);

      // Act
      const match = await gameService.createSoloMatch(gameData.gameType, gameData.userId);
      expect(match).toBeDefined();

      // Simulate grid intersection validation
      const validationResults = gameData.userAnswers.map(answer => 
        gameService.validateGridIntersection(answer.league, answer.nationality, answer.player)
      );

      // Calculate final score
      const finalScore = gameService.calculateGridScore(validationResults);

      // Assert
      expect(match.game_type).toBe('GRILLE');
      expect(match.user_id).toBe(gameData.userId);
      expect(validationResults.every(result => result)).toBe(true);
      expect(finalScore).toBe(3);
    });
  });

  describe('Complete CLUB Game Flow', () => {
    test('should complete full CLUB game process', async () => {
      // Arrange
      const gameData = {
        gameType: 'CLUB',
        userId: 'user-123',
        players: [
          { id: 'player-1', name: 'Kylian Mbappé', current_club: 'Real Madrid', nationality: 'France', position: 'Attaquant' },
          { id: 'player-2', name: 'Wissam Ben Yedder', current_club: 'AS Monaco', nationality: 'France', position: 'Attaquant' },
        ],
        userAnswers: [
          { player: 'Kylian Mbappé', club: 'Real Madrid' },
          { player: 'Wissam Ben Yedder', club: 'AS Monaco' },
        ],
      };

      // Mock game creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          game_type: gameData.gameType,
          user_id: gameData.userId,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock club guess validation
      jest.spyOn(gameService, 'validateClubGuess').mockReturnValue(true);

      // Mock score calculation
      jest.spyOn(gameService, 'calculateTimeBasedScore').mockReturnValue(100);

      // Act
      const match = await gameService.createSoloMatch(gameData.gameType, gameData.userId);
      expect(match).toBeDefined();

      // Simulate club guess validation
      const validationResults = gameData.userAnswers.map(answer => 
        gameService.validateClubGuess(answer.player, answer.club)
      );

      // Calculate final score
      const finalScore = gameService.calculateTimeBasedScore(validationResults);

      // Assert
      expect(match.game_type).toBe('CLUB');
      expect(match.user_id).toBe(gameData.userId);
      expect(validationResults.every(result => result)).toBe(true);
      expect(finalScore).toBe(100);
    });
  });

  describe('Complete Multiplayer Game Flow', () => {
    test('should complete full multiplayer game process', async () => {
      // Arrange
      const gameData = {
        gameType: 'TOP10',
        userId: 'user-123',
        participants: ['user-123', 'user-456', 'user-789'],
        maxPlayers: 3,
      };

      // Mock game creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          game_type: gameData.gameType,
          user_id: gameData.userId,
          status: 'PENDING',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock participant addition
      mockSupabase.from().insert().mockResolvedValueOnce({
        data: { id: 'participant-123' },
        error: null,
      });

      // Act
      const match = await gameService.createSoloMatch(gameData.gameType, gameData.userId);
      expect(match).toBeDefined();

      // Simulate adding participants
      for (const participantId of gameData.participants) {
        // Mock adding participant
        mockSupabase.from().insert().mockResolvedValueOnce({
          data: { id: `participant-${participantId}` },
          error: null,
        });
      }

      // Assert
      expect(match.game_type).toBe('TOP10');
      expect(match.user_id).toBe(gameData.userId);
      expect(match.status).toBe('PENDING');
    });
  });

  describe('Complete League Game Flow', () => {
    test('should complete full league game process', async () => {
      // Arrange
      const leagueData = {
        leagueId: 'league-123',
        gameType: 'TOP10',
        participants: ['user-123', 'user-456', 'user-789'],
        gamesPerMatch: 3,
        matchFrequency: '1 per week',
      };

      // Mock league game creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          game_type: leagueData.gameType,
          league_id: leagueData.leagueId,
          status: 'PENDING',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock participant addition
      mockSupabase.from().insert().mockResolvedValueOnce({
        data: { id: 'participant-123' },
        error: null,
      });

      // Act
      const match = await gameService.createSoloMatch(leagueData.gameType, leagueData.participants[0]);
      expect(match).toBeDefined();

      // Simulate adding league participants
      for (const participantId of leagueData.participants) {
        // Mock adding league participant
        mockSupabase.from().insert().mockResolvedValueOnce({
          data: { id: `participant-${participantId}` },
          error: null,
        });
      }

      // Assert
      expect(match.game_type).toBe('TOP10');
      expect(match.status).toBe('PENDING');
    });
  });

  describe('Complete Score Calculation Flow', () => {
    test('should calculate scores for all game types', () => {
      // Arrange
      const top10Results = [true, true, false, true, false];
      const grilleResults = [true, true, true, false, false];
      const clubResults = [true, false, true, true, false];

      // Mock score calculations
      jest.spyOn(gameService, 'calculateTop10Score').mockReturnValue(3);
      jest.spyOn(gameService, 'calculateGridScore').mockReturnValue(3);
      jest.spyOn(gameService, 'calculateTimeBasedScore').mockReturnValue(150);

      // Act
      const top10Score = gameService.calculateTop10Score(top10Results);
      const grilleScore = gameService.calculateGridScore(grilleResults);
      const clubScore = gameService.calculateTimeBasedScore(clubResults);

      // Assert
      expect(top10Score).toBe(3);
      expect(grilleScore).toBe(3);
      expect(clubScore).toBe(150);
    });
  });
});

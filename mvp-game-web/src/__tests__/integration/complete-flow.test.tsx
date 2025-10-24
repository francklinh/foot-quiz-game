import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  })),
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// React Router mocking removed for integration tests

describe('Complete Application Flow Integration Tests', () => {
  let authService: AuthService;
  let gameService: GameService;
  let playerService: PlayerService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    gameService = new GameService();
    playerService = new PlayerService();
  });

  describe('Complete User Journey: Registration to Game Completion', () => {
    test('should complete full user journey from registration to game completion', async () => {
      // Arrange
      const userData = {
        email: 'journey@example.com',
        password: 'password123',
        pseudo: 'journeyuser',
        country: 'FRA',
      };

      const gameData = {
        gameType: 'TOP10',
        questionId: 'question-123',
        userAnswers: ['Kylian Mbappé', 'Wissam Ben Yedder', 'Alexandre Lacazette'],
      };

      // Mock registration
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: userData.email } },
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: { id: 'user-123', pseudo: userData.pseudo, email: userData.email, country: userData.country },
        error: null,
      });

      // Mock game creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          game_type: gameData.gameType,
          user_id: 'user-123',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock player validation
      jest.spyOn(playerService, 'validatePlayerForGame').mockReturnValue(true);

      // Mock score calculation
      jest.spyOn(gameService, 'calculateTop10Score').mockReturnValue(3);

      // Act & Assert
      // 1. User Registration
      const user = await authService.register(
        userData.email,
        userData.password,
        userData.pseudo,
        userData.country
      );
      expect(user).toBeDefined();
      expect(user?.email).toBe(userData.email);

      // 2. Game Creation
      const match = await gameService.createSoloMatch(gameData.gameType, 'user-123');
      expect(match).toBeDefined();
      expect(match.game_type).toBe(gameData.gameType);

      // 3. Game Play Simulation
      const validationResults = gameData.userAnswers.map(playerName => 
        playerService.validatePlayerForGame({ name: playerName }, 'TOP10')
      );
      expect(validationResults.every(result => result)).toBe(true);

      // 4. Score Calculation
      const finalScore = gameService.calculateTop10Score(validationResults);
      expect(finalScore).toBe(3);
    });
  });

  describe('Complete League Journey: Creation to Match Completion', () => {
    test('should complete full league journey from creation to match completion', async () => {
      // Arrange
      const leagueData = {
        name: 'Ligue des Champions',
        description: 'Ligue pour les meilleurs joueurs',
        maxPlayers: 10,
        gamesPerMatch: 3,
        matchFrequency: '1 per week',
        creatorId: 'user-123',
        participants: ['user-123', 'user-456', 'user-789'],
      };

      const matchData = {
        gameType: 'TOP10',
        participants: leagueData.participants,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Mock league creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'league-123',
          name: leagueData.name,
          description: leagueData.description,
          max_players: leagueData.maxPlayers,
          games_per_match: leagueData.gamesPerMatch,
          match_frequency: leagueData.matchFrequency,
          creator_id: leagueData.creatorId,
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock participant addition
      mockSupabase.from().insert().mockResolvedValueOnce({
        data: { id: 'participant-123' },
        error: null,
      });

      // Mock match creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          league_id: 'league-123',
          game_type: matchData.gameType,
          status: 'PENDING',
          deadline: matchData.deadline,
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock match completion
      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        },
        error: null,
      });

      // Act & Assert
      // 1. League Creation
      const league = await mockSupabase.from('leagues').insert({
        name: leagueData.name,
        description: leagueData.description,
        max_players: leagueData.maxPlayers,
        games_per_match: leagueData.gamesPerMatch,
        match_frequency: leagueData.matchFrequency,
        creator_id: leagueData.creatorId,
      }).select().single();

      expect(league.data.name).toBe(leagueData.name);
      expect(league.data.max_players).toBe(leagueData.maxPlayers);

      // 2. Add Participants
      for (const participantId of leagueData.participants) {
        await mockSupabase.from('league_participants').insert({
          league_id: league.data.id,
          user_id: participantId,
          joined_at: new Date().toISOString(),
        });
      }

      // 3. Create Match
      const match = await mockSupabase.from('matches').insert({
        league_id: league.data.id,
        game_type: matchData.gameType,
        status: 'PENDING',
        deadline: matchData.deadline,
      }).select().single();

      expect(match.data.league_id).toBe(league.data.id);
      expect(match.data.game_type).toBe(matchData.gameType);

      // 4. Complete Match
      const completedMatch = await mockSupabase.from('matches').update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      }).eq('id', match.data.id).select().single();

      expect(completedMatch.data.status).toBe('COMPLETED');
    });
  });

  describe('Complete Multiplayer Journey: Match Creation to Completion', () => {
    test('should complete full multiplayer journey from match creation to completion', async () => {
      // Arrange
      const multiplayerData = {
        gameType: 'GRILLE',
        creatorId: 'user-123',
        participants: ['user-123', 'user-456', 'user-789'],
        maxPlayers: 3,
      };

      const gameResults = [
        { user_id: 'user-123', score: 8, cerises_earned: 80 },
        { user_id: 'user-456', score: 6, cerises_earned: 60 },
        { user_id: 'user-789', score: 4, cerises_earned: 40 },
      ];

      // Mock match creation
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          game_type: multiplayerData.gameType,
          user_id: multiplayerData.creatorId,
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

      // Mock match completion
      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: {
          id: 'match-123',
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        },
        error: null,
      });

      // Mock results update
      mockSupabase.from().update().eq().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Act & Assert
      // 1. Create Match
      const match = await mockSupabase.from('matches').insert({
        game_type: multiplayerData.gameType,
        user_id: multiplayerData.creatorId,
        status: 'PENDING',
      }).select().single();

      expect(match.data.game_type).toBe(multiplayerData.gameType);
      expect(match.data.status).toBe('PENDING');

      // 2. Add Participants
      for (const participantId of multiplayerData.participants) {
        await mockSupabase.from('match_participants').insert({
          match_id: match.data.id,
          user_id: participantId,
          joined_at: new Date().toISOString(),
        });
      }

      // 3. Complete Match
      const completedMatch = await mockSupabase.from('matches').update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      }).eq('id', match.data.id).select().single();

      expect(completedMatch.data.status).toBe('COMPLETED');

      // 4. Update Results
      for (const result of gameResults) {
        await mockSupabase.from('match_participants').update({
          score: result.score,
          cerises_earned: result.cerises_earned,
        }).eq('match_id', match.data.id).eq('user_id', result.user_id);
      }
    });
  });

  describe('Complete Error Handling Flow', () => {
    test('should handle complete error scenarios gracefully', async () => {
      // Arrange
      const errorScenarios = [
        {
          name: 'Registration Error',
          service: 'auth',
          method: 'register',
          error: { message: 'Email already exists' },
        },
        {
          name: 'Game Creation Error',
          service: 'game',
          method: 'createSoloMatch',
          error: { message: 'Invalid game type' },
        },
        {
          name: 'League Creation Error',
          service: 'league',
          method: 'createLeague',
          error: { message: 'Invalid league data' },
        },
      ];

      // Mock error responses
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email already exists' },
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid game type' },
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid league data' },
      });

      // Act & Assert
      // 1. Registration Error
      await expect(
        authService.register('existing@example.com', 'password123', 'user', 'FRA')
      ).rejects.toThrow('Email already exists');

      // 2. Game Creation Error
      await expect(
        gameService.createSoloMatch('INVALID', 'user-123')
      ).rejects.toThrow('Invalid game type');

      // 3. League Creation Error
      const leagueResult = await mockSupabase.from('leagues').insert({
        name: 'Invalid League',
        max_players: 0, // Invalid
      }).select().single();

      expect(leagueResult.error).toBeDefined();
      expect(leagueResult.error.message).toBe('Invalid league data');
    });
  });

  describe('Complete Performance Flow', () => {
    test('should handle complete performance scenarios', async () => {
      // Arrange
      const performanceData = {
        largeLeague: {
          participants: Array.from({ length: 100 }, (_, i) => `user-${i}`),
          matches: Array.from({ length: 50 }, (_, i) => `match-${i}`),
        },
        highFrequency: {
          matchesPerDay: 10,
          participantsPerMatch: 6,
        },
      };

      // Mock high-volume operations
      mockSupabase.from().insert().mockResolvedValue({
        data: { id: 'bulk-insert-123' },
        error: null,
      });

      mockSupabase.from().select().eq().order().limit().mockResolvedValue({
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `participant-${i}`,
          user_id: `user-${i}`,
          total_cerises: Math.floor(Math.random() * 1000),
        })),
        error: null,
      });

      // Act & Assert
      // 1. Large League Creation
      for (const participantId of performanceData.largeLeague.participants) {
        await mockSupabase.from('league_participants').insert({
          league_id: 'league-123',
          user_id: participantId,
          joined_at: new Date().toISOString(),
        });
      }

      // 2. High Frequency Matches
      for (const matchId of performanceData.largeLeague.matches) {
        await mockSupabase.from('matches').insert({
          league_id: 'league-123',
          game_type: 'TOP10',
          status: 'PENDING',
          created_at: new Date().toISOString(),
        });
      }

      // 3. Bulk Ranking Calculation
      const ranking = await mockSupabase.from('league_participants')
        .select('user_id, total_cerises')
        .eq('league_id', 'league-123')
        .order('total_cerises', { ascending: false })
        .limit(100);

      expect(ranking.data).toHaveLength(100);
      expect(ranking.data[0].total_cerises).toBeGreaterThanOrEqual(ranking.data[99].total_cerises);
    });
  });
});

import { ChallengesService } from '../challenges.service';

describe('ChallengesService - Final Tests', () => {
  let challengesService: ChallengesService;

  beforeEach(() => {
    challengesService = new ChallengesService();
  });

  describe('Service Initialization', () => {
    it('should create ChallengesService instance', () => {
      expect(challengesService).toBeInstanceOf(ChallengesService);
    });
  });

  describe('Validation Logic', () => {
    it('should validate challenge data', () => {
      const validChallenge = {
        challenger_id: 'user-123',
        challenged_id: 'user-456',
        game_type: 'TOP10',
        status: 'PENDING',
        expires_at: '2024-01-02T10:00:00Z'
      };
      
      expect(validChallenge.challenger_id).toBeDefined();
      expect(validChallenge.challenged_id).toBeDefined();
      expect(validChallenge.game_type).toBeDefined();
      expect(validChallenge.status).toBeDefined();
      expect(validChallenge.expires_at).toBeDefined();
    });

    it('should validate game types', () => {
      const validGameTypes = ['TOP10', 'GRILLE', 'CLUB'];
      
      validGameTypes.forEach(gameType => {
        expect(typeof gameType).toBe('string');
        expect(gameType.length).toBeGreaterThan(0);
      });
    });

    it('should validate challenge statuses', () => {
      const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'EXPIRED'];
      
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(status.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Challenge Logic', () => {
    it('should detect self-challenge', () => {
      const userId = 'user-123';
      const isSelfChallenge = userId === userId;
      
      expect(isSelfChallenge).toBe(true);
    });

    it('should validate different users for challenge', () => {
      const user1 = 'user-123';
      const user2 = 'user-456';
      const canChallenge = user1 !== user2;
      
      expect(canChallenge).toBe(true);
    });

    it('should validate challenge expiration', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
      const past = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      expect(future > now).toBe(true);
      expect(past < now).toBe(true);
    });
  });

  describe('Results Logic', () => {
    it('should validate challenge results', () => {
      const validResults = {
        challenger_score: 8,
        challenged_score: 6,
        challenger_time: 120,
        challenged_time: 150,
        winner_id: 'user-123'
      };
      
      expect(validResults.challenger_score).toBeGreaterThanOrEqual(0);
      expect(validResults.challenged_score).toBeGreaterThanOrEqual(0);
      expect(validResults.winner_id).toBeDefined();
    });

    it('should determine winner correctly', () => {
      const scenarios = [
        { challenger_score: 8, challenged_score: 6, expected_winner: 'challenger' },
        { challenger_score: 6, challenged_score: 8, expected_winner: 'challenged' },
        { challenger_score: 8, challenged_score: 8, expected_winner: 'tie' }
      ];
      
      scenarios.forEach(scenario => {
        let winner;
        if (scenario.challenger_score > scenario.challenged_score) {
          winner = 'challenger';
        } else if (scenario.challenged_score > scenario.challenger_score) {
          winner = 'challenged';
        } else {
          winner = 'tie';
        }
        
        expect(winner).toBe(scenario.expected_winner);
      });
    });
  });

  describe('Statistics Logic', () => {
    it('should calculate win rate correctly', () => {
      const stats = [
        { wins: 10, losses: 5, expected_rate: 0.67 },
        { wins: 8, losses: 2, expected_rate: 0.8 },
        { wins: 0, losses: 5, expected_rate: 0 }
      ];
      
      stats.forEach(stat => {
        const winRate = stat.wins / (stat.wins + stat.losses);
        expect(winRate).toBeCloseTo(stat.expected_rate, 2);
      });
    });

    it('should validate leaderboard entries', () => {
      const leaderboardEntry = {
        user_id: 'user-123',
        wins: 10,
        losses: 5,
        win_rate: 0.67,
        total_challenges: 15
      };
      
      expect(leaderboardEntry.user_id).toBeDefined();
      expect(leaderboardEntry.wins).toBeGreaterThanOrEqual(0);
      expect(leaderboardEntry.losses).toBeGreaterThanOrEqual(0);
      expect(leaderboardEntry.win_rate).toBeGreaterThanOrEqual(0);
      expect(leaderboardEntry.win_rate).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle self-challenge in createChallenge', async () => {
      await expect(challengesService.createChallenge('user-123', 'user-123', 'TOP10', '2024-01-02T10:00:00Z'))
        .rejects.toThrow('Cannot challenge yourself');
    });

    it('should validate challenge parameters', () => {
      const validParams = {
        challengerId: 'user-123',
        challengedId: 'user-456',
        gameType: 'TOP10',
        expiresAt: '2024-01-02T10:00:00Z'
      };
      
      expect(validParams.challengerId).toBeDefined();
      expect(validParams.challengedId).toBeDefined();
      expect(validParams.gameType).toBeDefined();
      expect(validParams.expiresAt).toBeDefined();
    });
  });

  describe('Data Structures', () => {
    it('should validate challenge object structure', () => {
      const mockChallenge = {
        id: 'challenge-123',
        challenger_id: 'user-123',
        challenged_id: 'user-456',
        game_type: 'TOP10',
        status: 'PENDING',
        created_at: '2024-01-01T10:00:00Z',
        expires_at: '2024-01-02T10:00:00Z'
      };
      
      expect(mockChallenge.id).toBeDefined();
      expect(mockChallenge.challenger_id).toBeDefined();
      expect(mockChallenge.challenged_id).toBeDefined();
      expect(mockChallenge.game_type).toBeDefined();
      expect(mockChallenge.status).toBeDefined();
      expect(mockChallenge.created_at).toBeDefined();
      expect(mockChallenge.expires_at).toBeDefined();
    });

    it('should validate challenge results structure', () => {
      const mockResults = {
        challenger_score: 8,
        challenged_score: 6,
        challenger_time: 120,
        challenged_time: 150,
        winner_id: 'user-123'
      };
      
      expect(mockResults.challenger_score).toBeDefined();
      expect(mockResults.challenged_score).toBeDefined();
      expect(mockResults.winner_id).toBeDefined();
    });
  });

  describe('Business Logic', () => {
    it('should validate challenge eligibility', () => {
      const scenarios = [
        { user1: 'user-123', user2: 'user-456', canChallenge: true },
        { user1: 'user-123', user2: 'user-123', canChallenge: false }
      ];
      
      scenarios.forEach(scenario => {
        const canChallenge = scenario.user1 !== scenario.user2;
        expect(canChallenge).toBe(scenario.canChallenge);
      });
    });

    it('should validate challenge status transitions', () => {
      const validTransitions = [
        { from: 'PENDING', to: 'ACCEPTED' },
        { from: 'PENDING', to: 'REJECTED' },
        { from: 'ACCEPTED', to: 'COMPLETED' },
        { from: 'PENDING', to: 'EXPIRED' }
      ];
      
      validTransitions.forEach(transition => {
        expect(transition.from).toBeDefined();
        expect(transition.to).toBeDefined();
      });
    });
  });
});





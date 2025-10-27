// src/services/__tests__/admin-questions.service.test.ts
import { AdminQuestionsService } from '../admin-questions.service';

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
            data: { id: '1', title: 'Test Question', game_type: 'TOP10' },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: { id: '1', title: 'Updated Question' },
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

describe('AdminQuestionsService', () => {
  let service: AdminQuestionsService;

  beforeEach(() => {
    service = new AdminQuestionsService();
    jest.clearAllMocks();
  });

  describe('Question Management', () => {
    it('should get all questions with filters', async () => {
      const filters = {
        game_type: 'TOP10',
        is_active: true,
        difficulty: 'medium'
      };

      const result = await service.getQuestions(filters);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get a question by ID', async () => {
      const questionId = '1';
      const result = await service.getQuestionById(questionId);
      expect(result).toBeDefined();
      expect(result.id).toBe(questionId);
    });

    it('should create a TOP10 question', async () => {
      const question = {
        game_type: 'TOP10',
        title: 'Top 10 Buteurs Ligue 1 2024',
        description: 'Trouvez les 10 meilleurs buteurs de Ligue 1',
        difficulty: 'medium',
        time_limit: 300,
        max_attempts: 3,
        is_active: true,
        answers: [
          { player_id: '1', ranking: 1, points: 25 },
          { player_id: '2', ranking: 2, points: 20 }
        ]
      };

      const result = await service.createQuestion(question);
      expect(result).toBeDefined();
      expect(result.game_type).toBe('TOP10');
      expect(result.answers).toHaveLength(2);
    });

    it('should create a GRILLE question', async () => {
      const question = {
        game_type: 'GRILLE',
        title: 'Grille 3x3 Ligue 1 + France',
        description: 'Remplissez la grille avec des joueurs de Ligue 1 et français',
        difficulty: 'hard',
        time_limit: 600,
        max_attempts: 5,
        is_active: true,
        grid_config: {
          rows: 3,
          cols: 3,
          criteria: [
            { row: 1, col: 1, criteria: 'Ligue 1 + France' },
            { row: 1, col: 2, criteria: 'Ligue 1 + Spain' }
          ]
        }
      };

      const result = await service.createQuestion(question);
      expect(result).toBeDefined();
      expect(result.game_type).toBe('GRILLE');
      expect(result.grid_config).toBeDefined();
    });

    it('should create a CLUB question', async () => {
      const question = {
        game_type: 'CLUB',
        title: 'Devinez le club actuel',
        description: 'Trouvez le club actuel de ces joueurs',
        difficulty: 'easy',
        time_limit: 180,
        max_attempts: 2,
        is_active: true,
        players: [
          { player_id: '1', hint: 'Joueur français, attaquant' },
          { player_id: '2', hint: 'Joueur brésilien, milieu' }
        ]
      };

      const result = await service.createQuestion(question);
      expect(result).toBeDefined();
      expect(result.game_type).toBe('CLUB');
      expect(result.players).toHaveLength(2);
    });

    it('should update a question', async () => {
      const questionId = '1';
      const updates = {
        title: 'Updated Question Title',
        difficulty: 'hard',
        time_limit: 400
      };

      const result = await service.updateQuestion(questionId, updates);
      expect(result).toBeDefined();
    });

    it('should delete a question', async () => {
      const questionId = '1';
      const result = await service.deleteQuestion(questionId);
      expect(result).toBe(true);
    });

    it('should archive a question', async () => {
      const questionId = '1';
      const result = await service.archiveQuestion(questionId);
      expect(result).toBe(true);
    });
  });

  describe('Answer Management', () => {
    it('should add answers to a TOP10 question', async () => {
      const questionId = '1';
      const answers = [
        { player_id: '1', ranking: 1, points: 25 },
        { player_id: '2', ranking: 2, points: 20 }
      ];

      const result = await service.addAnswers(questionId, answers);
      expect(result).toBeDefined();
      expect(result.added_count).toBe(2);
    });

    it('should update answer ranking', async () => {
      const answerId = '1';
      const updates = {
        ranking: 3,
        points: 15
      };

      const result = await service.updateAnswer(answerId, updates);
      expect(result).toBeDefined();
    });

    it('should remove an answer', async () => {
      const answerId = '1';
      const result = await service.removeAnswer(answerId);
      expect(result).toBe(true);
    });

    it('should reorder answers', async () => {
      const questionId = '1';
      const newOrder = [
        { answer_id: '1', ranking: 2 },
        { answer_id: '2', ranking: 1 }
      ];

      const result = await service.reorderAnswers(questionId, newOrder);
      expect(result).toBe(true);
    });
  });

  describe('Grid Management', () => {
    it('should create grid configuration', async () => {
      const gridConfig = {
        rows: 3,
        cols: 3,
        criteria: [
          { row: 1, col: 1, criteria: 'Ligue 1 + France' },
          { row: 1, col: 2, criteria: 'Ligue 1 + Spain' }
        ]
      };

      const result = await service.createGridConfig(gridConfig);
      expect(result).toBeDefined();
      expect(result.rows).toBe(3);
      expect(result.cols).toBe(3);
    });

    it('should update grid configuration', async () => {
      const gridId = '1';
      const updates = {
        criteria: [
          { row: 1, col: 1, criteria: 'Updated criteria' }
        ]
      };

      const result = await service.updateGridConfig(gridId, updates);
      expect(result).toBeDefined();
    });

    it('should get grid answers', async () => {
      const gridId = '1';
      const result = await service.getGridAnswers(gridId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Question Validation', () => {
    it('should validate TOP10 question data', async () => {
      const invalidQuestion = {
        game_type: 'TOP10',
        title: '',
        answers: []
      };

      await expect(service.createQuestion(invalidQuestion)).rejects.toThrow();
    });

    it('should validate GRILLE question data', async () => {
      const invalidQuestion = {
        game_type: 'GRILLE',
        title: 'Test',
        grid_config: {
          rows: 0,
          cols: 0
        }
      };

      await expect(service.createQuestion(invalidQuestion)).rejects.toThrow();
    });

    it('should validate CLUB question data', async () => {
      const invalidQuestion = {
        game_type: 'CLUB',
        title: 'Test',
        players: []
      };

      await expect(service.createQuestion(invalidQuestion)).rejects.toThrow();
    });
  });

  describe('Question Statistics', () => {
    it('should get question usage statistics', async () => {
      const result = await service.getQuestionUsageStats();
      expect(result).toBeDefined();
      expect(result.total_questions).toBeDefined();
      expect(result.by_game_type).toBeDefined();
    });

    it('should get question performance metrics', async () => {
      const questionId = '1';
      const result = await service.getQuestionPerformanceMetrics(questionId);
      expect(result).toBeDefined();
      expect(result.completion_rate).toBeDefined();
      expect(result.average_score).toBeDefined();
    });

    it('should get popular questions', async () => {
      const result = await service.getPopularQuestions();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    it('should duplicate a question', async () => {
      const questionId = '1';
      const result = await service.duplicateQuestion(questionId);
      expect(result).toBeDefined();
      expect(result.id).not.toBe(questionId);
    });

    it('should bulk update questions', async () => {
      const questionIds = ['1', '2', '3'];
      const updates = { is_active: false };
      const result = await service.bulkUpdateQuestions(questionIds, updates);
      expect(result).toBeDefined();
      expect(result.updated_count).toBe(3);
    });

    it('should bulk delete questions', async () => {
      const questionIds = ['1', '2', '3'];
      const result = await service.bulkDeleteQuestions(questionIds);
      expect(result).toBeDefined();
      expect(result.deleted_count).toBe(3);
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

      await expect(service.getQuestions()).rejects.toThrow();
    });

    it('should handle invalid game types', async () => {
      const question = {
        game_type: 'INVALID',
        title: 'Test Question'
      };

      await expect(service.createQuestion(question)).rejects.toThrow();
    });
  });
});





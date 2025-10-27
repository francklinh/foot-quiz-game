// src/services/__tests__/admin-questions.service.simple.test.ts
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

describe('AdminQuestionsService - Simple Tests', () => {
  let service: AdminQuestionsService;

  beforeEach(() => {
    service = new AdminQuestionsService();
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AdminQuestionsService);
    });

    it('should have all required methods', () => {
      expect(typeof service.getQuestions).toBe('function');
      expect(typeof service.getQuestionById).toBe('function');
      expect(typeof service.createQuestion).toBe('function');
      expect(typeof service.updateQuestion).toBe('function');
      expect(typeof service.deleteQuestion).toBe('function');
      expect(typeof service.archiveQuestion).toBe('function');
      expect(typeof service.addAnswers).toBe('function');
      expect(typeof service.updateAnswer).toBe('function');
      expect(typeof service.removeAnswer).toBe('function');
      expect(typeof service.reorderAnswers).toBe('function');
      expect(typeof service.createGridConfig).toBe('function');
      expect(typeof service.updateGridConfig).toBe('function');
      expect(typeof service.getGridAnswers).toBe('function');
      expect(typeof service.getQuestionUsageStats).toBe('function');
      expect(typeof service.getQuestionPerformanceMetrics).toBe('function');
      expect(typeof service.getPopularQuestions).toBe('function');
      expect(typeof service.duplicateQuestion).toBe('function');
      expect(typeof service.bulkUpdateQuestions).toBe('function');
      expect(typeof service.bulkDeleteQuestions).toBe('function');
    });
  });

  describe('Validation', () => {
    it('should validate question data', async () => {
      const invalidData = {
        game_type: '',
        title: 'Test Question'
      };

      await expect(service.createQuestion(invalidData)).rejects.toThrow();
    });

    it('should validate game type values', async () => {
      const invalidData = {
        game_type: 'INVALID',
        title: 'Test Question',
        description: 'Test description',
        difficulty: 'easy',
        time_limit: 300,
        max_attempts: 3,
        is_active: true
      };

      await expect(service.createQuestion(invalidData)).rejects.toThrow();
    });

    it('should validate difficulty levels', async () => {
      const invalidData = {
        game_type: 'TOP10',
        title: 'Test Question',
        description: 'Test description',
        difficulty: 'invalid',
        time_limit: 300,
        max_attempts: 3,
        is_active: true
      };

      await expect(service.createQuestion(invalidData)).rejects.toThrow();
    });

    it('should validate time limits', async () => {
      const invalidData = {
        game_type: 'TOP10',
        title: 'Test Question',
        description: 'Test description',
        difficulty: 'easy',
        time_limit: 10, // Too low
        max_attempts: 3,
        is_active: true
      };

      await expect(service.createQuestion(invalidData)).rejects.toThrow();
    });

    it('should validate max attempts', async () => {
      const invalidData = {
        game_type: 'TOP10',
        title: 'Test Question',
        description: 'Test description',
        difficulty: 'easy',
        time_limit: 300,
        max_attempts: 0, // Too low
        is_active: true
      };

      await expect(service.createQuestion(invalidData)).rejects.toThrow();
    });

    it('should validate grid size', async () => {
      const invalidGridConfig = {
        question_id: '1',
        rows: 1, // Too small
        cols: 1, // Too small
        criteria: []
      };

      await expect(service.createGridConfig(invalidGridConfig)).rejects.toThrow();
    });

    it('should accept valid game types', async () => {
      const validGameTypes = ['TOP10', 'GRILLE', 'CLUB'];
      
      for (const gameType of validGameTypes) {
        // Should not throw for valid game types
        expect(() => service.validateGameType(gameType)).not.toThrow();
      }
    });

    it('should accept valid difficulties', async () => {
      const validDifficulties = ['easy', 'medium', 'hard'];
      
      for (const difficulty of validDifficulties) {
        // Should not throw for valid difficulties
        expect(() => service.validateDifficulty(difficulty)).not.toThrow();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing question ID', async () => {
      await expect(service.getQuestionById('')).rejects.toThrow();
    });

    it('should handle missing question ID for update', async () => {
      await expect(service.updateQuestion('', { title: 'Test' })).rejects.toThrow();
    });

    it('should handle missing question ID for delete', async () => {
      await expect(service.deleteQuestion('')).rejects.toThrow();
    });

    it('should handle missing question ID for archive', async () => {
      await expect(service.archiveQuestion('')).rejects.toThrow();
    });

    it('should handle missing answer ID for update', async () => {
      await expect(service.updateAnswer('', { ranking: 1 })).rejects.toThrow();
    });

    it('should handle missing answer ID for remove', async () => {
      await expect(service.removeAnswer('')).rejects.toThrow();
    });

    it('should handle missing grid ID for update', async () => {
      await expect(service.updateGridConfig('', { rows: 3 })).rejects.toThrow();
    });

    it('should handle missing grid ID for get answers', async () => {
      await expect(service.getGridAnswers('')).rejects.toThrow();
    });

    it('should handle missing question ID for performance', async () => {
      await expect(service.getQuestionPerformanceMetrics('')).rejects.toThrow();
    });

    it('should handle missing question ID for duplicate', async () => {
      await expect(service.duplicateQuestion('')).rejects.toThrow();
    });
  });

  describe('Answer Management', () => {
    it('should handle empty answers array', async () => {
      await expect(service.addAnswers('1', [])).rejects.toThrow();
    });

    it('should handle missing question ID for add answers', async () => {
      const answers = [{ player_id: '1', ranking: 1, points: 10 }];
      await expect(service.addAnswers('', answers)).rejects.toThrow();
    });

    it('should handle empty reorder array', async () => {
      await expect(service.reorderAnswers('1', [])).rejects.toThrow();
    });

    it('should handle missing question ID for reorder', async () => {
      const newOrder = [{ answer_id: '1', ranking: 1 }];
      await expect(service.reorderAnswers('', newOrder)).rejects.toThrow();
    });
  });

  describe('Bulk Operations', () => {
    it('should handle empty question IDs for bulk update', async () => {
      const result = await service.bulkUpdateQuestions([], { is_active: false });
      expect(result.updated_count).toBe(0);
      expect(result.error_count).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should handle empty question IDs for bulk delete', async () => {
      const result = await service.bulkDeleteQuestions([]);
      expect(result.deleted_count).toBe(0);
      expect(result.error_count).toBe(0);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Mock Integration', () => {
    it('should call supabase.from for getQuestions', async () => {
      const { supabase } = require('../../lib/supabase');
      await service.getQuestions();
      expect(supabase.from).toHaveBeenCalledWith('questions');
    });

    it('should call supabase.from for getQuestionById', async () => {
      const { supabase } = require('../../lib/supabase');
      await service.getQuestionById('1');
      expect(supabase.from).toHaveBeenCalledWith('questions');
    });

    it('should call supabase.from for getPopularQuestions', async () => {
      const { supabase } = require('../../lib/supabase');
      await service.getPopularQuestions();
      expect(supabase.from).toHaveBeenCalledWith('questions');
    });
  });
});





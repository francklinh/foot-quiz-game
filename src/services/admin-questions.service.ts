// src/services/admin-questions-refactored.service.ts
import { BaseAdminService, BaseEntity } from './admin-base.service';
import { 
  VALID_GAME_TYPES, 
  VALID_DIFFICULTIES, 
  GameType as GameTypeEnum, 
  Difficulty,
  ERROR_MESSAGES,
  LIMITS,
  TABLES
} from './admin-constants';

// Types
export interface Question extends BaseEntity {
  game_type: GameTypeEnum;
  title: string;
  description: string;
  difficulty: Difficulty;
  time_limit: number;
  max_attempts: number;
  is_active: boolean;
}

export interface QuestionAnswer {
  id: string;
  question_id: string;
  player_id: string;
  ranking: number;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface GridConfig {
  id: string;
  question_id: string;
  rows: number;
  cols: number;
  criteria: string[];
  created_at: string;
  updated_at: string;
}

export interface GridAnswer {
  id: string;
  grid_config_id: string;
  player_id: string;
  row: number;
  col: number;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionFilters {
  game_type?: GameTypeEnum;
  difficulty?: Difficulty;
  is_active?: boolean;
  search?: string;
}

export interface QuestionUsageStats {
  total_questions: number;
  by_game_type: Record<string, number>;
  by_difficulty: Record<string, number>;
  active_questions: number;
}

export interface QuestionPerformanceMetrics {
  completion_rate: number;
  average_score: number;
  average_time: number;
  success_rate: number;
}

export interface BulkUpdateResult {
  updated_count: number;
  success_count: number;
  error_count: number;
  errors: string[];
}

export interface BulkDeleteResult {
  deleted_count: number;
  success_count: number;
  error_count: number;
  errors: string[];
}

export class AdminQuestionsService extends BaseAdminService {
  // Validation methods
  private validateGameType(gameType: string): void {
    this.validateEnum(gameType, VALID_GAME_TYPES, 'Type de jeu');
  }

  private validateDifficulty(difficulty: string): void {
    this.validateEnum(difficulty, VALID_DIFFICULTIES, 'Niveau de difficulté');
  }

  private validateTimeLimit(timeLimit: number): void {
    this.validateRange(timeLimit, LIMITS.MIN_TIME_LIMIT, LIMITS.MAX_TIME_LIMIT, 'Limite de temps');
  }

  private validateMaxAttempts(maxAttempts: number): void {
    this.validateRange(maxAttempts, LIMITS.MIN_MAX_ATTEMPTS, LIMITS.MAX_MAX_ATTEMPTS, 'Nombre maximum de tentatives');
  }

  private validateGridSize(rows: number, cols: number): void {
    this.validateRange(rows, LIMITS.MIN_GRID_SIZE, LIMITS.MAX_GRID_SIZE, 'Nombre de lignes');
    this.validateRange(cols, LIMITS.MIN_GRID_SIZE, LIMITS.MAX_GRID_SIZE, 'Nombre de colonnes');
  }

  private validateQuestionData(data: any): void {
    this.validateRequired(data, ['game_type', 'title', 'description', 'difficulty', 'time_limit', 'max_attempts']);
    this.validateGameType(data.game_type);
    this.validateDifficulty(data.difficulty);
    this.validateTimeLimit(data.time_limit);
    this.validateMaxAttempts(data.max_attempts);
  }

  private validateGridConfigData(data: any): void {
    this.validateRequired(data, ['question_id', 'rows', 'cols', 'criteria']);
    this.validateGridSize(data.rows, data.cols);
  }

  // Question Management
  async getQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
    return this.executeSelect<Question>(TABLES.QUESTIONS, filters, 'created_at', 'desc');
  }

  async getQuestionById(questionId: string): Promise<Question> {
    this.validateId(questionId, 'ID de la question');
    return this.executeSelectSingle<Question>(TABLES.QUESTIONS, questionId);
  }

  async createQuestion(questionData: Omit<Question, keyof BaseEntity>): Promise<Question> {
    this.validateQuestionData(questionData);
    return this.executeInsert<Question>(TABLES.QUESTIONS, questionData);
  }

  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<Question> {
    this.validateId(questionId, 'ID de la question');
    return this.executeUpdate<Question>(TABLES.QUESTIONS, questionId, updates);
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    this.validateId(questionId, 'ID de la question');
    return this.executeDelete(TABLES.QUESTIONS, questionId);
  }

  async archiveQuestion(questionId: string): Promise<Question> {
    this.validateId(questionId, 'ID de la question');
    return this.executeUpdate<Question>(TABLES.QUESTIONS, questionId, { is_active: false });
  }

  // Answer Management
  async addAnswers(questionId: string, answers: Omit<QuestionAnswer, 'id' | 'question_id' | 'created_at' | 'updated_at'>[]): Promise<QuestionAnswer[]> {
    this.validateId(questionId, 'ID de la question');
    
    if (answers.length === 0) {
      throw new Error('Au moins une réponse est requise');
    }

    const answersWithQuestionId = answers.map(answer => ({
      ...answer,
      question_id: questionId
    }));

    const results: QuestionAnswer[] = [];
    for (const answer of answersWithQuestionId) {
      const result = await this.executeInsert<QuestionAnswer>(TABLES.QUESTION_ANSWERS, answer);
      results.push(result);
    }

    return results;
  }

  async updateAnswer(answerId: string, updates: Partial<QuestionAnswer>): Promise<QuestionAnswer> {
    this.validateId(answerId, 'ID de la réponse');
    return this.executeUpdate<QuestionAnswer>(TABLES.QUESTION_ANSWERS, answerId, updates);
  }

  async removeAnswer(answerId: string): Promise<boolean> {
    this.validateId(answerId, 'ID de la réponse');
    return this.executeDelete(TABLES.QUESTION_ANSWERS, answerId);
  }

  async reorderAnswers(questionId: string, newOrder: { answer_id: string; ranking: number }[]): Promise<QuestionAnswer[]> {
    this.validateId(questionId, 'ID de la question');
    
    if (newOrder.length === 0) {
      throw new Error('Au moins une réponse est requise pour le réordonnancement');
    }

    const results: QuestionAnswer[] = [];
    for (const orderItem of newOrder) {
      const result = await this.updateAnswer(orderItem.answer_id, { ranking: orderItem.ranking });
      results.push(result);
    }

    return results;
  }

  // Grid Configuration Management
  async createGridConfig(configData: Omit<GridConfig, keyof BaseEntity>): Promise<GridConfig> {
    this.validateGridConfigData(configData);
    return this.executeInsert<GridConfig>(TABLES.GRID_CONFIGS, configData);
  }

  async updateGridConfig(configId: string, updates: Partial<GridConfig>): Promise<GridConfig> {
    this.validateId(configId, 'ID de configuration de grille');
    return this.executeUpdate<GridConfig>(TABLES.GRID_CONFIGS, configId, updates);
  }

  async getGridAnswers(gridConfigId: string): Promise<GridAnswer[]> {
    this.validateId(gridConfigId, 'ID de configuration de grille');
    return this.executeSelect<GridAnswer>(TABLES.GRID_ANSWERS, { grid_config_id: gridConfigId });
  }

  // Statistics
  async getQuestionUsageStats(): Promise<QuestionUsageStats> {
    const questions = await this.executeSelect<Question>(TABLES.QUESTIONS);
    
    const byGameType = this.calculateStatistics(questions, 'game_type');
    const byDifficulty = this.calculateStatistics(questions, 'difficulty');
    const activeQuestions = questions.filter(q => q.is_active).length;

    return {
      total_questions: questions.length,
      by_game_type: byGameType,
      by_difficulty: byDifficulty,
      active_questions: activeQuestions
    };
  }

  async getQuestionPerformanceMetrics(questionId: string): Promise<QuestionPerformanceMetrics> {
    this.validateId(questionId, 'ID de la question');
    
    const results = await this.executeSelect<{ score: number; time_taken: number; is_completed: boolean }>(
      TABLES.GAME_RESULTS,
      { question_id: questionId },
      'created_at',
      'desc',
      'score, time_taken, is_completed'
    );

    return this.calculatePerformanceMetrics(results);
  }

  async getPopularQuestions(limit: number = 10): Promise<Question[]> {
    const questions = await this.executeSelect<Question>(
      TABLES.QUESTIONS,
      { is_active: true },
      'created_at',
      'desc'
    );

    return questions.slice(0, limit);
  }

  // Utility Methods
  async duplicateQuestion(questionId: string): Promise<Question> {
    this.validateId(questionId, 'ID de la question');
    
    const originalQuestion = await this.getQuestionById(questionId);
    const duplicatedData = {
      ...originalQuestion,
      title: `${originalQuestion.title} (Copie)`,
      is_active: false
    };

    delete (duplicatedData as any).id;
    delete (duplicatedData as any).created_at;
    delete (duplicatedData as any).updated_at;

    return this.createQuestion(duplicatedData);
  }

  // Bulk Operations
  async bulkUpdateQuestions(questionIds: string[], updates: Partial<Question>): Promise<BulkUpdateResult> {
    if (questionIds.length === 0) {
      return { updated_count: 0, success_count: 0, error_count: 0, errors: [] };
    }

    const result = await this.executeBulkOperation(
      questionIds,
      async (questionId) => this.updateQuestion(questionId, updates),
      'Bulk update questions'
    );
    return { ...result, updated_count: result.success_count };
  }

  async bulkDeleteQuestions(questionIds: string[]): Promise<BulkDeleteResult> {
    if (questionIds.length === 0) {
      return { deleted_count: 0, success_count: 0, error_count: 0, errors: [] };
    }

    const result = await this.executeBulkOperation(
      questionIds,
      async (questionId) => this.deleteQuestion(questionId),
      'Bulk delete questions'
    );
    return { ...result, deleted_count: result.success_count };
  }

  async bulkArchiveQuestions(questionIds: string[]): Promise<BulkUpdateResult> {
    if (questionIds.length === 0) {
      return { updated_count: 0, success_count: 0, error_count: 0, errors: [] };
    }

    const result = await this.executeBulkOperation(
      questionIds,
      async (questionId) => this.archiveQuestion(questionId),
      'Bulk archive questions'
    );
    return { ...result, updated_count: result.success_count };
  }
}

// src/services/admin-questions.service.ts
import { supabase } from '../lib/supabase';

// Types
export interface Question {
  id: string;
  game_type: 'TOP10' | 'GRILLE' | 'CLUB';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number;
  max_attempts: number;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Top10Answer {
  player_id: string;
  ranking: number;
  points: number;
}

export interface GrilleAnswer {
  row: number;
  col: number;
  player_id: string;
  criteria: string;
}

export interface ClubAnswer {
  player_id: string;
  hint: string;
  correct_club: string;
}

export interface GridConfig {
  id: string;
  question_id: string;
  rows: number;
  cols: number;
  criteria: Array<{
    row: number;
    col: number;
    criteria: string;
  }>;
}

export interface QuestionFilters {
  game_type?: string;
  is_active?: boolean;
  difficulty?: string;
  is_archived?: boolean;
}

export interface QuestionUsageStats {
  total_questions: number;
  by_game_type: Record<string, number>;
  by_difficulty: Record<string, number>;
  popular_questions: Question[];
}

export interface QuestionPerformanceMetrics {
  completion_rate: number;
  average_score: number;
  average_time: number;
  success_rate: number;
}

export interface BulkUpdateResult {
  updated_count: number;
  error_count: number;
  errors: string[];
}

export interface BulkDeleteResult {
  deleted_count: number;
  error_count: number;
  errors: string[];
}

// Constants
const VALID_GAME_TYPES = ['TOP10', 'GRILLE', 'CLUB'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const MIN_TIME_LIMIT = 30;
const MAX_TIME_LIMIT = 3600;
const MIN_MAX_ATTEMPTS = 1;
const MAX_MAX_ATTEMPTS = 10;
const MIN_GRID_SIZE = 2;
const MAX_GRID_SIZE = 5;

const ERROR_MESSAGES = {
  INVALID_GAME_TYPE: 'Type de jeu invalide',
  INVALID_DIFFICULTY: 'Niveau de difficulté invalide',
  INVALID_TIME_LIMIT: 'Limite de temps invalide',
  INVALID_MAX_ATTEMPTS: 'Nombre maximum de tentatives invalide',
  INVALID_GRID_SIZE: 'Taille de grille invalide',
  QUESTION_NOT_FOUND: 'Question non trouvée',
  VALIDATION_ERROR: 'Erreur de validation',
  DATABASE_ERROR: 'Erreur de base de données'
};

export class AdminQuestionsService {
  // Validation methods
  private validateGameType(gameType: string): void {
    if (!VALID_GAME_TYPES.includes(gameType)) {
      throw new Error(ERROR_MESSAGES.INVALID_GAME_TYPE);
    }
  }

  private validateDifficulty(difficulty: string): void {
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      throw new Error(ERROR_MESSAGES.INVALID_DIFFICULTY);
    }
  }

  private validateTimeLimit(timeLimit: number): void {
    if (timeLimit < MIN_TIME_LIMIT || timeLimit > MAX_TIME_LIMIT) {
      throw new Error(ERROR_MESSAGES.INVALID_TIME_LIMIT);
    }
  }

  private validateMaxAttempts(maxAttempts: number): void {
    if (maxAttempts < MIN_MAX_ATTEMPTS || maxAttempts > MAX_MAX_ATTEMPTS) {
      throw new Error(ERROR_MESSAGES.INVALID_MAX_ATTEMPTS);
    }
  }

  private validateGridSize(rows: number, cols: number): void {
    if (rows < MIN_GRID_SIZE || rows > MAX_GRID_SIZE || 
        cols < MIN_GRID_SIZE || cols > MAX_GRID_SIZE) {
      throw new Error(ERROR_MESSAGES.INVALID_GRID_SIZE);
    }
  }

  private validateQuestionData(data: any): void {
    if (!data.game_type || !data.title || !data.description) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }
    
    this.validateGameType(data.game_type);
    this.validateDifficulty(data.difficulty);
    this.validateTimeLimit(data.time_limit);
    this.validateMaxAttempts(data.max_attempts);
  }

  // Question Management
  async getQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.game_type) {
        query = query.eq('game_type', filters.game_type);
      }
      
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      if (filters.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async getQuestionById(questionId: string): Promise<Question> {
    if (!questionId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(ERROR_MESSAGES.QUESTION_NOT_FOUND);
      }

      return data;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async createQuestion(questionData: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Promise<Question> {
    this.validateQuestionData(questionData);

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([questionData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<Question> {
    if (!questionId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    if (updates.game_type) {
      this.validateGameType(updates.game_type);
    }
    
    if (updates.difficulty) {
      this.validateDifficulty(updates.difficulty);
    }
    
    if (updates.time_limit) {
      this.validateTimeLimit(updates.time_limit);
    }
    
    if (updates.max_attempts) {
      this.validateMaxAttempts(updates.max_attempts);
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    if (!questionId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async archiveQuestion(questionId: string): Promise<boolean> {
    if (!questionId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { error } = await supabase
        .from('questions')
        .update({ is_archived: true, is_active: false })
        .eq('id', questionId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  // Answer Management
  async addAnswers(questionId: string, answers: Top10Answer[] | GrilleAnswer[] | ClubAnswer[]): Promise<{ added_count: number }> {
    if (!questionId || !answers || answers.length === 0) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { data, error } = await supabase
        .from('question_answers')
        .insert(answers.map(answer => ({ question_id: questionId, ...answer })));

      if (error) {
        throw new Error(error.message);
      }

      return { added_count: answers.length };
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async updateAnswer(answerId: string, updates: any): Promise<any> {
    if (!answerId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { data, error } = await supabase
        .from('question_answers')
        .update(updates)
        .eq('id', answerId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async removeAnswer(answerId: string): Promise<boolean> {
    if (!answerId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { error } = await supabase
        .from('question_answers')
        .delete()
        .eq('id', answerId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async reorderAnswers(questionId: string, newOrder: Array<{ answer_id: string; ranking: number }>): Promise<boolean> {
    if (!questionId || !newOrder || newOrder.length === 0) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      for (const orderItem of newOrder) {
        await supabase
          .from('question_answers')
          .update({ ranking: orderItem.ranking })
          .eq('id', orderItem.answer_id)
          .eq('question_id', questionId);
      }

      return true;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  // Grid Management
  async createGridConfig(gridConfig: Omit<GridConfig, 'id'>): Promise<GridConfig> {
    this.validateGridSize(gridConfig.rows, gridConfig.cols);

    try {
      const { data, error } = await supabase
        .from('grid_configs')
        .insert([gridConfig])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async updateGridConfig(gridId: string, updates: Partial<GridConfig>): Promise<GridConfig> {
    if (!gridId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    if (updates.rows && updates.cols) {
      this.validateGridSize(updates.rows, updates.cols);
    }

    try {
      const { data, error } = await supabase
        .from('grid_configs')
        .update(updates)
        .eq('id', gridId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async getGridAnswers(gridId: string): Promise<GrilleAnswer[]> {
    if (!gridId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { data, error } = await supabase
        .from('grid_answers')
        .select('*')
        .eq('grid_id', gridId);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  // Question Statistics
  async getQuestionUsageStats(): Promise<QuestionUsageStats> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      const questions = data || [];
      const totalQuestions = questions.length;
      
      const byGameType = questions.reduce((acc: Record<string, number>, question) => {
        acc[question.game_type] = (acc[question.game_type] || 0) + 1;
        return acc;
      }, {});

      const byDifficulty = questions.reduce((acc: Record<string, number>, question) => {
        acc[question.difficulty] = (acc[question.difficulty] || 0) + 1;
        return acc;
      }, {});

      const popularQuestions = questions
        .filter(q => q.is_active)
        .slice(0, 5);

      return {
        total_questions: totalQuestions,
        by_game_type: byGameType,
        by_difficulty: byDifficulty,
        popular_questions: popularQuestions
      };
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async getQuestionPerformanceMetrics(questionId: string): Promise<QuestionPerformanceMetrics> {
    if (!questionId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('score, time_taken, is_completed')
        .eq('question_id', questionId);

      if (error) {
        throw new Error(error.message);
      }

      const results = data || [];
      const totalResults = results.length;
      const completedResults = results.filter(r => r.is_completed);
      const completionRate = totalResults > 0 ? completedResults.length / totalResults : 0;
      const averageScore = completedResults.length > 0 
        ? completedResults.reduce((sum, r) => sum + r.score, 0) / completedResults.length 
        : 0;
      const averageTime = completedResults.length > 0 
        ? completedResults.reduce((sum, r) => sum + r.time_taken, 0) / completedResults.length 
        : 0;
      const successRate = completedResults.length > 0 
        ? completedResults.filter(r => r.score > 0).length / completedResults.length 
        : 0;

      return {
        completion_rate: completionRate,
        average_score: averageScore,
        average_time: averageTime,
        success_rate: successRate
      };
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async getPopularQuestions(): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  // Bulk Operations
  async duplicateQuestion(questionId: string): Promise<Question> {
    if (!questionId) {
      throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    try {
      const originalQuestion = await this.getQuestionById(questionId);
      const duplicatedQuestion = {
        ...originalQuestion,
        id: undefined,
        title: `${originalQuestion.title} (Copie)`,
        created_at: undefined,
        updated_at: undefined
      };

      return await this.createQuestion(duplicatedQuestion);
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  async bulkUpdateQuestions(questionIds: string[], updates: Partial<Question>): Promise<BulkUpdateResult> {
    const result: BulkUpdateResult = {
      updated_count: 0,
      error_count: 0,
      errors: []
    };

    for (const questionId of questionIds) {
      try {
        await this.updateQuestion(questionId, updates);
        result.updated_count++;
      } catch (error: any) {
        result.error_count++;
        result.errors.push(`Erreur pour ${questionId}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDeleteQuestions(questionIds: string[]): Promise<BulkDeleteResult> {
    const result: BulkDeleteResult = {
      deleted_count: 0,
      error_count: 0,
      errors: []
    };

    for (const questionId of questionIds) {
      try {
        await this.deleteQuestion(questionId);
        result.deleted_count++;
      } catch (error: any) {
        result.error_count++;
        result.errors.push(`Erreur pour ${questionId}: ${error.message}`);
      }
    }

    return result;
  }
}

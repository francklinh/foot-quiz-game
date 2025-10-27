// src/services/admin-games.service.ts
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
export interface GameType extends BaseEntity {
  name: string;
  description: string;
  rules: string;
  scoring_system: string;
}

export interface GameConfiguration extends BaseEntity {
  game_type_id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  time_limit: number;
  max_players: number;
  is_active: boolean;
}

export interface GameRules extends BaseEntity {
  game_type_id: string;
  description: string;
  scoring: string;
  time_limit: number;
  max_attempts: number;
}

export interface GameUsageStats {
  total_games: number;
  popular_games: GameConfiguration[];
  by_difficulty: Record<string, number>;
  by_game_type: Record<string, number>;
}

export interface GamePerformanceMetrics {
  completion_rate: number;
  average_score: number;
  average_time: number;
  success_rate: number;
}

export class AdminGamesService extends BaseAdminService {
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

  private validateMaxPlayers(maxPlayers: number): void {
    this.validateRange(maxPlayers, LIMITS.MIN_MAX_PLAYERS, LIMITS.MAX_MAX_PLAYERS, 'Nombre maximum de joueurs');
  }

  private validateGameTypeData(data: any): void {
    this.validateRequired(data, ['name', 'description', 'rules', 'scoring_system']);
  }

  private validateGameConfigurationData(data: any): void {
    this.validateRequired(data, ['game_type_id', 'title', 'description']);
    this.validateDifficulty(data.difficulty);
    this.validateTimeLimit(data.time_limit);
    this.validateMaxPlayers(data.max_players);
  }

  // Game Types Management
  async getGameTypes(): Promise<GameType[]> {
    return this.executeSelect<GameType>(TABLES.GAME_TYPES);
  }

  async createGameType(gameTypeData: Omit<GameType, keyof BaseEntity>): Promise<GameType> {
    this.validateGameTypeData(gameTypeData);
    return this.executeInsert<GameType>(TABLES.GAME_TYPES, gameTypeData);
  }

  async updateGameType(gameTypeId: string, updates: Partial<GameType>): Promise<GameType> {
    this.validateId(gameTypeId, 'ID du type de jeu');
    return this.executeUpdate<GameType>(TABLES.GAME_TYPES, gameTypeId, updates);
  }

  async deleteGameType(gameTypeId: string): Promise<boolean> {
    this.validateId(gameTypeId, 'ID du type de jeu');
    return this.executeDelete(TABLES.GAME_TYPES, gameTypeId);
  }

  // Game Configuration Management
  async getGameConfigurations(): Promise<GameConfiguration[]> {
    return this.executeSelect<GameConfiguration>(
      TABLES.GAME_CONFIGURATIONS,
      {},
      'created_at',
      'desc',
      '*, game_type:game_types(name, description)'
    );
  }

  async createGameConfiguration(configData: Omit<GameConfiguration, keyof BaseEntity>): Promise<GameConfiguration> {
    this.validateGameConfigurationData(configData);
    return this.executeInsert<GameConfiguration>(TABLES.GAME_CONFIGURATIONS, configData);
  }

  async updateGameConfiguration(configId: string, updates: Partial<GameConfiguration>): Promise<GameConfiguration> {
    this.validateId(configId, 'ID de configuration');
    return this.executeUpdate<GameConfiguration>(TABLES.GAME_CONFIGURATIONS, configId, updates);
  }

  async deleteGameConfiguration(configId: string): Promise<boolean> {
    this.validateId(configId, 'ID de configuration');
    return this.executeDelete(TABLES.GAME_CONFIGURATIONS, configId);
  }

  // Game Rules Management
  async getGameRules(gameTypeId: string): Promise<GameRules | null> {
    this.validateId(gameTypeId, 'ID du type de jeu');
    
    try {
      return await this.executeSelectSingle<GameRules>(
        TABLES.GAME_RULES,
        gameTypeId,
        '*'
      );
    } catch (error: any) {
      if (error.message.includes('No rows found')) {
        return null;
      }
      throw error;
    }
  }

  async updateGameRules(gameTypeId: string, rulesData: Partial<GameRules>): Promise<GameRules> {
    this.validateId(gameTypeId, 'ID du type de jeu');
    
    try {
      // Try to update existing rules
      return await this.executeUpdate<GameRules>(
        TABLES.GAME_RULES,
        gameTypeId,
        rulesData
      );
    } catch (error: any) {
      if (error.message.includes('No rows found')) {
        // No existing rules, create new ones
        return this.executeInsert<GameRules>(
          TABLES.GAME_RULES,
          { game_type_id: gameTypeId, ...rulesData }
        );
      }
      throw error;
    }
  }

  // Game Statistics
  async getGameUsageStats(): Promise<GameUsageStats> {
    const configs = await this.executeSelect<GameConfiguration>(TABLES.GAME_CONFIGURATIONS);
    const results = await this.executeSelect<{ game_configuration_id: string; score: number }>(
      TABLES.GAME_RESULTS,
      {},
      'created_at',
      'desc',
      'game_configuration_id, score'
    );

    const totalGames = configs.length;
    const popularGames = configs.slice(0, 5);
    
    const byDifficulty = this.calculateStatistics(configs, 'difficulty');
    const byGameType = this.calculateStatistics(configs, 'game_type_id');

    return {
      total_games: totalGames,
      popular_games: popularGames,
      by_difficulty: byDifficulty,
      by_game_type: byGameType
    };
  }

  async getGamePerformanceMetrics(gameId: string): Promise<GamePerformanceMetrics> {
    this.validateId(gameId, 'ID du jeu');
    
    const results = await this.executeSelect<{ score: number; time_taken: number; is_completed: boolean }>(
      TABLES.GAME_RESULTS,
      { game_configuration_id: gameId },
      'created_at',
      'desc',
      'score, time_taken, is_completed'
    );

    return this.calculatePerformanceMetrics(results);
  }
}

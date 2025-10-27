// src/services/admin-players-refactored.service.ts
import { BaseAdminService, BaseEntity } from './admin-base.service';
import { 
  VALID_POSITIONS, 
  VALID_NATIONALITIES, 
  PlayerPosition,
  Nationality,
  ERROR_MESSAGES,
  LIMITS,
  TABLES
} from './admin-constants';

// Types
export interface Player extends BaseEntity {
  name: string;
  position: PlayerPosition;
  nationality: Nationality;
  current_club: string;
  club_history: ClubHistory[];
  is_active: boolean;
  is_verified: boolean;
}

export interface ClubHistory {
  club: string;
  start_year: number;
  end_year: number;
}

export interface PlayerFilters {
  position?: PlayerPosition;
  nationality?: Nationality;
  is_active?: boolean;
  is_verified?: boolean;
  current_club?: string;
}

export interface PlayerStatistics {
  total_games: number;
  average_score: number;
  best_score: number;
  games_by_type: Record<string, number>;
  performance_trend: Array<{ date: string; score: number }>;
}

export interface ImportResult {
  success_count: number;
  error_count: number;
  errors: string[];
}

export interface ExportResult {
  csv_data: string;
  total_players: number;
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

export class AdminPlayersService extends BaseAdminService {
  // Validation methods
  private validatePosition(position: string): void {
    this.validateEnum(position, VALID_POSITIONS, 'Position');
  }

  private validateNationality(nationality: string): void {
    this.validateEnum(nationality, VALID_NATIONALITIES, 'Nationalité');
  }

  private validatePlayerData(data: any): void {
    this.validateRequired(data, ['name', 'position']);
    this.validatePosition(data.position);
    
    if (data.nationality) {
      this.validateNationality(data.nationality);
    }
  }

  // Player Management
  async getPlayers(filters: PlayerFilters = {}): Promise<Player[]> {
    return this.executeSelect<Player>(TABLES.PLAYERS, filters, 'name', 'asc');
  }

  async getPlayerById(playerId: string): Promise<Player> {
    this.validateId(playerId, 'ID du joueur');
    return this.executeSelectSingle<Player>(TABLES.PLAYERS, playerId);
  }

  async createPlayer(playerData: Omit<Player, keyof BaseEntity>): Promise<Player> {
    this.validatePlayerData(playerData);
    return this.executeInsert<Player>(TABLES.PLAYERS, playerData);
  }

  async updatePlayer(playerId: string, updates: Partial<Player>): Promise<Player> {
    this.validateId(playerId, 'ID du joueur');
    return this.executeUpdate<Player>(TABLES.PLAYERS, playerId, updates);
  }

  async deletePlayer(playerId: string): Promise<boolean> {
    this.validateId(playerId, 'ID du joueur');
    return this.executeDelete(TABLES.PLAYERS, playerId);
  }

  async archivePlayer(playerId: string): Promise<Player> {
    this.validateId(playerId, 'ID du joueur');
    return this.executeUpdate<Player>(TABLES.PLAYERS, playerId, { is_active: false });
  }

  async verifyPlayer(playerId: string): Promise<Player> {
    this.validateId(playerId, 'ID du joueur');
    return this.executeUpdate<Player>(TABLES.PLAYERS, playerId, { is_verified: true });
  }

  // Search and Filtering
  async searchPlayers(searchTerm: string, filters: PlayerFilters = {}): Promise<Player[]> {
    return this.executeSearch<Player>(
      TABLES.PLAYERS,
      'name',
      searchTerm,
      filters
    );
  }

  async getPlayersByPosition(position: PlayerPosition): Promise<Player[]> {
    this.validatePosition(position);
    return this.executeSelect<Player>(TABLES.PLAYERS, { position });
  }

  async getPlayersByNationality(nationality: Nationality): Promise<Player[]> {
    this.validateNationality(nationality);
    return this.executeSelect<Player>(TABLES.PLAYERS, { nationality });
  }

  async getPlayersByClub(club: string): Promise<Player[]> {
    return this.executeSelect<Player>(TABLES.PLAYERS, { current_club: club });
  }

  // Statistics
  async getPlayerStatistics(playerId: string): Promise<PlayerStatistics> {
    this.validateId(playerId, 'ID du joueur');
    
    const results = await this.executeSelect<{ score: number; game_type: string; created_at: string }>(
      TABLES.GAME_RESULTS,
      { player_id: playerId },
      'created_at',
      'desc',
      'score, game_type, created_at'
    );

    const totalGames = results.length;
    const averageScore = totalGames > 0 ? results.reduce((sum, r) => sum + r.score, 0) / totalGames : 0;
    const bestScore = totalGames > 0 ? Math.max(...results.map(r => r.score)) : 0;
    
    const gamesByType = this.calculateStatistics(results, 'game_type');
    
    const performanceTrend = results.slice(0, 10).map(r => ({
      date: r.created_at,
      score: r.score
    }));

    return {
      total_games: totalGames,
      average_score: averageScore,
      best_score: bestScore,
      games_by_type: gamesByType,
      performance_trend: performanceTrend
    };
  }

  async getPlayersStatistics(): Promise<{
    total_players: number;
    by_position: Record<string, number>;
    by_nationality: Record<string, number>;
    by_club: Record<string, number>;
    active_players: number;
    verified_players: number;
  }> {
    const players = await this.executeSelect<Player>(TABLES.PLAYERS);
    
    const byPosition = this.calculateStatistics(players, 'position');
    const byNationality = this.calculateStatistics(players, 'nationality');
    const byClub = this.calculateStatistics(players, 'current_club');
    
    const activePlayers = players.filter(p => p.is_active).length;
    const verifiedPlayers = players.filter(p => p.is_verified).length;

    return {
      total_players: players.length,
      by_position: byPosition,
      by_nationality: byNationality,
      by_club: byClub,
      active_players: activePlayers,
      verified_players: verifiedPlayers
    };
  }

  // Bulk Operations
  async bulkUpdatePlayers(playerIds: string[], updates: Partial<Player>): Promise<BulkUpdateResult> {
    if (playerIds.length === 0) {
      return { updated_count: 0, error_count: 0, errors: [] };
    }

    const result = await this.executeBulkOperation(
      playerIds,
      async (playerId) => this.updatePlayer(playerId, updates),
      'Bulk update players'
    );
    return { ...result, updated_count: result.success_count };
  }

  async bulkDeletePlayers(playerIds: string[]): Promise<BulkDeleteResult> {
    if (playerIds.length === 0) {
      return { deleted_count: 0, error_count: 0, errors: [] };
    }

    const result = await this.executeBulkOperation(
      playerIds,
      async (playerId) => this.deletePlayer(playerId),
      'Bulk delete players'
    );
    return { ...result, deleted_count: result.success_count };
  }

  async bulkArchivePlayers(playerIds: string[]): Promise<BulkUpdateResult> {
    if (playerIds.length === 0) {
      return { updated_count: 0, error_count: 0, errors: [] };
    }

    const result = await this.executeBulkOperation(
      playerIds,
      async (playerId) => this.archivePlayer(playerId),
      'Bulk archive players'
    );
    return { ...result, updated_count: result.success_count };
  }

  async bulkVerifyPlayers(playerIds: string[]): Promise<BulkUpdateResult> {
    if (playerIds.length === 0) {
      return { updated_count: 0, error_count: 0, errors: [] };
    }

    const result = await this.executeBulkOperation(
      playerIds,
      async (playerId) => this.verifyPlayer(playerId),
      'Bulk verify players'
    );
    return { ...result, updated_count: result.success_count };
  }

  // Import/Export
  async importPlayers(playersData: any[]): Promise<ImportResult> {
    if (playersData.length === 0) {
      return { success_count: 0, error_count: 0, errors: [] };
    }

    return this.executeBulkOperation(
      playersData,
      async (playerData) => this.createPlayer(playerData),
      'Import players'
    );
  }

  async exportPlayers(filters: PlayerFilters = {}): Promise<ExportResult> {
    const players = await this.getPlayers(filters);
    
    const csvHeaders = ['name', 'position', 'nationality', 'current_club', 'is_active', 'is_verified'];
    const csvRows = players.map(player => 
      csvHeaders.map(header => player[header as keyof Player]).join(',')
    );
    
    const csvData = [csvHeaders.join(','), ...csvRows].join('\n');

    return {
      csv_data: csvData,
      total_players: players.length
    };
  }
}

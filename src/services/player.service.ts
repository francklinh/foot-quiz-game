export interface Player {
  id: string;
  name: string;
  current_club: string;
  nationality: string;
  position: string;
  photo_url?: string;
  is_active?: boolean;
}

export class PlayerService {
  async searchPlayers(query: string, limit: number = 10): Promise<Player[]> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to search players');
    }
  }

  async getPlayerById(id: string): Promise<Player | null> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  validatePlayerForGame(player: Player, gameType: string): boolean {
    // Basic validation for all game types
    if (!player || !player.id || !player.name || !player.current_club || !player.nationality) {
      return false;
    }

    // Game-specific validation
    switch (gameType) {
      case 'TOP10':
        return this.validateForTop10(player);
      case 'GRILLE':
        return this.validateForGrille(player);
      case 'CLUB':
        return this.validateForClub(player);
      default:
        return false;
    }
  }

  private validateForTop10(player: Player): boolean {
    // TOP10 requires position and active status
    return !!(player.position && player.is_active !== false);
  }

  private validateForGrille(player: Player): boolean {
    // GRILLE requires nationality and club
    return !!(player.nationality && player.current_club);
  }

  private validateForClub(player: Player): boolean {
    // CLUB requires name and club
    return !!(player.name && player.current_club);
  }

  async getPlayersByNationality(nationality: string): Promise<Player[]> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('nationality', nationality)
        .eq('is_active', true);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get players by nationality');
    }
  }

  async getPlayersByClub(club: string): Promise<Player[]> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('current_club', club)
        .eq('is_active', true);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get players by club');
    }
  }
}





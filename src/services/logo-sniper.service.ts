// src/services/logo-sniper.service.ts
import { supabase } from "../lib/supabase";

export interface Club {
  id: string;
  name: string;
  name_variations: string[];
  logo_url: string;
  type: 'CLUB' | 'NATIONAL_TEAM';
  country?: string;
  league?: string;
}

export interface LogoAnswer {
  id: string;
  question_id: string;
  club_id: string;
  display_order: number;
  club: Club;
}

export interface LogoValidationResult {
  correct_count: number;
  total_logos: number;
  correct_answers: string[];
  score: number;
  cerises_earned: number;
  streak_bonus: number;
  time_bonus: number;
}

export class LogoSniperService {
  /**
   * Récupère une question Logo Sniper et ses clubs associés
   */
  async getQuestionWithClubs(questionId: string): Promise<LogoAnswer[]> {
    try {
      const { data, error } = await supabase
        .from('question_answers')
        .select(`
          id,
          question_id,
          club_id,
          display_order,
          club:clubs (
            id,
            name,
            name_variations,
            logo_url,
            type,
            country,
            league
          )
        `)
        .eq('question_id', questionId)
        .eq('is_active', true)
        .not('club_id', 'is', null)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        question_id: item.question_id,
        club_id: item.club_id,
        display_order: item.display_order,
        club: item.club as Club,
      }));
    } catch (error) {
      console.error('Failed to get question with clubs:', error);
      throw new Error('Failed to load Logo Sniper question');
    }
  }

  /**
   * Recherche des clubs pour l'autocomplétion
   */
  async searchClubs(searchTerm: string, limit: number = 10): Promise<Club[]> {
    try {
      const normalized = searchTerm.toLowerCase().trim();
      
      if (normalized.length < 2) {
        return [];
      }

      // Recherche dans name (name_variations nécessiterait une fonction personnalisée)
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, name_variations, logo_url, type, country, league')
        .eq('is_active', true)
        .ilike('name', `%${normalized}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((club: any) => ({
        id: club.id,
        name: club.name,
        name_variations: club.name_variations || [],
        logo_url: club.logo_url,
        type: club.type,
        country: club.country,
        league: club.league,
      }));
    } catch (error) {
      console.error('Failed to search clubs:', error);
      return [];
    }
  }

  /**
   * Normalise une réponse pour la comparaison
   */
  normalizeAnswer(answer: string): string {
    return answer
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Valide une réponse utilisateur contre un club
   */
  validateAnswer(userAnswer: string, club: Club): boolean {
    const normalized = this.normalizeAnswer(userAnswer);
    
    // Vérifier le nom principal
    if (this.normalizeAnswer(club.name) === normalized) {
      return true;
    }

    // Vérifier les variantes
    if (club.name_variations && club.name_variations.length > 0) {
      for (const variant of club.name_variations) {
        if (this.normalizeAnswer(variant) === normalized) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Calcule le score et les cerises pour Logo Sniper
   * Basé sur les règles du cahier des charges
   */
  calculateScore(
    correctCount: number,
    totalLogos: number,
    timeRemaining: number,
    streakCount: number
  ): { score: number; cerises: number; streakBonus: number; timeBonus: number } {
    // Cerises de base
    let cerises = 150;
    
    // Pénalité pour erreurs
    const errors = totalLogos - correctCount;
    const penalty = errors * 10;
    cerises = Math.max(0, cerises - penalty);

    // Bonus streaks
    let streakBonus = 0;
    if (streakCount >= 20) {
      streakBonus = 15;
    } else if (streakCount >= 15) {
      streakBonus = 15;
    } else if (streakCount >= 10) {
      streakBonus = 10;
    } else if (streakCount >= 5) {
      streakBonus = 10;
    }
    cerises += streakBonus;

    // Bonus temps (1 cerise par seconde restante)
    const timeBonus = Math.max(0, timeRemaining);
    cerises += timeBonus;

    // Maximum 200 cerises
    cerises = Math.min(200, cerises);

    // Score = 10 points par logo correct
    const score = correctCount * 10;

    return {
      score,
      cerises,
      streakBonus,
      timeBonus,
    };
  }

  /**
   * Récupère les questions Logo Sniper disponibles
   */
  async getAvailableQuestions(): Promise<Array<{ id: string; title: string }>> {
    try {
      // Récupérer d'abord l'ID du game_type LOGO_SNIPER
      const { data: gameType, error: gameTypeError } = await supabase
        .from('game_types')
        .select('id')
        .eq('code', 'LOGO_SNIPER')
        .single();

      if (gameTypeError || !gameType) {
        console.error('LOGO_SNIPER game_type not found');
        return [];
      }

      // Récupérer les questions avec ce game_type_id
      const { data, error } = await supabase
        .from('questions')
        .select('id, content')
        .eq('game_type_id', gameType.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((q: any) => ({
        id: q.id,
        title: q.content?.question || q.content || `Question ${q.id}`,
      }));
    } catch (error) {
      console.error('Failed to get Logo Sniper questions:', error);
      return [];
    }
  }
}


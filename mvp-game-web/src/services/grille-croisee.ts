// src/services/grille-croisee.ts
import { supabase } from "../lib/supabase";

export type GrilleConfig = {
  id: string;
  name: string;
  description: string;
  row_type: string;
  col_type: string;
  row_labels: string[];
  col_labels: string[];
  is_active: boolean;
  created_at: string;
};

export type GrilleAnswer = {
  id: string;
  grille_id: string;
  row_index: number;
  col_index: number;
  player_id?: string;
  answer: string;
  answer_norm: string;
  players?: {
    nationality?: string;
  };
};

export type GrilleGame = {
  id: string;
  grille_id: string;
  player_name?: string;
  final_score: number;
  correct_answers: number;
  total_answers: number;
  time_taken?: number;
  created_at: string;
};

export type LeaderboardEntry = {
  player_name: string;
  final_score: number;
  correct_answers: number;
  total_answers: number;
  time_taken?: number;
  created_at: string;
};

/** Récupère la configuration d'une grille par défaut */
export async function getDefaultGrille(): Promise<GrilleConfig> {
  const { data, error } = await supabase
    .from("grille_configs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    // Fallback vers une config par défaut si pas de données
    return {
      id: "default",
      name: "Grille Classique",
      description: "Grille par défaut",
      row_type: "nationality",
      col_type: "club",
      row_labels: ["FRA", "BRA", "ARG"],
      col_labels: ["PSG", "OM", "ASM"],
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }
  
  return {
    ...data,
    row_labels: Array.isArray(data.row_labels) ? data.row_labels : JSON.parse(data.row_labels || '[]'),
    col_labels: Array.isArray(data.col_labels) ? data.col_labels : JSON.parse(data.col_labels || '[]'),
  };
}

/** Récupère toutes les configurations de grilles disponibles */
export async function getAllGrilles(): Promise<GrilleConfig[]> {
  const { data, error } = await supabase
    .from("grille_configs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(grille => ({
    ...grille,
    row_labels: Array.isArray(grille.row_labels) ? grille.row_labels : JSON.parse(grille.row_labels || '[]'),
    col_labels: Array.isArray(grille.col_labels) ? grille.col_labels : JSON.parse(grille.col_labels || '[]'),
  }));
}

/** Récupère les réponses d'une grille avec les informations des joueurs */
export async function getGrilleAnswers(grilleId: string): Promise<GrilleAnswer[]> {
  const { data, error } = await supabase
    .from("grille_answers")
    .select(`
      *,
      players!grille_answers_player_id_fkey (
        nationality
      )
    `)
    .eq("grille_id", grilleId)
    .order("row_index, col_index");
  
  if (error) throw error;
  return (data ?? []) as GrilleAnswer[];
}

/** Crée une nouvelle partie de grille croisée */
export async function startGrilleGame(grilleId: string, playerName?: string): Promise<string> {
  const { data, error } = await supabase
    .from("grille_games")
    .insert({ 
      grille_id: grilleId,
      player_name: playerName 
    })
    .select("id")
    .single<{ id: string }>();
  
  if (error) throw error;
  return data.id;
}

/** Sauvegarde le résultat final d'une partie */
export async function saveGrilleGameResult(
  gameId: string,
  finalScore: number,
  correctAnswers: number,
  totalAnswers: number,
  timeTaken?: number
): Promise<void> {
  const { error } = await supabase
    .from("grille_games")
    .update({
      final_score: finalScore,
      correct_answers: correctAnswers,
      total_answers: totalAnswers,
      time_taken: timeTaken,
    })
    .eq("id", gameId);
  
  if (error) throw error;
}

/** Récupère le leaderboard des meilleurs scores */
export async function getGrilleLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("grille_games")
    .select("player_name, final_score, correct_answers, total_answers, time_taken, created_at")
    .order("final_score", { ascending: false })
    .order("correct_answers", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data ?? []) as LeaderboardEntry[];
}

/** Sauvegarde une tentative de réponse */
export async function saveGrilleAttempt(
  gameId: string,
  rowIndex: number,
  colIndex: number,
  answer: string,
  isCorrect: boolean,
  scoreDelta: number
): Promise<string> {
  const normalized = normalize(answer);
  
  const { data, error } = await supabase
    .from("grille_attempts")
    .insert({
      game_id: gameId,
      row_index: rowIndex,
      col_index: colIndex,
      answer: answer,
      answer_norm: normalized,
      is_correct: isCorrect,
      score_delta: scoreDelta,
    })
    .select("id")
    .single<{ id: string }>();
  
  if (error) throw error;
  return data.id;
}

/** Normalisation simple (sans accents + lowercase + espaces réduits) */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Récupère les statistiques personnelles d'un joueur */
export async function getPlayerStats(playerName: string): Promise<{
  totalGames: number;
  bestScore: number;
  averageScore: number;
  totalCorrectAnswers: number;
  bestStreak: number;
}> {
  const { data, error } = await supabase
    .from("grille_games")
    .select("final_score, correct_answers")
    .eq("player_name", playerName);
  
  if (error) throw error;
  
  const games = data ?? [];
  const totalGames = games.length;
  const bestScore = Math.max(...games.map(g => g.final_score), 0);
  const averageScore = totalGames > 0 ? games.reduce((sum, g) => sum + g.final_score, 0) / totalGames : 0;
  const totalCorrectAnswers = games.reduce((sum, g) => sum + g.correct_answers, 0);
  
  return {
    totalGames,
    bestScore,
    averageScore: Math.round(averageScore * 100) / 100,
    totalCorrectAnswers,
    bestStreak: 9, // Pour l'instant, on peut pas calculer ça facilement
  };
}

/** Récupère les joueurs disponibles pour les suggestions */
export async function getPlayersForSuggestions(): Promise<Array<{
  id: string;
  name: string;
  nationality?: string;
}>> {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, nationality")
    .not("name", "is", null)
    .order("name");
  
  if (error) throw error;
  return data ?? [];
}

/** Récupère les nationalités disponibles */
export async function getAvailableNationalities(): Promise<string[]> {
  const { data, error } = await supabase
    .from("players")
    .select("nationality")
    .not("nationality", "is", null)
    .not("nationality", "eq", "");
  
  if (error) throw error;
  
  // Retourner les nationalités uniques, triées
  const nationalitySet = new Set((data ?? []).map(p => p.nationality).filter(Boolean));
  const nationalities = Array.from(nationalitySet);
  return nationalities.sort();
}

/** Crée une grille dynamique basée sur des critères */
export async function createDynamicGrille(
  rowType: 'nationality' | 'club',
  colType: 'nationality' | 'club',
  rowValues: string[],
  colValues: string[]
): Promise<GrilleConfig> {
  const { data, error } = await supabase
    .from("grille_configs")
    .insert({
      name: `Grille ${rowType} × ${colType}`,
      description: `Grille dynamique ${rowType} × ${colType}`,
      row_type: rowType,
      col_type: colType,
      row_labels: rowValues,
      col_labels: colValues,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    row_labels: Array.isArray(data.row_labels) ? data.row_labels : JSON.parse(data.row_labels || '[]'),
    col_labels: Array.isArray(data.col_labels) ? data.col_labels : JSON.parse(data.col_labels || '[]'),
  };
}

/** Mappe les codes de nationalités vers les noms complets */
export const NATIONALITY_NAMES: Record<string, string> = {
  'FRA': 'France',
  'BRA': 'Brésil', 
  'ARG': 'Argentine',
  'ESP': 'Espagne',
  'GER': 'Allemagne',
  'ENG': 'Angleterre',
  'POR': 'Portugal',
  'ITA': 'Italie',
  'NED': 'Pays-Bas',
  'BEL': 'Belgique',
  'CRO': 'Croatie',
  'SUI': 'Suisse',
  'POL': 'Pologne',
  'MAR': 'Maroc',
  'SEN': 'Sénégal',
  'NGA': 'Nigeria',
  'EGY': 'Égypte',
  'KOR': 'Corée du Sud',
  'JPN': 'Japon',
  'AUS': 'Australie',
  'USA': 'États-Unis',
  'CAN': 'Canada',
  'MEX': 'Mexique',
  'CHI': 'Chili',
  'COL': 'Colombie',
  'URU': 'Uruguay',
  'PER': 'Pérou',
  'ECU': 'Équateur',
  'VEN': 'Venezuela',
  'BOL': 'Bolivie',
  'PAR': 'Paraguay',
};

/** Mappe les codes de nationalités vers les drapeaux */
export const NATIONALITY_FLAGS: Record<string, string> = {
  'FRA': '🇫🇷',
  'BRA': '🇧🇷',
  'ARG': '🇦🇷',
  'ESP': '🇪🇸',
  'GER': '🇩🇪',
  'ENG': '🇬🇧',
  'POR': '🇵🇹',
  'ITA': '🇮🇹',
  'NED': '🇳🇱',
  'BEL': '🇧🇪',
  'CRO': '🇭🇷',
  'SUI': '🇨🇭',
  'POL': '🇵🇱',
  'MAR': '🇲🇦',
  'SEN': '🇸🇳',
  'NGA': '🇳🇬',
  'EGY': '🇪🇬',
  'KOR': '🇰🇷',
  'JPN': '🇯🇵',
  'AUS': '🇦🇺',
  'USA': '🇺🇸',
  'CAN': '🇨🇦',
  'MEX': '🇲🇽',
  'CHI': '🇨🇱',
  'COL': '🇨🇴',
  'URU': '🇺🇾',
  'PER': '🇵🇪',
  'ECU': '🇪🇨',
  'VEN': '🇻🇪',
  'BOL': '🇧🇴',
  'PAR': '🇵🇾',
};

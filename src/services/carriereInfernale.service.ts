// src/services/carriereInfernale.service.ts
import { supabase } from "../lib/supabase";

// Interface pour un club
export interface Club {
  id: string;
  name: string;
  name_variations: string[];
  logo_url: string;
  type: 'CLUB' | 'NATIONAL_TEAM';
  country?: string;
  league?: string;
}

// Interface pour un joueur dans une question Carrière Infernale
export interface CarriereInfernalePlayer {
  id: string;
  name: string;
  photo_url?: string;
  nationality?: string;
  position?: string;
  correct_clubs: Club[]; // Les clubs réels où ce joueur a évolué
}

// Interface pour une question Carrière Infernale
export interface CarriereInfernaleQuestion {
  id: string;
  title: string;
  game_type: string;
  players: CarriereInfernalePlayer[]; // Jusqu'à 5 joueurs
}

// Interface pour les sélections utilisateur
export interface CarriereInfernaleUserSelection {
  player_id: string;
  selected_club_ids: string[]; // Les clubs sélectionnés par l'utilisateur pour ce joueur
}

// Interface pour les détails d'un joueur dans la revue
export interface CarriereInfernalePlayerDetail {
  player_id: string;
  correct_clubs: string[]; // IDs des clubs corrects
  selected_clubs: string[]; // IDs des clubs sélectionnés
  correct_count: number;
  incorrect_count: number;
  is_perfect: boolean;
}

// Interface pour le résultat de validation
export interface CarriereInfernaleValidationResult {
  correct_count: number;
  incorrect_count: number;
  total_possible: number;
  perfect_count: number;
  is_perfect_global: boolean;
  score: number;
  cerises_earned: number;
  streak_bonus: number;
  time_bonus: number;
  player_details: CarriereInfernalePlayerDetail[]; // Détails pour la revue
}

/**
 * Récupère une question Carrière Infernale avec ses joueurs et leurs clubs réels
 */
export async function getCarriereInfernaleQuestion(
  questionId: string
): Promise<CarriereInfernaleQuestion> {
  // Récupérer la question avec la structure réelle (game_type_id + content JSONB)
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select(`
      id,
      game_type_id,
      content,
      season,
      game_types!inner (code)
    `)
    .eq("id", questionId)
    .eq("game_types.code", "CARRIERE_INFERNALE")
    .eq("is_active", true)
    .single();

  if (questionError) throw questionError;
  if (!question) throw new Error("Question non trouvée");

  // Récupérer les réponses (joueurs + clubs réels) de la question
  // On groupe par player_id pour récupérer tous les clubs d'un joueur
  const { data: answers, error: answersError } = await supabase
    .from("question_answers")
    .select(`
      id,
      player_id,
      club_id,
      display_order,
      players!inner (
        id,
        name,
        photo_url,
        nationality,
        position
      ),
      clubs!inner (
        id,
        name,
        name_variations,
        logo_url,
        type,
        country,
        league
      )
    `)
    .eq("question_id", questionId)
    .eq("is_active", true)
    .not("player_id", "is", null)
    .not("club_id", "is", null)
    .order("display_order", { ascending: true });

  if (answersError) throw answersError;

  // Grouper les réponses par joueur
  const playersMap = new Map<string, CarriereInfernalePlayer>();

  (answers || []).forEach((answer: any) => {
    const playerId = answer.player_id;
    
    if (!playersMap.has(playerId)) {
      // Créer un nouveau joueur
      playersMap.set(playerId, {
        id: answer.players.id,
        name: answer.players.name,
        photo_url: answer.players.photo_url,
        nationality: answer.players.nationality,
        position: answer.players.position,
        correct_clubs: [],
      });
    }

    // Ajouter le club à la liste des clubs réels du joueur
    const player = playersMap.get(playerId)!;
    player.correct_clubs.push({
      id: answer.clubs.id,
      name: answer.clubs.name,
      name_variations: answer.clubs.name_variations || [],
      logo_url: answer.clubs.logo_url,
      type: answer.clubs.type || 'CLUB',
      country: answer.clubs.country,
      league: answer.clubs.league,
    });
  });

  // Convertir la Map en array
  const players = Array.from(playersMap.values());

  // Extraire le titre depuis content (JSONB) ou utiliser un titre par défaut
  const title =
    (question.content as any)?.title ||
    (question.content as any)?.question ||
    "Carrière Infernale";

  return {
    id: question.id,
    title: title,
    game_type: "CARRIERE_INFERNALE",
    players,
  };
}

/**
 * Récupère les questions disponibles pour Carrière Infernale
 */
export async function getAvailableCarriereInfernaleQuestions(): Promise<
  Array<{ id: string; title: string; season?: string }>
> {
  // Utiliser la structure réelle : game_type_id via jointure avec game_types
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      content,
      season,
      game_types!inner (code)
    `)
    .eq("game_types.code", "CARRIERE_INFERNALE")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Transformer les données pour extraire le titre depuis content
  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.content?.title || q.content?.question || "Carrière Infernale",
    season: q.season,
  }));
}

/**
 * Valide les réponses du jeu Carrière Infernale
 * Format d'entrée: Array de sélections, une par joueur
 */
export async function validateCarriereInfernaleAnswers(
  questionId: string,
  userSelections: CarriereInfernaleUserSelection[],
  timeRemaining: number = 0
): Promise<CarriereInfernaleValidationResult> {
  // Convertir les sélections en format JSONB pour la fonction SQL
  const selectionsJson = userSelections.map((selection) => ({
    player_id: selection.player_id,
    selected_club_ids: selection.selected_club_ids,
  }));

  const { data, error } = await supabase.rpc("validate_carriere_infernale_answers", {
    p_question_id: questionId,
    p_user_selections: selectionsJson,
    p_time_remaining: timeRemaining,
  });

  if (error) {
    console.error("Erreur validation Carrière Infernale:", error);
    throw error;
  }

  // La fonction retourne un JSONB, pas un TABLE
  // Donc data est directement l'objet JSONB
  if (!data) {
    throw new Error("Aucun résultat de validation");
  }

  // Si data est une string, la parser
  let result: CarriereInfernaleValidationResult;
  if (typeof data === 'string') {
    try {
      result = JSON.parse(data);
    } catch (parseError) {
      console.error("Erreur parsing JSONB:", parseError);
      throw new Error("Format de réponse invalide");
    }
  } else {
    result = data as CarriereInfernaleValidationResult;
  }

  return result;
}

/**
 * Récupère une question aléatoire pour Carrière Infernale
 */
export async function getRandomCarriereInfernaleQuestion(): Promise<CarriereInfernaleQuestion> {
  // Récupérer toutes les questions actives avec la structure réelle
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(`
      id,
      game_types!inner (code)
    `)
    .eq("game_types.code", "CARRIERE_INFERNALE")
    .eq("is_active", true);

  if (questionsError) throw questionsError;
  if (!questions || questions.length === 0) {
    throw new Error("Aucune question disponible pour Carrière Infernale");
  }

  // Sélectionner une question aléatoire
  const randomIndex = Math.floor(Math.random() * questions.length);
  const randomQuestionId = questions[randomIndex].id;

  return getCarriereInfernaleQuestion(randomQuestionId);
}

/**
 * Génère des clubs distracteurs pour un joueur
 * Les distracteurs sont des clubs aléatoires de la même ligue/pays que les clubs réels
 */
export async function generateDistractors(
  correctClubs: Club[],
  count: number
): Promise<Club[]> {
  if (correctClubs.length === 0) {
    return [];
  }

  // Récupérer la ligue ou le pays du premier club réel (pour cohérence)
  const firstClub = correctClubs[0];
  const league = firstClub.league;
  const country = firstClub.country;

  // Construire la requête pour récupérer des clubs similaires
  const correctClubIds = new Set(correctClubs.map((c) => c.id));
  
  let query = supabase
    .from("clubs")
    .select("id, name, name_variations, logo_url, type, country, league")
    .eq("is_active", true);

  // Filtrer par ligue si disponible
  if (league) {
    query = query.eq("league", league);
  } else if (country) {
    // Sinon filtrer par pays
    query = query.eq("country", country);
  }

  const { data, error } = await query.limit(count * 3); // Récupérer plus pour avoir du choix après filtrage

  if (error) {
    console.warn("Erreur lors de la génération des distracteurs:", error);
    // En cas d'erreur, retourner un array vide
    return [];
  }

  // Filtrer pour exclure les clubs réels et mélanger
  const filtered = (data || []).filter((club: any) => !correctClubIds.has(club.id));
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count).map((club: any) => ({
    id: club.id,
    name: club.name,
    name_variations: club.name_variations || [],
    logo_url: club.logo_url,
    type: club.type || 'CLUB',
    country: club.country,
    league: club.league,
  }));
}


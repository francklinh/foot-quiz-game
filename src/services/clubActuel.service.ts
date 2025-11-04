// src/services/clubActuel.service.ts
import { supabase } from "../lib/supabase";

// Interface pour un joueur dans une question Club Actuel
export interface ClubActuelPlayer {
  id: string;
  name: string;
  current_club: string;
  photo_url?: string;
  nationality?: string;
  position?: string;
  display_order: number;
}

// Interface pour une question Club Actuel
export interface ClubActuelQuestion {
  id: string;
  title: string;
  game_type: string;
  players: ClubActuelPlayer[];
}

// Interface pour une suggestion de club (autocomplétion)
export interface ClubSuggestion {
  id: string;
  name: string;
  name_variations: string[];
  type: string;
  country?: string;
  league?: string;
  relevance: number;
}

// Interface pour les réponses utilisateur
export interface ClubActuelUserAnswer {
  player_id: string;
  club_name: string;
}

// Interface pour le résultat de validation
export interface ClubActuelValidationResult {
  correct_count: number;
  total_players: number;
  correct_answers: Record<string, {
    user_answer: string;
    correct_club: string;
    player_id: string;
  }>;
  score: number;
  cerises_earned: number;
  streak_bonus: number;
  time_bonus: number;
}

/**
 * Récupère une question Club Actuel avec ses joueurs
 */
export async function getClubActuelQuestion(questionId: string): Promise<ClubActuelQuestion> {
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
    .eq("game_types.code", "CLUB_ACTUEL")
    .eq("is_active", true)
    .single();

  if (questionError) throw questionError;
  if (!question) throw new Error("Question non trouvée");

  // Récupérer les joueurs de la question
  const { data: answers, error: answersError } = await supabase
    .from("question_answers")
    .select(`
      id,
      player_id,
      display_order,
      players!inner (
        id,
        name,
        current_club,
        photo_url,
        nationality,
        position
      )
    `)
    .eq("question_id", questionId)
    .eq("is_active", true)
    .not("player_id", "is", null)
    .order("display_order", { ascending: true });

  if (answersError) throw answersError;

  const players: ClubActuelPlayer[] = (answers || []).map((answer: any) => ({
    id: answer.player_id,
    name: answer.players.name,
    current_club: answer.players.current_club,
    photo_url: answer.players.photo_url,
    nationality: answer.players.nationality,
    position: answer.players.position,
    display_order: answer.display_order || 0,
  }));

  // Extraire le titre depuis content (JSONB) ou utiliser un titre par défaut
  const title = 
    (question.content as any)?.title || 
    (question.content as any)?.question || 
    "Club Actuel";

  return {
    id: question.id,
    title: title,
    game_type: "CLUB_ACTUEL", // Toujours CLUB_ACTUEL pour ce service
    players,
  };
}

/**
 * Récupère les questions disponibles pour Club Actuel
 */
export async function getAvailableClubActuelQuestions(): Promise<
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
    .eq("game_types.code", "CLUB_ACTUEL")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Transformer les données pour extraire le titre depuis content
  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.content?.title || q.content?.question || "Club Actuel",
    season: q.season,
  }));
}

/**
 * Recherche de clubs pour l'autocomplétion
 * Utilise la fonction search_clubs qui retourne JSONB pour meilleure compatibilité Supabase
 * @param searchTerm - Terme de recherche
 * @param limit - Nombre maximum de résultats
 */
export async function searchClubs(
  searchTerm: string, 
  limit: number = 20
): Promise<ClubSuggestion[]> {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const trimmedSearch = searchTerm.trim();
  
  try {
    // Essayer d'abord avec la fonction JSONB
    const { data, error } = await supabase.rpc("search_clubs", {
      p_search_term: trimmedSearch,
      p_limit: limit,
    });

    if (error) {
      console.warn("Erreur RPC search_clubs, utilisation du fallback:", error.message);
      // Fallback: requête directe si RPC échoue
      // Utiliser ilike pour recherche insensible à la casse
      const { data: clubsData, error: clubsError } = await supabase
        .from("clubs")
        .select("id, name, name_variations, type, country, league")
        .eq("is_active", true)
        .ilike("name", `%${trimmedSearch}%`)
        .limit(limit);

      if (clubsError) {
        console.error("Erreur fallback recherche clubs:", clubsError);
        // Ne pas throw, retourner un array vide
        return [];
      }
      
      // Transformer en ClubSuggestion avec relevance calculée
      return (clubsData || []).map((club) => {
        const nameLower = club.name.toLowerCase();
        const searchLower = trimmedSearch.toLowerCase();
        let relevance = 0.5;
        
        if (nameLower === searchLower) {
          relevance = 1.0;
        } else if (nameLower.startsWith(searchLower)) {
          relevance = 0.8;
        } else if (nameLower.includes(searchLower)) {
          relevance = 0.6;
        }
        
        return {
          id: club.id,
          name: club.name,
          name_variations: club.name_variations || [],
          type: club.type || "CLUB",
          country: club.country,
          league: club.league,
          relevance,
        };
      }).sort((a, b) => b.relevance - a.relevance);
    }

    // Traitement des données JSONB
    let result: ClubSuggestion[] = [];
    
    if (typeof data === 'string') {
      try {
        result = JSON.parse(data);
      } catch (parseError) {
        console.error("Erreur parsing JSONB:", parseError);
        result = [];
      }
    } else if (Array.isArray(data)) {
      result = data;
    } else if (data && typeof data === 'object') {
      // Si c'est un objet avec une propriété qui contient l'array
      result = (data as any).data || (data as any).results || Object.values(data) || [];
    }

    // Vérifier que les résultats sont valides
    if (!Array.isArray(result)) {
      console.warn("Les résultats de search_clubs ne sont pas un array:", result);
      result = [];
    }

    // S'assurer que tous les résultats ont les champs requis
    result = result.map((item: any) => ({
      id: item.id,
      name: item.name || '',
      name_variations: item.name_variations || [],
      type: item.type || 'CLUB',
      country: item.country,
      league: item.league,
      relevance: typeof item.relevance === 'number' ? item.relevance : 0.5,
    }));

    // Trier par pertinence décroissante
    return result.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error("Erreur lors de la recherche de clubs:", error);
    // En cas d'erreur, retourner un array vide plutôt que de throw
    return [];
  }
}

/**
 * Valide les réponses du jeu Club Actuel
 */
export async function validateClubActuelAnswers(
  questionId: string,
  userAnswers: ClubActuelUserAnswer[],
  timeRemaining: number,
  streakCount: number
): Promise<ClubActuelValidationResult> {
  // Convertir les réponses en format JSONB pour la fonction SQL
  const answersJson: Record<string, string> = {};
  userAnswers.forEach((answer) => {
    answersJson[answer.player_id] = answer.club_name;
  });

  const { data, error } = await supabase.rpc("validate_club_actuel_answers", {
    p_question_id: questionId,
    p_user_answers: answersJson,
    p_time_remaining: timeRemaining,
    p_streak_count: streakCount,
  });

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error("Aucun résultat de validation");
  }

  const result = data[0] as ClubActuelValidationResult;
  return result;
}

/**
 * Récupère une question aléatoire pour Club Actuel
 */
export async function getRandomClubActuelQuestion(): Promise<ClubActuelQuestion> {
  // Récupérer toutes les questions actives avec la structure réelle
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(`
      id,
      game_types!inner (code)
    `)
    .eq("game_types.code", "CLUB_ACTUEL")
    .eq("is_active", true);

  if (questionsError) throw questionsError;
  if (!questions || questions.length === 0) {
    throw new Error("Aucune question disponible pour Club Actuel");
  }

  // Sélectionner une question aléatoire
  const randomIndex = Math.floor(Math.random() * questions.length);
  const randomQuestionId = questions[randomIndex].id;

  return getClubActuelQuestion(randomQuestionId);
}


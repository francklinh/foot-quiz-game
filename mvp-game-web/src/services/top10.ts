// src/services/top10.ts
import { supabase } from "lib/supabase";
import { questionAnswerService } from "./question-answer.service";

export type ThemeRow = { id: string; slug: string; title: string };
export type ThemeAnswerRow = { answer: string; answer_norm: string };

// Interface pour les questions selon le cahier des charges
export interface QuestionRow {
  id: string;
  game_type: string;
  title: string;
  player_ids: string[];
  season: string;
  is_active: boolean;
  created_at: string;
}

// Interface pour les réponses avec informations joueur
export interface AnswerWithPlayer {
  id: string;
  question_id: string;
  player_id: string;
  ranking?: number;
  points?: number;
  is_correct?: boolean;
  players: {
    name: string;
    current_club: string;
    nationality: string;
  };
}

export async function getThemeBySlug(slug: string) {
  const { data, error } = await supabase
    .from("themes")
    .select("id, slug, title")
    .eq("slug", slug)
    .single<ThemeRow>();
  if (error) throw error;
  return data;
}

export async function getAnswers(themeId: string) {
  const { data, error } = await supabase
    .from("theme_answers")
    .select("answer, answer_norm")
    .eq("theme_id", themeId);
  if (error) throw error;
  return (data ?? []) as ThemeAnswerRow[];
}

/** Crée une partie et retourne son id */
export async function startGame(themeId: string) {
  const { data, error } = await supabase
    .from("games")
    .insert({ theme_id: themeId })
    .select("id")
    .single<{ id: string }>();
  if (error) throw error;
  return data.id;
}

/** Enregistre une tentative (bonne ou mauvaise) */
export async function submitAnswer(
  gameId: string,
  raw: string,
  isCorrect: boolean,
  delta: number
) {
  const normalized = normalize(raw);
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      game_id: gameId,
      raw_input: raw,
      normalized,
      is_correct: isCorrect,
      score_delta: delta,
    })
    .select("id")
    .single<{ id: string }>();
  if (error) throw error;
  return data.id;
}

/** Termine la partie (score final + nb de bonnes réponses) */
export async function endGame(gameId: string, finalScore: number, answersCount: number) {
  const { error } = await supabase
    .from("games")
    .update({
      ended_at: new Date().toISOString(),
      final_score: finalScore,
      answers_count: answersCount,
    })
    .eq("id", gameId);
  if (error) throw error;
}

/** Normalisation simple (sans accents + lowercase + espaces réduits) */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// Nouvelles fonctions selon le cahier des charges
export async function getQuestionBySlug(slug: string): Promise<QuestionRow> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<QuestionRow>();
  if (error) throw error;
  return data;
}

export async function getQuestionAnswers(questionId: string): Promise<AnswerWithPlayer[]> {
  return questionAnswerService.getAnswersWithPlayers(questionId);
}

export async function getTop10Answers(questionId: string): Promise<AnswerWithPlayer[]> {
  const answers = await questionAnswerService.getAnswersWithPlayers(questionId);
  return answers.filter(answer => answer.ranking !== undefined).sort((a, b) => (a.ranking || 0) - (b.ranking || 0));
}

export async function getClubAnswers(questionId: string): Promise<AnswerWithPlayer[]> {
  const answers = await questionAnswerService.getAnswersWithPlayers(questionId);
  return answers.filter(answer => answer.is_correct !== undefined);
}

// Fonctions de gestion des réponses pour l'admin
export async function createQuestionAnswer(questionId: string, playerId: string, ranking?: number, isCorrect?: boolean) {
  const data: any = {
    question_id: questionId,
    player_id: playerId
  };

  if (ranking !== undefined) {
    data.ranking = ranking;
    data.points = calculatePoints(ranking);
  }

  if (isCorrect !== undefined) {
    data.is_correct = isCorrect;
  }

  return questionAnswerService.createAnswer(data);
}

export async function updateQuestionAnswer(answerId: string, updates: any) {
  return questionAnswerService.updateAnswer(answerId, updates);
}

export async function deleteQuestionAnswer(answerId: string) {
  return questionAnswerService.deleteAnswer(answerId);
}

// Calculer les points selon le classement (TOP 10)
function calculatePoints(ranking: number): number {
  const pointsMap: { [key: number]: number } = {
    1: 25, 2: 20, 3: 18, 4: 16, 5: 14,
    6: 12, 7: 10, 8: 8, 9: 6, 10: 4
  };
  return pointsMap[ranking] || 0;
}
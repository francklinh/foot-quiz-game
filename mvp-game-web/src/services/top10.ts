// src/services/top10.ts
import { supabase } from "lib/supabase";

export type ThemeRow = { id: string; slug: string; title: string };
export type ThemeAnswerRow = { answer: string; answer_norm: string };

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
import { supabase } from "lib/supabase";

export async function getThemeBySlug(slug: string) {
  const { data, error } = await supabase!.from("themes")
    .select("id, slug, title").eq("slug", slug).single();
  if (error) throw error;
  return data;
}

export async function getAnswers(themeId: string) {
  const { data, error } = await supabase!.from("theme_answers")
    .select("answer, answer_norm").eq("theme_id", themeId);
  if (error) throw error;
  return data ?? [];
}
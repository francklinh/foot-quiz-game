// src/pages/Top10.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AutocompleteInput } from "../components/AutocompleteInput";
import { supabase } from "../lib/supabase";

// --- Types DB (simplifiés) ---
type ThemeRow = { id: string; slug: string; title: string };
type ThemeAnswerRow = { answer: string; answer_norm: string };
type LeaderboardRow = { final_score: number; answers_count: number; ended_at: string };

type Feedback = { type: "ok" | "error" | "info"; msg: string };

// --- Helper: normalisation (sans accents, lowercase, espaces réduits) ---
function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function Top10() {
  const { slug } = useParams();
  const effectiveSlug = slug ?? "buteurs-ligue1"; // fallback si /top10 sans slug

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // UI / Game state
  const [title, setTitle] = useState("Top 10");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Données thème
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [validSet, setValidSet] = useState<Set<string>>(new Set());

  // Partie + leaderboard
  const [gameId, setGameId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  const gameOver = timeLeft <= 0 || answers.length >= 10;
  const replayBtnRef = useRef<HTMLButtonElement | null>(null);

  // Timer
  useEffect(() => {
    if (loading || gameOver) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [loading, gameOver]);

  // Chargement thème + réponses + création de partie + leaderboard initial
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);

        // 1) Thème
        const { data: theme, error: themeErr } = await supabase
          .from("themes")
          .select("id, slug, title")
          .eq("slug", effectiveSlug)
          .single<ThemeRow>();
        if (themeErr) throw themeErr;
        if (!theme) throw new Error("Theme not found");
        if (cancelled) return;

        setTitle(theme.title);

        // 2) Réponses valides
        const { data: rows, error: ansErr } = await supabase
          .from("theme_answers")
          .select("answer, answer_norm")
          .eq("theme_id", theme.id);
        if (ansErr) throw ansErr;

        const list = (rows ?? []) as ThemeAnswerRow[];
        setSuggestions(list.map((r) => r.answer));
        setValidSet(new Set(list.map((r) => r.answer_norm)));

        // 3) Reset UI
        setTimeLeft(60);
        setScore(0);
        setStreak(0);
        setAnswers([]);
        setFeedback(null);

        // 4) Créer une partie (taggée user_id si connecté)
        const { data: game, error: gameErr } = await supabase
          .from("games")
          .insert({ theme_id: theme.id, user_id: userId })
          .select("id")
          .single<{ id: string }>();
        if (gameErr) throw gameErr;
        if (!cancelled) setGameId(game.id);

        // 5) Charger leaderboard initial
        const { data: lb, error: lbErr } = await supabase.rpc("leaderboard_by_theme", {
          p_slug: effectiveSlug,
          p_limit: 10,
        });
        if (lbErr) throw lbErr;
        if (!cancelled) setLeaderboard(lb ?? []);
      } catch (e: any) {
        if (!cancelled) setLoadError(e.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveSlug, userId]);

  // Scoring
  const BASE_GOOD = 15;
  const BAD_PENALTY = 5;
  const BONUS_BY_STREAK: Record<number, number> = { 3: 10, 6: 15, 9: 10, 10: 15 };

  // Validation + enregistrement
  const onSelectAnswer = async (value: string) => {
    if (loading || gameOver || !gameId) return;

    const norm = normalize(value);
    if (!norm) return;

    // Doublon UI
    if (answers.some((a) => normalize(a) === norm)) {
      setFeedback({ type: "info", msg: "Déjà trouvé ✅" });
      return;
    }

    if (validSet.has(norm)) {
      const nextStreak = streak + 1;
      const bonus = BONUS_BY_STREAK[nextStreak] ?? 0;
      const delta = BASE_GOOD + bonus;

      // UI
      setAnswers((prev) => [...prev, value]);
      setScore((prev) => prev + delta);
      setStreak(nextStreak);
      setFeedback({ type: "ok", msg: `Bonne réponse ✅ +${delta}` });

      // DB
      try {
        await supabase.from("submissions").insert({
          game_id: gameId,
          user_id: userId,
          raw_input: value,
          normalized: norm,
          is_correct: true,
          score_delta: delta,
        });
      } catch (e) {
        console.error("submitAnswer (good) failed:", e);
      }
    } else {
      const delta = -BAD_PENALTY;

      // UI
      setStreak(0);
      setScore((prev) => Math.max(0, prev + delta));
      setFeedback({ type: "error", msg: `Mauvaise réponse ❌ ${delta}` });

      // DB
      try {
        await supabase.from("submissions").insert({
          game_id: gameId,
          user_id: userId,
          raw_input: value,
          normalized: norm,
          is_correct: false,
          score_delta: delta,
        });
      } catch (e) {
        console.error("submitAnswer (bad) failed:", e);
      }
    }
  };

  // Clôture de partie + refresh leaderboard
  useEffect(() => {
    if (!gameOver || !gameId) return;
    (async () => {
      try {
        await supabase
          .from("games")
          .update({
            ended_at: new Date().toISOString(),
            final_score: score,
            answers_count: answers.length,
          })
          .eq("id", gameId);

        const { data: lb } = await supabase.rpc("leaderboard_by_theme", {
          p_slug: effectiveSlug,
          p_limit: 10,
        });
        setLeaderboard(lb ?? []);
      } catch (e) {
        console.error("endGame/leaderboard failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  // Couleur timer
  const timeColor = useMemo(() => {
    if (timeLeft <= 10) return "text-red-600";
    if (timeLeft <= 20) return "text-yellow-600";
    return "text-green-700";
  }, [timeLeft]);

  // Erreur
  if (loadError) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">Erreur de chargement</h1>
        <p className="text-red-600">{loadError}</p>
        <div className="space-x-2">
          <Link to="/top10/buteurs-ligue1" className="underline text-blue-600">
            Buteurs L1
          </Link>
          <Link to="/top10/passeurs-ligue1" className="underline text-blue-600">
            Passeurs L1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">
            Thèmes rapides :{" "}
            <Link className="underline" to="/top10/buteurs-ligue1">Buteurs</Link>{" "}
            ·{" "}
            <Link className="underline" to="/top10/passeurs-ligue1">Passeurs</Link>
          </p>
        </div>
        <div className="text-lg">
          🍒 <span className="font-bold">{score}</span>
        </div>
      </header>

      {/* Infos jeu */}
      <div className="flex items-center gap-4">
        <div className={`text-xl font-semibold ${timeColor}`}>
          {loading ? "⏱️ ..." : <>⏱️ {timeLeft}s</>}
        </div>
        <div className="text-sm text-gray-600">Streak 🔥 {streak}</div>
        <div className="text-sm text-gray-600">Réponses : {answers.length}/10</div>
      </div>

      {/* Saisie */}
      <div className="flex gap-2">
        <AutocompleteInput
          suggestions={suggestions}
          onSelect={onSelectAnswer}
          disabled={loading || gameOver}
          className="flex-1"
          placeholder={loading ? "Chargement…" : "Tape une réponse…"}
        />
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={
            feedback.type === "ok"
              ? "text-green-600"
              : feedback.type === "error"
              ? "text-red-600"
              : "text-gray-600"
          }
        >
          {feedback.msg}
        </div>
      )}

      {/* Réponses trouvées */}
      <ul className="space-y-1">
        {answers.map((a, i) => (
          <li key={i} className="text-green-700">✅ {a}</li>
        ))}
      </ul>

      {/* Fin de partie */}
      {gameOver && (
        <footer className="p-3 border rounded bg-gray-50 space-y-2">
          <p className="font-semibold">
            {answers.length >= 8
              ? "Vrai boss, triplé ! 🍒🍒🍒"
              : answers.length >= 4
              ? "Pas mal, encore un effort 💪"
              : "On remet ça ? 🔁"}
          </p>
          <button
            ref={replayBtnRef}
            className="px-4 py-2 rounded bg-gray-700 text-white"
            onClick={() => {
              setTimeLeft(60);
              setScore(0);
              setStreak(0);
              setAnswers([]);
              setFeedback(null);
              replayBtnRef.current?.blur();
            }}
            disabled={loading}
          >
            Rejouer
          </button>
        </footer>
      )}

      {/* Leaderboard */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">🏆 Meilleurs scores</h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-600">Pas encore de scores. Lance une partie !</p>
        ) : (
          <ol className="space-y-1">
            {leaderboard.map((row, idx) => (
              <li
                key={`${row.ended_at}-${idx}`}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right font-mono">{idx + 1}.</span>
                  <span className="font-semibold">{row.final_score}</span>
                  <span className="text-xs text-gray-500">({row.answers_count}/10)</span>
                </div>
                <time className="text-xs text-gray-500">
                  {new Date(row.ended_at).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
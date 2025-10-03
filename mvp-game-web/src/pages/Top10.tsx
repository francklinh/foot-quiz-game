import { useEffect, useMemo, useRef, useState } from "react";
import { AutocompleteInput } from "../components/AutocompleteInput";

// --- Données d'exemple : remplace-les plus tard par tes vraies données (Semaine 6)
const VALID_ANSWERS = [
  "Messi",
  "Ronaldo",
  "Mbappé",
  "Ibrahimović",
  "Cavani",
  "Neymar",
  "Benzema",
  "Lewandowski",
  "Salah",
  "Haaland",
];

type Feedback = { type: "ok" | "error" | "info"; msg: string };

// Bonus accordés aux paliers de streak
const BONUS_BY_STREAK: Record<number, number> = {
  3: 10,
  6: 15,
  9: 10,
  10: 15, // atteint 10/10
};

export function Top10() {
  // --- State principal ---
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // --- Helpers UI ---
  const replayBtnRef = useRef<HTMLButtonElement | null>(null);
  const gameOver = timeLeft <= 0 || answers.length >= 10;

  // Ensemble pour vérif rapide O(1)
  const validSet = useMemo(
    () => new Set(VALID_ANSWERS.map((n) => n.toLowerCase())),
    []
  );

  // --- Timer 60s ---
  useEffect(() => {
    if (gameOver) return; // stop si partie terminée
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [gameOver]);

  // --- Règles de scoring ---
  const BASE_GOOD = 15;
  const BAD_PENALTY = 5;

  function applyGoodAnswer(newAnswer: string) {
    // éviter doublons (case-insensitive)
    if (answers.some((a) => a.toLowerCase() === newAnswer.toLowerCase())) {
      setFeedback({ type: "info", msg: "Déjà trouvé ✅" });
      return;
    }

    setAnswers((prev) => [...prev, newAnswer]);
    setScore((prev) => prev + BASE_GOOD);

    setStreak((prev) => {
      const next = prev + 1;
      const bonus = BONUS_BY_STREAK[next] ?? 0;
      if (bonus) setScore((s) => s + bonus);
      return next;
    });

    setFeedback({ type: "ok", msg: "Bonne réponse ✅ +15" });
  }

  function applyBadAnswer() {
    setStreak(0);
    setScore((prev) => Math.max(0, prev - BAD_PENALTY));
    setFeedback({ type: "error", msg: "Mauvaise réponse ❌ -5" });
  }

  // --- Validation depuis l'autocomplete ---
  function onSelectAnswer(value: string) {
    if (gameOver) return;
    const answer = value.trim();
    if (!answer) return;

    if (validSet.has(answer.toLowerCase())) {
      applyGoodAnswer(answer);
    } else {
      applyBadAnswer();
    }
  }

  // --- Styles simples pour le timer ---
  const timeColor =
    timeLeft <= 10 ? "text-red-600" : timeLeft <= 20 ? "text-yellow-600" : "text-green-700";

  // --- Rendu ---
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Top 10 — Buteurs Ligue 1</h1>
        <div className="text-lg">
          🍒 <span className="font-bold">{score}</span>
        </div>
      </header>

      <div className="flex items-center gap-4">
        <div className={`text-xl font-semibold ${timeColor}`}>⏱️ {timeLeft}s</div>
        <div className="text-sm text-gray-600">Streak 🔥 {streak}</div>
        <div className="text-sm text-gray-600">Réponses : {answers.length}/10</div>
      </div>

      {/* Champ avec autocomplétion */}
      <div className="flex gap-2">
        <AutocompleteInput
          suggestions={VALID_ANSWERS}
          onSelect={onSelectAnswer}
          disabled={gameOver}
          className="flex-1"
          placeholder="Tape un joueur… (Enter pour valider)"
        />
        {/* Bouton optionnel (l'autocomplete valide déjà au Enter / clic) */}
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded bg-blue-600 text-white opacity-50 cursor-not-allowed"
          aria-label="Valider (Enter)"
          title="Valider (Enter)"
        >
          OK
        </button>
      </div>

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

      <ul className="space-y-1">
        {answers.map((a, i) => (
          <li key={i} className="text-green-700">
            ✅ {a}
          </li>
        ))}
      </ul>

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
              // reset partie
              setTimeLeft(60);
              setScore(0);
              setStreak(0);
              setAnswers([]);
              setFeedback(null);
              replayBtnRef.current?.blur();
            }}
          >
            Rejouer
          </button>
        </footer>
      )}
    </div>
  );
}
// src/pages/Top10.tsx
import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom"; // Pas utilisé pour l'instant
import { AutocompleteInput } from "../components/AutocompleteInput";
import { supabase } from "../lib/supabase";
import { CerisesService } from "../services/cerises.service";
import { ChallengesService } from "../services/challenges.service";
import { useChallenge } from "../hooks/useChallenge";

// --- Types DB ---
type ThemeRow = { id: string; slug: string; title: string };
type ThemeAnswerRow = { 
  answer: string; 
  answer_norm: string;
  ranking?: number;
  goals?: number;
  assists?: number;
  value?: number;
  players?: {
    nationality?: string;
  };
};
type LeaderboardRow = { final_score: number; answers_count: number; ended_at: string };

type Feedback = { type: "ok" | "error" | "info"; msg: string };

// --- Helper: normalisation ---
function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// --- Helper: Drapeaux ---
const COUNTRY_FLAGS: Record<string, string> = {
  'FRA': '🇫🇷', 'ESP': '🇪🇸', 'BRA': '🇧🇷', 'ARG': '🇦🇷',
  'GER': '🇩🇪', 'ENG': '🇬🇧', 'POR': '🇵🇹', 'ITA': '🇮🇹',
  'NED': '🇳🇱', 'BEL': '🇧🇪', 'NOR': '🇳🇴', 'EGY': '🇪🇬',
  'NGA': '🇳🇬', 'CAN': '🇨🇦', 'USA': '🇺🇸', 'CHI': '🇨🇱',
  'UKR': '🇺🇦', 'POL': '🇵🇱', 'SRB': '🇷🇸', 'GUI': '🇬🇳',
  'KOR': '🇰🇷', 'SWE': '🇸🇪', 'CRO': '🇭🇷', 'DEN': '🇩🇰',
};

function getCountryFlag(countryCode: string | null | undefined): string {
  if (!countryCode) return '🏳️';
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || '🏳️';
}

function getStatisticUnit(gameMode: string): string {
  switch (gameMode.toLowerCase()) {
    case 'buteurs':
      return 'buts';
    case 'passeurs':
      return 'passes';
    default:
      return 'points';
  }
}

export function Top10() {
  // const { slug } = useParams(); // Pas utilisé pour l'instant

  // Challenge hook
  const { challenge, isChallengeMode, completeChallenge } = useChallenge();

  // Sélecteurs de mode et année
  const [gameMode, setGameMode] = useState<"buteurs" | "passeurs">("buteurs");
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [league, setLeague] = useState<string>("ligue1");

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Services
  const cerisesService = new CerisesService();
  const challengesService = new ChallengesService();
  
  // Cerises state
  const [userCerises, setUserCerises] = useState<number>(0);
  const [cerisesEarned, setCerisesEarned] = useState<number>(0);

  // UI / Game state
  const [title, setTitle] = useState("Top 10");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Données thème
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [validSet, setValidSet] = useState<Set<string>>(new Set());
  const [allValidAnswers, setAllValidAnswers] = useState<ThemeAnswerRow[]>([]);
  
  // 🎯 Système de prévisualisation avec flou
  const [foundAnswers, setFoundAnswers] = useState<Set<string>>(new Set());

  // Partie + leaderboard
  const [gameId, setGameId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  const gameOver = timeLeft <= 0 || answers.length >= 10;
  const replayBtnRef = useRef<HTMLButtonElement | null>(null);

  // Load user cerises
  useEffect(() => {
    if (!userId) return;
    
    const loadUserCerises = async () => {
      try {
        const balance = await cerisesService.getUserCerises(userId);
        setUserCerises(balance);
      } catch (error) {
        console.error('Failed to load user cerises:', error);
      }
    };
    
    loadUserCerises();
  }, [userId]);

  // Timer
  useEffect(() => {
    if (loading || gameOver || !gameStarted) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [loading, gameOver, gameStarted]);

  // 🎯 Déflouter tous les joueurs à la fin de la partie
  useEffect(() => {
    if (gameOver && allValidAnswers.length > 0) {
      // Ajouter tous les joueurs à foundAnswers pour les déflouter
      const allAnswers = allValidAnswers.map(answer => answer.answer_norm);
      setFoundAnswers(new Set(allAnswers));
    }
  }, [gameOver, allValidAnswers]);

  // Chargement thème basé sur mode + année + ligue
  useEffect(() => {
    if (!gameStarted) return;
    
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);

        // Construire les paramètres de recherche
        const season = `${selectedYear}-${parseInt(selectedYear) + 1}`;
        const type = gameMode === "buteurs" ? "buteurs" : "passeurs";
        setTitle(`Top 10 ${gameMode === "buteurs" ? "Buteurs" : "Passeurs"} ${league.toUpperCase()} ${selectedYear}`);

        // 1) Question TOP 10
        const { data: question, error: questionErr } = await supabase
          .from("questions")
          .select("id, content")
          .eq("game_type_id", 1) // TOP 10
          .eq("is_active", true)
          .contains("content", { type, season })
          .single();
        
        if (questionErr || !question) {
          throw new Error(`Question TOP 10 "${type}" pour la saison "${season}" introuvable.`);
        }
        if (cancelled) return;

        // 2) Réponses de la question
        const { data: rows, error: ansErr } = await supabase
          .from("question_answers")
          .select(`
            ranking,
            points,
            players!inner(name, current_club, nationality)
          `)
          .eq("question_id", question.id)
          .order("ranking", { ascending: true });
        if (ansErr) throw ansErr;

        // Traitement des réponses avec les données des joueurs
        const list = (rows ?? []).map((r: any) => ({
          answer: r.players.name,
          answer_norm: normalize(r.players.name),
          ranking: r.ranking,
          points: r.points,
          players: {
            nationality: r.players.nationality
          }
        })) as ThemeAnswerRow[];
        
        setValidSet(new Set(list.map((r) => r.answer_norm)));
        setAllValidAnswers(list); // Stocker toutes les réponses pour le récapitulatif

        // 3) Suggestions = TOUS les joueurs de la base (pas seulement les réponses valides)
        const { data: allPlayers, error: playersErr } = await supabase
          .from("players")
          .select("name")
          .order("name");
        
        if (playersErr) throw playersErr;
        setSuggestions((allPlayers ?? []).map((p) => p.name));

        // 4) Reset UI
        setTimeLeft(60);
        setScore(0);
        setStreak(0);
        setAnswers([]);
        setFeedback(null);

        // 5) Initialiser le jeu (sans sauvegarde en base pour l'instant)
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!cancelled) setGameId(gameId);

        // 6) Leaderboard vide pour l'instant (pas de table games)
        if (!cancelled) setLeaderboard([]);
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
  }, [gameStarted, gameMode, selectedYear, league, userId]);

  // Scoring
  const BASE_GOOD = 15;
  const BAD_PENALTY = 5;
  const BONUS_BY_STREAK: Record<number, number> = { 3: 10, 6: 15, 9: 10, 10: 15 };

  // Validation + enregistrement
  const onSelectAnswer = async (value: string) => {
    if (loading || gameOver || !gameId) return;

    const norm = normalize(value);
    if (!norm) return;

    // Debug: afficher les informations de matching
    console.log("🔍 Debug matching:");
    console.log("- Input:", value);
    console.log("- Normalisé:", norm);
    console.log("- ValidSet size:", validSet.size);
    console.log("- ValidSet contient:", validSet.has(norm));
    console.log("- ValidSet preview:", Array.from(validSet).slice(0, 5));

    // Doublon UI
    if (answers.some((a) => normalize(a) === norm)) {
      setFeedback({ type: "info", msg: "Déjà trouvé" });
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
      setFeedback({ type: "ok", msg: `Bonne réponse +${delta}` });
      
      // 🎯 Ajouter à la liste des réponses trouvées pour le défloutage
      setFoundAnswers((prev) => new Set(Array.from(prev).concat(norm)));

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
      setFeedback({ type: "error", msg: `Mauvaise réponse ${delta}` });

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
    
    let hasRun = false;
    
    (async () => {
      if (hasRun) return;
      hasRun = true;

      try {
        console.log("Ending game:", gameId, "Score:", score, "Answers:", answers.length);
        
        // Sauvegarde désactivée - pas de table games
        console.log("Partie terminée - Score final:", score, "Réponses:", answers.length);

        // Leaderboard désactivé - pas de table games
        console.log("Leaderboard non disponible - pas de table games");
        setLeaderboard([]);
      } catch (e) {
        console.error("endGame/leaderboard failed:", e);
      }
    })();
  }, [gameOver, gameId, score, answers.length, gameMode, league, selectedYear]);

  // Handle cerises rewards and challenge completion at game end
  useEffect(() => {
    if (!gameOver || !userId || !gameStarted) return;
    
    const handleGameEnd = async () => {
      try {
        // Calculate cerises based on score
        const baseReward = Math.max(1, Math.floor(score / 10)); // 1 cerise minimum, +1 per 10 points
        const bonusReward = answers.length >= 8 ? 5 : answers.length >= 4 ? 2 : 0; // Bonus for good performance
        const totalReward = baseReward + bonusReward;

        if (totalReward > 0) {
          await cerisesService.addCerises(userId, totalReward);
          setCerisesEarned(totalReward);

          // Update user cerises display
          const newBalance = await cerisesService.getUserCerises(userId);
          setUserCerises(newBalance);
        }

        // Complete challenge if in challenge mode
        if (isChallengeMode && completeChallenge) {
          const timeTaken = 60 - timeLeft; // Calculate time taken
          const success = await completeChallenge(score, timeTaken);
          if (success) {
            console.log('Challenge completed successfully!');
          }
        }
      } catch (error) {
        console.error('Failed to handle game end:', error);
      }
    };
    
    handleGameEnd();
  }, [gameOver, userId, gameStarted, score, answers.length, gameMode, isChallengeMode, completeChallenge, timeLeft]);

  // Couleur timer (utilisée dans le JSX)
  // const timeColor = () => {
  //   if (timeLeft <= 10) return "text-red-600";
  //   if (timeLeft <= 20) return "text-yellow-600";
  //   return "text-green-700";
  // };

  // Fonction pour vérifier si une réponse a été trouvée
  const isAnswerFound = (answerNorm: string) => {
    return answers.some(answer => normalize(answer) === answerNorm);
  };

  // 🎯 Helper pour vérifier si une réponse doit être défloutée
  const isAnswerUnblurred = (answerNorm: string) => {
    return foundAnswers.has(answerNorm);
  };

  // Erreur
  if (loadError) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">Erreur de chargement</h1>
        <p className="text-red-600">{loadError}</p>
        <p className="text-sm text-gray-600">
          Assurez-vous que le thème existe dans Supabase avec le slug correspondant.
        </p>
        <button
          onClick={() => {
            setGameStarted(false);
            setLoadError(null);
          }}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative p-4">
      {/* Motifs ballon en filigrane */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-primary rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header avec sélecteurs */}
        <header className="space-y-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              ⚽ {title} ⚽
            </h1>
            <p className="text-lg text-text/70 font-medium">Testez vos connaissances footballistiques !</p>
            
            {/* Challenge mode indicator */}
            {isChallengeMode && challenge && (
              <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <div>
                    <div className="font-bold">Mode Défi</div>
                    <div className="text-sm opacity-90">
                      Défi contre {challenge.challenger?.pseudo || challenge.challenged?.pseudo || 'Adversaire'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        
        {/* Sélecteurs de configuration */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-accent-light">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode de jeu */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">🎯 Mode de jeu</label>
              <select
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value as "buteurs" | "passeurs")}
                disabled={gameStarted && !gameOver}
                className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent font-medium text-text focus:outline-none focus:border-primary transition-colors duration-200 disabled:opacity-50"
              >
                <option value="buteurs">⚽ Buteurs</option>
                <option value="passeurs">🎯 Passeurs</option>
              </select>
            </div>

            {/* Ligue */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">🏆 Ligue</label>
              <select
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                disabled={gameStarted && !gameOver}
                className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent font-medium text-text focus:outline-none focus:border-primary transition-colors duration-200 disabled:opacity-50"
              >
                <option value="ligue1">🇫🇷 Ligue 1</option>
                <option value="epl">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</option>
                <option value="laliga">🇪🇸 LaLiga</option>
                <option value="seriea">🇮🇹 Serie A</option>
                <option value="bundesliga">🇩🇪 Bundesliga</option>
                <option value="ucl">⭐ Champions League</option>
              </select>
            </div>

            {/* Année */}
            <div>
              <label className="block text-sm font-bold text-orange-600 mb-2">📅 Année</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={gameStarted && !gameOver}
                className="w-full border-2 border-orange-300 rounded-xl px-3 py-2 bg-white font-semibold text-gray-700 disabled:bg-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="2025">2024-2025</option>
                <option value="2024">2023-2024</option>
                <option value="2023">2022-2023</option>
                <option value="2022">2021-2022</option>
                <option value="2021">2020-2021</option>
                <option value="2020">2019-2020</option>
              </select>
            </div>
          </div>

          {/* Bouton Lancer la partie */}
          {!gameStarted && (
            <button
              onClick={() => setGameStarted(true)}
              className="w-full px-6 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xl font-black transform hover:scale-105 transition-all shadow-xl"
            >
              🚀 LANCER LA PARTIE 🚀
            </button>
          )}

          {gameStarted && !gameOver && (
            <p className="text-xs text-center text-primary font-semibold">
              🔒 Sélecteurs verrouillés pendant la partie
            </p>
          )}
        </div>
      </header>

      {/* Score et compteurs - Visible seulement si partie lancée */}
      {gameStarted && (
        <div className="bg-white rounded-3xl shadow-2xl p-4 border border-accent-light">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Timer */}
              <div className={`px-4 py-2 rounded-2xl font-black text-lg shadow-lg ${
                timeLeft <= 10 
                  ? "bg-primary text-white animate-pulse" 
                  : timeLeft <= 20
                  ? "bg-secondary text-text"
                  : "bg-accent text-text"
              }`}>
                {loading ? "⏳" : `⏱️ ${timeLeft}s`}
              </div>

              {/* Streak */}
              <div className="px-4 py-2 rounded-2xl bg-primary text-white font-black text-lg shadow-lg">
                🔥 {streak}
              </div>

              {/* Réponses */}
              <div className="px-4 py-2 rounded-2xl bg-secondary text-text font-black text-lg shadow-lg">
                ✅ {answers.length}/10
              </div>
            </div>

            {/* Score cerises */}
            <div className="px-6 py-2 rounded-2xl bg-primary text-white font-black text-2xl shadow-lg">
              🍒 {score}
            </div>
          </div>
        </div>
      )}

      {/* Saisie - Visible seulement si partie lancée */}
      {gameStarted && (
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
          <AutocompleteInput
            suggestions={suggestions}
            onSelect={onSelectAnswer}
            disabled={loading || gameOver}
            className="flex-1"
            placeholder={loading ? "⏳ Chargement..." : "🔍 Tape au moins 3 caractères..."}
            minChars={3}
          />
        </div>
      )}

      {/* Feedback */}
      {gameStarted && feedback && (
        <div className={`rounded-2xl p-4 text-center font-black text-lg shadow-lg ${
          feedback.type === "ok"
            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
            : feedback.type === "error"
            ? "bg-gradient-to-r from-red-400 to-rose-500 text-white animate-shake"
            : "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Réponses trouvées */}
      {gameStarted && answers.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-accent-light">
          <h3 className="font-black text-primary mb-3 text-lg">🎯 Tes réponses :</h3>
          <div className="grid grid-cols-2 gap-2">
            {answers.map((a, i) => (
              <div key={i} className="bg-primary/10 border-2 border-red-600 rounded-xl px-4 py-2 font-bold text-primary flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 Aperçu progressif des réponses (pendant le jeu) */}
      {gameStarted && !gameOver && allValidAnswers.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-accent-light">
          <h3 className="font-black text-primary mb-3 text-lg">👀 Aperçu du défi :</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche : joueurs 1-5 */}
            <div className="space-y-3">
              {allValidAnswers.slice(0, 5).map((answer, index) => {
                const unblurred = isAnswerUnblurred(answer.answer_norm);
                const flag = getCountryFlag(answer.players?.nationality);
                const statValue = gameMode === 'buteurs' ? answer.goals : answer.assists;
                const statUnit = getStatisticUnit(gameMode);
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-accent-light bg-white"
                  >
                    <span className="text-2xl font-bold text-primary">
                      {answer.ranking || (index + 1)}.
                    </span>
                    <span className="text-2xl">
                      {flag}
                    </span>
                    <span 
                      className={`font-bold text-text flex-1 transition-all duration-500 ${
                        unblurred ? "" : "blur-sm"
                      }`}
                    >
                      {answer.answer}
                    </span>
                    {statValue && (
                      <span className={`text-sm font-semibold text-text bg-accent px-2 py-1 rounded transition-all duration-500 ${
                        unblurred ? "" : "blur-sm"
                      }`}>
                        {statValue} {statUnit}
                      </span>
                    )}
                    {unblurred && (
                      <span className="text-primary text-lg">✅</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Colonne droite : joueurs 6-10 */}
            <div className="space-y-3">
              {allValidAnswers.slice(5, 10).map((answer, index) => {
                const unblurred = isAnswerUnblurred(answer.answer_norm);
                const flag = getCountryFlag(answer.players?.nationality);
                const statValue = gameMode === 'buteurs' ? answer.goals : answer.assists;
                const statUnit = getStatisticUnit(gameMode);
                
                return (
                  <div
                    key={index + 5}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-accent-light bg-white"
                  >
                    <span className="text-2xl font-bold text-primary">
                      {answer.ranking || (index + 6)}.
                    </span>
                    <span className="text-2xl">
                      {flag}
                    </span>
                    <span 
                      className={`font-bold text-text flex-1 transition-all duration-500 ${
                        unblurred ? "" : "blur-sm"
                      }`}
                    >
                      {answer.answer}
                    </span>
                    {statValue && (
                      <span className={`text-sm font-semibold text-text bg-accent px-2 py-1 rounded transition-all duration-500 ${
                        unblurred ? "" : "blur-sm"
                      }`}>
                        {statValue} {statUnit}
                      </span>
                    )}
                    {unblurred && (
                      <span className="text-primary text-lg">✅</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fin de partie */}
      {gameOver && gameStarted && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 border border-accent-light">
          <div className="text-6xl mb-2">
            {answers.length >= 8 ? "🏆" : answers.length >= 4 ? "👍" : "💪"}
          </div>
          <p className="text-2xl font-black text-primary">
            {answers.length >= 8
              ? "LÉGENDE ! Triplé parfait ! 🍒🍒🍒"
              : answers.length >= 4
              ? "Pas mal ! Encore un effort 💪"
              : "On se refait une partie ? 🔄"}
          </p>
          <div className="text-4xl font-black text-primary">
            {score} points ! 🎯
          </div>
          
          {cerisesEarned > 0 && (
            <div className="bg-secondary rounded-2xl p-4 border-2 border-primary">
              <div className="text-2xl font-bold text-primary mb-2">
                🍒 Cerises gagnées !
              </div>
              <div className="text-3xl font-black text-primary">
                +{cerisesEarned} cerises
              </div>
              <div className="text-sm text-primary/70 mt-1">
                Solde total: {userCerises} cerises
              </div>
            </div>
          )}

          {/* Récapitulatif des réponses */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-left border border-accent-light">
            <h3 className="text-xl font-black text-gray-800 mb-4 text-center">
              📋 Récapitulatif des réponses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-60 overflow-y-auto">
              {/* Colonne gauche : joueurs 1-5 */}
              <div className="space-y-3">
                {allValidAnswers.slice(0, 5).map((answer, index) => {
                  const found = isAnswerFound(answer.answer_norm);
                  const unblurred = isAnswerUnblurred(answer.answer_norm);
                  const flag = getCountryFlag(answer.players?.nationality);
                  const statValue = gameMode === 'buteurs' ? answer.goals : answer.assists;
                  const statUnit = getStatisticUnit(gameMode);
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        found
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-400"
                          : "bg-gradient-to-r from-red-100 to-rose-100 border-red-400"
                      }`}
                    >
                      <span className="text-xl font-bold text-purple-600">
                        {answer.ranking || (index + 1)}.
                      </span>
                      <span className="text-2xl">
                        {flag}
                      </span>
                      <span className="text-2xl">
                        {found ? "✅" : "❌"}
                      </span>
                      <span 
                        className={`font-bold flex-1 transition-all duration-500 ${
                          found ? "text-green-800" : "text-red-800"
                        } ${!unblurred ? "blur-sm" : ""}`}
                      >
                        {answer.answer}
                      </span>
                      {statValue && (
                        <span className={`text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded ${
                          !unblurred ? "blur-sm" : ""
                        }`}>
                          {statValue} {statUnit}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Colonne droite : joueurs 6-10 */}
              <div className="space-y-3">
                {allValidAnswers.slice(5, 10).map((answer, index) => {
                  const found = isAnswerFound(answer.answer_norm);
                  const unblurred = isAnswerUnblurred(answer.answer_norm);
                  const flag = getCountryFlag(answer.players?.nationality);
                  const statValue = gameMode === 'buteurs' ? answer.goals : answer.assists;
                  const statUnit = getStatisticUnit(gameMode);
                  
                  return (
                    <div
                      key={index + 5}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        found
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-400"
                          : "bg-gradient-to-r from-red-100 to-rose-100 border-red-400"
                      }`}
                    >
                      <span className="text-xl font-bold text-purple-600">
                        {answer.ranking || (index + 6)}.
                      </span>
                      <span className="text-2xl">
                        {flag}
                      </span>
                      <span className="text-2xl">
                        {found ? "✅" : "❌"}
                      </span>
                      <span 
                        className={`font-bold flex-1 transition-all duration-500 ${
                          found ? "text-green-800" : "text-red-800"
                        } ${!unblurred ? "blur-sm" : ""}`}
                      >
                        {answer.answer}
                      </span>
                      {statValue && (
                        <span className={`text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded ${
                          !unblurred ? "blur-sm" : ""
                        }`}>
                          {statValue} {statUnit}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 font-semibold">
                {answers.length}/{allValidAnswers.length} réponses trouvées
              </p>
            </div>
          </div>

          <button
            ref={replayBtnRef}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-xl"
            onClick={() => {
              setGameStarted(false);
              setTimeLeft(60);
              setScore(0);
              setStreak(0);
              setAnswers([]);
              setFeedback(null);
              setGameId(null);
              replayBtnRef.current?.blur();
            }}
            disabled={loading}
          >
            🎮 NOUVELLE PARTIE 🎮
          </button>
        </div>
      )}

      {/* Leaderboard */}
      <section className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
        <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          🏆 HALL OF FAME 🏆
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 font-semibold py-8">
            Aucun score pour l'instant... Sois le premier ! 🚀
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((row, idx) => (
              <div
                key={`${row.ended_at}-${idx}`}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  idx === 0 
                    ? "bg-gradient-to-r from-yellow-200 to-amber-200 border-2 border-yellow-400"
                    : idx === 1
                    ? "bg-gradient-to-r from-gray-200 to-slate-200 border-2 border-gray-400"
                    : idx === 2
                    ? "bg-gradient-to-r from-orange-200 to-amber-200 border-2 border-orange-400"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </span>
                  <div>
                    <div className="font-black text-lg text-gray-800">{row.final_score} 🍒</div>
                    <div className="text-xs text-gray-600 font-semibold">
                      {row.answers_count}/10 réponses
                    </div>
                  </div>
                </div>
                <time className="text-xs text-gray-500 font-medium">
                  {new Date(row.ended_at).toLocaleDateString('fr-FR')}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
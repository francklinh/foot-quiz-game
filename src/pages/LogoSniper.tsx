// src/pages/LogoSniper.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CerisesService } from "../services/cerises.service";
import { LogoSniperService, LogoAnswer } from "../services/logo-sniper.service";

type Feedback = { type: "ok" | "error" | "info"; msg: string };

export function LogoSniper() {
  const navigate = useNavigate();
  const logoSniperService = new LogoSniperService();
  const cerisesService = new CerisesService();

  // Auth
  const [userId, setUserId] = useState<string | null>(null);

  // Question
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [availableQuestions, setAvailableQuestions] = useState<Array<{ id: string; title: string }>>([]);
  const [logos, setLogos] = useState<LogoAnswer[]>([]);
  const [currentLogoIndex, setCurrentLogoIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [foundLogos, setFoundLogos] = useState<Set<number>>(new Set());

  // Results
  const [finalScore, setFinalScore] = useState<number>(0);
  const [cerisesEarned, setCerisesEarned] = useState<number>(0);
  const [streakBonus, setStreakBonus] = useState<number>(0);
  const [timeBonus, setTimeBonus] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cerisesAddedRef = useRef<boolean>(false);

  // Load user
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    });
  }, []);

  // Load available questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await logoSniperService.getAvailableQuestions();
        setAvailableQuestions(questions);
        if (questions.length > 0 && !selectedQuestion) {
          setSelectedQuestion(questions[0].id);
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    };
    loadQuestions();
  }, []);

  // Load logos when question is selected
  useEffect(() => {
    if (!selectedQuestion) return;

    const loadLogos = async () => {
      try {
        const logoAnswers = await logoSniperService.getQuestionWithClubs(selectedQuestion);
        setLogos(logoAnswers);
        setCurrentLogoIndex(0);
        setFoundLogos(new Set());
        setCorrectAnswers([]);
      } catch (error) {
        console.error("Failed to load logos:", error);
      }
    };

    loadLogos();
  }, [selectedQuestion]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver || timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeLeft <= 0 && gameStarted) {
        endGame();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameOver, timeLeft]);

  const startGame = () => {
    if (!selectedQuestion || logos.length === 0) {
      setFeedback({ type: "error", msg: "Veuillez sélectionner une question" });
      return;
    }

    setGameStarted(true);
    setGameOver(false);
    setTimeLeft(60);
    setScore(0);
    setCurrentLogoIndex(0);
    setCurrentInput("");
    setSuggestions([]);
    setFoundLogos(new Set());
    setCorrectAnswers([]);
    setStreakCount(0);
    setFeedback(null);
    cerisesAddedRef.current = false; // Réinitialiser le flag pour une nouvelle partie
    inputRef.current?.focus();
  };

  const endGame = async () => {
    setGameOver(true);
    setGameStarted(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Calculer le score final
    const result = logoSniperService.calculateScore(
      correctAnswers.length,
      logos.length,
      timeLeft,
      streakCount
    );

    setFinalScore(result.score);
    setCerisesEarned(result.cerises);
    setStreakBonus(result.streakBonus);
    setTimeBonus(result.timeBonus);

    // Ajouter les cerises au compte utilisateur
    if (userId && result.cerises > 0 && !cerisesAddedRef.current) {
      cerisesAddedRef.current = true;
      try {
        console.log(`💰 Ajout de ${result.cerises} cerises pour l'utilisateur ${userId}`);
        const newBalance = await cerisesService.addCerises(userId, result.cerises);
        console.log(`✅ Nouveau solde cerises: ${newBalance}`);
        
        // Notifier le header de la mise à jour AVANT de mettre à jour l'état local
        console.log('📢 Émission de l\'événement cerises-updated:', { balance: newBalance, added: result.cerises });
        const event = new CustomEvent('cerises-updated', { 
          detail: { balance: newBalance, added: result.cerises } 
        });
        window.dispatchEvent(event);
        console.log('✅ Événement cerises-updated émis');
      } catch (error) {
        console.error("❌ Erreur ajout cerises:", error);
        cerisesAddedRef.current = false; // Réessayer si erreur
      }
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!gameStarted || gameOver || currentLogoIndex >= logos.length) return;

    const currentLogo = logos[currentLogoIndex];
    const isCorrect = logoSniperService.validateAnswer(answer, currentLogo.club);

    if (isCorrect) {
      // Bonne réponse
      setCorrectAnswers((prev) => [...prev, currentLogo.club.name]);
      setStreakCount((prev) => prev + 1);
      setScore((prev) => prev + 10);
      setFoundLogos((prev) => new Set([...Array.from(prev), currentLogoIndex]));
      setFeedback({ type: "ok", msg: "✅ Correct !" });

      // Passer au logo suivant
      if (currentLogoIndex < logos.length - 1) {
        setTimeout(() => {
          setCurrentLogoIndex((prev) => prev + 1);
          setCurrentInput("");
          setSuggestions([]);
          setFeedback(null);
          inputRef.current?.focus();
        }, 500);
      } else {
        // Tous les logos trouvés
        endGame();
      }
    } else {
      // Mauvaise réponse
      setStreakCount(0);
      setFeedback({ type: "error", msg: "❌ Incorrect" });
      
      // Passer au logo suivant après 1000ms (même en cas d'erreur)
      if (currentLogoIndex < logos.length - 1) {
        setTimeout(() => {
          setCurrentLogoIndex((prev) => prev + 1);
          setCurrentInput("");
          setSuggestions([]);
          setFeedback(null);
          inputRef.current?.focus();
        }, 1000);
      } else {
        // Dernier logo - terminer la partie après le feedback
        setTimeout(() => {
          setFeedback(null);
          endGame();
        }, 1000);
      }
    }
  };

  const handleInputChange = async (value: string) => {
    setCurrentInput(value);
    
    // Rechercher des clubs pour l'autocomplétion
    if (value.length >= 2) {
      const clubs = await logoSniperService.searchClubs(value, 10);
      setSuggestions(clubs.map(c => c.name));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (value: string) => {
    handleAnswerSubmit(value);
  };

  const getFinalMessage = () => {
    const percentage = (correctAnswers.length / logos.length) * 100;
    if (percentage === 100) {
      return {
        title: "Sniper d'élite ! 🎯🍒",
        message: "T'as visé juste à chaque tir !",
        emoji: "🎯",
      };
    } else if (percentage >= 75) {
      return {
        title: "Belle précision !",
        message: "Encore un tir et c'était parfait !",
        emoji: "⭐",
      };
    } else if (percentage >= 50) {
      return {
        title: "Bon tir !",
        message: "T'as touché les montants plus que les filets.",
        emoji: "👏",
      };
    } else {
      return {
        title: "T'as tiré dans les tribunes...",
        message: "Peut mieux faire !",
        emoji: "😅",
      };
    }
  };

  const currentLogo = logos[currentLogoIndex];
  const finalMessage = gameOver ? getFinalMessage() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black mb-2">🎯 LOGO SNIPER</h1>
          <p className="text-lg opacity-90">Identifie rapidement les logos !</p>
        </div>

        {/* Question Selector */}
        {!gameStarted && (
          <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <label className="block text-sm font-semibold mb-2">Sélectionner une question</label>
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              disabled={gameStarted}
              className="w-full p-3 rounded-xl border-2 border-primary/20 bg-white/10 text-white font-medium focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">-- Choisir une question --</option>
              {availableQuestions.map((q) => (
                <option key={q.id} value={q.id} className="text-black">
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Game Area */}
        {gameStarted && !gameOver && currentLogo && (
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm mb-6">
            {/* Timer */}
            <div className="text-center mb-6">
              <div className="text-4xl font-black text-yellow-300">
                ⏱️ {timeLeft}s
              </div>
            </div>

            {/* Logo Display */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {/* Flash effect on correct answer */}
                {feedback?.type === "ok" && (
                  <div className="absolute inset-0 bg-yellow-400 opacity-30 rounded-xl animate-pulse"></div>
                )}
                {/* Flash red on error */}
                {feedback?.type === "error" && (
                  <div className="absolute inset-0 bg-red-500 opacity-30 rounded-xl animate-pulse"></div>
                )}
                
                <img
                  src={currentLogo.club.logo_url}
                  alt="Logo"
                  className="w-64 h-64 object-contain rounded-xl bg-white/20 p-4 border-4 border-white/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/256x256?text=Logo+Missing";
                  }}
                />
              </div>
            </div>

            {/* Input with Autocomplete */}
            <div className="mb-4 relative">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentInput.trim()) {
                    handleAnswerSubmit(currentInput);
                  }
                }}
                placeholder="Nom du club..."
                className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-white/50 border-2 border-white/30 focus:border-yellow-400 text-xl font-semibold focus:outline-none"
                disabled={gameOver}
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-2 bg-white/90 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="p-3 hover:bg-blue-500/20 cursor-pointer text-gray-900 font-medium border-b border-gray-200 last:border-b-0"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`text-center p-4 rounded-xl mb-4 ${
                  feedback.type === "ok"
                    ? "bg-green-500/30 text-green-200"
                    : feedback.type === "error"
                    ? "bg-red-500/30 text-red-200"
                    : "bg-blue-500/30 text-blue-200"
                }`}
              >
                {feedback.msg}
              </div>
            )}

            {/* Progress */}
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {currentLogoIndex + 1} / {logos.length}
              </div>
              <div className="w-full bg-white/20 rounded-full h-4 mb-2">
                <div
                  className="bg-yellow-400 h-4 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentLogoIndex + 1) / logos.length) * 100}%`,
                  }}
                />
              </div>
              <div className="text-sm opacity-75">
                Score: {score} | Streak: {streakCount}
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm mb-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{finalMessage?.emoji}</div>
              <h2 className="text-3xl font-black mb-2">{finalMessage?.title}</h2>
              <p className="text-xl opacity-90 mb-6">{finalMessage?.message}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-75 mb-1">Score</div>
                  <div className="text-3xl font-black">{finalScore}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-75 mb-1">Cerises</div>
                  <div className="text-3xl font-black">🍒 {cerisesEarned}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-75 mb-1">Réponses correctes</div>
                  <div className="text-3xl font-black">
                    {correctAnswers.length} / {logos.length}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-75 mb-1">Bonus</div>
                  <div className="text-xl font-bold">
                    Streak: +{streakBonus} | Temps: +{timeBonus}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setGameOver(false);
                    setGameStarted(false);
                    setScore(0);
                    setCurrentLogoIndex(0);
                    setFoundLogos(new Set());
                    setCorrectAnswers([]);
                    setStreakCount(0);
                    setTimeLeft(60);
                    cerisesAddedRef.current = false; // Réinitialiser le flag pour une nouvelle partie
                  }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-xl"
                >
                  🎮 NOUVELLE PARTIE
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-4 rounded-2xl bg-white/20 text-white font-bold text-xl hover:bg-white/30 transform hover:scale-105 transition-all"
                >
                  🏠 ACCUEIL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        {!gameStarted && !gameOver && (
          <div className="text-center">
            <button
              onClick={startGame}
              disabled={!selectedQuestion || logos.length === 0}
              className="px-12 py-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black text-2xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              🎯 COMMENCER
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


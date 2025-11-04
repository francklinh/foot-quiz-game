// src/components/ClubActuelGame.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ClubActuelPlayer,
  ClubActuelUserAnswer,
  ClubSuggestion,
  validateClubActuelAnswers,
  searchClubs,
} from "../services/clubActuel.service";

interface ClubActuelGameProps {
  questionId: string;
  players: ClubActuelPlayer[];
  onComplete: (result: {
    correctCount: number;
    totalPlayers: number;
    score: number;
    cerises: number;
    streakBonus: number;
    timeBonus: number;
    timeRemaining: number;
  }) => void;
  onAbandon?: () => void;
  durationSeconds?: number;
}

const GAME_DURATION = 60; // 60 secondes par défaut

export function ClubActuelGame({
  questionId,
  players,
  onComplete,
  onAbandon,
  durationSeconds = GAME_DURATION,
}: ClubActuelGameProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<ClubActuelUserAnswer[]>([]);
  const [clubInput, setClubInput] = useState("");
  const [clubSuggestions, setClubSuggestions] = useState<ClubSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [streakCount, setStreakCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect";
    message: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleGameEnd();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining]);

  // Autocomplétion des clubs
  useEffect(() => {
    const trimmedInput = clubInput.trim();
    if (trimmedInput.length >= 2) {
      const searchTimeout = setTimeout(async () => {
        try {
          console.log(`🔍 Recherche de clubs pour: "${trimmedInput}"`);
          // Retourner tous les clubs correspondants
          const suggestions = await searchClubs(trimmedInput, 10);
          console.log(`✅ Résultats trouvés:`, suggestions);
          setClubSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
          
          if (suggestions.length === 0) {
            console.warn(`⚠️ Aucun club trouvé pour "${trimmedInput}"`);
          }
        } catch (error) {
          console.error("Erreur lors de la recherche de clubs:", error);
          setClubSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300); // Debounce de 300ms

      return () => clearTimeout(searchTimeout);
    } else {
      setClubSuggestions([]);
      setShowSuggestions(false);
    }
  }, [clubInput]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (clubName: string) => {
    setClubInput(clubName);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleValidate = useCallback(async () => {
    if (!clubInput.trim() || !currentPlayer || isValidating) {
      return;
    }

    setIsValidating(true);
    const clubName = clubInput.trim();

    // Vérifier si la réponse est correcte
    const isCorrect =
      clubName.toLowerCase().trim() ===
      currentPlayer.current_club.toLowerCase().trim();

    // Enregistrer la réponse
    const newAnswer: ClubActuelUserAnswer = {
      player_id: currentPlayer.id,
      club_name: clubName,
    };

    setUserAnswers((prev) => [...prev, newAnswer]);

    // Afficher le feedback
    if (isCorrect) {
      setStreakCount((prev) => prev + 1);
      setFeedback({
        type: "correct",
        message: "Correct ! 🎉",
      });
    } else {
      setStreakCount(0);
      setFeedback({
        type: "incorrect",
        message: `Incorrect. Le club actuel est: ${currentPlayer.current_club}`,
      });
    }

    // Passer au joueur suivant après un délai
    setTimeout(() => {
      setFeedback(null);
      setClubInput("");
      setIsValidating(false);

      if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex((prev) => prev + 1);
      } else {
        // Tous les joueurs ont été présentés
        handleGameEnd();
      }
    }, 2000);
  }, [clubInput, currentPlayer, currentPlayerIndex, players.length, isValidating]);

  const handleGameEnd = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    try {
      // Valider toutes les réponses avec la fonction SQL
      const result = await validateClubActuelAnswers(
        questionId,
        userAnswers,
        timeRemaining,
        streakCount
      );

      onComplete({
        correctCount: result.correct_count,
        totalPlayers: result.total_players,
        score: result.score,
        cerises: result.cerises_earned,
        streakBonus: result.streak_bonus,
        timeBonus: result.time_bonus,
        timeRemaining,
      });
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      // En cas d'erreur, utiliser les réponses calculées côté client
      const correctCount = userAnswers.filter(
        (answer) =>
          players.find((p) => p.id === answer.player_id)?.current_club.toLowerCase() ===
          answer.club_name.toLowerCase()
      ).length;

      onComplete({
        correctCount,
        totalPlayers: players.length,
        score: correctCount * 10,
        cerises: correctCount * 10, // Base seulement
        streakBonus: 0,
        timeBonus: timeRemaining,
        timeRemaining,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isValidating) {
      handleValidate();
    } else if (e.key === "ArrowDown" && showSuggestions && clubSuggestions.length > 0) {
      e.preventDefault();
      // TODO: Navigation dans les suggestions au clavier
    }
  };

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center h-screen bg-pattern">
        <p className="text-secondary">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern p-4">
      {/* Header avec timer */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-secondary">
            Joueur {currentPlayerIndex + 1} / {players.length}
          </div>
          <div className="text-2xl font-black text-primary">
            ⏱️ {timeRemaining}s
          </div>
        </div>

        {/* Zone centrale avec photo du joueur */}
        <div className="card-primary rounded-xl shadow-lg p-8 mb-6">
          <div className="flex flex-col items-center">
            {/* Photo du joueur */}
            {currentPlayer.photo_url ? (
              <img
                src={currentPlayer.photo_url}
                alt={currentPlayer.name}
                className="w-48 h-48 object-cover rounded-lg mb-4 border-4 border-primary"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-48 h-48 bg-accent-dark rounded-lg mb-4 flex items-center justify-center text-secondary">
                <span className="text-6xl">👤</span>
              </div>
            )}

            {/* Nom du joueur */}
            <h2 className="text-2xl font-black text-primary mb-2">
              {currentPlayer.name}
            </h2>

            {/* Infos supplémentaires (optionnel) */}
            {(currentPlayer.nationality || currentPlayer.position) && (
              <div className="text-sm text-secondary mb-4">
                {currentPlayer.position && <span>{currentPlayer.position}</span>}
                {currentPlayer.position && currentPlayer.nationality && " • "}
                {currentPlayer.nationality && <span>{currentPlayer.nationality}</span>}
              </div>
            )}

            {/* Question */}
            <p className="text-lg text-primary mb-6 font-semibold">
              Quel est son club actuel ?
            </p>

            {/* Champ de saisie avec autocomplétion */}
            <div className="w-full max-w-md relative">
              <input
                ref={inputRef}
                type="text"
                value={clubInput}
                onChange={(e) => setClubInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tapez le nom du club..."
                className="w-full px-4 py-3 input-primary rounded-lg text-lg font-medium"
                disabled={isValidating}
                autoFocus
              />

              {/* Suggestions d'autocomplétion */}
              {showSuggestions && clubSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-accent rounded-lg shadow-lg max-h-60 overflow-y-auto border-2 border-primary"
                >
                  {clubSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion.name)}
                      className="w-full px-4 py-2 text-left hover:bg-primary-light focus:bg-primary-light focus:outline-none border-b border-light last:border-b-0"
                    >
                      <div className="font-medium text-primary">{suggestion.name}</div>
                      {suggestion.league && (
                        <div className="text-xs text-secondary">{suggestion.league}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton Valider */}
            <button
              onClick={handleValidate}
              disabled={!clubInput.trim() || isValidating}
              className="mt-6 px-8 py-3 btn-primary rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? "Validation..." : "Valider"}
            </button>

            {/* Feedback */}
            {feedback && (
              <div
                className={`mt-4 px-6 py-3 rounded-lg ${
                  feedback.type === "correct"
                    ? "bg-success-light text-success border-2 border-success"
                    : "bg-danger-light text-danger border-2 border-danger"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {/* Indicateur de streak */}
            {streakCount > 0 && (
              <div className="mt-4 text-warning font-semibold">
                🔥 Série de {streakCount} bonne{streakCount > 1 ? "s" : ""} réponse{streakCount > 1 ? "s" : ""} !
              </div>
            )}
          </div>
        </div>

        {/* Bouton Abandonner */}
        {onAbandon && (
          <div className="text-center">
            <button
              onClick={onAbandon}
              className="text-secondary hover:text-primary underline text-sm font-semibold"
            >
              Abandonner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


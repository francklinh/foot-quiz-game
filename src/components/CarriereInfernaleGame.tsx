// src/components/CarriereInfernaleGame.tsx
import React, { useState, useEffect } from "react";
import {
  CarriereInfernalePlayer,
  Club,
  generateDistractors,
} from "../services/carriereInfernale.service";

interface CarriereInfernaleGameProps {
  player: CarriereInfernalePlayer;
  onValidate: (selectedClubIds: string[]) => void;
  onNext: () => void;
  totalCorrect: number; // Nombre total de bonnes réponses (max 15)
  isLastPlayer: boolean;
  timeRemaining: number; // Temps restant en secondes
  onTimeUp: () => void; // Callback quand le timer atteint 0
  onTimeUpWithSelection?: (selectedClubIds: string[]) => void; // Callback avec sélection actuelle
}

export function CarriereInfernaleGame({
  player,
  onValidate,
  onNext,
  totalCorrect,
  isLastPlayer,
  timeRemaining,
  onTimeUp,
  onTimeUpWithSelection,
}: CarriereInfernaleGameProps) {
  const [allClubs, setAllClubs] = useState<Club[]>([]); // 10 logos (réels + distracteurs)
  const [selectedClubIds, setSelectedClubIds] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | "perfect";
    clubId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const correctClubIds = new Set(player.correct_clubs.map((c) => c.id));

  // Timer : vérifier si le temps est écoulé
  useEffect(() => {
    if (timeRemaining <= 0) {
      // Si on a une fonction pour sauvegarder la sélection actuelle, l'utiliser
      if (onTimeUpWithSelection) {
        onTimeUpWithSelection(Array.from(selectedClubIds));
      } else {
        onTimeUp();
      }
    }
  }, [timeRemaining, onTimeUp, onTimeUpWithSelection, selectedClubIds]);

  // Générer les 10 logos (clubs réels + distracteurs)
  useEffect(() => {
    const loadClubs = async () => {
      setLoading(true);
      try {
        const correctCount = player.correct_clubs.length;
        const distractorsCount = 10 - correctCount;

        // Générer les distracteurs
        const distractors = await generateDistractors(
          player.correct_clubs,
          distractorsCount
        );

        // Mélanger clubs réels et distracteurs
        const all = [...player.correct_clubs, ...distractors];
        const shuffled = all.sort(() => Math.random() - 0.5);

        setAllClubs(shuffled.slice(0, 10));
      } catch (error) {
        console.error("Erreur lors du chargement des clubs:", error);
        // En cas d'erreur, utiliser seulement les clubs réels
        setAllClubs(player.correct_clubs);
      } finally {
        setLoading(false);
      }
    };

    loadClubs();
  }, [player]);

  const handleToggleClub = (clubId: string) => {
    if (isValidating) return;

    setSelectedClubIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clubId)) {
        newSet.delete(clubId);
      } else {
        newSet.add(clubId);
      }
      return newSet;
    });
  };

  const handleValidate = async () => {
    if (isValidating || selectedClubIds.size === 0) return;

    setIsValidating(true);

    // Calculer les bonnes et mauvaises sélections
    const correctSelections: string[] = [];
    const incorrectSelections: string[] = [];

    selectedClubIds.forEach((clubId) => {
      if (correctClubIds.has(clubId)) {
        correctSelections.push(clubId);
      } else {
        incorrectSelections.push(clubId);
      }
    });

    // Vérifier si perfect (tous les clubs réels sélectionnés, aucun incorrect)
    const isPerfect =
      correctSelections.length === player.correct_clubs.length &&
      incorrectSelections.length === 0;

    // Feedback visuel
    if (isPerfect) {
      setFeedback({ type: "perfect" });
    } else if (correctSelections.length > 0) {
      setFeedback({ type: "correct", clubId: correctSelections[0] });
    } else if (incorrectSelections.length > 0) {
      setFeedback({ type: "incorrect", clubId: incorrectSelections[0] });
    }

    // Appeler la validation après un court délai pour le feedback
    setTimeout(() => {
      onValidate(Array.from(selectedClubIds));
      setIsValidating(false);
      setFeedback(null);
    }, 1500);
  };

  // Position des logos en cercle
  const getLogoPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Commencer en haut
    const radius = 180; // Rayon du cercle en pixels
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-pattern">
        <p className="text-primary text-xl">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        {/* Timer et compteur de réponses correctes */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-4">
          <div className="card-primary rounded-lg px-6 py-2 border border-primary">
            <p className="text-primary text-lg font-bold">
              ⏱️ <span className={timeRemaining <= 10 ? "text-danger animate-pulse" : "text-warning"}>{timeRemaining}s</span>
            </p>
          </div>
          <div className="card-primary rounded-lg px-6 py-2 border border-primary">
            <p className="text-primary text-lg font-bold">
              Réponses correctes: <span className="text-warning">{totalCorrect}/15</span>
            </p>
          </div>
        </div>

        {/* Zone centrale avec le joueur */}
        <div className="relative flex flex-col items-center justify-center mb-8">
          {/* Photo du joueur */}
          <div className="relative mb-4">
            {player.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.name}
                className="w-48 h-48 rounded-full object-cover border-4 border-warning shadow-2xl"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-secondary-light border-4 border-warning flex items-center justify-center">
                <span className="text-inverse text-4xl">⚽</span>
              </div>
            )}
            {/* Cercle de flamme dorée si perfect */}
            {feedback?.type === "perfect" && (
              <div className="absolute inset-0 rounded-full border-4 border-warning animate-pulse shadow-[0_0_20px_rgba(214,158,46,0.8)]" />
            )}
          </div>

          {/* Nom du joueur */}
          <h2 className="text-primary text-3xl font-bold mb-2 text-center">
            {player.name}
          </h2>
          {player.nationality && (
            <p className="text-secondary text-sm">{player.nationality}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-primary text-lg">
            Sélectionne les clubs réels où ce joueur a évolué
          </p>
        </div>

        {/* Logos en cercle */}
        <div className="relative w-full h-96 flex items-center justify-center mb-8">
          {allClubs.map((club, index) => {
            const position = getLogoPosition(index, allClubs.length);
            const isSelected = selectedClubIds.has(club.id);
            const isCorrect = correctClubIds.has(club.id);
            const showFeedback =
              feedback?.clubId === club.id || feedback?.type === "perfect";

            return (
              <div
                key={club.id}
                className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handleToggleClub(club.id)}
              >
                <div
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-4 transition-all duration-300 ${
                    isSelected
                      ? isCorrect
                        ? "border-warning shadow-[0_0_20px_rgba(214,158,46,0.8)] scale-110"
                        : "border-danger opacity-50 scale-90"
                      : "border-transparent hover:border-medium"
                  } ${
                    showFeedback && !isCorrect && feedback?.type === "incorrect"
                      ? "animate-pulse opacity-30"
                      : ""
                  }`}
                >
                  <img
                    src={club.logo_url}
                    alt={club.name}
                    className="w-full h-full object-contain bg-white p-1"
                  />
                  {/* Halo doré pour bonne sélection */}
                  {isSelected && isCorrect && (
                    <div className="absolute inset-0 border-2 border-warning rounded-lg animate-pulse" />
                  )}
                </div>
                {/* Nom du club au survol */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-inverse text-xs bg-secondary px-2 py-1 rounded">
                    {club.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton VALIDER */}
        <div className="flex justify-center">
          <button
            onClick={handleValidate}
            disabled={isValidating || selectedClubIds.size === 0}
            className={`px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300 ${
              isValidating || selectedClubIds.size === 0
                ? "bg-secondary-light text-muted cursor-not-allowed"
                : "btn-primary shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {isValidating ? "Validation..." : "VALIDER"}
          </button>
        </div>

        {/* Message de feedback */}
        {feedback && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div
              className={`px-6 py-4 rounded-lg font-bold text-xl ${
                feedback.type === "perfect"
                  ? "bg-warning text-primary"
                  : feedback.type === "correct"
                  ? "bg-success text-inverse"
                  : "bg-danger text-inverse"
              } animate-bounce`}
            >
              {feedback.type === "perfect"
                ? "🔥 PARFAIT !"
                : feedback.type === "correct"
                ? "✅ Correct !"
                : "❌ Incorrect"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


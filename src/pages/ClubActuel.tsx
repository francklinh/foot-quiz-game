// src/pages/ClubActuel.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  getClubActuelQuestion,
  getAvailableClubActuelQuestions,
  getRandomClubActuelQuestion,
  ClubActuelQuestion,
} from "../services/clubActuel.service";
import { ClubActuelGame } from "../components/ClubActuelGame";
import { CerisesService } from "../services/cerises.service";

type GameState = "selection" | "playing" | "completed";

interface GameResult {
  correctCount: number;
  totalPlayers: number;
  score: number;
  cerises: number;
  streakBonus: number;
  timeBonus: number;
  timeRemaining: number;
}

export function ClubActuel() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameMode = searchParams.get("mode") || "solo";

  // Services
  const cerisesService = new CerisesService();

  // État du jeu
  const [gameState, setGameState] = useState<GameState>("selection");
  const [question, setQuestion] = useState<ClubActuelQuestion | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<
    Array<{ id: string; title: string; season?: string }>
  >([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const cerisesAddedRef = useRef<boolean>(false);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    });
  }, []);

  // Charger les questions disponibles
  useEffect(() => {
    loadAvailableQuestions();
  }, []);

  const loadAvailableQuestions = async () => {
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      const questions = await getAvailableClubActuelQuestions();
      setAvailableQuestions(questions);
    } catch (error: any) {
      console.error("Erreur lors du chargement des questions:", error);
      setQuestionsError(error.message || "Erreur lors du chargement des questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleStartGame = async (questionId?: string) => {
    try {
      setQuestionsError(null);
      let questionToLoad: ClubActuelQuestion;

      if (questionId) {
        questionToLoad = await getClubActuelQuestion(questionId);
      } else {
        // Question aléatoire
        questionToLoad = await getRandomClubActuelQuestion();
      }

      setQuestion(questionToLoad);
      setGameState("playing");
      setStartTime(Date.now());
      cerisesAddedRef.current = false; // Réinitialiser le flag pour une nouvelle partie
    } catch (error: any) {
      console.error("Erreur lors du chargement de la question:", error);
      setQuestionsError(error.message || "Erreur lors du chargement de la question");
    }
  };

  const handleGameComplete = async (result: GameResult) => {
    setGameResult(result);
    setGameState("completed");

    if (userId && gameMode === "solo") {
      try {
        // Calculer le temps pris
        const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 60 - result.timeRemaining;
        
        // Sauvegarder le résultat dans game_results
        const { error: gameResultError } = await supabase
          .from('game_results')
          .insert({
            user_id: userId,
            game_type: 'CLUB_ACTUEL',
            score: result.score,
            time_taken: timeTaken,
            won: result.correctCount === result.totalPlayers, // Gagné si toutes les réponses sont correctes
            created_at: new Date().toISOString()
          });

        if (gameResultError) {
          console.error("Erreur lors de l'enregistrement du résultat:", gameResultError);
        } else {
          console.log("✅ Résultat sauvegardé dans game_results");
        }

        // Ajouter les cerises au compte utilisateur
        if (result.cerises > 0 && !cerisesAddedRef.current) {
          cerisesAddedRef.current = true;
          try {
            console.log(`💰 Ajout de ${result.cerises} cerises pour l'utilisateur ${userId}`);
            const newBalance = await cerisesService.addCerises(userId, result.cerises);
            console.log(`✅ Nouveau solde cerises: ${newBalance}`);
            
            // Notifier le header de la mise à jour
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
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du score:", error);
      }
    }
  };

  const handleAbandon = () => {
    if (window.confirm("Êtes-vous sûr de vouloir abandonner ?")) {
      setGameState("selection");
      setQuestion(null);
      setGameResult(null);
    }
  };

  const handleReplay = () => {
    setGameState("selection");
    setQuestion(null);
    setGameResult(null);
    setSelectedQuestionId("");
    setStartTime(null);
    cerisesAddedRef.current = false; // Réinitialiser le flag pour une nouvelle partie
  };

  const handleBack = () => {
    navigate("/");
  };

  // Écran de sélection de question
  if (gameState === "selection") {
    return (
      <div className="min-h-screen bg-pattern p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="text-primary hover:text-primary-dark mb-4 font-semibold"
            >
              ← Retour
            </button>
            <h1 className="text-4xl font-black text-primary mb-2">
              🏆 CLUB ACTUEL
            </h1>
            <p className="text-secondary">
              Devine le club actuel des joueurs présentés. Combines réflexe, mémoire et veille football !
            </p>
          </div>

          {/* Règles du jeu */}
          <div className="card-primary rounded-xl p-6 mb-6 border-2 border-primary">
            <h2 className="text-xl font-bold text-primary mb-3">RÈGLES DU JEU</h2>
            <ul className="list-disc list-inside text-primary space-y-2">
              <li>15 joueurs à identifier</li>
              <li>60 secondes pour répondre</li>
              <li>10 cerises par bonne réponse</li>
              <li>Bonus streaks : +10 cerises à 3, 6 bonnes réponses, +15 à 9, 12</li>
              <li>Bonus temps : +1 cerise par seconde restante</li>
              <li>Maximum 200 cerises (hors bonus temps)</li>
            </ul>
          </div>

          {/* Sélection de question */}
          <div className="card-primary rounded-xl p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-bold text-primary mb-4">
              Choisir une question
            </h2>

            {questionsLoading && (
              <div className="text-center py-8">
                <p className="text-secondary">Chargement des questions...</p>
              </div>
            )}

            {questionsError && (
              <div className="bg-danger-light border-2 border-danger rounded-lg p-4 mb-4">
                <p className="text-primary">{questionsError}</p>
              </div>
            )}

            {!questionsLoading && availableQuestions.length > 0 && (
              <div className="space-y-3">
                {availableQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestionId(q.id);
                      handleStartGame(q.id);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedQuestionId === q.id
                        ? "border-primary bg-primary-light"
                        : "border-light hover:border-primary hover:bg-accent"
                    }`}
                  >
                    <div className="font-semibold text-primary">{q.title}</div>
                    {q.season && (
                      <div className="text-sm text-secondary">{q.season}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!questionsLoading && availableQuestions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-secondary mb-4">
                  Aucune question disponible pour le moment.
                </p>
                <button
                  onClick={loadAvailableQuestions}
                  className="text-primary hover:text-primary-dark underline font-semibold"
                >
                  Recharger
                </button>
              </div>
            )}

            {/* Bouton question aléatoire */}
            <div className="mt-6 pt-6 border-t border-light">
              <button
                onClick={() => handleStartGame()}
                className="w-full py-3 btn-primary rounded-lg font-semibold transition-colors"
                disabled={questionsLoading}
              >
                🎲 Question aléatoire
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran de jeu
  if (gameState === "playing" && question) {
    return (
      <ClubActuelGame
        questionId={question.id}
        players={question.players}
        onComplete={handleGameComplete}
        onAbandon={handleAbandon}
        durationSeconds={60}
      />
    );
  }

  // Écran de résultats
  if (gameState === "completed" && gameResult) {
    return (
      <div className="min-h-screen bg-pattern p-4">
        <div className="max-w-2xl mx-auto">
          <div className="card-primary rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-black text-primary mb-6">
              🎉 Partie terminée !
            </h1>

            {/* Score principal */}
            <div className="mb-8">
              <div className="text-6xl font-black text-primary mb-2">
                {gameResult.correctCount}/{gameResult.totalPlayers}
              </div>
              <div className="text-xl text-secondary">
                Bonnes réponses
              </div>
            </div>

            {/* Détails */}
            <div className="bg-accent rounded-lg p-6 mb-6 text-left border-2 border-light">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary">Score :</span>
                  <span className="font-semibold text-primary">{gameResult.score} points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Cerises de base :</span>
                  <span className="font-semibold text-primary">
                    {gameResult.correctCount * 10} 🍒
                  </span>
                </div>
                {gameResult.streakBonus > 0 && (
                  <div className="flex justify-between text-warning">
                    <span>Bonus streak :</span>
                    <span className="font-semibold">+{gameResult.streakBonus} 🍒</span>
                  </div>
                )}
                {gameResult.timeBonus > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Bonus temps :</span>
                    <span className="font-semibold">+{gameResult.timeBonus} 🍒</span>
                  </div>
                )}
                <div className="border-t border-light pt-3 flex justify-between">
                  <span className="text-lg font-bold text-primary">
                    Total cerises :
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {gameResult.cerises} 🍒
                  </span>
                </div>
              </div>
            </div>

            {/* Message selon le score */}
            <div className="mb-6">
              {gameResult.cerises >= 200 && (
                <p className="text-xl font-semibold text-warning">
                  🏆 Directeur sportif en chef ! Tu signes les stars avant tout le monde 🍒💼⚽
                </p>
              )}
              {gameResult.cerises >= 100 && gameResult.cerises < 200 && (
                <p className="text-lg text-primary">
                  ✅ Solide ! Tu surveilles bien le mercato, mais t'as laissé filer 2–3 transferts.
                </p>
              )}
              {gameResult.cerises >= 50 && gameResult.cerises < 100 && (
                <p className="text-lg text-primary">
                  📰 Tu lis les infos transfert… mais en retard d'une journée.
                </p>
              )}
              {gameResult.cerises < 50 && (
                <p className="text-lg text-primary">
                  😅 T'es perdu au mercato. T'as encore pensé que Ronaldo jouait au Real ? 😭🍒
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleReplay}
                className="w-full py-3 btn-primary rounded-lg font-semibold transition-colors"
              >
                Rejouer
              </button>
              <button
                onClick={handleBack}
                className="w-full py-3 btn-outline rounded-lg font-semibold transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-pattern">
      <p className="text-secondary">Chargement...</p>
    </div>
  );
}


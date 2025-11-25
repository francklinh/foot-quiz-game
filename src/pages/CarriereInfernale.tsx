// src/pages/CarriereInfernale.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  getCarriereInfernaleQuestion,
  getAvailableCarriereInfernaleQuestions,
  getRandomCarriereInfernaleQuestion,
  CarriereInfernaleQuestion,
  CarriereInfernalePlayer,
  CarriereInfernaleUserSelection,
  validateCarriereInfernaleAnswers,
} from "../services/carriereInfernale.service";
import { CarriereInfernaleGame } from "../components/CarriereInfernaleGame";
import { CerisesService } from "../services/cerises.service";

type GameState = "selection" | "playing" | "completed";

interface GameResult {
  correctCount: number;
  incorrectCount: number;
  totalPossible: number;
  perfectCount: number;
  isPerfectGlobal: boolean;
  score: number;
  cerises: number;
  streakBonus: number;
  timeBonus: number;
  playerDetails: Array<{
    player_id: string;
    correct_clubs: string[];
    selected_clubs: string[];
    correct_count: number;
    incorrect_count: number;
    is_perfect: boolean;
  }>;
}

export function CarriereInfernale() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const gameMode = searchParams.get("mode") || "solo";

  // Services
  const cerisesService = new CerisesService();

  // État du jeu
  const [gameState, setGameState] = useState<GameState>("selection");
  const [question, setQuestion] = useState<CarriereInfernaleQuestion | null>(null);
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

  // État du jeu en cours
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<CarriereInfernaleUserSelection[]>([]);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60); // Timer de 60 secondes
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [playersMap, setPlayersMap] = useState<Map<string, CarriereInfernalePlayer>>(new Map());


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

  // Charger les informations des joueurs pour la revue
  useEffect(() => {
    if (showReview && question && gameState === "completed") {
      const map = new Map<string, CarriereInfernalePlayer>();
      question.players.forEach((player) => {
        map.set(player.id, player);
      });
      setPlayersMap(map);
    }
  }, [showReview, question, gameState]);

  const loadAvailableQuestions = async () => {
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      const questions = await getAvailableCarriereInfernaleQuestions();
      setAvailableQuestions(questions);
    } catch (error: any) {
      console.error("Erreur lors du chargement des questions:", error);
      setQuestionsError(error.message || "Erreur lors du chargement des questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Fonction de fin de partie (mémorisée pour éviter les re-renders)
  const handleGameComplete = useCallback(async (finalSelections?: CarriereInfernaleUserSelection[]) => {
    console.log("🎮 handleGameComplete appelé", { question: !!question, finalSelections, userSelections, gameState });
    
    // Empêcher l'exécution si le jeu est déjà terminé
    if (gameState !== "playing") {
      console.log("⚠️ Jeu déjà terminé, arrêt");
      return;
    }
    
    if (!question) {
      console.error("❌ Pas de question, arrêt");
      return;
    }

    // Arrêter le timer si actif
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Changer l'état immédiatement pour empêcher les appels multiples
    setGameState("completed");

    // Utiliser les sélections passées en paramètre ou celles de l'état
    const selectionsToValidate = finalSelections || userSelections;
    console.log("📋 Sélections à valider:", selectionsToValidate);

    try {
      console.log("🔍 Appel de validateCarriereInfernaleAnswers...");
      // Valider toutes les réponses avec la fonction SQL (passer timeRemaining)
      const result = await validateCarriereInfernaleAnswers(
        question.id,
        selectionsToValidate,
        timeRemaining
      );
      console.log("✅ Résultat de validation:", result);

      const gameResultData: GameResult = {
        correctCount: result.correct_count,
        incorrectCount: result.incorrect_count,
        totalPossible: result.total_possible,
        perfectCount: result.perfect_count,
        isPerfectGlobal: result.is_perfect_global,
        score: result.score,
        cerises: result.cerises_earned,
        streakBonus: result.streak_bonus,
        timeBonus: result.time_bonus,
        playerDetails: result.player_details || [],
      };

      console.log("💾 Définition du gameResult:", gameResultData);
      setGameResult(gameResultData);
      console.log("✅ Résultats définis");

      if (userId && gameMode === "solo") {
        try {
          // Calculer le temps pris (60 - timeRemaining)
          const timeTaken = 60 - timeRemaining;

          // Sauvegarder le résultat dans game_results
          const { error: gameResultError } = await supabase
            .from("game_results")
            .insert({
              user_id: userId,
              game_type: "CARRIERE_INFERNALE",
              score: result.score,
              time_taken: timeTaken,
              won: result.correct_count === result.total_possible,
              created_at: new Date().toISOString(),
            });

          if (gameResultError) {
            console.error("Erreur lors de l'enregistrement du résultat:", gameResultError);
          } else {
            console.log("✅ Résultat sauvegardé dans game_results");
          }

          // Ajouter les cerises au compte utilisateur
          if (result.cerises_earned > 0 && !cerisesAddedRef.current) {
            cerisesAddedRef.current = true;
            try {
              console.log(
                `💰 Ajout de ${result.cerises_earned} cerises pour l'utilisateur ${userId}`
              );
              const newBalance = await cerisesService.addCerises(
                userId,
                result.cerises_earned
              );
              console.log(`✅ Nouveau solde cerises: ${newBalance}`);

              // Notifier le header de la mise à jour
              console.log("📢 Émission de l'événement cerises-updated:", {
                balance: newBalance,
                added: result.cerises_earned,
              });
              const event = new CustomEvent("cerises-updated", {
                detail: { balance: newBalance, added: result.cerises_earned },
              });
              window.dispatchEvent(event);
              console.log("✅ Événement cerises-updated émis");
            } catch (error) {
              console.error("❌ Erreur ajout cerises:", error);
              cerisesAddedRef.current = false;
            }
          }
        } catch (error) {
          console.error("Erreur lors de l'enregistrement du score:", error);
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la validation:", error);
      setQuestionsError(error.message || "Erreur lors de la validation");
      // Même en cas d'erreur, afficher un résultat vide pour que l'utilisateur puisse voir quelque chose
      setGameResult({
        correctCount: 0,
        incorrectCount: 0,
        totalPossible: 0,
        perfectCount: 0,
        isPerfectGlobal: false,
        score: 0,
        cerises: 0,
        streakBonus: 0,
        timeBonus: 0,
        playerDetails: [],
      });
    }
  }, [question, userSelections, userId, gameMode, timeRemaining, cerisesService, gameState]);

  // Fonction pour gérer la fin du timer avec la sélection actuelle
  const handleTimeUpWithSelection = useCallback((selectedClubIds: string[]) => {
    console.log("⏰ handleTimeUpWithSelection appelé", { selectedClubIds, question: !!question, currentPlayerIndex, userSelections, gameState });
    
    // Empêcher l'exécution si le jeu est déjà terminé
    if (gameState !== "playing") {
      console.log("⚠️ Jeu déjà terminé dans handleTimeUpWithSelection, arrêt");
      return;
    }
    
    if (!question) {
      console.error("❌ Pas de question dans handleTimeUpWithSelection");
      return;
    }
    
    // Construire la liste complète des sélections incluant celle du joueur actuel
    const finalSelections: CarriereInfernaleUserSelection[] = [...userSelections];
    
    // Ajouter la sélection du joueur actuel si elle n'existe pas déjà
    if (currentPlayerIndex < question.players.length) {
      const currentPlayer = question.players[currentPlayerIndex];
      console.log("👤 Joueur actuel:", currentPlayer.name);
      const alreadyValidated = userSelections.some(
        (sel) => sel.player_id === currentPlayer.id
      );
      
      if (!alreadyValidated) {
        const selection: CarriereInfernaleUserSelection = {
          player_id: currentPlayer.id,
          selected_club_ids: selectedClubIds,
        };
        finalSelections.push(selection);
        console.log("➕ Sélection ajoutée pour", currentPlayer.name, selection);
        
        // Calculer les bonnes réponses pour ce joueur (pour l'affichage)
        const correctClubIds = new Set(currentPlayer.correct_clubs.map((c) => c.id));
        const correctCount = selectedClubIds.filter((id) => correctClubIds.has(id)).length;
        setTotalCorrect((prevTotal) => prevTotal + correctCount);
      } else {
        console.log("ℹ️ Joueur déjà validé:", currentPlayer.name);
      }
    }
    
    // Ne pas mettre à jour userSelections ici pour éviter les re-renders
    // On passe directement les sélections à handleGameComplete
    console.log("📝 Sélections finales:", finalSelections);
    
    // Appeler handleGameComplete avec les sélections finales
    console.log("🚀 Appel de handleGameComplete...");
    handleGameComplete(finalSelections);
  }, [handleGameComplete, question, currentPlayerIndex, userSelections, gameState]);

  // Fonction pour gérer la fin du timer (sans sélection)
  const handleTimeUp = useCallback(() => {
    handleTimeUpWithSelection([]);
  }, [handleTimeUpWithSelection]);

  // Gestion du timer
  useEffect(() => {
    if (gameState !== "playing") {
      // Arrêter le timer si on n'est plus en mode playing
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timeRemaining <= 0) {
      // Temps écoulé - fin de partie
      console.log("⏰ Timer à 0, arrêt du timer et appel de handleTimeUp");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Vérifier que le jeu est toujours en cours avant d'appeler handleTimeUp
      if (gameState === "playing") {
        handleTimeUp();
      }
      return;
    }

    // Démarrer le timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Arrêter le timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Ne pas appeler handleTimeUp ici, le useEffect le fera quand timeRemaining sera 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, timeRemaining, handleTimeUp]);

  const handleStartGame = async (questionId?: string) => {
    try {
      setQuestionsError(null);
      let questionToLoad: CarriereInfernaleQuestion;

      if (questionId) {
        questionToLoad = await getCarriereInfernaleQuestion(questionId);
      } else {
        // Question aléatoire
        questionToLoad = await getRandomCarriereInfernaleQuestion();
      }

      setQuestion(questionToLoad);
      setGameState("playing");
      setStartTime(Date.now());
      setCurrentPlayerIndex(0);
      setUserSelections([]);
      setTotalCorrect(0);
      setTimeRemaining(60); // Réinitialiser le timer à 60 secondes
      cerisesAddedRef.current = false;
    } catch (error: any) {
      console.error("Erreur lors du chargement de la question:", error);
      setQuestionsError(error.message || "Erreur lors du chargement de la question");
    }
  };

  const handlePlayerValidate = async (selectedClubIds: string[]) => {
    if (!question) return;

    const currentPlayer = question.players[currentPlayerIndex];
    
    // Sauvegarder la sélection de ce joueur
    const selection: CarriereInfernaleUserSelection = {
      player_id: currentPlayer.id,
      selected_club_ids: selectedClubIds,
    };

    setUserSelections((prev) => [...prev, selection]);

    // Calculer les bonnes réponses pour ce joueur (pour le compteur)
    const correctClubIds = new Set(currentPlayer.correct_clubs.map((c) => c.id));
    const correctCount = selectedClubIds.filter((id) => correctClubIds.has(id)).length;
    setTotalCorrect((prev) => prev + correctCount);

    // Vérifier si on a atteint 15 bonnes réponses ou si c'est le dernier joueur
    const newTotalCorrect = totalCorrect + correctCount;
    const isLastPlayer = currentPlayerIndex >= question.players.length - 1;

    if (newTotalCorrect >= 15 || isLastPlayer) {
      // Fin de partie - valider toutes les réponses
      await handleGameComplete();
    } else {
      // Passer au joueur suivant
      setCurrentPlayerIndex((prev) => prev + 1);
    }
  };

  const getFinalMessage = () => {
    if (!gameResult) return "";

    const { correctCount, incorrectCount, isPerfectGlobal } = gameResult;

    if (isPerfectGlobal) {
      return "T'as maîtrisé le mercato comme un agent légendaire ! 🍒🔥";
    } else if (correctCount >= 12 && incorrectCount <= 3) {
      return "Solide ! Quelques transferts discutables mais t'es sur le marché.";
    } else if (correctCount >= 8) {
      return "On dirait que t'as joué au dart avec la carrière du gars…";
    } else {
      return "Catastrophe sportive… même PSG 2017 ferait mieux.";
    }
  };

  // Écran de sélection de question
  if (gameState === "selection") {
    return (
      <div className="min-h-screen bg-pattern p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold heading-primary mb-8 text-center">
            🔥 Carrière Infernale
          </h1>

          <div className="card-primary rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold heading-primary mb-4">Règles du jeu</h2>
            <ul className="text-primary space-y-2">
              <li>• Sélectionne les clubs réels où chaque joueur a évolué</li>
              <li>• ⏱️ 60 secondes pour compléter la partie</li>
              <li>• Maximum 15 bonnes réponses par partie</li>
              <li>• 10 cerises par bonne réponse</li>
              <li>• Bonus +5 cerises par joueur "perfect"</li>
              <li>• Maximum 200 cerises par partie</li>
            </ul>
          </div>

          {questionsLoading ? (
            <div className="text-center text-primary">Chargement des questions...</div>
          ) : questionsError ? (
            <div className="bg-danger-light text-primary p-4 rounded-lg mb-4 border border-primary">
              {questionsError}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold heading-primary mb-4">
                  Choisir une question
                </h2>
                <div className="space-y-2">
                  {availableQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        handleStartGame(q.id);
                      }}
                      className="w-full btn-primary p-4 rounded-lg text-left hover-lift"
                    >
                      <div className="font-bold">{q.title}</div>
                      {q.season && (
                        <div className="text-sm opacity-90">{q.season}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => handleStartGame()}
                  className="btn-secondary font-bold px-8 py-4 rounded-lg text-xl hover-lift"
                >
                  Question Aléatoire
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Écran de jeu
  if (gameState === "playing" && question) {
    const currentPlayer = question.players[currentPlayerIndex];
    const isLastPlayer = currentPlayerIndex >= question.players.length - 1;

    return (
      <CarriereInfernaleGame
        player={currentPlayer}
        onValidate={handlePlayerValidate}
        onNext={() => setCurrentPlayerIndex((prev) => prev + 1)}
        totalCorrect={totalCorrect}
        isLastPlayer={isLastPlayer}
        timeRemaining={timeRemaining}
        onTimeUp={handleTimeUp}
        onTimeUpWithSelection={handleTimeUpWithSelection}
      />
    );
  }

  // Écran de résultats
  console.log("🔍 État actuel:", { gameState, hasGameResult: !!gameResult, hasQuestion: !!question });
  if (gameState === "completed" && gameResult) {
    console.log("✅ Affichage de l'écran de résultats");

    return (
      <div className={`min-h-screen bg-pattern flex items-center justify-center p-4 ${gameResult.isPerfectGlobal ? 'animate-pulse' : gameResult.cerises < 50 ? 'animate-shake' : ''}`}>
        <div className={`max-w-4xl w-full card-primary rounded-lg p-8 relative ${gameResult.isPerfectGlobal ? 'border-primary shadow-xl' : gameResult.cerises < 50 ? 'border-danger' : 'border-primary'}`}>
          {/* Effet visuel pour perfect global */}
          {gameResult.isPerfectGlobal && (
            <div className="absolute inset-0 bg-warning-light/30 rounded-lg pointer-events-none animate-pulse" />
          )}

          <h1 className="text-4xl font-bold heading-primary mb-6 text-center">
            🏆 Résultats
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-primary mb-2">
              {gameResult.score}
            </div>
            <div className="text-primary text-xl mb-2">
              {gameResult.correctCount} / {gameResult.totalPossible} bonnes réponses
            </div>
            {gameResult.incorrectCount > 0 && (
              <div className="text-danger text-lg mb-2">
                ❌ {gameResult.incorrectCount} erreur{gameResult.incorrectCount > 1 ? "s" : ""}
              </div>
            )}
            {gameResult.perfectCount > 0 && (
              <div className="text-warning text-lg mb-2">
                🔥 {gameResult.perfectCount} joueur{gameResult.perfectCount > 1 ? "s" : ""}{" "}
                perfect{gameResult.perfectCount > 1 ? "s" : ""} !
              </div>
            )}
            {gameResult.streakBonus > 0 && (
              <div className="text-secondary text-sm mb-2">
                Bonus streaks: +{gameResult.streakBonus} cerises
              </div>
            )}
            {gameResult.timeBonus > 0 && (
              <div className="text-success text-sm mb-2">
                Bonus temps: +{gameResult.timeBonus} cerises
              </div>
            )}
            <div className="text-success text-2xl font-bold mb-4">
              🍒 +{gameResult.cerises} cerises
            </div>
            <div className={`text-lg font-bold mb-4 ${gameResult.isPerfectGlobal ? 'text-warning' : gameResult.cerises < 50 ? 'text-danger' : 'text-primary'}`}>
              {getFinalMessage()}
            </div>
          </div>

          {/* Bouton pour afficher/masquer la revue */}
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowReview(!showReview)}
              className="btn-outline font-bold px-6 py-3 rounded-lg hover-lift"
            >
              {showReview ? "Masquer" : "Voir"} la revue des réponses
            </button>
          </div>

          {/* Revue des réponses */}
          {showReview && (
            <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold heading-primary mb-4">📋 Revue des réponses</h2>
              {gameResult.playerDetails.map((detail, index) => {
                const player = playersMap.get(detail.player_id);
                if (!player) return null;

                // Récupérer les clubs corrects et sélectionnés
                const correctClubIds = new Set(detail.correct_clubs);
                const selectedClubIds = new Set(detail.selected_clubs);
                const correctSelected = player.correct_clubs.filter((c) => selectedClubIds.has(c.id));
                const incorrectSelected = player.correct_clubs.filter((c) => !selectedClubIds.has(c.id));
                const wrongSelectedIds = detail.selected_clubs.filter((id) => !correctClubIds.has(id));
                
                // Récupérer les clubs incorrects depuis tous les clubs de la question
                const allClubsInQuestion = new Set<string>();
                question?.players.forEach((p) => {
                  p.correct_clubs.forEach((c) => allClubsInQuestion.add(c.id));
                });
                // Pour les clubs incorrects, on ne peut afficher que l'ID car ils ne sont pas dans les clubs corrects

                return (
                  <div
                    key={detail.player_id}
                    className={`card-accent rounded-lg p-4 border ${detail.is_perfect ? 'border-warning' : 'border-danger'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {player.photo_url && (
                        <img
                          src={player.photo_url}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-primary font-bold text-lg">{player.name}</h3>
                        {detail.is_perfect && (
                          <span className="text-warning text-sm">✅ Perfect</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Clubs corrects sélectionnés */}
                      {correctSelected.length > 0 && (
                        <div>
                          <div className="text-success text-sm font-semibold mb-1">
                            ✅ Clubs corrects sélectionnés ({correctSelected.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {correctSelected.map((club) => (
                              <div
                                key={club.id}
                                className="bg-success-light border border-success rounded px-2 py-1 text-primary text-sm flex items-center gap-1"
                              >
                                {club.logo_url && (
                                  <img src={club.logo_url} alt={club.name} className="w-4 h-4" />
                                )}
                                {club.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clubs corrects non sélectionnés */}
                      {incorrectSelected.length > 0 && (
                        <div>
                          <div className="text-warning text-sm font-semibold mb-1">
                            ⚠️ Clubs corrects non sélectionnés ({incorrectSelected.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {incorrectSelected.map((club) => (
                              <div
                                key={club.id}
                                className="bg-warning-light border border-warning rounded px-2 py-1 text-primary text-sm flex items-center gap-1"
                              >
                                {club.logo_url && (
                                  <img src={club.logo_url} alt={club.name} className="w-4 h-4" />
                                )}
                                {club.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clubs incorrects sélectionnés */}
                      {wrongSelectedIds.length > 0 && (
                        <div>
                          <div className="text-danger text-sm font-semibold mb-1">
                            ❌ Clubs incorrects sélectionnés ({wrongSelectedIds.length})
                          </div>
                          <div className="text-danger text-xs mb-2">
                            {wrongSelectedIds.length} erreur{wrongSelectedIds.length > 1 ? "s" : ""} = -{wrongSelectedIds.length * 5} cerises
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {wrongSelectedIds.map((clubId) => (
                              <div
                                key={clubId}
                                className="bg-danger-light border border-danger rounded px-2 py-1 text-primary text-sm"
                              >
                                Club ID: {clubId.substring(0, 8)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setGameState("selection");
                setGameResult(null);
                setQuestion(null);
                setShowReview(false);
              }}
              className="btn-secondary font-bold px-6 py-3 rounded-lg hover-lift"
            >
              Retour
            </button>
            <button
              onClick={() => {
                setShowReview(false);
                handleStartGame();
              }}
              className="btn-primary font-bold px-6 py-3 rounded-lg hover-lift"
            >
              Rejouer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  saveGrilleGameResult, 
  getGrilleLeaderboard, 
  startGrilleGame,
  getDefaultGrille,
  getGrilleAnswers,
  getPlayersForSuggestions,
  NATIONALITY_NAMES,
  NATIONALITY_FLAGS,
  LeaderboardEntry,
  GrilleConfig,
  GrilleAnswer
} from '../services/grille-croisee';

// Types pour la grille
type GridCell = {
  id: string;
  rowIndex: number;
  colIndex: number;
  rowLabel: string;
  colLabel: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean | null;
  isAnswered: boolean;
};

type GameState = {
  grid: GridCell[][];
  currentStreak: number;
  totalScore: number;
  timeLeft: number;
  gameStarted: boolean;
  gameOver: boolean;
  perfectScore: boolean;
  gameId?: string;
  startTime?: number;
  playerName?: string;
};

type GrilleGameState = {
  config?: GrilleConfig;
  answers: GrilleAnswer[];
  availablePlayers: Array<{id: string; name: string; nationality?: string}>;
  loading: boolean;
};

export function GrilleCroisee() {
  // États du jeu
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    currentStreak: 0,
    totalScore: 0,
    timeLeft: 120, // 2 minutes
    gameStarted: false,
    gameOver: false,
    perfectScore: false,
  });

  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [grilleState, setGrilleState] = useState<GrilleGameState>({
    config: undefined,
    answers: [],
    availablePlayers: [],
    loading: true,
  });
  
  // États pour la recherche directe dans les cases
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [cellInputValue, setCellInputValue] = useState('');
  const [cellSuggestions, setCellSuggestions] = useState<string[]>([]);
  const [showCellSuggestions, setShowCellSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Charger les données de la grille depuis la base de données
  const loadGrilleData = useCallback(async () => {
    try {
      setGrilleState(prev => ({ ...prev, loading: true }));
      
      // Charger la configuration par défaut
      const config = await getDefaultGrille();
      
      // Charger les réponses
      const answers = await getGrilleAnswers(config.id);
      
      // Charger les joueurs disponibles
      const players = await getPlayersForSuggestions();
      
      setGrilleState({
        config,
        answers,
        availablePlayers: players,
        loading: false,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données de grille:', error);
      setGrilleState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadGrilleData();
  }, [loadGrilleData]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCellSuggestions) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setShowCellSuggestions(false);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCellSuggestions) {
        setShowCellSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCellSuggestions]);

  // Initialiser la grille 3x3 avec les vraies données
  const initializeGrid = useCallback(() => {
    if (!grilleState.config || !grilleState.answers.length) {
      return [];
    }
    
    const grid: GridCell[][] = [];
    const { config, answers } = grilleState;
    
    // Limiter à 3 lignes et 3 colonnes maximum
    const maxRows = Math.min(3, config.row_labels.length);
    const maxCols = Math.min(3, config.col_labels.length);
    
    for (let row = 0; row < maxRows; row++) {
      const rowCells: GridCell[] = [];
      for (let col = 0; col < maxCols; col++) {
        const cellId = `${row}-${col}`;
        
        // Trouver la réponse correspondante
        const answerData = answers.find(a => a.row_index === row && a.col_index === col);
        
        rowCells.push({
          id: cellId,
          rowIndex: row,
          colIndex: col,
          rowLabel: getDisplayLabel(config.row_labels[row], config.row_type),
          colLabel: getDisplayLabel(config.col_labels[col], config.col_type),
          answer: answerData?.answer || '',
          userAnswer: '',
          isCorrect: null,
          isAnswered: false,
        });
      }
      grid.push(rowCells);
    }
    
    return grid;
  }, [grilleState]);

  // Helper pour afficher les labels avec drapeaux/noms complets
  const getDisplayLabel = (code: string, type: string): string => {
    if (type === 'nationality') {
      const flag = NATIONALITY_FLAGS[code] || '🏳️';
      const name = NATIONALITY_NAMES[code] || code;
      return `${flag} ${name}`;
    }
    return code;
  };

  // Charger le leaderboard
  const loadLeaderboard = useCallback(async () => {
    try {
      const leaderboardData = await getGrilleLeaderboard(10);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Erreur lors du chargement du leaderboard:', error);
    }
  }, []);

  // Charger le leaderboard au montage du composant
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Démarrer le jeu
  const startGame = async () => {
    if (!grilleState.config) {
      console.error('Configuration de grille non disponible');
      return;
    }
    
    try {
      // Créer une nouvelle partie en base de données
      const gameId = await startGrilleGame(grilleState.config.id, playerNameInput.trim() || undefined);
      
      setGameState(prev => ({
        ...prev,
        grid: initializeGrid(),
        gameStarted: true,
        gameOver: false,
        currentStreak: 0,
        totalScore: 0,
        timeLeft: showTimer ? 120 : 0,
        gameId,
        startTime: Date.now(),
        playerName: playerNameInput.trim() || 'Joueur anonyme',
      }));
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
      // Démarrer quand même le jeu localement
      setGameState(prev => ({
        ...prev,
        grid: initializeGrid(),
        gameStarted: true,
        gameOver: false,
        currentStreak: 0,
        totalScore: 0,
        timeLeft: showTimer ? 120 : 0,
        startTime: Date.now(),
        playerName: playerNameInput.trim() || 'Joueur anonyme',
      }));
    }
  };

  // Timer
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || !showTimer) return;
    
    if (gameState.timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeft: prev.timeLeft - 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameStarted, gameState.gameOver, gameState.timeLeft, showTimer]);

  // Fin du jeu
  const endGame = async () => {
    const correctAnswers = gameState.grid.flat().filter(cell => cell.isCorrect).length;
    const totalAnswers = gameState.grid.flat().filter(cell => cell.isAnswered).length;
    const isPerfect = correctAnswers === 9;
    const timeTaken = gameState.startTime ? Date.now() - gameState.startTime : undefined;
    
    // Sauvegarder le score en base de données
    if (gameState.gameId) {
      try {
        await saveGrilleGameResult(
          gameState.gameId,
          gameState.totalScore,
          correctAnswers,
          totalAnswers,
          timeTaken ? Math.round(timeTaken / 1000) : undefined
        );
        
        // Recharger le leaderboard après sauvegarde
        await loadLeaderboard();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du score:', error);
      }
    }
    
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      perfectScore: isPerfect,
    }));
  };

  // Gérer la sélection d'une case (ancienne méthode - gardée pour compatibilité)
  const handleCellClick = (row: number, col: number) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
    setSelectedCell({ row, col });
    setInputValue('');
    setSuggestions([]);
  };

  // Gérer l'édition directe d'une case
  const handleCellEdit = (row: number, col: number) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
    setEditingCell({ row, col });
    setCellInputValue('');
    setCellSuggestions([]);
    setShowCellSuggestions(false);
  };

  // Gérer la saisie dans une case
  const handleCellInputChange = (value: string) => {
    setCellInputValue(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.length >= 2) {
      const filtered = grilleState.availablePlayers.filter(player => 
        player.name.toLowerCase().includes(value.toLowerCase())
      ).map(player => player.name);
      setCellSuggestions(filtered.slice(0, 5));
      setShowCellSuggestions(true);
    } else {
      setCellSuggestions([]);
      setShowCellSuggestions(false);
    }
  };

  // Valider une réponse depuis une case
  const handleCellValidate = (row: number, col: number, answer: string) => {
    if (!answer.trim()) return;
    
    validateAnswer(row, col, answer.trim());
    setEditingCell(null);
    setCellInputValue('');
    setCellSuggestions([]);
    setShowCellSuggestions(false);
  };

  // Sélectionner une suggestion
  const handleSuggestionSelect = (suggestion: string) => {
    setCellInputValue(suggestion);
    setCellSuggestions([]);
    setShowCellSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Annuler l'édition d'une case
  const handleCellCancel = () => {
    setEditingCell(null);
    setCellInputValue('');
    setCellSuggestions([]);
    setShowCellSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Gérer la saisie
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Autocomplétion avec les vrais joueurs
    if (value.length >= 2) {
      const filtered = grilleState.availablePlayers.filter(player => 
        player.name.toLowerCase().includes(value.toLowerCase())
      ).map(player => player.name);
      setSuggestions(filtered.slice(0, 8));
    } else {
      setSuggestions([]);
    }
  };

  // Valider une réponse
  const validateAnswer = (row: number, col: number, answer: string) => {
    const cell = gameState.grid[row][col];
    const isCorrect = cell.answer.toLowerCase() === answer.toLowerCase();
    
    let newScore = gameState.totalScore;
    let newStreak = gameState.currentStreak;
    
    if (isCorrect) {
      newScore += 20; // +20 cerises pour bonne réponse
      newStreak += 1;
      
      // Bonus de streak
      if (newStreak === 2) newScore += 2;
      else if (newStreak === 3) newScore += 3;
      else if (newStreak === 5) newScore += 5;
      else if (newStreak === 9) newScore += 10; // Grille parfaite
      
      // Feedback sonore (à implémenter)
      if (newStreak === 3) console.log('🔥 Streak 3!');
      else if (newStreak === 5) console.log('🔔🔥 Streak 5!');
      else if (newStreak === 9) console.log('🎆 Grille parfaite!');
    } else {
      newScore = Math.max(0, newScore - 5); // -5 cerises, minimum 0
      newStreak = 0;
    }
    
    // Mettre à jour la grille
    const newGrid = [...gameState.grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      userAnswer: answer,
      isCorrect,
      isAnswered: true,
    };
    
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      totalScore: newScore,
      currentStreak: newStreak,
    }));
    
    setSelectedCell(null);
    setInputValue('');
    setSuggestions([]);
    
    // Vérifier si la grille est complète
    const answeredCells = newGrid.flat().filter(cell => cell.isAnswered).length;
    if (answeredCells === 9) {
      endGame();
    }
  };

  // Gérer les suggestions
  const handleSuggestionClick = (suggestion: string) => {
    if (selectedCell) {
      validateAnswer(selectedCell.row, selectedCell.col, suggestion);
    }
  };

  // Obtenir le message de fin
  const getEndMessage = () => {
    const correctAnswers = gameState.grid.flat().filter(cell => cell.isCorrect).length;
    
    if (correctAnswers <= 3) {
      return { text: 'Hors-jeu total !', emoji: '🥴', color: 'text-red-500' };
    } else if (correctAnswers <= 6) {
      return { text: 'Petit pont mais Ligue 2.', emoji: '😅', color: 'text-yellow-500' };
    } else {
      return { text: 'Ligue des Champions de la grille !', emoji: '🏆', color: 'text-yellow-400' };
    }
  };

  return (
    <div className="min-h-screen bg-soccer-pattern relative overflow-hidden">
      {/* Fond avec ballon stylisé */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-96 h-96 rounded-full bg-secondary/20 relative">
          {/* Cerises à la place des hexagones noirs */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl">🍒</div>
          <div className="absolute top-1/4 left-4 text-3xl">🍒</div>
          <div className="absolute top-1/4 right-4 text-3xl">🍒</div>
          <div className="absolute top-1/2 left-8 text-3xl">🍒</div>
          <div className="absolute top-1/2 right-8 text-3xl">🍒</div>
          <div className="absolute bottom-1/4 left-4 text-3xl">🍒</div>
          <div className="absolute bottom-1/4 right-4 text-3xl">🍒</div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl">🍒</div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 drop-shadow-lg">
            ⚡ Grille Croisée ⚡
          </h1>
          <p className="text-xl text-text/80 font-medium">Trouve les joueurs qui croisent clubs et nations !</p>
        </div>

        {/* Compteurs */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-4 py-2 shadow-lg">
            <span className="text-2xl animate-pulse-slow">🔥</span>
            <span className="text-xl font-bold text-white">
              Streak: {gameState.currentStreak}
            </span>
          </div>
          
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-4 py-2 shadow-lg">
            <span className="text-2xl animate-bounce-slow">🍒</span>
            <span className="text-xl font-bold text-white">
              Score: {gameState.totalScore}
            </span>
          </div>

          {/* Bouton Leaderboard */}
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="bg-secondary hover:bg-secondary-dark text-text font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 shadow-lg"
          >
            <span className="text-xl">🏆</span>
            Leaderboard
          </button>
        </div>

        {/* Timer */}
        {showTimer && gameState.gameStarted && !gameState.gameOver && (
          <div className="mb-6">
            <div className="bg-red-600 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-red-400 h-full transition-all duration-1000"
                style={{ width: `${(gameState.timeLeft / 120) * 100}%` }}
              />
            </div>
            <p className="text-center text-white mt-2">
              Temps restant: {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
        )}

        {/* Grille */}
        {gameState.gameStarted && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 shadow-2xl">
              {/* Labels des colonnes */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div></div>
                {grilleState.config?.col_labels.slice(0, 3).map((label, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-blue-600 text-white p-3 rounded-xl font-bold text-sm">
                      {getDisplayLabel(label, grilleState.config?.col_type || 'club')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grille 3x3 */}
              {gameState.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 gap-4 mb-4">
                  {/* Label de la ligne */}
                  <div className="flex items-center justify-center">
                    <div className="bg-green-600 text-white p-3 rounded-xl font-bold text-sm">
                      {getDisplayLabel(grilleState.config?.row_labels[rowIndex] || '', grilleState.config?.row_type || 'nationality')}
                    </div>
                  </div>
                  
                  {/* Cases de la ligne (limitées à 3) */}
                  {row.slice(0, 3).map((cell, colIndex) => (
                    <div key={cell.id} className="relative">
                      {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                        // Mode édition directe
                        <div className="aspect-square rounded-xl border-4 border-blue-400 bg-blue-50 p-2">
                          <input
                            type="text"
                            value={cellInputValue}
                            onChange={(e) => handleCellInputChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (selectedSuggestionIndex >= 0 && cellSuggestions[selectedSuggestionIndex]) {
                                  handleSuggestionSelect(cellSuggestions[selectedSuggestionIndex]);
                                } else if (cellInputValue.trim()) {
                                  handleCellValidate(rowIndex, colIndex, cellInputValue.trim());
                                }
                              } else if (e.key === 'Escape') {
                                handleCellCancel();
                              } else if (e.key === 'ArrowDown' && showCellSuggestions) {
                                e.preventDefault();
                                setSelectedSuggestionIndex(prev => 
                                  prev < cellSuggestions.length - 1 ? prev + 1 : 0
                                );
                              } else if (e.key === 'ArrowUp' && showCellSuggestions) {
                                e.preventDefault();
                                setSelectedSuggestionIndex(prev => 
                                  prev > 0 ? prev - 1 : cellSuggestions.length - 1
                                );
                              }
                            }}
                            onBlur={() => {
                              // Délai pour permettre le clic sur les suggestions
                              setTimeout(() => {
                                if (showCellSuggestions) {
                                  // Si les suggestions sont visibles, ne pas valider automatiquement
                                  return;
                                }
                                if (cellInputValue.trim()) {
                                  handleCellValidate(rowIndex, colIndex, cellInputValue.trim());
                                } else {
                                  handleCellCancel();
                                }
                              }, 150);
                            }}
                            className="w-full h-full text-center text-sm font-bold bg-transparent border-none outline-none text-gray-800"
                            placeholder="Nom du joueur..."
                            autoFocus
                          />
                          
                          {/* Suggestions dans la case */}
                          {showCellSuggestions && cellSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-20 max-h-32 overflow-y-auto">
                              {cellSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className={`p-2 cursor-pointer text-xs border-b border-gray-100 last:border-b-0 ${
                                    index === selectedSuggestionIndex 
                                      ? 'bg-blue-500 text-white' 
                                      : 'hover:bg-blue-100'
                                  }`}
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Empêche le onBlur de se déclencher
                                    handleSuggestionSelect(suggestion);
                                  }}
                                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Mode affichage normal
                        <div
                          className={`aspect-square rounded-xl border-4 cursor-pointer transition-all duration-300 flex items-center justify-center text-center p-2 ${
                            cell.isAnswered
                              ? cell.isCorrect
                                ? 'bg-green-500 border-green-400 text-white'
                                : 'bg-red-500 border-red-400 text-white'
                              : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                          }`}
                          onClick={() => handleCellEdit(rowIndex, colIndex)}
                        >
                          {cell.isAnswered ? (
                            <div>
                              <div className="font-bold text-sm">{cell.userAnswer}</div>
                              {cell.isCorrect ? (
                                <span className="text-lg">✅</span>
                              ) : (
                                <span className="text-lg">❌</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs opacity-70">Cliquez pour répondre</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
              <h3 className="text-white text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                🏆 Leaderboard
              </h3>
              
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        index === 0 ? 'bg-yellow-500/30 border-2 border-yellow-400' :
                        index === 1 ? 'bg-gray-400/30 border-2 border-gray-300' :
                        index === 2 ? 'bg-orange-600/30 border-2 border-orange-500' :
                        'bg-white/10 border border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-orange-400' :
                          'text-white'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div>
                          <div className="text-white font-bold">
                            {entry.player_name || 'Joueur anonyme'}
                          </div>
                          <div className="text-sm text-blue-200">
                            {entry.correct_answers}/{entry.total_answers} bonnes réponses
                            {entry.time_taken && ` • ${entry.time_taken}s`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {entry.final_score} 🍒
                        </div>
                        <div className="text-xs text-blue-200">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-blue-200">
                  <p>Aucun score enregistré pour le moment.</p>
                  <p className="text-sm mt-2">Soyez le premier à jouer !</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu de démarrage */}
        {!gameState.gameStarted && (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 text-center">
              <h3 className="text-white text-2xl font-bold mb-4">Prêt à jouer ?</h3>
              
              {grilleState.loading ? (
                <div className="text-blue-200 mb-6">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                  Chargement de la grille...
                </div>
              ) : grilleState.config ? (
                <div className="text-blue-200 mb-6">
                  <p>Trouve les joueurs qui correspondent aux intersections !</p>
                  <div className="mt-4 p-4 bg-blue-600/30 rounded-xl">
                    <h4 className="text-white font-bold mb-2">🎯 {grilleState.config.name}</h4>
                    <p className="text-sm">{grilleState.config.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-200 mb-6">
                  ❌ Erreur lors du chargement de la grille
                </p>
              )}
              
              {/* Saisie du nom du joueur */}
              <div className="mb-6">
                <label className="block text-white text-sm font-bold mb-2">
                  Votre nom (optionnel)
                </label>
                <input
                  type="text"
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="Entrez votre nom pour le leaderboard"
                  className="w-full p-3 rounded-xl text-center bg-white/30 border-2 border-white/50 text-white placeholder-white/70 focus:outline-none focus:border-blue-400"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center justify-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={showTimer}
                    onChange={(e) => setShowTimer(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Activer le timer (2 minutes)
                </label>
              </div>
              
              <button
                onClick={startGame}
                disabled={grilleState.loading || !grilleState.config}
                className={`w-full font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform ${
                  grilleState.loading || !grilleState.config
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
                } text-white`}
              >
                {grilleState.loading ? '⏳ Chargement...' : '🚀 Démarrer la Grille !'}
              </button>
            </div>
          </div>
        )}

        {/* Écran de fin */}
        {gameState.gameOver && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-8 text-center mb-6">
              {(() => {
                const endMessage = getEndMessage();
                return (
                  <>
                    <div className="text-6xl mb-4">{endMessage.emoji}</div>
                    <h3 className={`text-3xl font-bold mb-4 ${endMessage.color}`}>
                      {endMessage.text}
                    </h3>
                    <p className="text-white text-xl mb-6">
                      Score final: {gameState.totalScore} 🍒
                    </p>
                    {gameState.perfectScore && (
                      <p className="text-yellow-400 text-xl mb-6 animate-pulse">
                        🎆 Grille parfaite ! 🎆
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setGameState({
                          grid: [],
                          currentStreak: 0,
                          totalScore: 0,
                          timeLeft: 120,
                          gameStarted: false,
                          gameOver: false,
                          perfectScore: false,
                          gameId: undefined,
                          startTime: undefined,
                          playerName: undefined,
                        });
                        setSelectedCell(null);
                        setPlayerNameInput('');
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300"
                    >
                      🔄 Rejouer
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Récapitulatif des réponses */}
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
              <h4 className="text-2xl font-bold text-white mb-6">
                📋 Récapitulatif des réponses
              </h4>
              
              {/* Grille de récapitulatif */}
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                  {/* Labels des colonnes */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div></div>
                    {grilleState.config?.col_labels.slice(0, 3).map((label, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xs">
                          {getDisplayLabel(label, grilleState.config?.col_type || 'club')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Grille de récapitulatif 3x3 */}
                  {gameState.grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-4 gap-4 mb-3">
                      {/* Label de la ligne */}
                      <div className="flex items-center justify-center">
                        <div className="bg-green-600 text-white p-2 rounded-lg font-bold text-xs">
                          {getDisplayLabel(grilleState.config?.row_labels[rowIndex] || '', grilleState.config?.row_type || 'nationality')}
                        </div>
                      </div>
                      
                      {/* Cases de la ligne (limitées à 3) */}
                      {row.slice(0, 3).map((cell, colIndex) => (
                        <div
                          key={cell.id}
                          className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-center p-2 ${
                            cell.isCorrect
                              ? 'bg-green-500 border-green-400 text-white'
                              : 'bg-red-500 border-red-400 text-white'
                          }`}
                        >
                          <div className="font-bold text-xs mb-1">
                            {cell.isAnswered ? cell.userAnswer : '?'}
                          </div>
                          {cell.isCorrect ? (
                            <span className="text-sm">✅</span>
                          ) : (
                            <div className="text-xs">
                              <div className="text-red-200">❌</div>
                              <div className="text-yellow-200 font-semibold">
                                {cell.answer}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Légende */}
                <div className="mt-6 flex justify-center gap-8 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Bonne réponse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Mauvaise réponse (en jaune: la bonne)</span>
                  </div>
                </div>

                {/* Statistiques détaillées */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-white">
                  <div className="bg-green-600/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-300">
                      {gameState.grid.flat().filter(cell => cell.isCorrect).length}
                    </div>
                    <div className="text-sm">Bonnes réponses</div>
                  </div>
                  <div className="bg-red-600/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-red-300">
                      {gameState.grid.flat().filter(cell => cell.isAnswered && !cell.isCorrect).length}
                    </div>
                    <div className="text-sm">Mauvaises réponses</div>
                  </div>
                </div>

                {/* Message d'encouragement */}
                <div className="mt-6 p-4 bg-blue-600/30 rounded-xl">
                  <p className="text-white text-sm">
                    💡 <strong>Astuce :</strong> Les réponses en jaune sont les bonnes ! 
                    Étudie-les pour améliorer ton score la prochaine fois ! 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
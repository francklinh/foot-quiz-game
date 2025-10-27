import React from 'react';
import { Challenge, ChallengeResults } from '../services/challenges.service';

interface ChallengeResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  currentUserId: string;
}

export function ChallengeResultsModal({ isOpen, onClose, challenge, currentUserId }: ChallengeResultsModalProps) {
  if (!isOpen || !challenge || !challenge.results) return null;

  const results = challenge.results;
  const isChallenger = challenge.challenger_id === currentUserId;
  const opponent = isChallenger ? challenge.challenged : challenge.challenger;
  const opponentName = opponent?.pseudo || 'Joueur inconnu';

  const userScore = isChallenger ? results.challenger_score : results.challenged_score;
  const opponentScore = isChallenger ? results.challenged_score : results.challenger_score;
  const userTime = isChallenger ? results.challenger_time : results.challenged_time;
  const opponentTime = isChallenger ? results.challenged_time : results.challenger_time;
  const isWinner = results.winner_id === currentUserId;

  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'TOP10': return '🏆';
      case 'GRILLE': return '🔢';
      case 'CLUB': return '⚽';
      default: return '🎮';
    }
  };

  const getGameName = (gameType: string) => {
    switch (gameType) {
      case 'TOP10': return 'Top 10';
      case 'GRILLE': return 'Grille Croisée';
      case 'CLUB': return 'Club Express';
      default: return gameType;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">🏆 Résultats du Défi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Informations du défi */}
          <div className="text-center">
            <div className="text-4xl mb-2">{getGameIcon(challenge.game_type)}</div>
            <h3 className="text-xl font-bold text-primary">{getGameName(challenge.game_type)}</h3>
            <p className="text-gray-600">Défi contre {opponentName}</p>
          </div>

          {/* Résultats */}
          <div className="bg-accent-light rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Votre score */}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">Vous</div>
                <div className="text-3xl font-black text-primary">{userScore}</div>
                <div className="text-sm text-gray-600">points</div>
                {challenge.game_type !== 'CLUB' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Temps: {formatTime(userTime)}
                  </div>
                )}
              </div>

              {/* Score adversaire */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 mb-1">{opponentName}</div>
                <div className="text-3xl font-black text-gray-600">{opponentScore}</div>
                <div className="text-sm text-gray-600">points</div>
                {challenge.game_type !== 'CLUB' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Temps: {formatTime(opponentTime)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Résultat final */}
          <div className={`text-center p-4 rounded-lg ${
            isWinner ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'
          }`}>
            <div className="text-4xl mb-2">
              {isWinner ? '🎉' : '😔'}
            </div>
            <div className={`text-2xl font-bold ${
              isWinner ? 'text-green-600' : 'text-red-600'
            }`}>
              {isWinner ? 'Victoire !' : 'Défaite'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {isWinner 
                ? 'Félicitations ! Vous avez remporté ce défi !' 
                : 'Bonne chance pour le prochain défi !'
              }
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white border border-accent-light rounded-lg p-3">
              <div className="font-semibold text-primary mb-1">Différence de score</div>
              <div className="text-lg font-bold">
                {Math.abs(userScore - opponentScore)} points
              </div>
            </div>
            <div className="bg-white border border-accent-light rounded-lg p-3">
              <div className="font-semibold text-primary mb-1">Performance</div>
              <div className="text-lg font-bold">
                {userScore > opponentScore ? 'Supérieure' : 'Inférieure'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                // TODO: Navigate to create new challenge
                alert('Créer un nouveau défi');
              }}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Nouveau défi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





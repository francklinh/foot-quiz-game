import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiplayerChallenge } from '../services/multiplayer-challenges.service';

interface ChallengeCardProps {
  challenge: MultiplayerChallenge;
  currentUserId: string;
  onPlay?: (challengeId: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  currentUserId,
  onPlay 
}) => {
  const navigate = useNavigate();

  // Informations sur le participant actuel
  const currentUserParticipant = challenge.participants?.find(p => p.user_id === currentUserId);
  const isCreator = challenge.creator_id === currentUserId;

  // Statistiques
  const totalParticipants = challenge.participants?.length || 0;
  const completedCount = challenge.participants?.filter(p => p.status === 'completed').length || 0;
  const pendingCount = challenge.participants?.filter(p => p.status === 'pending').length || 0;
  
  // Gagnant actuel
  const winner = challenge.participants?.find(p => p.rank === 1);

  // Labels
  const getGameTypeLabel = (gameType: string): string => {
    const labels: Record<string, string> = {
      TOP10: 'Top 10',
      GRILLE: 'Grille Croisée',
      CLUB: 'Club Express',
      COMING_SOON: 'Prochainement'
    };
    return labels[gameType] || gameType;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminé',
      expired: 'Expiré',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      expired: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getGameTypeIcon = (gameType: string): string => {
    const icons: Record<string, string> = {
      TOP10: '🏆',
      GRILLE: '📊',
      CLUB: '⚽',
      COMING_SOON: '🚀'
    };
    return icons[gameType] || '🎮';
  };

  const handleViewResults = () => {
    navigate(`/challenge/${challenge.id}`);
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay(challenge.id);
    } else {
      // Navigation par défaut vers le jeu approprié avec les infos du défi
      const gameRoutes: Record<string, string> = {
        TOP10: '/top10'
        // GRILLE et CLUB seront développés plus tard
      };
      const route = gameRoutes[challenge.game_type];
      if (route) {
        navigate(route, { 
          state: { 
            challengeId: challenge.id,
            questionId: challenge.question_id,
            isChallengeMode: true
          } 
        });
      }
    }
  };

  // Temps restant
  const getTimeRemaining = (): string => {
    const now = new Date();
    const expires = new Date(challenge.expires_at);
    const diff = expires.getTime() - now.getTime();
    
    if (diff < 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}j restant${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours}h restant${hours > 1 ? 's' : ''}`;
    return 'Bientôt expiré';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getGameTypeIcon(challenge.game_type)}</span>
            <div>
              <h3 className="font-bold text-lg">{getGameTypeLabel(challenge.game_type)}</h3>
              <p className="text-xs text-indigo-100">
                Créé par {isCreator ? 'vous' : challenge.creator?.pseudo}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(challenge.status)}`}>
            {getStatusLabel(challenge.status)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Progression */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progression</span>
            <span className="text-sm font-semibold text-gray-900">
              {completedCount}/{totalParticipants}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${totalParticipants > 0 ? (completedCount / totalParticipants) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Votre statut */}
        {currentUserParticipant && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">Votre statut</span>
              <div className="flex items-center space-x-2">
                {currentUserParticipant.status === 'completed' ? (
                  <>
                    <span className="text-sm text-indigo-700">
                      {currentUserParticipant.score} pts
                    </span>
                    {currentUserParticipant.rank && (
                      <span className="text-lg">
                        {currentUserParticipant.rank === 1 ? '🥇' : 
                         currentUserParticipant.rank === 2 ? '🥈' : 
                         currentUserParticipant.rank === 3 ? '🥉' : 
                         `#${currentUserParticipant.rank}`}
                      </span>
                    )}
                  </>
                ) : currentUserParticipant.status === 'active' ? (
                  <span className="text-sm text-blue-700 flex items-center">
                    <span className="animate-pulse mr-1">🎮</span> En cours...
                  </span>
                ) : (
                  <span className="text-sm text-yellow-700">⏳ À votre tour</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gagnant (si terminé) */}
        {challenge.status === 'completed' && winner && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🏆</span>
                <span className="text-sm font-medium text-gray-900">
                  {winner.user_id === currentUserId ? 'Vous avez gagné !' : `${winner.user?.pseudo} a gagné`}
                </span>
              </div>
              <span className="text-sm font-bold text-yellow-800">
                {winner.score} pts
              </span>
            </div>
          </div>
        )}

        {/* Informations */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-gray-500">Participants</span>
            <div className="font-semibold text-gray-900">{totalParticipants} joueurs</div>
          </div>
          <div>
            <span className="text-gray-500">Temps restant</span>
            <div className="font-semibold text-gray-900">{getTimeRemaining()}</div>
          </div>
        </div>

        {/* Participants en attente */}
        {pendingCount > 0 && challenge.status !== 'completed' && (
          <div className="text-xs text-gray-500 mb-4">
            <span className="inline-flex items-center">
              <span className="mr-1">⏳</span>
              {pendingCount} joueur{pendingCount > 1 ? 's' : ''} en attente
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {currentUserParticipant?.status === 'pending' && challenge.status !== 'expired' && challenge.status !== 'cancelled' && (
            <button
              onClick={handlePlay}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md text-sm"
            >
              🎮 Jouer
            </button>
          )}
          
          {(challenge.status === 'completed' || completedCount > 0) && (
            <button
              onClick={handleViewResults}
              className={`${currentUserParticipant?.status === 'pending' ? 'flex-1' : 'w-full'} bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition text-sm`}
            >
              📊 Voir les résultats
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MultiplayerChallengesService, 
  MultiplayerChallenge, 
  ChallengeParticipant 
} from '../services/multiplayer-challenges.service';
import { supabase } from '../lib/supabase';

const challengesService = new MultiplayerChallengesService();

const ChallengeResults: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState<MultiplayerChallenge | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [challengeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'utilisateur actuel
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setCurrentUserId(session.user.id);

      // Récupérer le défi
      if (!challengeId) {
        throw new Error('Challenge ID missing');
      }

      const challengeData = await challengesService.getChallengeById(challengeId);
      setChallenge(challengeData);
    } catch (err: any) {
      console.error('Failed to load challenge:', err);
      setError(err.message || 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

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
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRankEmoji = (rank: number | null): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handlePlayAgain = () => {
    if (challenge?.game_type) {
      const gameRoutes: Record<string, string> = {
        TOP10: '/top10'
        // GRILLE et CLUB seront développés plus tard
      };
      navigate(gameRoutes[challenge.game_type] || '/');
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Défi introuvable'}</p>
          <button
            onClick={handleBackHome}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const completedParticipants = challenge.participants?.filter(p => p.status === 'completed') || [];
  const pendingParticipants = challenge.participants?.filter(p => p.status === 'pending') || [];
  const activeParticipants = challenge.participants?.filter(p => p.status === 'active') || [];
  const currentUserParticipant = challenge.participants?.find(p => p.user_id === currentUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              🏆 Résultats du Défi
            </h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(challenge.status)}`}>
              {getStatusLabel(challenge.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Jeu:</span>
              <span className="ml-2 font-semibold">{getGameTypeLabel(challenge.game_type)}</span>
            </div>
            <div>
              <span className="text-gray-500">Créé par:</span>
              <span className="ml-2 font-semibold">{challenge.creator?.pseudo}</span>
            </div>
            <div>
              <span className="text-gray-500">Participants:</span>
              <span className="ml-2 font-semibold">
                {completedParticipants.length}/{challenge.participants?.length}
              </span>
            </div>
          </div>

          {challenge.status === 'completed' && challenge.completed_at && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm">Terminé le:</span>
              <span className="ml-2 text-sm font-semibold">{formatDate(challenge.completed_at)}</span>
            </div>
          )}
        </div>

        {/* Classement */}
        {completedParticipants.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏁 Classement</h2>
            
            <div className="space-y-3">
              {completedParticipants
                .sort((a, b) => {
                  if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
                  if (a.score !== b.score) return (b.score || 0) - (a.score || 0);
                  return (a.time_taken || Infinity) - (b.time_taken || Infinity);
                })
                .map((participant, index) => {
                  const isCurrentUser = participant.user_id === currentUserId;
                  const isWinner = participant.rank === 1;
                  
                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition ${
                        isWinner
                          ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400'
                          : isCurrentUser
                          ? 'bg-indigo-50 border-2 border-indigo-300'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-2xl font-bold w-16 text-center">
                          {getRankEmoji(participant.rank || index + 1)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${isWinner ? 'text-lg' : ''}`}>
                              {participant.user?.pseudo || 'Joueur inconnu'}
                            </span>
                            {isCurrentUser && (
                              <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                                Vous
                              </span>
                            )}
                            {isWinner && (
                              <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                                Gagnant !
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {participant.score || 0}
                          </div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-semibold text-gray-700">
                            {formatTime(participant.time_taken)}
                          </div>
                          <div className="text-xs text-gray-500">temps</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Participants en attente */}
        {(pendingParticipants.length > 0 || activeParticipants.length > 0) && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⏳ En attente</h2>
            <div className="space-y-2">
              {[...activeParticipants, ...pendingParticipants].map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {participant.status === 'active' ? '🎮' : '⏳'}
                    </span>
                    <span className="font-medium">
                      {participant.user?.pseudo || 'Joueur inconnu'}
                    </span>
                    {participant.user_id === currentUserId && (
                      <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                        Vous
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {participant.status === 'active' ? 'En cours...' : 'Pas encore joué'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {currentUserParticipant?.status === 'pending' && challenge.status !== 'completed' && (
            <button
              onClick={handlePlayAgain}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
            >
              🎮 Jouer maintenant
            </button>
          )}
          
          <button
            onClick={handlePlayAgain}
            className="flex-1 bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            🔄 Rejouer
          </button>
          
          <button
            onClick={handleBackHome}
            className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            🏠 Accueil
          </button>
        </div>

        {/* Statistiques supplémentaires */}
        {challenge.status === 'completed' && completedParticipants.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Statistiques</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {Math.max(...completedParticipants.map(p => p.score || 0))}
                </div>
                <div className="text-sm text-gray-500">Meilleur score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {Math.round(
                    completedParticipants.reduce((sum, p) => sum + (p.score || 0), 0) /
                    completedParticipants.length
                  )}
                </div>
                <div className="text-sm text-gray-500">Score moyen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {formatTime(Math.min(...completedParticipants.map(p => p.time_taken || Infinity)))}
                </div>
                <div className="text-sm text-gray-500">Meilleur temps</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {completedParticipants.length}
                </div>
                <div className="text-sm text-gray-500">Participants</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeResults;





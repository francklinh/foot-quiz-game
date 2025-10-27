import React, { useState, useEffect } from 'react';
import { ChallengesService, Challenge } from '../services/challenges.service';

interface ActiveChallengesListProps {
  userId: string;
  onChallengeAccepted?: (challengeId: string) => void;
  onChallengeRejected?: (challengeId: string) => void;
}

export function ActiveChallengesList({ userId, onChallengeAccepted, onChallengeRejected }: ActiveChallengesListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const challengesService = new ChallengesService();

  useEffect(() => {
    if (userId) {
      loadActiveChallenges();
    }
  }, [userId]);

  const loadActiveChallenges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const activeChallenges = await challengesService.getActiveChallenges(userId);
      setChallenges(activeChallenges);
    } catch (err) {
      setError('Failed to load active challenges.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await challengesService.acceptChallenge(challengeId);
      alert('Défi accepté ! 🎉');
      loadActiveChallenges();
      onChallengeAccepted?.(challengeId);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
      console.error(err);
    }
  };

  const handleRejectChallenge = async (challengeId: string) => {
    try {
      await challengesService.rejectChallenge(challengeId);
      alert('Défi rejeté.');
      loadActiveChallenges();
      onChallengeRejected?.(challengeId);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
      console.error(err);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-400';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800 border-gray-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Défis Actifs</h3>
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Défis Actifs</h3>
        <div className="text-center text-red-500">{error}</div>
        <button
          onClick={loadActiveChallenges}
          className="mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Défis Actifs</h3>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚔️</div>
          <p>Aucun défi actif</p>
          <p className="text-sm text-gray-400 mt-1">Créez un défi ou attendez qu'on vous en propose un !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4">Défis Actifs ({challenges.length})</h3>
      
      <div className="space-y-4">
        {challenges.map(challenge => {
          const isChallenger = challenge.challenger_id === userId;
          const opponent = isChallenger ? challenge.challenged : challenge.challenger;
          const opponentName = opponent?.pseudo || 'Joueur inconnu';

          return (
            <div key={challenge.id} className="border border-accent-light rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getGameIcon(challenge.game_type)}</div>
                  <div>
                    <h4 className="font-bold text-primary">
                      {isChallenger ? `Défi envoyé à ${opponentName}` : `Défi de ${opponentName}`}
                    </h4>
                    <p className="text-sm text-gray-600">{getGameName(challenge.game_type)}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                  {challenge.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <p>Créé le: {formatDate(challenge.created_at)}</p>
                <p>Expire le: {formatDate(challenge.expires_at)}</p>
              </div>

              {challenge.status === 'PENDING' && !isChallenger && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptChallenge(challenge.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleRejectChallenge(challenge.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Rejeter
                  </button>
                </div>
              )}

              {challenge.status === 'ACCEPTED' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // TODO: Navigate to game with challenge context
                      alert(`Lancer le jeu ${getGameName(challenge.game_type)} pour le défi`);
                    }}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Jouer le défi
                  </button>
                </div>
              )}

              {challenge.status === 'COMPLETED' && challenge.results && (
                <div className="mt-3 p-3 bg-accent-light rounded-lg">
                  <p className="font-semibold text-primary mb-2">Résultats:</p>
                  <div className="text-sm text-gray-700">
                    <p>Votre score: <span className="font-bold">{challenge.results.challenger_score}</span></p>
                    <p>Score adversaire: <span className="font-bold">{challenge.results.challenged_score}</span></p>
                    <p className={`font-bold ${challenge.results.winner_id === userId ? 'text-green-600' : 'text-red-600'}`}>
                      {challenge.results.winner_id === userId ? '🎉 Vous avez gagné !' : '😔 Vous avez perdu.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}





import React, { useState } from 'react';
import { ChallengesService, Challenge } from '../services/challenges.service';

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId: string;
  onChallengeUpdate?: (challenge: Challenge) => void;
  className?: string;
}

export function ChallengeCard({ 
  challenge, 
  currentUserId, 
  onChallengeUpdate,
  className = '' 
}: ChallengeCardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const challengesService = new ChallengesService();

  const isChallenger = challenge.challenger_id === currentUserId;
  const isChallenged = challenge.challenged_id === currentUserId;
  const opponent = isChallenger ? challenge.challenged : challenge.challenger;

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedChallenge = await challengesService.acceptChallenge(challenge.id);
      onChallengeUpdate?.(updatedChallenge);
    } catch (err) {
      setError('Failed to accept challenge');
      console.error('Failed to accept challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedChallenge = await challengesService.rejectChallenge(challenge.id);
      onChallengeUpdate?.(updatedChallenge);
    } catch (err) {
      setError('Failed to reject challenge');
      console.error('Failed to reject challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      case 'EXPIRED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'ACCEPTED': return 'Accepté';
      case 'REJECTED': return 'Rejeté';
      case 'COMPLETED': return 'Terminé';
      case 'EXPIRED': return 'Expiré';
      default: return status;
    }
  };

  const getGameTypeText = (gameType: string) => {
    switch (gameType) {
      case 'TOP10': return 'Top 10';
      case 'GRILLE': return 'Grille Croisée';
      case 'CLUB': return 'Club Express';
      default: return gameType;
    }
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border border-accent-light ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {opponent?.pseudo?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-semibold text-primary">{opponent?.pseudo || 'Unknown'}</div>
            <div className="text-sm text-gray-500">{getGameTypeText(challenge.game_type)}</div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
          {getStatusText(challenge.status)}
        </div>
      </div>

      {challenge.results && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Résultats</div>
          <div className="flex justify-between text-sm">
            <span>Vous: {challenge.results.challenger_score}</span>
            <span>Adversaire: {challenge.results.challenged_score}</span>
          </div>
          {challenge.results.winner_id === currentUserId && (
            <div className="text-green-600 font-medium text-sm mt-1">🏆 Vous avez gagné !</div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mb-3">
        Créé le {new Date(challenge.created_at).toLocaleDateString()}
        {challenge.expires_at && (
          <span> • Expire le {new Date(challenge.expires_at).toLocaleDateString()}</span>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-3">{error}</div>
      )}

      {challenge.status === 'PENDING' && isChallenged && (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Accepting...' : 'Accepter'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Rejecting...' : 'Rejeter'}
          </button>
        </div>
      )}

      {challenge.status === 'ACCEPTED' && (
        <div className="text-center text-blue-600 font-medium">
          Challenge accepté - Prêt à jouer !
        </div>
      )}
    </div>
  );
}

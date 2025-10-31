import React, { useEffect, useState } from 'react';
import { MultiplayerChallengesService, MultiplayerChallenge } from '../services/multiplayer-challenges.service';
import { ChallengeCard } from './ChallengeCard';
import { supabase } from '../lib/supabase';

interface ChallengesListProps {
  filter?: 'active' | 'completed' | 'all';
  limit?: number;
  title?: string;
  emptyMessage?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const challengesService = new MultiplayerChallengesService();

export const ChallengesList: React.FC<ChallengesListProps> = ({ 
  filter = 'all',
  limit,
  title,
  emptyMessage,
  showViewAll = false,
  onViewAll
}) => {
  const [challenges, setChallenges] = useState<MultiplayerChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, [filter, limit]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'utilisateur actuel
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Non authentifié');
        return;
      }
      setCurrentUserId(session.user.id);

      // Déterminer les filtres
      let statusFilter: ('pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled')[] | undefined = undefined;
      if (filter === 'active') {
        statusFilter = ['pending', 'in_progress'];
      } else if (filter === 'completed') {
        statusFilter = ['completed'];
      }

      // Récupérer les défis
      const data = await challengesService.getUserChallenges(session.user.id, {
        status: statusFilter,
        limit
      });

      // Dédupliquer les défis (au cas où il y aurait des doublons)
      const uniqueChallenges = Array.from(
        new Map(data.map(ch => [ch.id, ch])).values()
      );

      // Filtrer pour ne garder que les défis où l'utilisateur peut encore jouer ou a joué
      let filteredChallenges = uniqueChallenges;
      
      if (filter === 'active') {
        // Défis actifs = défis où l'utilisateur n'a pas encore joué
        filteredChallenges = uniqueChallenges.filter(challenge => {
          const userParticipant = challenge.participants?.find(p => p.user_id === session.user.id);
          return userParticipant?.status === 'pending' || userParticipant?.status === 'active';
        });
      }

      setChallenges(filteredChallenges);
    } catch (err: any) {
      console.error('Failed to load challenges:', err);
      setError(err.message || 'Impossible de charger les défis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Chargement des défis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-gray-600">
          {emptyMessage || 'Aucun défi pour le moment'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showViewAll && onViewAll && challenges.length > 0 && (
            <button
              onClick={onViewAll}
              className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
            >
              Voir tout →
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            currentUserId={currentUserId || ''}
          />
        ))}
      </div>
    </div>
  );
};

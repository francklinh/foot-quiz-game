import React from 'react';
import { LeaderboardEntry } from '../services/stats.service';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  currentUserId?: string;
}

export function LeaderboardTable({ entries, loading = false, currentUserId }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Classement Global</h3>
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Classement Global</h3>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>Aucun joueur dans le classement</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 border-yellow-300';
      case 2: return 'bg-gray-100 border-gray-300';
      case 3: return 'bg-orange-100 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4">Classement Global</h3>
      
      <div className="space-y-2">
        {entries.map(entry => (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${
              getRankColor(entry.rank)
            } ${
              currentUserId === entry.userId ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-primary">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex items-center gap-3">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.pseudo}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {entry.pseudo.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div>
                  <div className="font-bold text-primary">
                    {entry.pseudo}
                    {currentUserId === entry.userId && (
                      <span className="ml-2 text-sm text-primary">(Vous)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.gamesPlayed} partie{entry.gamesPlayed > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {entry.totalScore.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(entry.winRate)}% victoires
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





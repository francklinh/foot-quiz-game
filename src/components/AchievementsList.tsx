import React from 'react';
import { Achievement } from '../services/stats.service';

interface AchievementsListProps {
  achievements: Achievement[];
  loading?: boolean;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'COMMON': return 'border-gray-300 bg-gray-50';
    case 'RARE': return 'border-blue-300 bg-blue-50';
    case 'EPIC': return 'border-purple-300 bg-purple-50';
    case 'LEGENDARY': return 'border-yellow-300 bg-yellow-50';
    default: return 'border-gray-300 bg-gray-50';
  }
};

const getRarityTextColor = (rarity: string) => {
  switch (rarity) {
    case 'COMMON': return 'text-gray-600';
    case 'RARE': return 'text-blue-600';
    case 'EPIC': return 'text-purple-600';
    case 'LEGENDARY': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export function AchievementsList({ achievements, loading = false }: AchievementsListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Succès</h3>
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Succès</h3>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>Aucun succès débloqué</p>
          <p className="text-sm text-gray-400 mt-1">Jouez pour débloquer des succès !</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4">Succès ({achievements.length})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`border-2 rounded-lg p-4 ${getRarityColor(achievement.rarity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-primary">{achievement.name}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRarityTextColor(achievement.rarity)} bg-white`}>
                    {achievement.rarity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <div className="text-xs text-gray-500">
                  Débloqué le {formatDate(achievement.unlockedAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





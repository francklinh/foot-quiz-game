import React from 'react';
import { GameStats } from '../services/stats.service';

interface GameStatsChartProps {
  gameStats: GameStats[];
  loading?: boolean;
}

export function GameStatsChart({ gameStats, loading = false }: GameStatsChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Statistiques par Jeu</h3>
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (gameStats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Statistiques par Jeu</h3>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>Aucune statistique disponible</p>
        </div>
      </div>
    );
  }

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4">Statistiques par Jeu</h3>
      
      <div className="space-y-4">
        {gameStats.map((stat, index) => (
          <div key={stat.gameType} className="border border-accent-light rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{getGameIcon(stat.gameType)}</div>
              <div>
                <h4 className="font-bold text-primary">{getGameName(stat.gameType)}</h4>
                <div className="text-sm text-gray-500">
                  {stat.totalPlayed} partie{stat.totalPlayed > 1 ? 's' : ''} jouée{stat.totalPlayed > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.totalScore}</div>
                <div className="text-xs text-gray-500">Score total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(stat.averageScore)}</div>
                <div className="text-xs text-gray-500">Moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.bestScore}</div>
                <div className="text-xs text-gray-500">Meilleur</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(stat.winRate)}%</div>
                <div className="text-xs text-gray-500">Victoires</div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-accent-light">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Temps total: {formatTime(stat.totalTime)}</span>
                <span>Temps moyen: {formatTime(stat.averageTime)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





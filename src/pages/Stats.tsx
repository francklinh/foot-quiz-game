import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StatsService, UserStats, LeaderboardEntry } from '../services/stats.service';
import { StatsCard } from '../components/StatsCard';
import { GameStatsChart } from '../components/GameStatsChart';
import { AchievementsList } from '../components/AchievementsList';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { FloatingBall } from '../components/FloatingBall';

export function Stats() {
  // Services
  const statsService = new StatsService();

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // Stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'achievements' | 'leaderboard'>('overview');

  // Load user authentication
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load stats data
  useEffect(() => {
    if (userId) {
      loadStatsData();
      loadLeaderboard();
    }
  }, [userId]);

  const loadStatsData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const stats = await statsService.getUserStats(userId);
      setUserStats(stats);
    } catch (err) {
      setError('Failed to load user statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await statsService.getGlobalLeaderboard(10);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-2xl font-bold text-primary">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl font-bold text-red-500">{error}</div>
          <button
            onClick={loadStatsData}
            className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-2xl font-bold text-primary">Aucune statistique disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-black mb-2">📊 Mes Statistiques</h1>
            <p className="text-xl opacity-90">Découvrez vos performances et votre progression !</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex border-b border-accent-light mb-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'games', label: 'Par Jeu', icon: '🎮' },
            { id: 'achievements', label: 'Succès', icon: '🏆' },
            { id: 'leaderboard', label: 'Classement', icon: '🥇' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`py-3 px-6 text-lg font-medium ${
                activeTab === tab.id 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Cerises Total"
                value={userStats.totalCerises.toLocaleString()}
                icon="🍒"
                color="primary"
                subtitle="Monnaie virtuelle"
              />
              <StatsCard
                title="Parties Jouées"
                value={userStats.totalGamesPlayed}
                icon="🎮"
                color="secondary"
                subtitle="Tous jeux confondus"
              />
              <StatsCard
                title="Score Total"
                value={userStats.totalScore.toLocaleString()}
                icon="🏆"
                color="accent"
                subtitle={`Moyenne: ${Math.round(userStats.averageScore)}`}
              />
              <StatsCard
                title="Taux de Victoire"
                value={`${Math.round(userStats.winRate)}%`}
                icon="⚡"
                color="success"
                subtitle={`${userStats.challengesWon} victoires`}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                title="Amis"
                value={userStats.friendsCount}
                icon="👥"
                color="accent"
                subtitle="Réseau social"
              />
              <StatsCard
                title="Défis Envoyés"
                value={userStats.challengesSent}
                icon="⚔️"
                color="warning"
                subtitle="Défis lancés"
              />
              <StatsCard
                title="Achats Boutique"
                value={userStats.shopPurchases}
                icon="🛍️"
                color="danger"
                subtitle={`${userStats.totalSpent} cerises dépensées`}
              />
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Progression Hebdomadaire</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Parties jouées:</span>
                    <span className="font-bold text-primary">{userStats.weeklyProgress.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold text-primary">{userStats.weeklyProgress.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cerises gagnées:</span>
                    <span className="font-bold text-primary">{userStats.weeklyProgress.cerisesEarned}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Progression Mensuelle</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Parties jouées:</span>
                    <span className="font-bold text-primary">{userStats.monthlyProgress.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold text-primary">{userStats.monthlyProgress.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cerises gagnées:</span>
                    <span className="font-bold text-primary">{userStats.monthlyProgress.cerisesEarned}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <GameStatsChart
            gameStats={userStats ? [] : []} // TODO: Add game stats to UserStats interface
            loading={false}
          />
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <AchievementsList
            achievements={userStats.achievements}
            loading={false}
          />
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <LeaderboardTable
            entries={leaderboard}
            loading={false}
            currentUserId={userId || undefined}
          />
        )}
      </div>

      <FloatingBall />
    </div>
  );
}

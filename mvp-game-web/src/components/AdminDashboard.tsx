// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { AdminGamesScreen } from './AdminGamesScreen';
import { AdminPlayersScreen } from './AdminPlayersScreen';
import { AdminQuestionsScreen } from './AdminQuestionsScreen';
import { SupabaseConnectionTest } from './SupabaseConnectionTest';
import { AdminFetchTest } from './AdminFetchTest';
import { CorsTest } from './CorsTest';
import { SimpleSupabaseTest } from './SimpleSupabaseTest';
import { SimpleConnectionTest } from './SimpleConnectionTest';
import { SupabaseSimpleTest } from './SupabaseSimpleTest';
import { supabaseLocalService } from '../services/supabase-local.service';

interface AdminDashboardProps {
  className?: string;
}

interface DashboardStats {
  totalGames: number;
  totalPlayers: number;
  totalQuestions: number;
  activeQuestions: number;
}

type ActiveTab = 'games' | 'players' | 'questions';

export function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('games');
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    totalPlayers: 0,
    totalQuestions: 0,
    activeQuestions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utilisation du service local Supabase

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await supabaseLocalService.getStats();
      setStats(stats);
    } catch (err: any) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleQuickAction = (action: ActiveTab) => {
    setActiveTab(action);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'games':
        return <AdminGamesScreen className="mt-6" />;
      case 'players':
        return <AdminPlayersScreen className="mt-6" />;
      case 'questions':
        return <AdminQuestionsScreen className="mt-6" />;
      default:
        return <AdminGamesScreen className="mt-6" />;
    }
  };

  const renderStatCard = (title: string, value: number | string, icon: string, color: string) => {
    if (loading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-lg font-semibold text-gray-900">Chargement...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-lg font-semibold text-red-600">Erreur</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Tableau de Bord Admin</h1>
        <p className="text-text-secondary">Gérez tous les aspects de votre application CLAFOOTIX</p>
      </div>

      {/* Statistics Cards */}
      {/* Tests de Connexion Supabase */}
      <div className="mb-8 space-y-4">
        <SimpleSupabaseTest />
        <SimpleConnectionTest />
        <SupabaseSimpleTest />
        <SupabaseConnectionTest />
        <AdminFetchTest />
        <CorsTest />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatCard('Total Jeux', stats.totalGames, '🎮', 'bg-blue-100')}
          {renderStatCard('Total Joueurs', stats.totalPlayers, '👥', 'bg-green-100')}
          {renderStatCard('Total Questions', stats.totalQuestions, '❓', 'bg-yellow-100')}
          {renderStatCard('Questions Actives', stats.activeQuestions, '✅', 'bg-purple-100')}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction('games')}
            className="p-4 bg-white rounded-lg shadow border hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100">
                <span className="text-xl">🎮</span>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Créer un Jeu</h3>
                <p className="text-sm text-gray-500">Ajouter un nouveau type de jeu</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleQuickAction('players')}
            className="p-4 bg-white rounded-lg shadow border hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100">
                <span className="text-xl">👥</span>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Ajouter un Joueur</h3>
                <p className="text-sm text-gray-500">Enregistrer un nouveau joueur</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleQuickAction('questions')}
            className="p-4 bg-white rounded-lg shadow border hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100">
                <span className="text-xl">❓</span>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Créer une Question</h3>
                <p className="text-sm text-gray-500">Ajouter une nouvelle question</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" role="navigation">
            <button
              onClick={() => handleTabChange('games')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'games'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'games'}
            >
              Jeux
            </button>
            <button
              onClick={() => handleTabChange('players')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'players'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'players'}
            >
              Joueurs
            </button>
            <button
              onClick={() => handleTabChange('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'questions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={activeTab === 'questions'}
            >
              Questions
            </button>
          </nav>
        </div>
      </div>

      {/* Active Screen */}
      {renderActiveScreen()}
    </div>
  );
}
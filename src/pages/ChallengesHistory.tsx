import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiplayerChallengesService, MultiplayerChallenge } from '../services/multiplayer-challenges.service';
import { ChallengeCard } from '../components/ChallengeCard';
import { supabase } from '../lib/supabase';

const challengesService = new MultiplayerChallengesService();

type FilterType = 'all' | 'active' | 'completed' | 'expired';
type GameTypeFilter = 'ALL' | 'TOP10' | 'GRILLE' | 'CLUB';

const ChallengesHistory: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<MultiplayerChallenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<MultiplayerChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [gameTypeFilter, setGameTypeFilter] = useState<GameTypeFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, gameTypeFilter, searchTerm, challenges]);

  const loadChallenges = async () => {
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

      // Récupérer tous les défis de l'utilisateur
      const data = await challengesService.getUserChallenges(session.user.id);
      setChallenges(data);
    } catch (err: any) {
      console.error('Failed to load challenges:', err);
      setError(err.message || 'Impossible de charger les défis');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...challenges];

    // Filtre par statut
    if (statusFilter === 'active') {
      filtered = filtered.filter(c => 
        c.status === 'pending' || c.status === 'in_progress'
      );
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(c => c.status === 'completed');
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter(c => c.status === 'expired' || c.status === 'cancelled');
    }

    // Filtre par type de jeu
    if (gameTypeFilter !== 'ALL') {
      filtered = filtered.filter(c => c.game_type === gameTypeFilter);
    }

    // Filtre par recherche (nom du créateur ou participants)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        const creatorMatch = c.creator?.pseudo.toLowerCase().includes(term);
        const participantsMatch = c.participants?.some(p => 
          p.user?.pseudo.toLowerCase().includes(term)
        );
        return creatorMatch || participantsMatch;
      });
    }

    setFilteredChallenges(filtered);
  };

  // Statistiques
  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'pending' || c.status === 'in_progress').length,
    completed: challenges.filter(c => c.status === 'completed').length,
    wins: challenges.filter(c => {
      const userParticipant = c.participants?.find(p => p.user_id === currentUserId);
      return userParticipant?.rank === 1;
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">📜 Historique des Défis</h1>
              <p className="text-gray-600">Retrouvez tous vos défis passés et en cours</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              ← Retour
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Actifs</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Terminés</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.wins}</div>
              <div className="text-sm text-gray-600">Victoires</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Terminés</option>
                  <option value="expired">Expirés/Annulés</option>
                </select>
              </div>

              {/* Filtre par type de jeu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de jeu
                </label>
                <select
                  value={gameTypeFilter}
                  onChange={(e) => setGameTypeFilter(e.target.value as GameTypeFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">Tous les jeux</option>
                  <option value="TOP10">Top 10</option>
                  <option value="GRILLE">Grille Croisée</option>
                  <option value="CLUB">Club Express</option>
                </select>
              </div>

              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom du joueur..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Bouton réinitialiser */}
            {(statusFilter !== 'all' || gameTypeFilter !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setGameTypeFilter('ALL');
                  setSearchTerm('');
                }}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                🔄 Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Liste des défis */}
        {filteredChallenges.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun défi trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {challenges.length === 0
                ? "Vous n'avez pas encore participé à de défis. Créez-en un !"
                : "Aucun défi ne correspond à vos critères de recherche."}
            </p>
            <button
              onClick={() => navigate('/?mode=multijoueur')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
            >
              🎮 Créer un défi
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              {filteredChallenges.length} défi{filteredChallenges.length > 1 ? 's' : ''} trouvé{filteredChallenges.length > 1 ? 's' : ''}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  currentUserId={currentUserId || ''}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesHistory;




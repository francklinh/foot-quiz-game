// src/components/AdminPlayersScreen.tsx
import React, { useState, useEffect } from 'react';
import { supabaseLocalService } from '../services/supabase-local.service';

// Types pour les joueurs
interface Player {
  id: string;
  name: string;
  nationality: string;
  position: string;
  current_club: string;
  club_history?: ClubHistory[];
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

interface PlayerFilters {
  search: string;
  nationality: string;
  position: string;
  club: string;
}

interface ClubHistory {
  id: string;
  player_id: string;
  club_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

// Types pour les positions et nationalités (plus flexibles)
type PlayerPosition = 'Attaquant' | 'Milieu' | 'Défenseur' | 'Gardien' | string;
type Nationality = 'France' | 'Brazil' | 'Argentina' | 'Spain' | 'England' | 'Germany' | 'Italy' | 'Portugal' | 'Netherlands' | 'Belgium' | 'Poland' | 'Croatia' | 'Norway' | 'Egypt' | 'South Korea' | 'Japan' | 'Mexico' | 'USA' | 'Canada' | 'Australia' | 'Chile' | string;

const VALID_POSITIONS: PlayerPosition[] = ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'];
const VALID_NATIONALITIES: Nationality[] = ['France', 'Brazil', 'Argentina', 'Spain', 'England', 'Germany', 'Italy', 'Portugal', 'Netherlands', 'Belgium', 'Poland', 'Croatia', 'Norway', 'Egypt', 'South Korea', 'Japan', 'Mexico', 'USA', 'Canada', 'Australia', 'Chile'];

interface AdminPlayersScreenProps {
  className?: string;
}

export function AdminPlayersScreen({ className = '' }: AdminPlayersScreenProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: 'Attaquant' as PlayerPosition,
    nationality: 'France' as Nationality,
    current_club: '',
    club_history: [] as ClubHistory[],
    is_active: true,
    is_verified: false
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Utilisation du service local Supabase

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, activeFilter]);

  const loadPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseLocalService.getPlayers();
      setPlayers(data);
    } catch (err: any) {
      setError('Erreur lors du chargement des joueurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = async () => {
    try {
      let filtered = [...players];

      // Apply search filter
      if (searchTerm.length >= 2) {
        const searchResults = await supabaseLocalService.searchPlayers(searchTerm);
        filtered = searchResults;
      }

      // Apply position filter
      if (activeFilter !== 'all') {
        filtered = filtered.filter(player => player.position === activeFilter);
      }

      setFilteredPlayers(filtered);
    } catch (err: any) {
      console.error('Error filtering players:', err);
      setFilteredPlayers(players);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await supabaseLocalService.createPlayer(formData);
      setShowCreateModal(false);
      setFormData({ name: '', position: 'Attaquant' as PlayerPosition, nationality: 'France' as Nationality, current_club: '', club_history: [], is_active: true, is_verified: false });
      setFormErrors([]);
      loadPlayers();
    } catch (err: any) {
      setError('Erreur lors de la création du joueur');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await supabaseLocalService.updatePlayer(selectedPlayer.id, formData);
      setShowEditModal(false);
      setSelectedPlayer(null);
      setFormData({ name: '', position: 'Attaquant' as PlayerPosition, nationality: 'France' as Nationality, current_club: '', club_history: [], is_active: true, is_verified: false });
      setFormErrors([]);
      loadPlayers();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du joueur');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlayer) return;
    
    try {
      await supabaseLocalService.deletePlayer(selectedPlayer.id);
      setShowDeleteModal(false);
      setSelectedPlayer(null);
      loadPlayers();
    } catch (err: any) {
      setError('Erreur lors de la suppression du joueur');
      console.error(err);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPlayers.length === 0) return;

    try {
      switch (action) {
        case 'archive':
          // Archive players (not implemented in local service yet)
          console.log('Archive players:', selectedPlayers);
          break;
        case 'verify':
          // Verify players (not implemented in local service yet)
          console.log('Verify players:', selectedPlayers);
          break;
        case 'delete':
          // Delete players
          for (const playerId of selectedPlayers) {
            await supabaseLocalService.deletePlayer(playerId);
          }
          break;
      }
      setSelectedPlayers([]);
      loadPlayers();
    } catch (err: any) {
      setError(`Erreur lors de l'action en lot: ${action}`);
      console.error(err);
    }
  };

  const openEditModal = (player: Player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      nationality: player.nationality,
      current_club: player.current_club,
      club_history: player.club_history || [],
      is_active: player.is_active || true,
      is_verified: player.is_verified || false
    });
    setFormErrors([]);
    setShowEditModal(true);
  };

  const openDeleteModal = (player: Player) => {
    setSelectedPlayer(player);
    setShowDeleteModal(true);
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push('Le nom est requis');
    if (!formData.position.trim()) errors.push('La position est requise');
    if (!formData.nationality.trim()) errors.push('La nationalité est requise');
    if (!formData.current_club.trim()) errors.push('Le club actuel est requis');
    return errors;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="text-lg">Chargement des joueurs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Gestion des Joueurs</h1>
        <p className="text-text-secondary">Gérez la base de données des joueurs de football</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
          >
            Ajouter un Joueur
          </button>
        </div>

        {/* Position Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous
          </button>
          {VALID_POSITIONS.map((position) => (
            <button
              key={position}
              onClick={() => handleFilter(position)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === position
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {position}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPlayers.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedPlayers.length} joueur(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('verify')}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Vérifier
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Archiver
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="grid gap-4">
        {filteredPlayers.map((player) => (
          <div key={player.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.id)}
                  onChange={() => togglePlayerSelection(player.id)}
                  className="mt-1"
                  aria-label={`Sélectionner ${player.name}`}
                />
                <div>
                  <h3 className="text-lg font-semibold text-primary">{player.name}</h3>
                  <div className="mt-1 text-sm text-text-secondary space-y-1">
                    <p><strong>Position:</strong> {player.position}</p>
                    <p><strong>Nationalité:</strong> {player.nationality}</p>
                    <p><strong>Club:</strong> {player.current_club}</p>
                    <div className="flex gap-4 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        player.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {player.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        player.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.is_verified ? 'Vérifié' : 'Non vérifié'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(player)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={`Modifier ${player.name}`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => openDeleteModal(player)}
                  className="text-red-600 hover:text-red-800"
                  aria-label={`Supprimer ${player.name}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucun joueur trouvé
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Ajouter un Nouveau Joueur</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as PlayerPosition })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Sélectionner une position</option>
                    {VALID_POSITIONS.map((position) => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationalité *
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value as Nationality })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Sélectionner une nationalité</option>
                    {VALID_NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>{nationality}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club actuel *
                  </label>
                  <input
                    type="text"
                    value={formData.current_club}
                    onChange={(e) => setFormData({ ...formData, current_club: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    Actif
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                      className="mr-2"
                    />
                    Vérifié
                  </label>
                </div>
              </div>
              {formErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <ul className="list-disc list-inside">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Modifier le Joueur</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as PlayerPosition })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {VALID_POSITIONS.map((position) => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationalité *
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value as Nationality })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {VALID_NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>{nationality}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club actuel *
                  </label>
                  <input
                    type="text"
                    value={formData.current_club}
                    onChange={(e) => setFormData({ ...formData, current_club: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    Actif
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                      className="mr-2"
                    />
                    Vérifié
                  </label>
                </div>
              </div>
              {formErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <ul className="list-disc list-inside">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce joueur ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

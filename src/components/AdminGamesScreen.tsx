// src/components/AdminGamesScreen.tsx
import React, { useState, useEffect } from 'react';
import { supabaseLocalService } from '../services/supabase-local.service';

// Types pour les jeux
interface GameType {
  id: string;
  name: string;
  description: string;
  rules?: string;
  scoring_system?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GameConfiguration {
  id: string;
  game_type_id: string;
  name: string;
  title?: string;
  description: string;
  configuration: any;
  difficulty?: string;
  time_limit?: number;
  max_players?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminGamesScreenProps {
  className?: string;
}

export function AdminGamesScreen({ className = '' }: AdminGamesScreenProps) {
  const [activeTab, setActiveTab] = useState<'types' | 'configurations'>('types');
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [configurations, setConfigurations] = useState<GameConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GameType | GameConfiguration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    scoring_system: ''
  });

  // Utilisation du service local Supabase

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'types') {
        const data = await supabaseLocalService.getGameTypes();
        setGameTypes(data);
      } else {
        // Pour les configurations, on utilise les questions pour l'instant
        const data = await supabaseLocalService.getQuestions();
        setConfigurations(data.map((q: any) => ({
          id: q.id,
          game_type_id: q.game_type_id || 'TOP10',
          name: q.content?.question || 'Question',
          description: q.content?.description || '',
          configuration: q.content,
          is_active: q.is_active,
          created_at: q.created_at,
          updated_at: q.updated_at
        })));
      }
    } catch (err: any) {
      setError(`Erreur lors du chargement des ${activeTab === 'types' ? 'types de jeux' : 'configurations'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabaseLocalService.createGameType({
        name: formData.name,
        description: formData.description,
        is_active: true
      });
      setShowCreateModal(false);
      setFormData({ name: '', description: '', rules: '', scoring_system: '' });
      loadData();
    } catch (err: any) {
      setError('Erreur lors de la création du type de jeu');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    try {
      await supabaseLocalService.updateGameType(selectedItem.id, {
        name: formData.name,
        description: formData.description,
        is_active: true
      });
      setShowEditModal(false);
      setSelectedItem(null);
      setFormData({ name: '', description: '', rules: '', scoring_system: '' });
      loadData();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du type de jeu');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await supabaseLocalService.deleteGameType(selectedItem.id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      setError('Erreur lors de la suppression du type de jeu');
      console.error(err);
    }
  };

  const openEditModal = (item: GameType | GameConfiguration) => {
    setSelectedItem(item);
    setFormData({
      name: (item as GameType).name || '',
      description: (item as GameType).description || '',
      rules: (item as GameType).rules || '',
      scoring_system: (item as GameType).scoring_system || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (item: GameType | GameConfiguration) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push('Le nom est requis');
    if (!formData.description.trim()) errors.push('La description est requise');
    if (!formData.rules.trim()) errors.push('Les règles sont requises');
    if (!formData.scoring_system.trim()) errors.push('Le système de scoring est requis');
    return errors;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Gestion des Jeux</h1>
        <p className="text-text-secondary">Gérez les types de jeux et leurs configurations</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('types')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Types de Jeux
            </button>
            <button
              onClick={() => setActiveTab('configurations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configurations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configurations
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'types' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Types de Jeux</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Créer un Type de Jeu
            </button>
          </div>

          <div className="grid gap-4">
            {gameTypes.map((gameType) => (
              <div key={gameType.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{gameType.name}</h3>
                    <p className="text-text-secondary mt-1">{gameType.description}</p>
                    <div className="mt-2 text-sm text-text-muted">
                      <p><strong>Règles:</strong> {gameType.rules || 'Non définies'}</p>
                      <p><strong>Système de Scoring:</strong> {gameType.scoring_system || 'Non défini'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(gameType)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Modifier ${gameType.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(gameType)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Supprimer ${gameType.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'configurations' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Configurations</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Créer une Configuration
            </button>
          </div>

          <div className="grid gap-4">
            {configurations.map((config) => (
              <div key={config.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{config.title || config.name}</h3>
                    <p className="text-text-secondary mt-1">{config.description}</p>
                    <div className="mt-2 text-sm text-text-muted">
                      <p><strong>Difficulté:</strong> {config.difficulty || 'Non définie'}</p>
                      <p><strong>Temps limite:</strong> {config.time_limit || 'Non défini'}s</p>
                      <p><strong>Joueurs max:</strong> {config.max_players || 'Non défini'}</p>
                      <p><strong>Actif:</strong> {config.is_active ? 'Oui' : 'Non'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(config)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Modifier ${config.title || config.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(config)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Supprimer ${config.title || config.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Créer un Nouveau Type de Jeu</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
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
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Règles
                  </label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Système de Scoring
                  </label>
                  <input
                    type="text"
                    value={formData.scoring_system}
                    onChange={(e) => setFormData({ ...formData, scoring_system: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
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
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Modifier le Type de Jeu</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
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
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Règles
                  </label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Système de Scoring
                  </label>
                  <input
                    type="text"
                    value={formData.scoring_system}
                    onChange={(e) => setFormData({ ...formData, scoring_system: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
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
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce type de jeu ? Cette action est irréversible.
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

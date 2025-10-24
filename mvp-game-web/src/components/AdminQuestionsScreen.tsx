// src/components/AdminQuestionsScreen.tsx
import React, { useState, useEffect } from 'react';
import { AdminQuestionsService, Question, GridAnswer, QuestionFilters } from '../services/admin-questions.service';
import { GameTypeEnum, Difficulty } from '../services/admin-constants';
import { VALID_GAME_TYPES, VALID_DIFFICULTIES } from '../services/admin-constants';

interface AdminQuestionsScreenProps {
  className?: string;
}

export function AdminQuestionsScreen({ className = '' }: AdminQuestionsScreenProps) {
  const [activeTab, setActiveTab] = useState<'questions' | 'gridAnswers'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gridAnswers, setGridAnswers] = useState<GridAnswer[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Question | GridAnswer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game_type: 'TOP10' as GameTypeEnum,
    difficulty: 'medium' as Difficulty,
    time_limit: 300,
    max_attempts: 3,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const questionsService = new AdminQuestionsService();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, activeFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'questions') {
        const data = await questionsService.getQuestions();
        setQuestions(data);
      } else {
        const data = await questionsService.getGridAnswers('default');
        setGridAnswers(data);
      }
    } catch (err: any) {
      setError(`Erreur lors du chargement des ${activeTab === 'questions' ? 'questions' : 'réponses grille'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = async () => {
    try {
      let filtered = [...questions];

      // Apply search filter
      if (searchTerm.length >= 2) {
        const searchResults = await questionsService.getQuestions({ search: searchTerm });
        filtered = searchResults;
      }

      // Apply game type filter
      if (activeFilter !== 'all') {
        filtered = filtered.filter(question => question.game_type === activeFilter);
      }

      setFilteredQuestions(filtered);
    } catch (err: any) {
      console.error('Error filtering questions:', err);
      setFilteredQuestions(questions);
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
      await questionsService.createQuestion(formData);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', game_type: 'TOP10' as GameTypeEnum, difficulty: 'medium' as Difficulty, time_limit: 300, max_attempts: 3, is_active: true });
      setFormErrors([]);
      loadData();
    } catch (err: any) {
      setError('Erreur lors de la création de la question');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await questionsService.updateQuestion(selectedItem.id, formData);
      setShowEditModal(false);
      setSelectedItem(null);
      setFormData({ title: '', description: '', game_type: 'TOP10' as GameTypeEnum, difficulty: 'medium' as Difficulty, time_limit: 300, max_attempts: 3, is_active: true });
      setFormErrors([]);
      loadData();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de la question');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await questionsService.deleteQuestion(selectedItem.id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      setError('Erreur lors de la suppression de la question');
      console.error(err);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedQuestions.length === 0) return;

    try {
      switch (action) {
        case 'archive':
          await questionsService.bulkArchiveQuestions(selectedQuestions);
          break;
        case 'delete':
          await questionsService.bulkDeleteQuestions(selectedQuestions);
          break;
      }
      setSelectedQuestions([]);
      loadData();
    } catch (err: any) {
      setError(`Erreur lors de l'action en lot: ${action}`);
      console.error(err);
    }
  };

  const openEditModal = (item: Question | GridAnswer) => {
    setSelectedItem(item);
    if ('title' in item) {
      setFormData({
        title: item.title,
        description: item.description,
        game_type: item.game_type,
        difficulty: item.difficulty,
        time_limit: item.time_limit,
        max_attempts: item.max_attempts,
        is_active: item.is_active
      });
    }
    setFormErrors([]);
    setShowEditModal(true);
  };

  const openDeleteModal = (item: Question | GridAnswer) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Le titre est requis');
    if (!formData.game_type.trim()) errors.push('Le type de jeu est requis');
    if (!formData.difficulty.trim()) errors.push('La difficulté est requise');
    if (formData.time_limit <= 0) errors.push('Le temps limite doit être positif');
    if (formData.max_attempts <= 0) errors.push('Le nombre de tentatives doit être positif');
    return errors;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="text-lg">Chargement des questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Gestion des Questions</h1>
        <p className="text-text-secondary">Gérez les questions de jeu et leurs réponses</p>
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
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab('gridAnswers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gridAnswers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Réponses Grille
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'questions' && (
        <div>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher une question..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
              >
                Créer une Question
              </button>
            </div>

            {/* Game Type Filters */}
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
              {VALID_GAME_TYPES.map((gameType) => (
                <button
                  key={gameType}
                  onClick={() => handleFilter(gameType)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeFilter === gameType
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {gameType}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">
                  {selectedQuestions.length} question(s) sélectionnée(s)
                </span>
                <div className="flex gap-2">
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

          {/* Questions List */}
          <div className="grid gap-4">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => toggleQuestionSelection(question.id)}
                      className="mt-1"
                      aria-label={`Sélectionner ${question.title}`}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{question.title}</h3>
                      <div className="mt-1 text-sm text-text-secondary space-y-1">
                        <p><strong>Type:</strong> {question.game_type}</p>
                        <p><strong>Difficulté:</strong> {question.difficulty}</p>
                        <p><strong>Temps limite:</strong> {question.time_limit}s</p>
                        <p><strong>Tentatives max:</strong> {question.max_attempts}</p>
                        <div className="flex gap-4 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            question.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {question.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(question)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Modifier ${question.title}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(question)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Supprimer ${question.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Aucune question trouvée
            </div>
          )}
        </div>
      )}

      {activeTab === 'gridAnswers' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Réponses Grille</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Ajouter une Réponse
            </button>
          </div>

          <div className="grid gap-4">
            {gridAnswers.map((answer) => (
              <div key={answer.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      Ligne {answer.row}, Colonne {answer.col}
                    </h3>
                    <p className="text-text-secondary mt-1">Points: {answer.points}</p>
                    <div className="mt-2 text-sm text-text-muted">
                      <p><strong>Grid Config ID:</strong> {answer.grid_config_id}</p>
                      <p><strong>Player ID:</strong> {answer.player_id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(answer)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Modifier réponse ligne ${answer.row}, colonne ${answer.col}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(answer)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Supprimer réponse ligne ${answer.row}, colonne ${answer.col}`}
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Créer une Nouvelle Question</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de jeu *
                  </label>
                  <select
                    value={formData.game_type}
                    onChange={(e) => setFormData({ ...formData, game_type: e.target.value as GameTypeEnum })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {VALID_GAME_TYPES.map((gameType) => (
                      <option key={gameType} value={gameType}>{gameType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulté *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Sélectionner une difficulté</option>
                    {VALID_DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps limite (secondes) *
                  </label>
                  <input
                    type="number"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tentatives max *
                  </label>
                  <input
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    Actif
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
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Modifier la Question</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de jeu *
                  </label>
                  <select
                    value={formData.game_type}
                    onChange={(e) => setFormData({ ...formData, game_type: e.target.value as GameTypeEnum })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {VALID_GAME_TYPES.map((gameType) => (
                      <option key={gameType} value={gameType}>{gameType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulté *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {VALID_DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps limite (secondes) *
                  </label>
                  <input
                    type="number"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tentatives max *
                  </label>
                  <input
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    Actif
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
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.
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

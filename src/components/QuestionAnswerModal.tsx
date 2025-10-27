// src/components/QuestionAnswerModal.tsx
import React, { useState, useEffect } from 'react';
import { supabaseLocalService } from '../services/supabase-local.service';

interface Player {
  id: string;
  name: string;
  current_club: string;
  nationality: string;
}

interface QuestionAnswer {
  id: string;
  question_id: string;
  player_id: string;
  ranking?: number;
  points?: number;
  is_correct?: boolean;
  players?: Player;
}

interface QuestionAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  questionId: string;
  questionType: 'TOP10' | 'CLUB';
  answer?: QuestionAnswer | null;
  mode: 'create' | 'edit';
}

export function QuestionAnswerModal({
  isOpen,
  onClose,
  onSave,
  questionId,
  questionType,
  answer,
  mode
}: QuestionAnswerModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    player_id: '',
    player_name: '',
    ranking: 1,
    points: 25,
    is_correct: true
  });

  // Charger les joueurs
  useEffect(() => {
    if (isOpen) {
      loadPlayers();
    }
  }, [isOpen]);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && answer) {
        setFormData({
          player_id: answer.player_id,
          player_name: answer.players?.name || '',
          ranking: answer.ranking || 1,
          points: answer.points || 25,
          is_correct: answer.is_correct !== undefined ? answer.is_correct : true
        });
      } else {
        setFormData({
          player_id: '',
          player_name: '',
          ranking: 1,
          points: 25,
          is_correct: true
        });
      }
      setSearchTerm('');
      setErrors([]);
    }
  }, [isOpen, mode, answer]);

  // Filtrer les joueurs selon la recherche
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = players.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.current_club.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.nationality.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlayers(filtered.slice(0, 10)); // Limiter à 10 suggestions
      setShowSuggestions(true);
    } else {
      setFilteredPlayers([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, players]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await supabaseLocalService.getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setFormData({
      ...formData,
      player_id: player.id,
      player_name: player.name
    });
    setSearchTerm(player.name);
    setShowSuggestions(false);
  };

  const handleRankingChange = (ranking: number) => {
    const points = calculatePoints(ranking);
    setFormData({
      ...formData,
      ranking,
      points
    });
  };

  const calculatePoints = (ranking: number): number => {
    const pointsMap: { [key: number]: number } = {
      1: 25, 2: 20, 3: 18, 4: 16, 5: 14,
      6: 12, 7: 10, 8: 8, 9: 6, 10: 4
    };
    return pointsMap[ranking] || 0;
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.player_id) {
      newErrors.push('Veuillez sélectionner un joueur');
    }

    if (questionType === 'TOP10') {
      if (formData.ranking < 1 || formData.ranking > 10) {
        newErrors.push('Le classement doit être entre 1 et 10');
      }
    }

    if (questionType === 'CLUB') {
      if (formData.is_correct === undefined) {
        newErrors.push('Veuillez indiquer si la réponse est correcte');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const data: any = {
        question_id: questionId,
        player_id: formData.player_id
      };

      if (questionType === 'TOP10') {
        data.ranking = formData.ranking;
        data.points = formData.points;
      } else if (questionType === 'CLUB') {
        data.is_correct = formData.is_correct;
      }

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors(['Erreur lors de la sauvegarde']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">
            {mode === 'create' ? 'Ajouter une Réponse' : 'Modifier la Réponse'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du joueur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Joueur *
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un joueur..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              
              {showSuggestions && filteredPlayers.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-gray-600">
                        {player.current_club} • {player.nationality}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Champs spécifiques selon le type de question */}
          {questionType === 'TOP10' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classement (1-10) *
                </label>
                <select
                  value={formData.ranking}
                  onChange={(e) => handleRankingChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                    <option key={rank} value={rank}>
                      {rank} ({calculatePoints(rank)} points)
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {questionType === 'CLUB' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réponse correcte *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_correct"
                    checked={formData.is_correct === true}
                    onChange={() => setFormData({ ...formData, is_correct: true })}
                    className="mr-2"
                  />
                  Correct
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_correct"
                    checked={formData.is_correct === false}
                    onChange={() => setFormData({ ...formData, is_correct: false })}
                    className="mr-2"
                  />
                  Incorrect
                </label>
              </div>
            </div>
          )}

          {/* Affichage des erreurs */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-sm text-red-600">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : (mode === 'create' ? 'Ajouter' : 'Modifier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





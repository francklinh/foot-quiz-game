import React, { useState, useEffect } from 'react';
import { ChallengesService } from '../services/challenges.service';
import { FriendsService } from '../services/friends.service';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
  currentUserId: string;
}

export function CreateChallengeModal({ isOpen, onClose, onCreateSuccess, currentUserId }: CreateChallengeModalProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [gameType, setGameType] = useState<'TOP10' | 'GRILLE' | 'CLUB'>('TOP10');
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const challengesService = new ChallengesService();
  const friendsService = new FriendsService();

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, currentUserId]);

  const loadFriends = async () => {
    try {
      const friendsData = await friendsService.getFriends(currentUserId);
      setFriends(friendsData);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedFriend) {
      setError('Veuillez sélectionner un ami');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);

      await challengesService.createChallenge(
        currentUserId,
        selectedFriend,
        gameType,
        expirationDate.toISOString()
      );

      onCreateSuccess();
      onClose();
      alert('Défi créé avec succès ! 🎉');
    } catch (err: any) {
      setError(`Erreur lors de la création du défi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'TOP10': return '🏆';
      case 'GRILLE': return '🔢';
      case 'CLUB': return '⚽';
      default: return '🎮';
    }
  };

  const getGameName = (type: string) => {
    switch (type) {
      case 'TOP10': return 'Top 10';
      case 'GRILLE': return 'Grille Croisée';
      case 'CLUB': return 'Club Express';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">⚔️ Créer un Défi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Sélection de l'ami */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisir un adversaire
            </label>
            <select
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
              className="w-full p-3 border-2 border-accent-light rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="">Sélectionner un ami...</option>
              {friends.map(friend => (
                <option key={friend.id} value={friend.friend?.id || friend.id}>
                  {friend.friend?.pseudo || 'Ami inconnu'}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du jeu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de jeu
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['TOP10', 'GRILLE', 'CLUB'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setGameType(type)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    gameType === type
                      ? 'border-primary bg-primary text-white'
                      : 'border-accent-light hover:border-primary'
                  }`}
                >
                  <div className="text-2xl mb-1">{getGameIcon(type)}</div>
                  <div className="text-xs font-medium">{getGameName(type)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Durée du défi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée du défi
            </label>
            <select
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number(e.target.value))}
              className="w-full p-3 border-2 border-accent-light rounded-lg focus:outline-none focus:border-primary"
            >
              <option value={1}>1 jour</option>
              <option value={3}>3 jours</option>
              <option value={7}>1 semaine</option>
              <option value={14}>2 semaines</option>
            </select>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateChallenge}
              disabled={loading || !selectedFriend}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || !selectedFriend
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {loading ? 'Création...' : 'Créer le défi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





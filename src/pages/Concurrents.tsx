import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingBall } from '../components/FloatingBall';
import { FriendsService } from '../services/friends.service';
import { ChallengesList } from '../components/ChallengesList';
import { supabase } from '../lib/supabase';

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface SelectedPlayer {
  id: string;
  name: string;
  avatar?: string;
}

export function Concurrents() {
  const navigate = useNavigate();
  const friendsService = new FriendsService();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [friends, setFriends] = useState<Player[]>([]);
  const [frequentPlayers, setFrequentPlayers] = useState<Player[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur et ses amis
  useEffect(() => {
    const loadUserAndFriends = async () => {
      try {
        // Récupérer l'utilisateur actuel
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          
          // Récupérer les amis de l'utilisateur
          const friendsData = await friendsService.getFriends(session.user.id);
          
          // Convertir les amis en format Player
          const friendsPlayers: Player[] = friendsData.map(friend => ({
            id: friend.friend?.id || friend.id,
            name: friend.friend?.pseudo || friend.friend?.email?.split('@')[0] || 'Ami',
            avatar: '👤'
          }));
          
          setFriends(friendsPlayers);
          
          // Pour l'instant, on affiche tous les amis comme "joueurs fréquents"
          // TODO: Implémenter une vraie logique pour les joueurs fréquents (basée sur l'historique de parties)
          setFrequentPlayers(friendsPlayers.slice(0, 6));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des amis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndFriends();
  }, []);

  const filteredFriends = friends.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addPlayer = (player: Player) => {
    if (selectedPlayers.length < 5 && !selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, {
        id: player.id,
        name: player.name,
        avatar: player.avatar
      }]);
    }
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleStartGame = () => {
    if (selectedPlayers.length > 0) {
      // Rediriger vers la page des jeux avec les joueurs sélectionnés
      const playerIds = selectedPlayers.map(p => p.id).join(',');
      navigate(`/home?mode=multijoueur&players=${playerIds}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Motifs ballon en filigrane */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-primary rounded-full"></div>
      </div>

      {/* Défis actifs */}
      {userId && (
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 relative z-10">
          <ChallengesList
            filter="active"
            limit={3}
            title="🎮 Vos défis actifs"
            emptyMessage="Aucun défi en attente. Créez-en un en sélectionnant des concurrents !"
            showViewAll={true}
            onViewAll={() => navigate('/challenges')}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-4 font-poppins">
            CHOISISSEZ VOS CONCURRENTS
          </h1>
          <p className="text-text/70 text-xl">
            Sélectionnez jusqu'à 5 joueurs pour votre partie multijoueur
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone de recherche des amis */}
          <div className="lg:col-span-2">
            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-accent-light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">
                  🔍 Rechercher des amis
                </h3>
                <button
                  onClick={() => navigate('/friends')}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200 shadow-md text-sm"
                >
                  Gérer les amis
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tapez le nom d'un ami..."
                  className="w-full p-4 border-2 border-accent-light rounded-xl focus:border-primary focus:outline-none text-lg"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text/40">
                  🔍
                </div>
              </div>
            </div>

            {/* Liste des amis / résultats de recherche */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light text-center">
                <p className="text-text/60">Chargement de vos amis...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light text-center">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-text/60 mb-4">Vous n'avez pas encore d'amis</p>
                <button
                  onClick={() => navigate('/friends')}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200 shadow-md"
                >
                  Ajouter des amis
                </button>
              </div>
            ) : filteredFriends.length === 0 && searchQuery ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light text-center">
                <p className="text-text/60">Aucun ami trouvé avec "{searchQuery}"</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
                <h3 className="text-xl font-bold text-primary mb-4">
                  {searchQuery ? `Résultats (${filteredFriends.length})` : `Tous vos amis (${friends.length})`}
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(searchQuery ? filteredFriends : friends).map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedPlayers.find(p => p.id === player.id)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-accent hover:bg-accent-light border-accent-light'
                      }`}
                      onClick={() => addPlayer(player)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{player.avatar}</div>
                        <div>
                          <div className="font-semibold">{player.name}</div>
                        </div>
                      </div>
                      {selectedPlayers.find(p => p.id === player.id) && (
                        <div className="text-white text-xl">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Zone des concurrents sélectionnés et joueurs fréquents */}
          <div className="space-y-6">
            {/* Concurrents sélectionnés */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
              <h3 className="text-xl font-bold text-primary mb-4">
                Vos concurrents ({selectedPlayers.length}/5)
              </h3>
              {selectedPlayers.length === 0 ? (
                <p className="text-text/60 text-center py-8">
                  Aucun concurrent sélectionné
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-primary text-white rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{player.avatar}</div>
                        <span className="font-semibold">{player.name}</span>
                      </div>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-white/80 hover:text-white text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Joueurs fréquents */}
            {frequentPlayers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
                <h3 className="text-xl font-bold text-primary mb-4">
                  ⭐ Joueurs fréquents
                </h3>
                <div className="space-y-2">
                  {frequentPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedPlayers.find(p => p.id === player.id)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-accent hover:bg-accent-light border-accent-light'
                      }`}
                      onClick={() => addPlayer(player)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{player.avatar}</div>
                        <div>
                          <div className="font-semibold text-sm">{player.name}</div>
                        </div>
                      </div>
                      {selectedPlayers.find(p => p.id === player.id) && (
                        <div className="text-white text-lg">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton de démarrage */}
            <div className="text-center">
              <button
                onClick={handleStartGame}
                disabled={selectedPlayers.length === 0}
                className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 ${
                  selectedPlayers.length > 0
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:scale-105'
                    : 'bg-accent-light text-text/40 cursor-not-allowed'
                }`}
              >
                {selectedPlayers.length > 0 
                  ? `🚀 Choisir le jeu (${selectedPlayers.length} joueur${selectedPlayers.length > 1 ? 's' : ''})`
                  : 'Sélectionnez au moins un joueur'
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}


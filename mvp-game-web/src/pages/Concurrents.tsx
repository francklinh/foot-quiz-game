import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingBall } from '../components/FloatingBall';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastPlayed?: string;
  gamesPlayed?: number;
}

interface SelectedPlayer {
  id: string;
  name: string;
  avatar?: string;
}

export function Concurrents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [frequentPlayers, setFrequentPlayers] = useState<Player[]>([]);

  // Données d'exemple - à remplacer par des appels API
  useEffect(() => {
    const mockPlayers: Player[] = [
      { id: '1', name: 'Alex Martin', avatar: '👨‍💼', isOnline: true, lastPlayed: '2 min', gamesPlayed: 45 },
      { id: '2', name: 'Sarah Dubois', avatar: '👩‍🎓', isOnline: true, lastPlayed: '5 min', gamesPlayed: 32 },
      { id: '3', name: 'Thomas Leroy', avatar: '👨‍🔬', isOnline: false, lastPlayed: '1h', gamesPlayed: 28 },
      { id: '4', name: 'Emma Rousseau', avatar: '👩‍💻', isOnline: true, lastPlayed: '10 min', gamesPlayed: 67 },
      { id: '5', name: 'Lucas Moreau', avatar: '👨‍🎨', isOnline: false, lastPlayed: '2h', gamesPlayed: 23 },
      { id: '6', name: 'Chloé Bernard', avatar: '👩‍⚕️', isOnline: true, lastPlayed: '15 min', gamesPlayed: 41 },
      { id: '7', name: 'Nicolas Petit', avatar: '👨‍🍳', isOnline: false, lastPlayed: '3h', gamesPlayed: 19 },
      { id: '8', name: 'Léa Garcia', avatar: '👩‍🏫', isOnline: true, lastPlayed: '8 min', gamesPlayed: 55 },
      { id: '9', name: 'Antoine Simon', avatar: '👨‍💻', isOnline: false, lastPlayed: '1j', gamesPlayed: 12 },
      { id: '10', name: 'Camille Durand', avatar: '👩‍🎤', isOnline: true, lastPlayed: '4 min', gamesPlayed: 38 }
    ];

    setAllPlayers(mockPlayers);
    // Les joueurs les plus fréquents sont ceux avec le plus de parties jouées
    setFrequentPlayers(mockPlayers.sort((a, b) => (b.gamesPlayed || 0) - (a.gamesPlayed || 0)).slice(0, 6));
  }, []);

  const filteredPlayers = allPlayers.filter(player =>
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
          {/* Zone de recherche et liste des joueurs */}
          <div className="lg:col-span-2">
            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-accent-light">
              <h3 className="text-xl font-bold text-primary mb-4">
                🔍 Rechercher des joueurs
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tapez le nom d'un joueur..."
                  className="w-full p-4 border-2 border-accent-light rounded-xl focus:border-primary focus:outline-none text-lg"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text/40">
                  🔍
                </div>
              </div>
            </div>

            {/* Liste des joueurs filtrés */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
              <h3 className="text-xl font-bold text-primary mb-4">
                Joueurs disponibles ({filteredPlayers.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPlayers.find(p => p.id === player.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-accent hover:bg-accent-light border-accent-light cursor-pointer'
                    }`}
                    onClick={() => addPlayer(player)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className={`text-sm ${selectedPlayers.find(p => p.id === player.id) ? 'text-white/80' : 'text-text/60'}`}>
                          {player.gamesPlayed} parties • {player.isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}
                        </div>
                      </div>
                    </div>
                    {selectedPlayers.find(p => p.id === player.id) && (
                      <div className="text-white text-xl">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
                        <div className={`text-xs ${selectedPlayers.find(p => p.id === player.id) ? 'text-white/80' : 'text-text/60'}`}>
                          {player.gamesPlayed} parties
                        </div>
                      </div>
                    </div>
                    {selectedPlayers.find(p => p.id === player.id) && (
                      <div className="text-white text-lg">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

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

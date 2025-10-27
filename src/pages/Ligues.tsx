import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingBall } from '../components/FloatingBall';

interface Ligue {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  status: 'active' | 'inactive' | 'upcoming';
  startDate: string;
  endDate: string;
  gamesPerMatch: number;
  matchFrequency: 'daily' | 'every3days' | 'weekly';
}

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

export function Ligues() {
  const navigate = useNavigate();
  const [ligues, setLigues] = useState<Ligue[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLigueName, setNewLigueName] = useState('');
  const [newLigueDescription, setNewLigueDescription] = useState('');
  const [newLigueGamesPerMatch, setNewLigueGamesPerMatch] = useState(3);
  const [newLigueMatchFrequency, setNewLigueMatchFrequency] = useState<'daily' | 'every3days' | 'weekly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [frequentPlayers, setFrequentPlayers] = useState<Player[]>([]);

  // Données d'exemple - à remplacer par des appels API
  useEffect(() => {
    const mockLigues: Ligue[] = [
      {
        id: '1',
        name: 'Ligue des Champions',
        description: 'Compétition hebdomadaire pour les meilleurs joueurs',
        members: 12,
        maxMembers: 20,
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        gamesPerMatch: 5,
        matchFrequency: 'weekly'
      },
      {
        id: '2',
        name: 'Ligue Amateur',
        description: 'Ligue conviviale pour débuter',
        members: 8,
        maxMembers: 15,
        status: 'upcoming',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        gamesPerMatch: 3,
        matchFrequency: 'every3days'
      },
      {
        id: '3',
        name: 'Ligue Pro',
        description: 'Pour les experts du football',
        members: 20,
        maxMembers: 20,
        status: 'inactive',
        startDate: '2023-12-01',
        endDate: '2023-12-03',
        gamesPerMatch: 7,
        matchFrequency: 'daily'
      }
    ];
    setLigues(mockLigues);

    // Données des joueurs
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
    if (selectedPlayers.length < 20 && !selectedPlayers.find(p => p.id === player.id)) {
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

  const handleCreateLigue = () => {
    if (newLigueName.trim()) {
      const newLigue: Ligue = {
        id: Date.now().toString(),
        name: newLigueName,
        description: newLigueDescription,
        members: selectedPlayers.length + 1, // +1 pour le créateur
        maxMembers: 20,
        status: 'upcoming',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gamesPerMatch: newLigueGamesPerMatch,
        matchFrequency: newLigueMatchFrequency
      };
      setLigues([...ligues, newLigue]);
      setNewLigueName('');
      setNewLigueDescription('');
      setNewLigueGamesPerMatch(3);
      setNewLigueMatchFrequency('daily');
      setSelectedPlayers([]);
      setSearchQuery('');
      setShowCreateForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary text-white';
      case 'upcoming': return 'bg-secondary text-black';
      case 'inactive': return 'bg-accent-light text-text';
      default: return 'bg-accent-light text-text';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'En cours';
      case 'upcoming': return 'À venir';
      case 'inactive': return 'Terminée';
      default: return 'Inconnu';
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '1 par jour';
      case 'every3days': return '1 tous les 3 jours';
      case 'weekly': return '1 par semaine';
      default: return 'Inconnu';
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4 font-poppins">
            MES LIGUES
          </h1>
          <p className="text-text/70 text-xl">
            Rejoignez des compétitions ou créez votre propre ligue
          </p>
        </div>

        {/* Bouton créer une ligue */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
          >
            {showCreateForm ? 'Annuler' : '+ Créer une nouvelle ligue'}
          </button>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-accent-light">
            <h3 className="text-2xl font-bold text-primary mb-6 text-center">
              Créer une nouvelle ligue
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <label className="block text-text font-semibold mb-2">
                    Nom de la ligue
                  </label>
                  <input
                    type="text"
                    value={newLigueName}
                    onChange={(e) => setNewLigueName(e.target.value)}
                    className="w-full p-3 border-2 border-accent-light rounded-xl focus:border-primary focus:outline-none"
                    placeholder="Ex: Ligue des Amis"
                  />
                </div>
                <div>
                  <label className="block text-text font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={newLigueDescription}
                    onChange={(e) => setNewLigueDescription(e.target.value)}
                    className="w-full p-3 border-2 border-accent-light rounded-xl focus:border-primary focus:outline-none h-24"
                    placeholder="Décrivez votre ligue..."
                  />
                </div>
                
                {/* Paramètres de la ligue */}
                <div className="bg-accent rounded-xl p-4">
                  <h4 className="font-semibold text-primary mb-3">⚙️ Paramètres de la ligue</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-text font-semibold mb-2">
                        Nombre de jeux par match
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={newLigueGamesPerMatch}
                          onChange={(e) => setNewLigueGamesPerMatch(parseInt(e.target.value))}
                          className="flex-1 slider"
                        />
                        <span className="bg-primary text-white px-3 py-1 rounded-lg font-bold min-w-[3rem] text-center">
                          {newLigueGamesPerMatch}
                        </span>
                      </div>
                      <div className="text-xs text-text/60 mt-1">
                        {newLigueGamesPerMatch === 1 ? '1 jeu' : `${newLigueGamesPerMatch} jeux`} par match
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-text font-semibold mb-2">
                        Fréquence des matchs
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'daily', label: '1 par jour', icon: '📅' },
                          { value: 'every3days', label: '1 tous les 3 jours', icon: '📆' },
                          { value: 'weekly', label: '1 par semaine', icon: '🗓️' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              newLigueMatchFrequency === option.value
                                ? 'bg-primary text-white border-primary'
                                : 'bg-accent hover:bg-accent-light border-accent-light'
                            }`}
                          >
                            <input
                              type="radio"
                              name="matchFrequency"
                              value={option.value}
                              checked={newLigueMatchFrequency === option.value}
                              onChange={(e) => setNewLigueMatchFrequency(e.target.value as 'daily' | 'every3days' | 'weekly')}
                              className="sr-only"
                            />
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-semibold">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sélection des joueurs */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-bold text-primary mb-4">
                  Inviter des joueurs à votre ligue
                </h4>
                
                {/* Barre de recherche */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher des joueurs..."
                      className="w-full p-3 border-2 border-accent-light rounded-xl focus:border-primary focus:outline-none"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/40">
                      🔍
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Liste des joueurs filtrés */}
                  <div>
                    <h5 className="font-semibold text-text mb-2">
                      Joueurs disponibles ({filteredPlayers.length})
                    </h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {filteredPlayers.map((player) => (
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

                  {/* Joueurs sélectionnés et fréquents */}
                  <div className="space-y-4">
                    {/* Joueurs sélectionnés */}
                    <div>
                      <h5 className="font-semibold text-text mb-2">
                        Membres sélectionnés ({selectedPlayers.length}/20)
                      </h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {selectedPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 bg-primary text-white rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="text-sm">{player.avatar}</div>
                              <span className="text-sm font-semibold">{player.name}</span>
                            </div>
                            <button
                              onClick={() => removePlayer(player.id)}
                              className="text-white/80 hover:text-white text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Joueurs fréquents */}
                    <div>
                      <h5 className="font-semibold text-text mb-2">
                        ⭐ Joueurs fréquents
                      </h5>
                      <div className="space-y-1">
                        {frequentPlayers.map((player) => (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              selectedPlayers.find(p => p.id === player.id)
                                ? 'bg-primary text-white border-primary'
                                : 'bg-accent hover:bg-accent-light border-accent-light'
                            }`}
                            onClick={() => addPlayer(player)}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="text-sm">{player.avatar}</div>
                              <div>
                                <div className="font-semibold text-xs">{player.name}</div>
                                <div className={`text-xs ${selectedPlayers.find(p => p.id === player.id) ? 'text-white/80' : 'text-text/60'}`}>
                                  {player.gamesPlayed} parties
                                </div>
                              </div>
                            </div>
                            {selectedPlayers.find(p => p.id === player.id) && (
                              <div className="text-white text-sm">✓</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton de création */}
                <div className="text-center mt-6">
                  <button
                    onClick={handleCreateLigue}
                    className="bg-secondary hover:bg-secondary-dark text-black font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Créer la ligue ({selectedPlayers.length + 1} membre{selectedPlayers.length > 0 ? 's' : ''}, {newLigueGamesPerMatch} jeu{newLigueGamesPerMatch > 1 ? 'x' : ''}, {getFrequencyText(newLigueMatchFrequency)})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des ligues */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ligues.map((ligue, index) => (
            <div
              key={ligue.id}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-primary">
                  {ligue.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ligue.status)}`}>
                  {getStatusText(ligue.status)}
                </span>
              </div>
              
              <p className="text-text/70 mb-4 text-sm">
                {ligue.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text/60">Membres:</span>
                  <span className="font-semibold">{ligue.members}/{ligue.maxMembers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text/60">Jeux par match:</span>
                  <span className="font-semibold">{ligue.gamesPerMatch}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text/60">Fréquence:</span>
                  <span className="font-semibold">{getFrequencyText(ligue.matchFrequency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text/60">Début:</span>
                  <span className="font-semibold">{new Date(ligue.startDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text/60">Fin:</span>
                  <span className="font-semibold">{new Date(ligue.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/ligue/${ligue.id}`)}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  {ligue.status === 'active' ? 'Jouer' : 'Voir détails'}
                </button>
                <button
                  onClick={() => {/* Logique pour quitter la ligue */}}
                  className="bg-accent-light hover:bg-accent text-text font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Quitter
                </button>
              </div>
            </div>
          ))}
        </div>

        {ligues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-text/60 mb-2">
              Aucune ligue trouvée
            </h3>
            <p className="text-text/40">
              Créez votre première ligue ou attendez d'être invité !
            </p>
          </div>
        )}
      </div>

      <FloatingBall />
    </div>
  );
}

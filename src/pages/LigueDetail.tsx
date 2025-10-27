import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FloatingBall } from '../components/FloatingBall';

interface LiguePlayer {
  id: string;
  name: string;
  avatar?: string;
  cherries: number;
  isOnline: boolean;
}

interface CurrentMatch {
  id: string;
  deadline: string;
  timeRemaining: string;
  games: Array<{
    id: string;
    name: string;
    icon: string;
    path: string;
    status: 'pending' | 'completed';
  }>;
  players: LiguePlayer[];
}

interface Game {
  id: string;
  name: string;
  icon: string;
  path: string;
}

export function LigueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ligue, setLigue] = useState<any>(null);
  const [players, setPlayers] = useState<LiguePlayer[]>([]);
  const [currentMatch, setCurrentMatch] = useState<CurrentMatch | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Données d'exemple - à remplacer par des appels API
  useEffect(() => {
    // Simuler le chargement de la ligue
    const mockLigue = {
      id: id,
      name: 'Ligue des Champions',
      description: 'Compétition hebdomadaire pour les meilleurs joueurs',
      members: 8,
      maxMembers: 20,
      status: 'active',
      gamesPerMatch: 5,
      matchFrequency: 'daily'
    };
    setLigue(mockLigue);

    // Simuler les joueurs de la ligue
    const mockPlayers: LiguePlayer[] = [
      { id: '1', name: 'Alex Martin', avatar: '👨‍💼', cherries: 245, isOnline: true },
      { id: '2', name: 'Sarah Dubois', avatar: '👩‍🎓', cherries: 198, isOnline: true },
      { id: '3', name: 'Thomas Leroy', avatar: '👨‍🔬', cherries: 187, isOnline: false },
      { id: '4', name: 'Emma Rousseau', avatar: '👩‍💻', cherries: 176, isOnline: true },
      { id: '5', name: 'Lucas Moreau', avatar: '👨‍🎨', cherries: 165, isOnline: false },
      { id: '6', name: 'Chloé Bernard', avatar: '👩‍⚕️', cherries: 142, isOnline: true },
      { id: '7', name: 'Nicolas Petit', avatar: '👨‍🍳', cherries: 98, isOnline: false },
      { id: '8', name: 'Léa Garcia', avatar: '👩‍🏫', cherries: 76, isOnline: true }
    ];
    setPlayers(mockPlayers.sort((a, b) => b.cherries - a.cherries));

    // Simuler un match en cours
    const mockCurrentMatch: CurrentMatch = {
      id: 'match-1',
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 heures
      timeRemaining: '2h 15min',
      games: [
        { id: '1', name: 'TOP 10', icon: '🏆', path: '/top10', status: 'pending' },
        { id: '2', name: 'TOP 10', icon: '🏆', path: '/top10', status: 'pending' },
        { id: '3', name: 'TOP 10', icon: '🏆', path: '/top10', status: 'completed' },
        { id: '4', name: 'TOP 10', icon: '🏆', path: '/top10', status: 'pending' },
        { id: '5', name: 'TOP 10', icon: '🏆', path: '/top10', status: 'pending' }
      ],
      players: mockPlayers.slice(0, 4) // Top 4 joueurs
    };
    setCurrentMatch(mockCurrentMatch);
  }, [id]);

  // Mise à jour du temps restant
  useEffect(() => {
    if (!currentMatch) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const deadline = new Date(currentMatch.deadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Temps écoulé');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}min`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Mise à jour chaque minute

    return () => clearInterval(interval);
  }, [currentMatch]);

  const handleLaunchGame = (game: { id: string; name: string; icon: string; path: string; status: string }) => {
    if (game.status === 'pending') {
      // Rediriger vers le jeu avec les paramètres de la ligue
      navigate(`${game.path}?mode=ligue&ligueId=${id}&matchId=${currentMatch?.id}&gameId=${game.id}`);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-secondary text-black';
      case 'completed': return 'bg-primary text-white';
      default: return 'bg-accent-light text-text';
    }
  };

  if (!ligue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-2xl font-bold text-primary">Chargement de la ligue...</h2>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* En-tête de la ligue */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-4 font-poppins">
            {ligue.name}
          </h1>
          <p className="text-text/70 text-xl mb-4">{ligue.description}</p>
          <div className="flex justify-center space-x-6 text-sm text-text/60">
            <span>👥 {ligue.members}/{ligue.maxMembers} membres</span>
            <span>🎮 {ligue.gamesPerMatch} jeux par match</span>
            <span>📅 {ligue.matchFrequency === 'daily' ? '1 par jour' : ligue.matchFrequency === 'every3days' ? '1 tous les 3 jours' : '1 par semaine'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classement de la ligue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
                🏆 Classement de la ligue
              </h2>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      index < 3
                        ? 'bg-accent border-primary'
                        : 'bg-accent-light border-accent-light hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold">
                        {getRankIcon(index)}
                      </div>
                      <div className="text-2xl">{player.avatar}</div>
                      <div className="font-bold text-lg">{player.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">🍒 {player.cherries}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Match en cours */}
          <div className="space-y-6">
            {currentMatch && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
                  ⚔️ Match en cours
                </h2>
                
                {/* Deadline */}
                <div className="bg-primary text-white rounded-xl p-4 mb-6 text-center">
                  <div className="text-sm font-semibold mb-1">⏰ DEADLINE</div>
                  <div className="text-2xl font-bold">{timeRemaining}</div>
                  <div className="text-sm opacity-90">
                    Vous avez {timeRemaining} pour jouer sinon vous perdrez les points
                  </div>
                </div>

                {/* Jeux du match */}
                <div className="mb-6">
                  <h3 className="font-semibold text-text mb-3">Jeux à jouer :</h3>
                  <div className="space-y-2">
                    {currentMatch.games.map((game, index) => (
                      <div
                        key={game.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                          game.status === 'completed' 
                            ? getStatusColor(game.status)
                            : `${getStatusColor(game.status)} cursor-pointer hover:scale-105`
                        }`}
                        onClick={() => handleLaunchGame(game)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-bold">{index + 1}.</span>
                          <span className="text-xl">{game.icon}</span>
                          <span className="font-semibold">{game.name}</span>
                        </div>
                        <div className="text-sm font-semibold">
                          {game.status === 'completed' ? '✅ Terminé' : '🚀 Cliquer pour jouer'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Joueurs du match */}
                <div className="mb-6">
                  <h3 className="font-semibold text-text mb-3">Joueurs participants :</h3>
                  <div className="space-y-2">
                    {currentMatch.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-accent rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="text-lg">{player.avatar}</div>
                          <span className="font-semibold text-sm">{player.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${player.isOnline ? 'bg-primary' : 'bg-accent-light'}`}></div>
                          <span className="text-xs text-text/60">
                            {player.isOnline ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Statistiques rapides */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
              <h3 className="text-xl font-bold text-primary mb-4">📊 Statistiques</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text/60">Total des cerises:</span>
                  <span className="font-semibold">🍒 {players.reduce((sum, p) => sum + p.cherries, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Joueurs actifs:</span>
                  <span className="font-semibold">{players.filter(p => p.isOnline).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Moyenne cerises:</span>
                  <span className="font-semibold">🍒 {Math.round(players.reduce((sum, p) => sum + p.cherries, 0) / players.length)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}

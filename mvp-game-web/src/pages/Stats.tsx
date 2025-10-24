import { useState, useEffect } from "react";
import { GlobalHeader } from "../components/GlobalHeader";
import { FloatingBall } from "../components/FloatingBall";

type LeaderboardEntry = {
  rank: number;
  pseudo: string;
  score: number;
  pays: string;
  avatar: string;
};

export function Stats() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(237);

  useEffect(() => {
    // Simuler des données de classement
    const mockData: LeaderboardEntry[] = [
      { rank: 1, pseudo: "FootMaster", score: 2847, pays: "🇫🇷", avatar: "👑" },
      { rank: 2, pseudo: "GoalKing", score: 2654, pays: "🇧🇷", avatar: "⚽" },
      { rank: 3, pseudo: "SoccerPro", score: 2521, pays: "🇪🇸", avatar: "🏆" },
      { rank: 4, pseudo: "BallWizard", score: 2389, pays: "🇩🇪", avatar: "⭐" },
      { rank: 5, pseudo: "StrikeForce", score: 2256, pays: "🇦🇷", avatar: "🔥" },
      { rank: 6, pseudo: "GoalMachine", score: 2134, pays: "🇬🇧", avatar: "💪" },
      { rank: 7, pseudo: "FootLegend", score: 2012, pays: "🇮🇹", avatar: "🚀" },
      { rank: 8, pseudo: "SoccerStar", score: 1890, pays: "🇳🇱", avatar: "🎯" },
      { rank: 9, pseudo: "BallMaster", score: 1768, pays: "🇵🇹", avatar: "⚡" },
      { rank: 10, pseudo: "GoalHunter", score: 1646, pays: "🇧🇪", avatar: "🏅" },
    ];
    setLeaderboard(mockData);
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Motifs ballon en filigrane */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-primary rounded-full"></div>
      </div>

      
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            📊 STATISTIQUES
          </h1>
          <div className="bg-primary text-white rounded-xl px-6 py-3 inline-block">
            <span className="text-2xl font-bold">{totalParticipants}</span>
            <span className="ml-2">participants</span>
          </div>
        </div>

        {/* Tableau de classement */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-accent-light">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Rang</th>
                  <th className="px-6 py-4 text-left font-bold">Joueur</th>
                  <th className="px-6 py-4 text-left font-bold">Score</th>
                  <th className="px-6 py-4 text-left font-bold">Pays</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.rank}
                    className={`${
                      index % 2 === 0 
                        ? 'bg-primary/10' 
                        : 'bg-accent/30'
                    } hover:bg-primary/20 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{entry.avatar}</span>
                        <span className="font-semibold text-text">{entry.pseudo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🧮</span>
                        <span className="font-bold text-primary">{entry.score.toLocaleString()}</span>
                        <span className="text-sm text-text/70">clafoutis</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl">{entry.pays}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistiques supplémentaires */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/90 backdrop-blur rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-text/70">Parties jouées</div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-secondary">89%</div>
            <div className="text-text/70">Taux de réussite</div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-primary">15</div>
            <div className="text-text/70">Streak record</div>
          </div>
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}

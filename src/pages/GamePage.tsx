import { useState } from "react";
import { Link } from "react-router-dom";
import { GlobalHeader } from "../components/GlobalHeader";
import { FloatingBall } from "../components/FloatingBall";

type GamePageProps = {
  title: string;
  description: string;
  rules: string;
  soloPath: string;
  defiPath: string;
  icon: string;
};

export function GamePage({ title, description, rules, soloPath, defiPath, icon }: GamePageProps) {
  const [selectedMode, setSelectedMode] = useState<'solo' | 'defi' | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Zone centrale */}
        <div className="space-y-8">
          {/* Encadré "Règles du jeu" */}
          <div className="bg-primary text-white rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">
              REGLES DU JEU
            </h2>
            <p className="text-white/90 leading-relaxed">
              {rules}
            </p>
          </div>

          {/* Zone de sélection de mode */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mode SOLO */}
            <button
              onClick={() => setSelectedMode('solo')}
              className={`p-8 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                selectedMode === 'solo'
                  ? 'bg-accent border-4 border-primary'
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🧍‍♂️</div>
                <h3 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">
                  SOLO
                </h3>
                <p className="text-text/70">
                  Jouez seul et améliorez vos scores personnels
                </p>
              </div>
            </button>

            {/* Mode DEFI */}
            <button
              onClick={() => setSelectedMode('defi')}
              className={`p-8 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                selectedMode === 'defi'
                  ? 'bg-accent border-4 border-primary'
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">
                  DEFI
                </h3>
                <p className="text-text/70">
                  Affrontez d'autres joueurs dans des défis épiques
                </p>
              </div>
            </button>
          </div>

          {/* Bouton de démarrage */}
          {selectedMode && (
            <div className="text-center">
              <Link
                to={selectedMode === 'solo' ? soloPath : defiPath}
                className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                DÉMARRER LE JEU
              </Link>
            </div>
          )}
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}





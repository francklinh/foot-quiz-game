import { Link, useLocation } from "react-router-dom";
import { FloatingBall } from "../components/FloatingBall";
import { AdminIndicator } from "../components/AdminIndicator";

export function Home() {
  const location = useLocation();
  const gameMode = new URLSearchParams(location.search).get('mode') || 'solo';

  const gameModules = [
    {
      title: "TOP 10",
      path: `/top10?mode=${gameMode}`,
      active: true,
      icon: "🏆"
    },
    {
      title: "GRILLE",
      path: `/grille?mode=${gameMode}`,
      active: true,
      icon: "⚡"
    },
    {
      title: "CLUB",
      path: `/club?mode=${gameMode}`,
      active: true,
      icon: "⚽"
    },
    {
      title: "COMING SOON",
      path: "#",
      active: false,
      icon: "🔒"
    }
  ];

  const getModeTitle = () => {
    switch (gameMode) {
      case 'solo': return 'MODE SOLO';
      case 'multijoueur': return 'MODE MULTIJOUEUR';
      case 'ligue': return 'MODE LIGUE';
      default: return 'MODE SOLO';
    }
  };

  return (
    <div className="min-h-screen bg-pattern">
      
      {/* Motifs ballon en filigrane avec meilleur contraste */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-primary rounded-full"></div>
      </div>
      
      {/* Zone centrale - Grille 2x2 des modules */}
      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* Titre du mode */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 font-poppins">
            {getModeTitle()}
          </h1>
          <p className="text-secondary text-lg">
            Choisissez votre jeu préféré
          </p>
        </div>
        {/* Lien Admin pour les administrateurs */}
        <div className="mb-6 flex justify-center">
          <AdminIndicator />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {gameModules.map((module, index) => (
            <div
              key={module.title}
              className={`relative rounded-xl p-8 shadow-lg transition-all duration-300 transform hover:scale-105 ${
                module.active
                  ? 'card-colored hover-lift cursor-pointer'
                  : 'card-accent opacity-50 cursor-not-allowed'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {module.active ? (
                <Link to={module.path} className="block h-full">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-inverse uppercase tracking-wider">
                      {module.title}
                    </h3>
                  </div>
                </Link>
              ) : (
                <div className="text-center h-full flex flex-col justify-center">
                  <div className="text-6xl mb-4 opacity-50">🔒</div>
                  <h3 className="text-2xl font-bold text-muted uppercase tracking-wider">
                    {module.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <FloatingBall />
      
      {/* Debug: Vérifier s'il y a un élément invisible qui bloque */}
      <div className="fixed top-0 right-0 w-20 h-16 bg-transparent pointer-events-none z-40"></div>
    </div>
  );
}
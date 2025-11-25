import { Link } from "react-router-dom";
import { FloatingBall } from "../components/FloatingBall";

export function Jeux() {
  const gameModules = [
    {
      title: "TOP 10",
      path: "/top10",
      active: true,
      icon: "🏆",
      description: "Classement des 10 meilleurs joueurs"
    },
    {
      title: "LOGO SNIPER",
      path: "/logo-sniper",
      active: true,
      icon: "🎯",
      description: "Devinez les logos des clubs"
    },
    {
      title: "CLUB ACTUEL",
      path: "/club-actuel",
      active: true,
      icon: "⚽",
      description: "Devinez le club actuel des joueurs"
    },
    {
      title: "CARRIÈRE INFERNALE",
      path: "/carriere-infernale",
      active: true,
      icon: "🔥",
      description: "Reconstitue la carrière des joueurs"
    }
  ];

  return (
    <div className="min-h-screen bg-pattern">
      {/* Motifs ballon en filigrane */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-primary rounded-full"></div>
      </div>

      {/* Zone centrale - Liste des jeux */}
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 font-poppins">
            JEUX DISPONIBLES
          </h1>
          <p className="text-secondary text-lg">
            Choisissez votre jeu préféré
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="text-6xl mb-4">{module.icon}</div>
                    <h3 className="text-2xl font-bold text-inverse uppercase tracking-wider mb-2">
                      {module.title}
                    </h3>
                    <p className="text-inverse/80 text-sm">
                      {module.description}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="text-center h-full flex flex-col justify-center">
                  <div className="text-6xl mb-4 opacity-50">{module.icon || '🔒'}</div>
                  <h3 className="text-2xl font-bold text-muted uppercase tracking-wider mb-2">
                    {module.title}
                  </h3>
                  <p className="text-muted text-sm">
                    {module.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}

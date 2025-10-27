import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingBall } from '../components/FloatingBall';

export function ModeSelection() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const gameModes = [
    {
      id: 'solo',
      title: 'SOLO',
      icon: '🧍‍♂️',
      description: 'Affrontez l\'ordinateur sur des parties de 60 secondes, avec des questions aléatoires et un chronomètre serré',
      color: 'bg-primary',
      hoverColor: 'hover:bg-primary-dark'
    },
    {
      id: 'multijoueur',
      title: 'DÉFI',
      icon: '👥',
      description: 'Parties rapides de 60 secondes, jouables de 2 à 6 joueurs',
      color: 'bg-secondary',
      hoverColor: 'hover:bg-secondary-dark'
    },
    {
      id: 'ligue',
      title: 'LIGUE',
      icon: '🏆',
      description: 'Les joueurs d\'une même ligue répondent aux mêmes séries de questions sur une période donnée (ex. 48 heures)',
      color: 'bg-accent',
      hoverColor: 'hover:bg-accent-light'
    }
  ];

  const handleModeSelection = (modeId: string) => {
    setSelectedMode(modeId);
    
    if (modeId === 'solo') {
      navigate(`/home?mode=${modeId}`);
    } else if (modeId === 'multijoueur') {
      navigate('/concurrents');
    } else if (modeId === 'ligue') {
      navigate('/ligues');
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

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4 font-poppins">
            CHOISISSEZ VOTRE MODE
          </h1>
          <p className="text-text/70 text-xl">
            Sélectionnez votre style de jeu préféré
          </p>
        </div>

        {/* Grille des modes de jeu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gameModes.map((mode, index) => (
            <div
              key={mode.id}
              className={`${mode.color} ${mode.hoverColor} rounded-2xl p-8 shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-white`}
              style={{
                animationDelay: `${index * 0.2}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
              onClick={() => handleModeSelection(mode.id)}
            >
              <div className="text-center">
                <div className="text-6xl mb-6">{mode.icon}</div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">
                  {mode.title}
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Zone d'information */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent-light">
            <h3 className="text-xl font-bold text-primary mb-3">
              💡 Comment ça marche ?
            </h3>
            <p className="text-text/70">
              Chaque mode offre une expérience unique. Le mode Solo vous permet de vous entraîner seul, 
              le mode Défi vous met au défi avec vos amis, et la Ligue vous fait participer à des compétitions 
              étendues sur plusieurs jours.
            </p>
          </div>
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}

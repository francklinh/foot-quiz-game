import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Animation de chargement de 2-3 secondes
    const timer = setTimeout(() => {
      setLoading(false);
      // Transition vers le menu accueil après l'animation
      setTimeout(() => {
        navigate("/");
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Motifs de fond subtils */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-white rounded-full"></div>
      </div>

      {/* Contenu principal */}
      <div className="text-center z-10">
        {/* Logo CLAFOOTIX */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            {/* Ballon de football avec éclair en forme de pizza et point d'interrogation */}
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl">
              <div className="text-6xl">⚽</div>
              {/* Éclair pizza */}
              <div className="absolute -top-2 -right-2 text-2xl">🍕</div>
              {/* Point d'interrogation */}
              <div className="absolute -bottom-2 -left-2 text-2xl">❓</div>
            </div>
          </div>
          
          {/* Texte CLAFOOTIX */}
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider">
            CLAFOOTIX
          </h1>
          <p className="text-xl text-white/80 font-medium">
            Jeux de Football
          </p>
        </div>

        {/* Animation de chargement */}
        {loading && (
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {/* Message de chargement */}
        {loading && (
          <p className="text-white/70 mt-4 text-sm">
            Chargement...
          </p>
        )}
      </div>

      {/* Animation de transition */}
      {!loading && (
        <div className="absolute inset-0 bg-white transform scale-0 animate-ping opacity-20"></div>
      )}
    </div>
  );
}





import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../logo.svg";
import { supabase } from "../lib/supabase";

type GlobalHeaderProps = {
  showProfile?: boolean;
};

export function GlobalHeader({ showProfile = true }: GlobalHeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [clafoutis, setClafoutis] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Récupération de l'utilisateur et des clafoutis
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    // Simuler la récupération des clafoutis (à remplacer par une vraie API)
    setClafoutis(Math.floor(Math.random() * 1000) + 100);

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <header className="bg-primary text-white shadow-lg h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Gauche - Compteur Clafoutis */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍕</span>
            <span className="text-lg font-bold">{clafoutis}</span>
          </div>

          {/* Centre - Logo CLAFOOTIX */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Clafootix" className="h-8 w-8 rounded" />
            <span className="text-xl font-bold font-poppins">CLAFOOTIX</span>
          </Link>

          {/* Droite - Icône Profil */}
          {showProfile && (
            <Link
              to="/profil"
              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary-dark transition-colors duration-200"
            >
              <span className="text-xl">👤</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

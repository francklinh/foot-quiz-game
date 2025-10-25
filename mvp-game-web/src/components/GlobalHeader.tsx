import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.svg";
import { supabase } from "../lib/supabase";
import { AdminIndicator } from "./AdminIndicator";

type GlobalHeaderProps = {
  showProfile?: boolean;
};

export function GlobalHeader({ showProfile = true }: GlobalHeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [clafoutis, setClafoutis] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Récupération de l'utilisateur et des clafoutis
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 GlobalHeader - Changement d\'état d\'authentification:', event, session?.user?.email);
      setUserEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    });

    // Vérifier la session au chargement immédiatement
    const checkSession = async () => {
      // Vérifier d'abord localStorage
      const storedToken = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
      
      if (storedToken) {
        try {
          // Parser le token pour extraire les informations utilisateur
          const tokenData = JSON.parse(storedToken);
          
          // Essayer différentes structures possibles
          let user = null;
          if (tokenData.currentSession?.user) {
            user = tokenData.currentSession.user;
          } else if (tokenData.user) {
            user = tokenData.user;
          } else if (tokenData.access_token) {
            // Si c'est juste un token d'accès, essayer de décoder le JWT
            try {
              const payload = JSON.parse(atob(tokenData.access_token.split('.')[1]));
              user = { email: payload.email, id: payload.sub };
            } catch (jwtErr) {
              console.error('❌ GlobalHeader - Erreur décodage JWT:', jwtErr);
            }
          }
          
          if (user) {
            setUserEmail(user.email ?? null);
            setUserId(user.id ?? null);
            return;
          }
        } catch (parseErr) {
          console.error('❌ GlobalHeader - Erreur parsing token:', parseErr);
        }
      }
      
      // Fallback: utiliser l'API directe
      try {
        // Récupérer le token depuis localStorage
        const storedToken = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
        if (storedToken) {
          const tokenData = JSON.parse(storedToken);
          if (tokenData.access_token) {
            const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/auth/v1/user', {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA'
              }
            });

            if (response.ok) {
              const userData = await response.json();
              setUserEmail(userData.email ?? null);
              setUserId(userData.id ?? null);
            }
          }
        }
      } catch (apiErr) {
        // Erreur silencieuse
      }
    };
    
    // Vérifier immédiatement et avec des délais
    checkSession();
    setTimeout(checkSession, 500);
    setTimeout(checkSession, 1000);
    setTimeout(checkSession, 2000);

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

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!userEmail) {
      
      // Forcer la récupération depuis localStorage
      const storedToken = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
      if (storedToken) {
        try {
          const tokenData = JSON.parse(storedToken);
          if (tokenData.currentSession?.user) {
            const user = tokenData.currentSession.user;
            setUserEmail(user.email ?? null);
            setUserId(user.id ?? null);
            navigate('/profil');
            return;
          }
        } catch (parseErr) {
          // Erreur silencieuse
        }
      }
      
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <header className="bg-primary text-white shadow-lg h-16 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Gauche - Compteur Clafoutis et Admin */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍕</span>
              <span className="text-lg font-bold">{clafoutis}</span>
            </div>
            <AdminIndicator />
          </div>

          {/* Centre - Logo CLAFOOTIX */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Clafootix" className="h-8 w-8 rounded" />
            <span className="text-xl font-bold font-poppins">CLAFOOTIX</span>
          </Link>

          {/* Droite - Icône Profil */}
          {showProfile && (
            <Link
              to={userEmail ? "/profil" : "/login"}
              onClick={handleProfileClick}
              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary-dark transition-colors duration-200"
              title={userEmail ? "Mon profil" : "Se connecter"}
            >
              <span className="text-xl">👤</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

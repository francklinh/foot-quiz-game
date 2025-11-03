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
  const [cerises, setCerises] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Fonction pour récupérer les cerises depuis Supabase
  const fetchUserCerises = async (userId: string) => {
    if (!userId) {
      console.warn('⚠️  GlobalHeader.fetchUserCerises - userId manquant');
      return;
    }

    try {
      console.log(`🔄 GlobalHeader.fetchUserCerises - Chargement cerises pour userId: ${userId}`);
      
      // Récupérer le token d'authentification depuis localStorage
      let authToken: string | null = null;
      try {
        const storedToken = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
        if (storedToken) {
          const tokenData = JSON.parse(storedToken);
          authToken = tokenData.access_token || tokenData.currentSession?.access_token || null;
        }
      } catch (e) {
        console.warn('⚠️  Impossible de récupérer le token d\'auth:', e);
      }
      
      const headers: HeadersInit = {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
        'Content-Type': 'application/json'
      };
      
      // Ajouter le token d'authentification si disponible
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('🔐 Utilisation du token d\'authentification pour la lecture');
      } else {
        console.warn('⚠️  Pas de token d\'authentification disponible, tentative sans auth');
      }

      const response = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/users?select=cerises_balance&id=eq.${userId}`, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        const cerisesBalance = data?.[0]?.cerises_balance || 0;
        console.log(`✅ GlobalHeader.fetchUserCerises - Cerises récupérées: ${cerisesBalance}`);
        setCerises(cerisesBalance);
      } else {
        const errorText = await response.text();
        console.error(`❌ GlobalHeader.fetchUserCerises - HTTP ${response.status}:`, errorText);
      }
    } catch (error: any) {
      console.error('❌ GlobalHeader.fetchUserCerises - Erreur:', error?.message || error);
    }
  };

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Écouter les changements de cerises depuis d'autres composants
  useEffect(() => {
    if (!userId) return;

    console.log('👂 Header - Enregistrement du listener cerises-updated pour userId:', userId);

    const handleCerisesUpdate = (event: CustomEvent) => {
      console.log('🔔 Header - Notification de mise à jour des cerises:', event.detail);
      // Utiliser directement la valeur de l'événement au lieu de refaire une requête
      if (event.detail?.balance !== undefined) {
        console.log(`✅ Header - Mise à jour directe du solde depuis l'événement: ${event.detail.balance}`);
        setCerises(event.detail.balance);
      } else {
        // Fallback : refaire une requête si la valeur n'est pas dans l'événement
        console.log('⚠️  Header - Valeur non trouvée dans l\'événement, récupération depuis l\'API');
        fetchUserCerises(userId);
      }
    };

    window.addEventListener('cerises-updated' as any, handleCerisesUpdate as any);

    return () => {
      console.log('🛑 Header - Suppression du listener cerises-updated');
      window.removeEventListener('cerises-updated' as any, handleCerisesUpdate as any);
    };
  }, [userId]);

  // Récupération de l'utilisateur et des clafoutis
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 GlobalHeader - Changement d\'état d\'authentification:', event, session?.user?.email);
      setUserEmail(session?.user?.email ?? null);
      const newUserId = session?.user?.id ?? null;
      setUserId(newUserId);
      
      // Récupérer les cerises quand l'utilisateur est identifié
      if (newUserId) {
        fetchUserCerises(newUserId);
      }
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
            const newUserId = user.id ?? null;
            setUserId(newUserId);
            // Récupérer les cerises quand l'utilisateur est identifié
            if (newUserId) {
              fetchUserCerises(newUserId);
            }
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
              const newUserId = userData.id ?? null;
              setUserId(newUserId);
              
              // Récupérer les cerises quand l'utilisateur est identifié
              if (newUserId) {
                fetchUserCerises(newUserId);
              }
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

    // Les cerises sont récupérées via fetchUserCerises() quand l'utilisateur est identifié

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
            const newUserId = user.id ?? null;
            setUserId(newUserId);
            // Récupérer les cerises quand l'utilisateur est identifié
            if (newUserId) {
              fetchUserCerises(newUserId);
            }
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
              <span className="text-2xl">🍒</span>
              <span className="text-lg font-bold">{cerises}</span>
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

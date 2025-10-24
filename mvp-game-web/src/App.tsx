import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { SplashScreen } from "./pages/SplashScreen";
import { ModeSelection } from "./pages/ModeSelection";
import { Concurrents } from "./pages/Concurrents";
import { Home } from "./pages/Home";
import { Ligues } from "./pages/Ligues";
import { LigueDetail } from "./pages/LigueDetail";
import { Profil } from "./pages/Profil";
import { Jeux } from "./pages/Jeux";
import { Stats } from "./pages/Stats";
import { Shop } from "./pages/Shop";
import { Challenges } from "./pages/Challenges";
import { Reglages } from "./pages/Reglages";
import { Regles } from "./pages/Regles";
import { Top10 } from "./pages/Top10";
import { GrilleCroisee } from "./pages/GrilleCroisee";
import { ClubExpress } from "./pages/ClubExpress";
import { TestSupabase } from "./pages/TestSupabase";
import { SupabaseTest } from "./components/SupabaseTest";
import { Admin } from "./pages/Admin";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GlobalHeader } from "./components/GlobalHeader";
import { supabase } from "./lib/supabase";

function App() {
  // Gestion de la session au niveau de l'application
  useEffect(() => {
    console.log('🔄 App - Initialisation de la gestion de session');
    
    // Vérifier la session au chargement
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('🔄 App - Session au chargement:', { data, error });
      if (data.session?.user) {
        console.log('✅ App - Session trouvée:', data.session.user.email);
      } else {
        console.log('❌ App - Aucune session trouvée');
        
        // Vérifier s'il y a des tokens dans l'URL (confirmation email ou lien magique)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        if (hashParams.has('access_token') || hashParams.has('refresh_token') || 
            urlParams.has('access_token') || urlParams.has('refresh_token')) {
          console.log('🔄 App - Tokens détectés dans l\'URL, tentative de traitement...');
          
          // Forcer le traitement de la session
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: newData, error: newError }) => {
              console.log('🔄 App - Session après traitement des tokens:', { newData, newError });
              if (newData.session?.user) {
                console.log('✅ App - Session créée après traitement des tokens:', newData.session.user.email);
                // Rediriger vers home si l'utilisateur est maintenant connecté
                window.location.href = '/home';
              }
            });
          }, 1000);
        }
      }
    });

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 App - Changement d\'état d\'authentification:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ App - Utilisateur connecté:', session.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ App - Utilisateur déconnecté');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 App - Token rafraîchi:', session.user.email);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background font-poppins">
        <Routes>
          {/* Pages d'authentification sans header */}
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Toutes les autres pages avec header global */}
          <Route path="/*" element={
            <>
              <GlobalHeader />
              <Routes>
                {/* Page de sélection de mode */}
                <Route path="/" element={<ModeSelection />} />
                <Route path="/concurrents" element={<Concurrents />} />
                <Route path="/home" element={<Home />} />
                <Route path="/ligues" element={<Ligues />} />
                <Route path="/ligue/:id" element={<LigueDetail />} />
                
                {/* Pages principales */}
                <Route path="/profil" element={<Profil />} />
                <Route path="/jeux" element={<Jeux />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/reglages" element={<Reglages />} />
                <Route path="/regles" element={<Regles />} />
                
                {/* Pages de jeu */}
                <Route path="/top10" element={<Top10 />} />
                <Route path="/top10/:slug" element={<Top10 />} />
                <Route path="/grille" element={<GrilleCroisee />} />
                <Route path="/club" element={<ClubExpress />} />
                
                {/* Pages techniques */}
                <Route path="/test" element={<TestSupabase />} />
                <Route path="/supabase-test" element={<SupabaseTest />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { Admin } from "./pages/Admin";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GlobalHeader } from "./components/GlobalHeader";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-poppins">
        <Routes>
          {/* Page d'ouverture sans header */}
          <Route path="/splash" element={<SplashScreen />} />
          
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
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
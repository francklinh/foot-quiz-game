import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Top10 } from "./pages/Top10";
import { GrilleCroisee } from "./pages/GrilleCroisee";
import { ClubExpress } from "./pages/ClubExpress";
import { TestSupabase } from "./pages/TestSupabase";
import { Admin } from "./pages/Admin";
import { AuthButtons } from "./components/AuthButtons";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminIndicator } from "./components/AdminIndicator";
import logo from "./logo.svg";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-poppins">
        {/* Header avec logo et navigation */}
        <header className="bg-gradient-to-r from-primary to-primary-dark shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo et titre */}
              <div className="flex items-center space-x-4">
                <img src={logo} alt="Clafootix" className="h-12 w-12" />
                <div className="text-white">
                  <h1 className="text-2xl font-bold">Clafootix</h1>
                  <p className="text-sm text-accent">Jeux de Football</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link 
                  to="/" 
                  className="text-white hover:text-secondary transition-colors duration-200 font-medium"
                >
                  Accueil
                </Link>
                <Link 
                  to="/top10" 
                  className="text-white hover:text-secondary transition-colors duration-200 font-medium"
                >
                  Top 10
                </Link>
                <Link 
                  to="/grille" 
                  className="text-white hover:text-secondary transition-colors duration-200 font-medium"
                >
                  Grille Croisée
                </Link>
                <Link 
                  to="/club" 
                  className="text-white hover:text-secondary transition-colors duration-200 font-medium"
                >
                  Club Express
                </Link>
                <Link 
                  to="/test" 
                  className="text-white hover:text-secondary transition-colors duration-200 font-medium"
                >
                  Test
                </Link>
                <Link 
                  to="/admin" 
                  className="text-secondary hover:text-secondary-light transition-colors duration-200 font-bold flex items-center space-x-1"
                >
                  <span>🛠️</span>
                  <span>Admin</span>
                </Link>
              </div>

              {/* Auth à droite */}
              <div className="flex items-center space-x-4">
                <AdminIndicator />
                <AuthButtons />
              </div>
            </div>
          </nav>
        </header>

        {/* Contenu principal */}
        <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/top10" element={<Top10 />} />
        <Route path="/grille" element={<GrilleCroisee />} />
        <Route path="/club" element={<ClubExpress />} />
        <Route path="/test" element={<TestSupabase />} /> {/* 👈 added test route */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } /> {/* 👈 protected admin route */}
        <Route path="/top10/:slug" element={<Top10 />} />
      </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Top10 } from "./pages/Top10";
import { GrilleCroisee } from "./pages/GrilleCroisee";
import { ClubExpress } from "./pages/ClubExpress";
import { TestSupabase } from "./pages/TestSupabase"; // 👈 import correct
import { Admin } from "./pages/Admin";
import { AuthButtons } from "./components/AuthButtons";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminIndicator } from "./components/AdminIndicator";

function App() {
  return (
    <Router>
      <nav className="flex items-center justify-between p-4 bg-gray-100">
        {/* Liens à gauche */}
        <div className="flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/top10">Top 10</Link>
          <Link to="/grille">Grille Croisée</Link>
          <Link to="/club">Club Express</Link>
          <Link to="/test">Test Supabase</Link>
          <Link to="/admin" className="text-purple-600 font-bold">🛠️ Admin</Link>
        </div>

        {/* Auth à droite */}
        <div className="flex items-center gap-3">
          <AdminIndicator />
          <AuthButtons />
        </div>
      </nav>
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
    </Router>
  );
}

export default App;
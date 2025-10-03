import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Top10 } from "./pages/Top10";
import { GrilleCroisee } from "./pages/GrilleCroisee";
import { ClubExpress } from "./pages/ClubExpress";
import { TestSupabase } from "./pages/TestSupabase"; // 👈 import correct

function App() {
  return (
    <Router>
      <nav className="flex gap-4 p-4 bg-gray-100">
        <Link to="/">Home</Link>
        <Link to="/top10">Top 10</Link>
        <Link to="/grille">Grille Croisée</Link>
        <Link to="/club">Club Express</Link>
        <Link to="/test">Test Supabase</Link> {/* 👈 corrected */}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/top10" element={<Top10 />} />
        <Route path="/grille" element={<GrilleCroisee />} />
        <Route path="/club" element={<ClubExpress />} />
        <Route path="/test" element={<TestSupabase />} /> {/* 👈 added test route */}
      </Routes>
    </Router>
  );
}

export default App;
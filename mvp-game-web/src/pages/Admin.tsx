// src/pages/Admin.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../Utils/auth";

// Types
type Theme = {
  id: string;
  slug: string;
  title: string;
  created_at: string;
};

type Player = {
  id: string;
  name: string;
  created_at: string;
};

type ThemeAnswer = {
  id: string;
  theme_id: string;
  answer: string;
  answer_norm: string;
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<"themes" | "players">("themes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔐 Authentification avec le hook personnalisé
  const { userEmail, isAdmin } = useAdminAuth();

  // Filtres
  const [filters, setFilters] = useState({
    gameMode: "all", // "all", "buteurs", "passeurs"
    league: "all",   // "all", "ligue1", "epl", etc.
    year: "all"      // "all", "2024", "2023", etc.
  });

  // États pour les thèmes
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeAnswers, setThemeAnswers] = useState<ThemeAnswer[]>([]);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [newTheme, setNewTheme] = useState({ slug: "", title: "" });
  const [newAnswer, setNewAnswer] = useState({ answer: "" });

  // États pour les joueurs
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayer, setNewPlayer] = useState({ name: "" });


  // Charger les données seulement si admin
  useEffect(() => {
    if (isAdmin) {
      loadThemes();
      loadPlayers();
    }
  }, [isAdmin]);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setThemes(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les thèmes selon les critères
  const filteredThemes = themes.filter(theme => {
    const slug = theme.slug.toLowerCase();
    
    // Filtre par mode
    const modeMatch = filters.gameMode === "all" || slug.includes(filters.gameMode);
    
    // Filtre par ligue
    const leagueMatch = filters.league === "all" || slug.includes(filters.league);
    
    // Filtre par année
    const yearMatch = filters.year === "all" || slug.includes(filters.year);
    
    return modeMatch && leagueMatch && yearMatch;
  });

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setPlayers(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadThemeAnswers = async (themeId: string) => {
    try {
      const { data, error } = await supabase
        .from("theme_answers")
        .select("*")
        .eq("theme_id", themeId)
        .order("answer");
      
      if (error) throw error;
      setThemeAnswers(data || []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // CRUD Thèmes
  const createTheme = async () => {
    if (!newTheme.slug || !newTheme.title) return;
    
    try {
      const { data, error } = await supabase
        .from("themes")
        .insert([newTheme])
        .select()
        .single();
      
      if (error) throw error;
      setThemes([data, ...themes]);
      setNewTheme({ slug: "", title: "" });
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Générer le slug automatiquement basé sur les filtres
  const generateSlug = () => {
    if (filters.gameMode === "all" || filters.league === "all" || filters.year === "all") {
      alert("Veuillez sélectionner des valeurs spécifiques pour tous les filtres avant de générer le slug");
      return;
    }
    const slug = `${filters.gameMode}-${filters.league}-${filters.year}`;
    setNewTheme({ ...newTheme, slug });
  };

  const updateTheme = async (theme: Theme) => {
    try {
      const { error } = await supabase
        .from("themes")
        .update({ slug: theme.slug, title: theme.title })
        .eq("id", theme.id);
      
      if (error) throw error;
      setThemes(themes.map(t => t.id === theme.id ? theme : t));
      setEditingTheme(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteTheme = async (themeId: string) => {
    if (!window.confirm("Supprimer ce thème et toutes ses réponses ?")) return;
    
    try {
      const { error } = await supabase
        .from("themes")
        .delete()
        .eq("id", themeId);
      
      if (error) throw error;
      setThemes(themes.filter(t => t.id !== themeId));
    } catch (e: any) {
      setError(e.message);
    }
  };

  // CRUD Réponses de thème
  const addAnswer = async (themeId: string) => {
    if (!newAnswer.answer) return;
    
    const answerNorm = newAnswer.answer
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    
    try {
      const { data, error } = await supabase
        .from("theme_answers")
        .insert([{
          theme_id: themeId,
          answer: newAnswer.answer,
          answer_norm: answerNorm
        }])
        .select()
        .single();
      
      if (error) throw error;
      setThemeAnswers([...themeAnswers, data]);
      setNewAnswer({ answer: "" });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteAnswer = async (answerId: string) => {
    if (!window.confirm("Supprimer cette réponse ?")) return;
    
    try {
      const { error } = await supabase
        .from("theme_answers")
        .delete()
        .eq("id", answerId);
      
      if (error) throw error;
      setThemeAnswers(themeAnswers.filter(a => a.id !== answerId));
    } catch (e: any) {
      setError(e.message);
    }
  };

  // CRUD Joueurs
  const createPlayer = async () => {
    if (!newPlayer.name) return;
    
    try {
      const { data, error } = await supabase
        .from("players")
        .insert([newPlayer])
        .select()
        .single();
      
      if (error) throw error;
      setPlayers([...players, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPlayer({ name: "" });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const updatePlayer = async (player: Player) => {
    try {
      const { error } = await supabase
        .from("players")
        .update({ name: player.name })
        .eq("id", player.id);
      
      if (error) throw error;
      setPlayers(players.map(p => p.id === player.id ? player : p).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingPlayer(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deletePlayer = async (playerId: string) => {
    if (!window.confirm("Supprimer ce joueur ?")) return;
    
    try {
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", playerId);
      
      if (error) throw error;
      setPlayers(players.filter(p => p.id !== playerId));
    } catch (e: any) {
      setError(e.message);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-6">
          <h1 className="text-4xl font-black text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🛠️ PANEL ADMIN 🛠️
          </h1>
          {/* 🔐 Indicateur d'admin */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Super Admin : {userEmail}
            </div>
          </div>
          <p className="text-center text-gray-600 font-semibold">
            Gestion des thèmes et joueurs
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-4 mb-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab("themes")}
              className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
                activeTab === "themes"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🎯 Thèmes
            </button>
            <button
              onClick={() => setActiveTab("players")}
              className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
                activeTab === "players"
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ⚽ Joueurs
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-2xl mb-6 text-center font-bold">
            ❌ {error}
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === "themes" && (
          <div className="space-y-6">
            {/* Filtres */}
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
              <h2 className="text-2xl font-black text-purple-600 mb-4">🔍 Filtres</h2>
              <div className="grid grid-cols-3 gap-4">
                {/* Mode de jeu */}
                <div>
                  <label className="block text-sm font-bold text-purple-600 mb-2">🎯 Mode</label>
                  <select
                    value={filters.gameMode}
                    onChange={(e) => setFilters({ ...filters, gameMode: e.target.value })}
                    className="w-full border-2 border-purple-300 rounded-xl px-3 py-2 bg-white font-semibold text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  >
                    <option value="all">🔍 Tous les modes</option>
                    <option value="buteurs">⚽ Buteurs</option>
                    <option value="passeurs">🎯 Passeurs</option>
                  </select>
                </div>

                {/* Ligue */}
                <div>
                  <label className="block text-sm font-bold text-green-600 mb-2">🏆 Ligue</label>
                  <select
                    value={filters.league}
                    onChange={(e) => setFilters({ ...filters, league: e.target.value })}
                    className="w-full border-2 border-green-300 rounded-xl px-3 py-2 bg-white font-semibold text-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    <option value="all">🔍 Toutes les ligues</option>
                    <option value="ligue1">🇫🇷 Ligue 1</option>
                    <option value="epl">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</option>
                    <option value="laliga">🇪🇸 LaLiga</option>
                    <option value="seriea">🇮🇹 Serie A</option>
                    <option value="bundesliga">🇩🇪 Bundesliga</option>
                    <option value="ucl">⭐ Champions League</option>
                  </select>
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm font-bold text-orange-600 mb-2">📅 Année</label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="w-full border-2 border-orange-300 rounded-xl px-3 py-2 bg-white font-semibold text-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  >
                    <option value="all">🔍 Toutes les années</option>
                    <option value="2025">2024-2025</option>
                    <option value="2024">2023-2024</option>
                    <option value="2023">2022-2023</option>
                    <option value="2022">2021-2022</option>
                    <option value="2021">2020-2021</option>
                    <option value="2020">2019-2020</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600 font-semibold">
                  Affichage de {filteredThemes.length} thème(s) correspondant à : 
                  {filters.gameMode === "all" ? " Tous les modes" : ` ${filters.gameMode}`} - 
                  {filters.league === "all" ? " Toutes les ligues" : ` ${filters.league}`} - 
                  {filters.year === "all" ? " Toutes les années" : ` ${filters.year}`}
                </span>
              </div>
              
              {/* Boutons de filtrage rapide */}
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Filtres rapides :</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setFilters({ gameMode: "buteurs", league: "all", year: "all" })}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition-all"
                  >
                    ⚽ Tous les buteurs
                  </button>
                  <button
                    onClick={() => setFilters({ gameMode: "passeurs", league: "all", year: "all" })}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition-all"
                  >
                    🎯 Tous les passeurs
                  </button>
                  <button
                    onClick={() => setFilters({ gameMode: "all", league: "ligue1", year: "all" })}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200 transition-all"
                  >
                    🇫🇷 Toute la Ligue 1
                  </button>
                  <button
                    onClick={() => setFilters({ gameMode: "all", league: "epl", year: "all" })}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200 transition-all"
                  >
                    🏴󠁧󠁢󠁥󠁮󠁧󠁿 Toute la Premier League
                  </button>
                  <button
                    onClick={() => setFilters({ gameMode: "all", league: "all", year: "2024" })}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-200 transition-all"
                  >
                    📅 Tous 2023-2024
                  </button>
                  <button
                    onClick={() => setFilters({ gameMode: "all", league: "all", year: "all" })}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
                  >
                    🔍 Voir tout
                  </button>
                </div>
              </div>
            </div>

            {/* Créer un thème */}
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
              <h2 className="text-2xl font-black text-blue-600 mb-4">➕ Nouveau Thème</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Slug (ex: buteurs-ligue1-2024)"
                    value={newTheme.slug}
                    onChange={(e) => setNewTheme({ ...newTheme, slug: e.target.value })}
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={generateSlug}
                    className="mt-2 px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-lg hover:bg-purple-600 transition-all"
                  >
                    🔄 Générer depuis les filtres
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Titre (ex: Top 10 Buteurs Ligue 1 2024)"
                  value={newTheme.title}
                  onChange={(e) => setNewTheme({ ...newTheme, title: e.target.value })}
                  className="border-2 border-blue-300 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                onClick={createTheme}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Créer
              </button>
            </div>

            {/* Liste des thèmes */}
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
              <h2 className="text-2xl font-black text-blue-600 mb-4">
                📋 Thèmes existants ({filteredThemes.length})
              </h2>
              <div className="space-y-4">
                {filteredThemes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg font-semibold">Aucun thème trouvé</p>
                    <p className="text-sm">Ajustez les filtres ou créez un nouveau thème</p>
                  </div>
                ) : (
                  filteredThemes.map((theme) => (
                    <div key={theme.id} className="border-2 border-gray-200 rounded-2xl p-4">
                    {editingTheme?.id === theme.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editingTheme.slug}
                            onChange={(e) => setEditingTheme({ ...editingTheme, slug: e.target.value })}
                            className="border-2 border-blue-300 rounded-xl px-4 py-2"
                          />
                          <input
                            type="text"
                            value={editingTheme.title}
                            onChange={(e) => setEditingTheme({ ...editingTheme, title: e.target.value })}
                            className="border-2 border-blue-300 rounded-xl px-4 py-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateTheme(editingTheme)}
                            className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditingTheme(null)}
                            className="px-4 py-2 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{theme.title}</h3>
                            <p className="text-sm text-gray-600">Slug: {theme.slug}</p>
                            <p className="text-xs text-gray-500">
                              Créé le {new Date(theme.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingTheme(theme);
                                loadThemeAnswers(theme.id);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteTheme(theme.id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        
                        {/* Gestion des réponses */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-bold text-gray-700 mb-2">Réponses ({themeAnswers.length})</h4>
                          <div className="space-y-2">
                            {themeAnswers.map((answer) => (
                              <div key={answer.id} className="flex justify-between items-center bg-white p-2 rounded-lg">
                                <span className="font-semibold">{answer.answer}</span>
                                <button
                                  onClick={() => deleteAnswer(answer.id)}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ❌
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              placeholder="Nouvelle réponse"
                              value={newAnswer.answer}
                              onChange={(e) => setNewAnswer({ answer: e.target.value })}
                              className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-1"
                            />
                            <button
                              onClick={() => addAnswer(theme.id)}
                              className="px-4 py-1 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "players" && (
          <div className="space-y-6">
            {/* Créer un joueur */}
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
              <h2 className="text-2xl font-black text-green-600 mb-4">➕ Nouveau Joueur</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Nom du joueur"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ name: e.target.value })}
                  className="flex-1 border-2 border-green-300 rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                <button
                  onClick={createPlayer}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Liste des joueurs */}
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
              <h2 className="text-2xl font-black text-green-600 mb-4">⚽ Joueurs ({players.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="border-2 border-gray-200 rounded-2xl p-4">
                    {editingPlayer?.id === player.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingPlayer.name}
                          onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                          className="w-full border-2 border-green-300 rounded-xl px-3 py-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePlayer(editingPlayer)}
                            className="px-3 py-1 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingPlayer(null)}
                            className="px-3 py-1 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600"
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-800">{player.name}</h3>
                          <p className="text-xs text-gray-500">
                            Ajouté le {new Date(player.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingPlayer(player)}
                            className="px-2 py-1 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deletePlayer(player.id)}
                            className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// src/pages/Admin.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../Utils/auth";

// Helper function to get country flag emoji
const getCountryFlag = (nationality: string): string => {
  const countryFlags: { [key: string]: string } = {
    'France': '🇫🇷',
    'Brazil': '🇧🇷',
    'Argentina': '🇦🇷',
    'Spain': '🇪🇸',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'Portugal': '🇵🇹',
    'Netherlands': '🇳🇱',
    'Belgium': '🇧🇪',
    'Poland': '🇵🇱',
    'Croatia': '🇭🇷',
    'Norway': '🇳🇴',
    'Egypt': '🇪🇬',
    'South Korea': '🇰🇷',
    'Nigeria': '🇳🇬',
    'Canada': '🇨🇦',
    'Morocco': '🇲🇦',
    'Senegal': '🇸🇳',
    'Algeria': '🇩🇿',
    'Tunisia': '🇹🇳',
    'Ivory Coast': '🇨🇮',
    'Ghana': '🇬🇭',
    'Cameroon': '🇨🇲',
    'Mali': '🇲🇱',
    'Burkina Faso': '🇧🇫',
    'Guinea': '🇬🇳',
    'Togo': '🇹🇬',
    'Congo': '🇨🇬',
    'DR Congo': '🇨🇩',
    'Central African Republic': '🇨🇫',
    'Chad': '🇹🇩',
    'Niger': '🇳🇪',
    'Gabon': '🇬🇦',
    'Equatorial Guinea': '🇬🇶',
    'São Tomé and Príncipe': '🇸🇹',
    'Cape Verde': '🇨🇻',
    'Guinea-Bissau': '🇬🇼',
    'Liberia': '🇱🇷',
    'Sierra Leone': '🇸🇱',
    'Gambia': '🇬🇲',
    'Mauritania': '🇲🇷',
    'Mauritius': '🇲🇺',
    'Seychelles': '🇸🇨',
    'Comoros': '🇰🇲',
    'Madagascar': '🇲🇬',
    'Malawi': '🇲🇼',
    'Zambia': '🇿🇲',
    'Zimbabwe': '🇿🇼',
    'Botswana': '🇧🇼',
    'Namibia': '🇳🇦',
    'South Africa': '🇿🇦',
    'Lesotho': '🇱🇸',
    'Swaziland': '🇸🇿',
    'Mozambique': '🇲🇿',
    'Tanzania': '🇹🇿',
    'Kenya': '🇰🇪',
    'Uganda': '🇺🇬',
    'Rwanda': '🇷🇼',
    'Burundi': '🇧🇮',
    'Ethiopia': '🇪🇹',
    'Eritrea': '🇪🇷',
    'Djibouti': '🇩🇯',
    'Somalia': '🇸🇴',
    'Sudan': '🇸🇩',
    'South Sudan': '🇸🇸',
    'Libya': '🇱🇾',
    'Lebanon': '🇱🇧',
    'Syria': '🇸🇾',
    'Jordan': '🇯🇴',
    'Israel': '🇮🇱',
    'Palestine': '🇵🇸',
    'Saudi Arabia': '🇸🇦',
    'Yemen': '🇾🇪',
    'Oman': '🇴🇲',
    'UAE': '🇦🇪',
    'Qatar': '🇶🇦',
    'Bahrain': '🇧🇭',
    'Kuwait': '🇰🇼',
    'Iraq': '🇮🇶',
    'Iran': '🇮🇷',
    'Turkey': '🇹🇷',
    'Cyprus': '🇨🇾',
    'Greece': '🇬🇷',
    'Albania': '🇦🇱',
    'North Macedonia': '🇲🇰',
    'Bulgaria': '🇧🇬',
    'Romania': '🇷🇴',
    'Moldova': '🇲🇩',
    'Ukraine': '🇺🇦',
    'Belarus': '🇧🇾',
    'Lithuania': '🇱🇹',
    'Latvia': '🇱🇻',
    'Estonia': '🇪🇪',
    'Russia': '🇷🇺',
    'Georgia': '🇬🇪',
    'Armenia': '🇦🇲',
    'Azerbaijan': '🇦🇿',
    'Kazakhstan': '🇰🇿',
    'Uzbekistan': '🇺🇿',
    'Turkmenistan': '🇹🇲',
    'Tajikistan': '🇹🇯',
    'Kyrgyzstan': '🇰🇬',
    'Afghanistan': '🇦🇫',
    'Pakistan': '🇵🇰',
    'India': '🇮🇳',
    'Bangladesh': '🇧🇩',
    'Sri Lanka': '🇱🇰',
    'Maldives': '🇲🇻',
    'Nepal': '🇳🇵',
    'Bhutan': '🇧🇹',
    'Myanmar': '🇲🇲',
    'Thailand': '🇹🇭',
    'Laos': '🇱🇦',
    'Vietnam': '🇻🇳',
    'Cambodia': '🇰🇭',
    'Malaysia': '🇲🇾',
    'Singapore': '🇸🇬',
    'Indonesia': '🇮🇩',
    'Brunei': '🇧🇳',
    'Philippines': '🇵🇭',
    'Taiwan': '🇹🇼',
    'Hong Kong': '🇭🇰',
    'Macau': '🇲🇴',
    'China': '🇨🇳',
    'Mongolia': '🇲🇳',
    'North Korea': '🇰🇵',
    'Japan': '🇯🇵',
    'Australia': '🇦🇺',
    'New Zealand': '🇳🇿',
    'United States': '🇺🇸',
    'Mexico': '🇲🇽',
    'Guatemala': '🇬🇹',
    'Belize': '🇧🇿',
    'El Salvador': '🇸🇻',
    'Honduras': '🇭🇳',
    'Nicaragua': '🇳🇮',
    'Costa Rica': '🇨🇷',
    'Panama': '🇵🇦',
    'Cuba': '🇨🇺',
    'Jamaica': '🇯🇲',
    'Haiti': '🇭🇹',
    'Dominican Republic': '🇩🇴',
    'Puerto Rico': '🇵🇷',
    'Venezuela': '🇻🇪',
    'Colombia': '🇨🇴',
    'Guyana': '🇬🇾',
    'Suriname': '🇸🇷',
    'French Guiana': '🇬🇫',
    'Ecuador': '🇪🇨',
    'Peru': '🇵🇪',
    'Bolivia': '🇧🇴',
    'Paraguay': '🇵🇾',
    'Uruguay': '🇺🇾',
    'Chile': '🇨🇱'
  };
  
  return countryFlags[nationality] || '🏳️';
};

// Get list of available countries for dropdown
const getAvailableCountries = (): string[] => {
  return [
    'France', 'Brazil', 'Argentina', 'Spain', 'England', 'Germany', 'Italy', 'Portugal',
    'Netherlands', 'Belgium', 'Poland', 'Croatia', 'Norway', 'Egypt', 'South Korea',
    'Nigeria', 'Canada', 'Morocco', 'Senegal', 'Algeria', 'Tunisia', 'Ivory Coast',
    'Ghana', 'Cameroon', 'Mali', 'Burkina Faso', 'Guinea', 'Togo', 'Congo',
    'DR Congo', 'Central African Republic', 'Chad', 'Niger', 'Gabon',
    'Equatorial Guinea', 'São Tomé and Príncipe', 'Cape Verde', 'Guinea-Bissau',
    'Liberia', 'Sierra Leone', 'Gambia', 'Mauritania', 'Mauritius', 'Seychelles',
    'Comoros', 'Madagascar', 'Malawi', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia',
    'South Africa', 'Lesotho', 'Swaziland', 'Mozambique', 'Tanzania', 'Kenya',
    'Uganda', 'Rwanda', 'Burundi', 'Ethiopia', 'Eritrea', 'Djibouti', 'Somalia',
    'Sudan', 'South Sudan', 'Libya', 'Lebanon', 'Syria', 'Jordan', 'Israel',
    'Palestine', 'Saudi Arabia', 'Yemen', 'Oman', 'UAE', 'Qatar', 'Bahrain',
    'Kuwait', 'Iraq', 'Iran', 'Turkey', 'Cyprus', 'Greece', 'Albania',
    'North Macedonia', 'Bulgaria', 'Romania', 'Moldova', 'Ukraine', 'Belarus',
    'Lithuania', 'Latvia', 'Estonia', 'Russia', 'Georgia', 'Armenia', 'Azerbaijan',
    'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan',
    'Afghanistan', 'Pakistan', 'India', 'Bangladesh', 'Sri Lanka', 'Maldives',
    'Nepal', 'Bhutan', 'Myanmar', 'Thailand', 'Laos', 'Vietnam', 'Cambodia',
    'Malaysia', 'Singapore', 'Indonesia', 'Brunei', 'Philippines', 'Taiwan',
    'Hong Kong', 'Macau', 'China', 'Mongolia', 'North Korea', 'Japan',
    'Australia', 'New Zealand', 'United States', 'Mexico', 'Guatemala', 'Belize',
    'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba',
    'Jamaica', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'Venezuela',
    'Colombia', 'Guyana', 'Suriname', 'French Guiana', 'Ecuador', 'Peru',
    'Bolivia', 'Paraguay', 'Uruguay', 'Chile'
  ].sort();
};

// Helper function to get statistic unit based on theme
const getStatisticUnit = (themeSlug: string): string => {
  if (themeSlug.includes('buteurs')) return 'buts';
  if (themeSlug.includes('passeurs')) return 'passes';
  return 'pts';
};

// Helper function to get statistic value
const getStatisticValue = (answer: ThemeAnswer, themeSlug: string): number | null => {
  if (themeSlug.includes('buteurs')) return answer.goals || null;
  if (themeSlug.includes('passeurs')) return answer.assists || null;
  return answer.value || null;
};

// Helper function to get player suggestions based on search
const getPlayerSuggestions = (search: string, players: Player[], existingAnswers: ThemeAnswer[]): Player[] => {
  if (!search || search.length < 2) return [];
  
  const searchLower = search.toLowerCase();
  const existingAnswerNames = new Set(existingAnswers.map(a => a.answer_norm));
  
  return players
    .filter(player => {
      const playerNameLower = player.name.toLowerCase();
      // Normaliser le nom du joueur comme dans la base de données
      const playerNameNorm = player.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
      
      return playerNameLower.includes(searchLower) && 
             !existingAnswerNames.has(playerNameNorm);
    })
    .slice(0, 8); // Limiter à 8 suggestions
};

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
  nationality?: string;
  created_at: string;
};

type ThemeAnswer = {
  id: string;
  theme_id: string;
  answer: string;
  answer_norm: string;
  ranking?: number;
  goals?: number;
  assists?: number;
  value?: number;
  players?: {
    nationality?: string;
  };
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
  const [newPlayer, setNewPlayer] = useState({ name: "", nationality: "" });
  
  // États pour la recherche de pays
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [editingNationalitySearch, setEditingNationalitySearch] = useState("");
  
  // État pour la suppression
  const [deletingAnswers, setDeletingAnswers] = useState<Set<string>>(new Set());
  
  // État pour la recherche de réponses
  const [answerSearch, setAnswerSearch] = useState("");


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
      console.log("Chargement des réponses pour le thème:", themeId);
      
      // 1) Récupérer les réponses (d'abord essayer avec les nouvelles colonnes)
      let { data: rows, error } = await supabase
        .from("theme_answers")
        .select(`
          id,
          theme_id,
          answer,
          answer_norm,
          ranking,
          goals,
          assists,
          value
        `)
        .eq("theme_id", themeId);
      
      // Si erreur, essayer sans les nouvelles colonnes
      if (error) {
        console.warn("Erreur avec les nouvelles colonnes, tentative sans:", error);
        const { data: fallbackRows, error: fallbackError } = await supabase
          .from("theme_answers")
          .select(`
            id,
            theme_id,
            answer,
            answer_norm
          `)
          .eq("theme_id", themeId);
        
        if (fallbackError) {
          console.error("Erreur lors de la récupération des réponses:", fallbackError);
          throw fallbackError;
        }
        // Normaliser les données pour avoir le même type
        rows = fallbackRows?.map((row: any) => ({
          ...row,
          ranking: null,
          goals: null,
          assists: null,
          value: null
        }));
      } else {
        // Trier par ranking si disponible
        if (rows) {
          rows = rows.sort((a: any, b: any) => (a.ranking || 0) - (b.ranking || 0));
        }
      }

      console.log("Réponses récupérées:", rows?.length || 0);

      // 2) Récupérer les nationalités des joueurs
      const { data: playersData, error: playersDataErr } = await supabase
        .from("players")
        .select("name, nationality");

      if (playersDataErr) {
        console.error("Erreur lors de la récupération des nationalités:", playersDataErr);
      }

      // 3) Créer un map name -> nationality
      const nationalityMap = new Map<string, string>();
      (playersData ?? []).forEach((p: any) => {
        if (p.name && p.nationality) {
          const normalizedName = p.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
          nationalityMap.set(normalizedName, p.nationality);
        }
      });

      // 4) Ajouter les nationalités aux réponses
      const answersWithNationality = (rows ?? []).map((r: any) => ({
        ...r,
        players: {
          nationality: nationalityMap.get(r.answer_norm) || null
        }
      }));

      console.log("Réponses avec nationalités:", answersWithNationality.length);
      setThemeAnswers(answersWithNationality);
    } catch (e: any) {
      console.error("Erreur dans loadThemeAnswers:", e);
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
    
    // Vérifier si le joueur existe déjà dans le thème (dans l'état local ET en base)
    const existingAnswer = themeAnswers.find(a => a.answer_norm === answerNorm);
    if (existingAnswer) {
      setError(`❌ Ce joueur existe déjà dans ce thème (position ${existingAnswer.ranking || 'N/A'})`);
      return;
    }
    
    try {
      console.log("Ajout d'une nouvelle réponse:", newAnswer.answer);
      
      // Double vérification en base de données pour éviter les race conditions
      const { data: existingDbAnswer, error: checkError } = await supabase
        .from("theme_answers")
        .select("id, ranking")
        .eq("theme_id", themeId)
        .eq("answer_norm", answerNorm)
        .maybeSingle();
      
      if (existingDbAnswer) {
        setError(`❌ Ce joueur existe déjà dans ce thème (position ${existingDbAnswer.ranking || 'N/A'}). Veuillez rafraîchir la page.`);
        return;
      }
      
      // 1. Calculer le bon ranking (dernier + 1)
      const maxRanking = themeAnswers.length > 0 ? Math.max(...themeAnswers.map(a => a.ranking || 0)) : 0;
      const newRanking = maxRanking + 1;
      
      // 2. Récupérer les statistiques du joueur depuis la base de données
      let playerStats = { goals: null, assists: null, value: null, nationality: null };
      
      try {
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("goals, assists, value, nationality")
          .eq("name", newAnswer.answer)
          .single();
        
        if (!playerError && playerData) {
          playerStats = {
            goals: playerData.goals,
            assists: playerData.assists,
            value: playerData.value,
            nationality: playerData.nationality
          };
          console.log("Statistiques joueur récupérées:", playerStats);
        }
      } catch (e) {
        console.log("Pas de statistiques trouvées pour ce joueur, utilisation des valeurs par défaut");
      }
      
      // 3. Insérer avec toutes les colonnes en une seule fois
      const { data, error } = await supabase
        .from("theme_answers")
        .insert([{
          theme_id: themeId,
          answer: newAnswer.answer,
          answer_norm: answerNorm,
          ranking: newRanking,
          goals: playerStats.goals,
          assists: playerStats.assists,
          value: playerStats.value
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Erreur lors de l'insertion:", error);
        
        // Si c'est une erreur RLS, afficher un message plus clair
        if (error.message.includes("row-level security")) {
          setError("❌ Problème de permissions. Veuillez vérifier les politiques RLS dans Supabase ou contacter l'administrateur.");
          return;
        }
        
        // Si c'est une erreur de contrainte d'unicité
        if (error.message.includes("duplicate key value violates unique constraint")) {
          setError("❌ Ce joueur existe déjà dans ce thème. Veuillez rafraîchir la page et réessayer.");
          return;
        }
        
        throw error;
      }
      
      console.log("Réponse insérée avec succès:", data.id);
      
      // 4. Mettre à jour l'état local avec les vraies données
      const newAnswerWithStats = {
        ...data,
        players: {
          nationality: playerStats.nationality
        }
      };
      
      setThemeAnswers(prevAnswers => [...prevAnswers, newAnswerWithStats]);
      
      // Nettoyer les champs
      setNewAnswer({ answer: "" });
      setAnswerSearch("");
      
    } catch (e: any) {
      console.error("Erreur lors de l'ajout de la réponse:", e);
      setError(`❌ Erreur: ${e.message}`);
    }
  };

  const deleteAnswer = async (answerId: string, themeId: string) => {
    if (!window.confirm("Supprimer cette réponse ?")) return;
    
    // Vérifier si la suppression est déjà en cours
    if (deletingAnswers.has(answerId)) {
      console.log("Suppression déjà en cours pour:", answerId);
      return;
    }
    
    // Vérifier si la réponse existe encore dans l'état local
    const answerExists = themeAnswers.find(a => a.id === answerId);
    if (!answerExists) {
      console.log("Réponse déjà supprimée ou inexistante:", answerId);
      return;
    }
    
    // Marquer comme en cours de suppression
    setDeletingAnswers(prev => new Set(prev).add(answerId));
    
    try {
      console.log("Suppression de la réponse:", answerId);
      
      const { error } = await supabase
        .from("theme_answers")
        .delete()
        .eq("id", answerId);
      
      if (error) {
        console.error("Erreur Supabase lors de la suppression:", error);
        throw error;
      }
      
      console.log("Suppression réussie en base de données");
      
      // Mettre à jour l'état local immédiatement avec une fonction pour éviter les race conditions
      setThemeAnswers(prevAnswers => {
        const updatedAnswers = prevAnswers.filter(a => a.id !== answerId);
        console.log("État local mis à jour. Réponses restantes:", updatedAnswers.length);
        return updatedAnswers;
      });
      
    } catch (e: any) {
      console.error("Erreur lors de la suppression:", e);
      setError(e.message);
    } finally {
      // Retirer de la liste des suppressions en cours
      setDeletingAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(answerId);
        return newSet;
      });
    }
  };

  // CRUD Joueurs
  const createPlayer = async () => {
    if (!newPlayer.name) return;
    
    try {
      const { data, error } = await supabase
        .from("players")
        .insert([{
          name: newPlayer.name,
          nationality: newPlayer.nationality || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      setPlayers([...players, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPlayer({ name: "", nationality: "" });
      setNationalitySearch("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const updatePlayer = async (player: Player) => {
    try {
      const { error } = await supabase
        .from("players")
        .update({ name: player.name, nationality: player.nationality || null })
        .eq("id", player.id);
      
      if (error) throw error;
      setPlayers(players.map(p => p.id === player.id ? player : p).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingPlayer(null);
      setEditingNationalitySearch("");
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
    <div className="min-h-screen bg-soccer-pattern p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
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
          <div className="bg-red-500 text-white p-4 rounded-2xl mb-6">
            <div className="text-center font-bold mb-2">
              ❌ {error}
            </div>
            {error.includes("politiques RLS") && (
              <div className="text-sm bg-red-600 p-3 rounded-lg mt-2">
                <p className="font-semibold mb-2">💡 Solution :</p>
                <ol className="text-left space-y-1">
                  <li>1. Allez dans l'interface Supabase</li>
                  <li>2. Table Editor → theme_answers</li>
                  <li>3. Settings → RLS Policies</li>
                  <li>4. Créez une politique permettant l'INSERT pour les utilisateurs authentifiés</li>
                  <li>5. Ou temporairement désactivez RLS sur cette table</li>
                </ol>
              </div>
            )}
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
                            {themeAnswers.map((answer, index) => {
                              const flag = getCountryFlag(answer.players?.nationality || '');
                              const statValue = getStatisticValue(answer, theme.slug);
                              const statUnit = getStatisticUnit(theme.slug);
                              
                              return (
                                <div key={answer.id} className="flex justify-between items-center bg-white p-3 rounded-lg border-l-4 border-blue-400">
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-lg font-bold text-blue-600 min-w-[2rem]">
                                      {answer.ranking || (index + 1)}.
                                    </span>
                                    <span className="text-lg">
                                      {flag}
                                    </span>
                                    <span className="font-semibold text-gray-800 flex-1">
                                      {answer.answer}
                                    </span>
                                    {statValue && (
                                      <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {statValue} {statUnit}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteAnswer(answer.id, theme.id)}
                                    disabled={deletingAnswers.has(answer.id)}
                                    className={`font-bold ml-2 ${
                                      deletingAnswers.has(answer.id)
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-red-500 hover:text-red-700"
                                    }`}
                                  >
                                    {deletingAnswers.has(answer.id) ? "⏳" : "❌"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder="Rechercher un joueur..."
                                value={answerSearch}
                                onChange={(e) => setAnswerSearch(e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-lg px-3 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              />
                              {answerSearch && getPlayerSuggestions(answerSearch, players, themeAnswers).length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                  {getPlayerSuggestions(answerSearch, players, themeAnswers).map((player) => (
                                    <div
                                      key={player.id}
                                      onClick={() => {
                                        setNewAnswer({ answer: player.name });
                                        setAnswerSearch("");
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                      <span className="text-lg">{getCountryFlag(player.nationality || '')}</span>
                                      <span className="font-semibold">{player.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Ou saisir manuellement"
                              value={newAnswer.answer}
                              onChange={(e) => setNewAnswer({ answer: e.target.value })}
                              className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-1 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            />
                            <button
                              onClick={() => addAnswer(theme.id)}
                              disabled={!newAnswer.answer}
                              className="px-4 py-1 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Ajouter
                            </button>
                          </div>
                          {newAnswer.answer && (
                            <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                              <span className="text-lg">
                                {(() => {
                                  const player = players.find(p => p.name.toLowerCase() === newAnswer.answer.toLowerCase());
                                  return player ? getCountryFlag(player.nationality || '') : '👤';
                                })()}
                              </span>
                              <span className="font-semibold text-blue-700">{newAnswer.answer}</span>
                              <button
                                onClick={() => {
                                  setNewAnswer({ answer: "" });
                                  setAnswerSearch("");
                                }}
                                className="ml-auto text-red-500 hover:text-red-700 font-bold text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nom du joueur"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="border-2 border-green-300 rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un pays..."
                    value={nationalitySearch}
                    onChange={(e) => setNationalitySearch(e.target.value)}
                    className="w-full border-2 border-green-300 rounded-xl px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                  {nationalitySearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-green-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {getAvailableCountries()
                        .filter(country => 
                          country.toLowerCase().includes(nationalitySearch.toLowerCase())
                        )
                        .slice(0, 10)
                        .map(country => (
                          <div
                            key={country}
                            onClick={() => {
                              setNewPlayer({ ...newPlayer, nationality: country });
                              setNationalitySearch("");
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-lg">{getCountryFlag(country)}</span>
                            <span className="font-semibold">{country}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              {newPlayer.nationality && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <span className="text-lg">{getCountryFlag(newPlayer.nationality)}</span>
                  <span className="font-semibold text-green-700">{newPlayer.nationality}</span>
                  <button
                    onClick={() => {
                      setNewPlayer({ ...newPlayer, nationality: "" });
                      setNationalitySearch("");
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                onClick={createPlayer}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
              >
                Ajouter
              </button>
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
                          placeholder="Nom du joueur"
                          value={editingPlayer.name}
                          onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                          className="w-full border-2 border-green-300 rounded-xl px-3 py-2"
                        />
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Rechercher un pays..."
                            value={editingNationalitySearch}
                            onChange={(e) => setEditingNationalitySearch(e.target.value)}
                            className="w-full border-2 border-green-300 rounded-xl px-3 py-2"
                          />
                          {editingNationalitySearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-green-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {getAvailableCountries()
                                .filter(country => 
                                  country.toLowerCase().includes(editingNationalitySearch.toLowerCase())
                                )
                                .slice(0, 10)
                                .map(country => (
                                  <div
                                    key={country}
                                    onClick={() => {
                                      setEditingPlayer({ ...editingPlayer, nationality: country });
                                      setEditingNationalitySearch("");
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  >
                                    <span className="text-lg">{getCountryFlag(country)}</span>
                                    <span className="font-semibold text-sm">{country}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        {editingPlayer.nationality && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <span className="text-lg">{getCountryFlag(editingPlayer.nationality)}</span>
                            <span className="font-semibold text-green-700 text-sm">{editingPlayer.nationality}</span>
                            <button
                              onClick={() => {
                                setEditingPlayer({ ...editingPlayer, nationality: "" });
                                setEditingNationalitySearch("");
                              }}
                              className="ml-auto text-red-500 hover:text-red-700 font-bold text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePlayer(editingPlayer)}
                            className="px-3 py-1 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingPlayer(null);
                              setEditingNationalitySearch("");
                            }}
                            className="px-3 py-1 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600"
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{player.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {player.nationality ? (
                              <>
                                <span className="text-lg">
                                  {getCountryFlag(player.nationality)}
                                </span>
                                <span className="text-sm text-gray-600 font-semibold">
                                  {player.nationality}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Aucune nationalité
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
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

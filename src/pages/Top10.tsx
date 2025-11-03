// src/pages/Top10.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AutocompleteInput } from "../components/AutocompleteInput";
import { supabase } from "../lib/supabase";
import { CerisesService } from "../services/cerises.service";
import { MultiplayerChallengesService } from "../services/multiplayer-challenges.service";
import { useChallenge } from "../hooks/useChallenge";

// Fonction utilitaire pour obtenir l'utilisateur connecté via API
// const getCurrentUser = async () => {
//   const { data: { user }, error } = await supabase.auth.getUser();
//   if (error || !user) {
//     throw new Error('User not authenticated');
//   }
//   return user;
// };

// --- Types DB ---
// type ThemeRow = { id: string; slug: string; title: string };
type ThemeAnswerRow = { 
  answer: string; 
  answer_norm: string;
  ranking?: number;
  points?: number;
  goals?: number;
  assists?: number;
  value?: number;
  players?: {
    nationality?: string;
  };
};
type LeaderboardRow = { final_score: number; answers_count: number; ended_at: string };

type Feedback = { type: "ok" | "error" | "info"; msg: string };

// --- Helper: normalisation ---
function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// --- Helper: Drapeaux ---
const COUNTRY_FLAGS: Record<string, string> = {
  // Codes à 3 lettres
  'FRA': '🇫🇷', 'ESP': '🇪🇸', 'BRA': '🇧🇷', 'ARG': '🇦🇷',
  'GER': '🇩🇪', 'ENG': '🇬🇧', 'POR': '🇵🇹', 'ITA': '🇮🇹',
  'NED': '🇳🇱', 'NLD': '🇳🇱', 'BEL': '🇧🇪', 'NOR': '🇳🇴', 'EGY': '🇪🇬',
  'NGA': '🇳🇬', 'CAN': '🇨🇦', 'USA': '🇺🇸', 'CHI': '🇨🇱',
  'UKR': '🇺🇦', 'POL': '🇵🇱', 'SRB': '🇷🇸', 'GUI': '🇬🇳',
  'KOR': '🇰🇷', 'SWE': '🇸🇪', 'CRO': '🇭🇷', 'DEN': '🇩🇰', 'TUR': '🇹🇷',
  // Noms complets (pour compatibilité avec la BDD)
  'FRANCE': '🇫🇷', 'SPAIN': '🇪🇸', 'BRAZIL': '🇧🇷', 'ARGENTINA': '🇦🇷',
  'GERMANY': '🇩🇪', 'ENGLAND': '🇬🇧', 'PORTUGAL': '🇵🇹', 'ITALY': '🇮🇹',
  'NETHERLANDS': '🇳🇱', 'BELGIUM': '🇧🇪', 'NORWAY': '🇳🇴', 'EGYPT': '🇪🇬',
  'NIGERIA': '🇳🇬', 'CANADA': '🇨🇦', 'CHILE': '🇨🇱',
  'UKRAINE': '🇺🇦', 'POLAND': '🇵🇱', 'SERBIA': '🇷🇸', 'GUINEA': '🇬🇳',
  'SOUTH KOREA': '🇰🇷', 'KOREA': '🇰🇷', 'SWEDEN': '🇸🇪', 'CROATIA': '🇭🇷', 'DENMARK': '🇩🇰',
  'MOROCCO': '🇲🇦', 'SENEGAL': '🇸🇳', 'IVORY COAST': '🇨🇮', 'CAMEROON': '🇨🇲',
  'ALGERIA': '🇩🇿', 'TUNISIA': '🇹🇳', 'MALI': '🇲🇱', 'BURKINA FASO': '🇧🇫',
  'URUGUAY': '🇺🇾', 'COLOMBIA': '🇨🇴', 'ECUADOR': '🇪🇨', 'PARAGUAY': '🇵🇾',
  'PERU': '🇵🇪', 'VENEZUELA': '🇻🇪', 'BOLIVIA': '🇧🇴',
  'MEXICO': '🇲🇽', 'COSTA RICA': '🇨🇷', 'JAPAN': '🇯🇵', 'AUSTRALIA': '🇦🇺',
  'IRAN': '🇮🇷', 'SAUDI ARABIA': '🇸🇦', 'GHANA': '🇬🇭', 'SWITZERLAND': '🇨🇭',
  'AUSTRIA': '🇦🇹', 'CZECH REPUBLIC': '🇨🇿', 'TURKEY': '🇹🇷', 'RUSSIA': '🇷🇺',
  'SCOTLAND': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'WALES': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'NORTHERN IRELAND': '🇬🇧',
  'REPUBLIC OF IRELAND': '🇮🇪', 'IRELAND': '🇮🇪', 'SLOVAKIA': '🇸🇰',
  'SLOVENIA': '🇸🇮', 'ROMANIA': '🇷🇴', 'HUNGARY': '🇭🇺', 'GREECE': '🇬🇷',
  'BOSNIA': '🇧🇦', 'BOSNIA AND HERZEGOVINA': '🇧🇦', 'ALBANIA': '🇦🇱',
  'NORTH MACEDONIA': '🇲🇰', 'MACEDONIA': '🇲🇰', 'MONTENEGRO': '🇲🇪',
  'FINLAND': '🇫🇮', 'ICELAND': '🇮🇸', 'LUXEMBOURG': '🇱🇺',
  'CAPE VERDE': '🇨🇻', 'GABON': '🇬🇦', 'CONGO': '🇨🇬', 'BENIN': '🇧🇯',
  'TOGO': '🇹🇬', 'ZIMBABWE': '🇿🇼', 'SOUTH AFRICA': '🇿🇦',
  'COMOROS': '🇰🇲', 'EQUATORIAL GUINEA': '🇬🇶', 'GAMBIA': '🇬🇲',
  // Noms en français (avec accents)
  'BRÉSIL': '🇧🇷', 'CAMEROUN': '🇨🇲', 'ALGÉRIE': '🇩🇿',
  'ESPAGNE': '🇪🇸', 'ALLEMAGNE': '🇩🇪', 'ANGLETERRE': '🇬🇧',
  'ITALIE': '🇮🇹', 'PAYS-BAS': '🇳🇱', 'BELGIQUE': '🇧🇪',
  'MAROC': '🇲🇦', 'SÉNÉGAL': '🇸🇳', "CÔTE D'IVOIRE": '🇨🇮',
  'TUNISIE': '🇹🇳', 'ÉGYPTE': '🇪🇬', 'NIGÉRIA': '🇳🇬',
  'TURQUIE': '🇹🇷',
};

function getCountryFlag(countryCode: string | null | undefined): string {
  if (!countryCode) return '🏳️';
  const normalized = countryCode.trim().toUpperCase();
  return COUNTRY_FLAGS[normalized] || '🏳️';
}


export function Top10() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const gameMode = searchParams.get('mode') || 'solo';
  const playersParam = searchParams.get('players') || '';
  
  // Récupérer les infos du défi depuis le state de navigation
  const navigationState = location.state as { challengeId?: string; questionId?: string; isChallengeMode?: boolean } | null;
  const existingChallengeId = navigationState?.challengeId;
  const forcedQuestionId = navigationState?.questionId;
  const isPlayingExistingChallenge = navigationState?.isChallengeMode || false;
  
  // Extraire les IDs des joueurs à défier
  const challengedPlayerIds = playersParam ? playersParam.split(',').filter(id => id.trim()) : [];
  const isMultiplayerChallenge = gameMode === 'multijoueur' && challengedPlayerIds.length > 0;

  // Challenge hook
  const { challenge, isChallengeMode, completeChallenge } = useChallenge();

  // Sélecteur de question
  const [selectedQuestion, setSelectedQuestion] = useState<string>(forcedQuestionId || "");
  const [availableQuestions, setAvailableQuestions] = useState<Array<{id: string, title: string}>>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  
  // État pour suivre si les défis ont été créés
  const [createdChallenges, setCreatedChallenges] = useState<string[]>([]);
  const challengesCreatedRef = useRef(false);
  useEffect(() => {
    // Essayer d'abord l'API Supabase
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) {
        setUserId(data.session.user.id);
      } else {
        // Fallback vers localStorage
        const storedToken = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
        if (storedToken) {
          try {
            const tokenData = JSON.parse(storedToken);
            if (tokenData.user?.id) {
              setUserId(tokenData.user.id);
              console.log("🔍 userId récupéré depuis localStorage:", tokenData.user.id);
            }
          } catch (err) {
            console.error("Erreur parsing localStorage pour userId:", err);
          }
        }
      }
    });
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Services
  const cerisesService = new CerisesService();
  const multiplayerChallengesService = new MultiplayerChallengesService();
  
  // Cerises state
  const [userCerises, setUserCerises] = useState<number>(0);
  const [cerisesEarned, setCerisesEarned] = useState<number>(0);
  const cerisesAddedRef = useRef(false); // Flag pour éviter les ajouts multiples

  // UI / Game state
  const [title, setTitle] = useState("Top 10");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Données thème
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [validSet, setValidSet] = useState<Set<string>>(new Set());
  const [allValidAnswers, setAllValidAnswers] = useState<ThemeAnswerRow[]>([]);
  
  // 🎯 Système de prévisualisation avec flou
  const [foundAnswers, setFoundAnswers] = useState<Set<string>>(new Set());

  // Partie + leaderboard
  const [gameId, setGameId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  const gameOver = timeLeft <= 0 || answers.length >= 10;
  const replayBtnRef = useRef<HTMLButtonElement | null>(null);

  // Load user cerises
  useEffect(() => {
    if (!userId) return;
    
    const loadUserCerises = async () => {
      try {
        const balance = await cerisesService.getUserCerises(userId);
        setUserCerises(balance);
      } catch (error) {
        console.error('Failed to load user cerises:', error);
      }
    };
    
    loadUserCerises();
  }, [userId]);

  // Créer automatiquement UN défi multi-joueurs
  useEffect(() => {
    if (!userId || !isMultiplayerChallenge || challengesCreatedRef.current || challengedPlayerIds.length === 0) {
      return;
    }

    // Marquer immédiatement pour éviter les créations multiples
    challengesCreatedRef.current = true;

    const createMultiplayerChallenge = async () => {
      console.log('🎯 Création d\'un défi multi-joueurs avec:', challengedPlayerIds);
      
      try {
        // Date d'expiration : 48 heures à partir de maintenant
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        
        // Créer UN SEUL défi avec tous les participants
        const challenge = await multiplayerChallengesService.createChallenge(
          userId,
          challengedPlayerIds,  // Tableau de tous les IDs des participants
          'TOP10',
          expiresAt,
          {
            questionId: selectedQuestion || undefined,
            minParticipants: 2,
            maxParticipants: challengedPlayerIds.length + 1 // créateur + invités
          }
        );
        
        setCreatedChallenges([challenge.id]);
        
        console.log(`🎉 Défi multi-joueurs créé avec succès !`);
        console.log(`   ID: ${challenge.id}`);
        console.log(`   Participants: ${challenge.participants?.length || 0}`);
        
        // Afficher les participants
        challenge.participants?.forEach(p => {
          console.log(`   - ${p.user?.pseudo || 'Inconnu'} (${p.status})`);
        });
      } catch (error) {
        console.error('❌ Erreur lors de la création du défi:', error);
        // En cas d'erreur, réinitialiser le flag pour permettre une nouvelle tentative
        challengesCreatedRef.current = false;
      }
    };

    createMultiplayerChallenge();
  }, [userId, isMultiplayerChallenge, challengedPlayerIds.length, selectedQuestion]);

  // Load available questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError(null);
        console.log("Chargement des questions disponibles...");
        
        console.log("Requête vers l'API...");
        console.log("🔍 Étape 1: Vérification auth...");
        
        // Vérifier l'état de l'authentification - utiliser localStorage directement
        console.log("🔍 Étape 2: Vérification auth via localStorage...");
        
        let user = null;
        const storedToken = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
        if (storedToken) {
          try {
            const tokenData = JSON.parse(storedToken);
            console.log("🔍 Token data:", tokenData);
            
            if (tokenData.currentSession?.user) {
              user = tokenData.currentSession.user;
              console.log("🔍 Utilisateur trouvé dans localStorage:", user.id);
            } else if (tokenData.user) {
              user = tokenData.user;
              console.log("🔍 Utilisateur trouvé dans localStorage (format alternatif):", user.id);
            }
          } catch (parseErr) {
            console.error("Erreur parsing localStorage:", parseErr);
          }
        }
        
        if (!user) {
          console.error("Utilisateur non trouvé dans localStorage");
          setQuestionsError("Vous devez être connecté pour accéder aux questions");
          setQuestionsLoading(false);
          return;
        }
        
        console.log("🔍 Étape 4: Appel API questions via REST (mode anonyme)...");
        
        // Utiliser l'API REST en mode anonyme (sans authentification)
        const headers = {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        };

        const response = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/questions?select=*&limit=10`, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const allQuestions = await response.json();
          
        console.log("🔍 Étape 5: Résultat API questions:", { allQuestions: allQuestions?.length });

        if (allQuestions) {
          console.log("Toutes les questions trouvées:", allQuestions);
          
          // Filtrer les questions TOP 10 côté client
          const top10Questions = allQuestions.filter((q: any) => {
            // Vérifier game_type_id
            if (q.game_type_id === 1) return true;
            
            // Vérifier game_type string
            if (q.game_type === 'top10' || q.game_type === 'TOP10') return true;
            
            // Vérifier le contenu (en s'assurant que c'est une string)
            if (q.content && typeof q.content === 'string' && q.content.toLowerCase().includes('top 10')) return true;
            if (q.title && typeof q.title === 'string' && q.title.toLowerCase().includes('top 10')) return true;
            
            return false;
          });
          
          console.log("Questions TOP 10 filtrées:", top10Questions);
          
          // Adapter les données selon la structure réelle de la table
          const adaptedQuestions = top10Questions.map((q: any) => {
            // Utiliser content.question comme titre principal
            let title = `Question ${q.id}`; // Fallback par défaut
            
            if (q.content && q.content.question && typeof q.content.question === 'string') {
              title = q.content.question;
            } else if (q.content && typeof q.content === 'string') {
              title = q.content;
            } else if (q.title && typeof q.title === 'string') {
              title = q.title;
            } else if (q.name && typeof q.name === 'string') {
              title = q.name;
            }
            
            return {
              id: q.id,
              title: title
            };
          });
          
          console.log("Questions adaptées:", adaptedQuestions);
          setAvailableQuestions(adaptedQuestions);
          if (adaptedQuestions.length > 0 && !selectedQuestion) {
            setSelectedQuestion(adaptedQuestions[0].id);
          }
          setQuestionsLoading(false);
        }
      } catch (error: any) {
        console.error('Erreur chargement questions:', error);
        console.error('Détails de l\'erreur:', error);
        if (error.message.includes('Session expired') || error.message.includes('not authenticated')) {
          setQuestionsError("Session expirée, veuillez vous reconnecter");
        } else {
          setQuestionsError(`Erreur de chargement: ${error.message}`);
        }
        setQuestionsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Timer
  useEffect(() => {
    if (loading || gameOver || !gameStarted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        // Si le temps arrive à 1 (va passer à 0), ajouter les cerises
        if (t === 1 && userId && !cerisesAddedRef.current) {
          cerisesAddedRef.current = true;
          const cerisesToAdd = Math.max(1, score);
          console.log(`⏱️ Temps écoulé ! Ajout de ${cerisesToAdd} cerises`);
          
          cerisesService.addCerises(userId, cerisesToAdd)
            .then((newBalance) => {
              // addCerises retourne déjà le nouveau solde, pas besoin de refaire getUserCerises
              console.log(`💰 Nouveau solde cerises: ${newBalance}`);
              setCerisesEarned(cerisesToAdd);
              
              // Notifier le header de la mise à jour AVANT setUserCerises
              console.log('📢 Émission de l\'événement cerises-updated:', { balance: newBalance, added: cerisesToAdd });
              const event = new CustomEvent('cerises-updated', { 
                detail: { balance: newBalance, added: cerisesToAdd } 
              });
              window.dispatchEvent(event);
              console.log('✅ Événement cerises-updated émis');
              
              // Mettre à jour l'état local en dernier
              setUserCerises(newBalance);
            })
            .catch((error) => {
              console.error('❌ Erreur ajout cerises:', error);
              cerisesAddedRef.current = false;
            });
        }
        return t > 0 ? t - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [loading, gameOver, gameStarted, userId, score, cerisesService]);

  // 🎯 Déflouter tous les joueurs à la fin de la partie
  useEffect(() => {
    if (gameOver && allValidAnswers.length > 0) {
      // Ajouter tous les joueurs à foundAnswers pour les déflouter
      const allAnswers = allValidAnswers.map(answer => answer.answer_norm);
      setFoundAnswers(new Set(allAnswers));
    }
  }, [gameOver, allValidAnswers]);

  // Chargement thème basé sur la question sélectionnée
  useEffect(() => {
    if (!gameStarted || !selectedQuestion) return;
    
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);

        // Utiliser l'API REST en mode anonyme
        console.log("Récupération de la question sélectionnée:", selectedQuestion);
        
        const headers = {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        };
        
        // 1) Récupérer la question sélectionnée
        const questionResponse = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/questions?select=*&id=eq.${selectedQuestion}`, {
          method: 'GET',
          headers
        });

        if (!questionResponse.ok) {
          throw new Error(`HTTP ${questionResponse.status}: ${questionResponse.statusText}`);
        }

        const questions = await questionResponse.json();
        if (!questions || questions.length === 0) {
          throw new Error('Question sélectionnée introuvable');
        }

        const question = questions[0];
        setTitle(question.title);
        console.log("Question trouvée:", question);
        if (cancelled) return;

        // 2) Récupérer les réponses de cette question avec jointure sur players
        const answersResponse = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/question_answers?select=*,players(name,nationality)&question_id=eq.${question.id}&order=ranking.asc`, {
          method: 'GET',
          headers
        });

        if (!answersResponse.ok) {
          throw new Error(`HTTP ${answersResponse.status}: ${answersResponse.statusText}`);
        }

        const answersData = await answersResponse.json();
        if (!answersData || answersData.length === 0) {
          throw new Error('Aucune réponse trouvée pour cette question');
        }

        console.log("Réponses trouvées:", answersData.length);
        console.log("Structure des réponses:", answersData[0]); // Voir la structure de la première réponse
        console.log("Propriétés de la première réponse:", Object.keys(answersData[0])); // Voir les clés disponibles
        console.log("Toutes les réponses:", answersData); // Voir toutes les réponses
        
        // 🔍 DEBUG - Vérifier si la relation players existe
        console.log("🔍 DEBUG NATIONALITÉ - Première réponse complète:", JSON.stringify(answersData[0], null, 2));
        console.log("🔍 DEBUG NATIONALITÉ - players dans première réponse:", answersData[0].players);
        console.log("🔍 DEBUG NATIONALITÉ - nationality:", answersData[0].players?.nationality);

        // Traitement des réponses
        const list = answersData.map((r: any, index: number) => {
          const playerName = r.players?.name || 'Joueur inconnu';
          const result = {
            answer: playerName,
            answer_norm: normalize(playerName), // ✅ Utiliser la même fonction normalize
            ranking: r.ranking,
            points: r.points || 0,
            players: {
              nationality: r.players?.nationality || 'Unknown'
            }
          };
          
          if (index === 0) {
            console.log(`🔍 DEBUG NATIONALITÉ - Transformation réponse 1:`, {
              input: r,
              output: result,
              hasPlayers: !!r.players,
              hasNationality: !!r.players?.nationality
            });
          }
          
          return result;
        }) as ThemeAnswerRow[];
        
        console.log("Réponses traitées:", list); // Voir les réponses après traitement
        console.log("🔍 DEBUG NATIONALITÉ - Première réponse traitée:", list[0]); // Voir la première réponse traitée
        console.log("🔍 DEBUG NATIONALITÉ - Flag qui sera affiché:", getCountryFlag(list[0]?.players?.nationality));
        console.log("allValidAnswers sera défini avec:", list.length, "réponses");
        setValidSet(new Set(list.map((r) => r.answer_norm)));
        setAllValidAnswers(list); // Stocker toutes les réponses pour le récapitulatif

        // 3) Suggestions = tous les joueurs de la base via API REST
        try {
          const playersResponse = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/players?select=name&order=name&limit=1000`, {
            method: 'GET',
            headers
          });

          if (playersResponse.ok) {
            const playersData = await playersResponse.json();
            setSuggestions((playersData ?? []).map((p: any) => p.name));
          } else {
            console.error("Erreur recherche joueurs:", playersResponse.status);
            // En cas d'erreur, utiliser les réponses de la question comme suggestions
            setSuggestions(list.map(p => p.answer));
          }
        } catch (error) {
          console.error("Erreur recherche joueurs:", error);
          // En cas d'erreur, utiliser les réponses de la question comme suggestions
          setSuggestions(list.map(p => p.answer));
        }

        // 4) Reset UI
        setTimeLeft(60);
        setScore(0);
        setStreak(0);
        setAnswers([]);
        setFeedback(null);

        // 5) Initialiser le jeu (sans sauvegarde en base pour l'instant)
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!cancelled) setGameId(gameId);

        // 6) Leaderboard vide pour l'instant (pas de table games)
        if (!cancelled) setLeaderboard([]);
      } catch (e: any) {
        if (!cancelled) setLoadError(e.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [gameStarted, selectedQuestion, userId]);

  // Scoring
  const BASE_GOOD = 15;
  const BAD_PENALTY = 5;
  const BONUS_BY_STREAK: Record<number, number> = { 3: 10, 6: 15, 9: 10, 10: 15 };

  // Validation + enregistrement
  const onSelectAnswer = async (value: string) => {
    if (loading || gameOver || !gameId) return;

    const norm = normalize(value);
    if (!norm) return;

    // Debug: afficher les informations de matching
    console.log("🔍 Debug matching:");
    console.log("- Input:", value);
    console.log("- Normalisé:", norm);
    console.log("- ValidSet size:", validSet.size);
    console.log("- ValidSet contient:", validSet.has(norm));
    console.log("- ValidSet preview:", Array.from(validSet).slice(0, 5));

    // Doublon UI
    if (answers.some((a) => normalize(a) === norm)) {
      setFeedback({ type: "info", msg: "Déjà trouvé" });
      return;
    }

    if (validSet.has(norm)) {
      const nextStreak = streak + 1;
      const bonus = BONUS_BY_STREAK[nextStreak] ?? 0;
      const delta = BASE_GOOD + bonus;

      // UI
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);
      setScore((prev) => prev + delta);
      setStreak(nextStreak);
      setFeedback({ type: "ok", msg: `Bonne réponse +${delta}` });
      
      // 🎯 Ajouter à la liste des réponses trouvées pour le défloutage
      setFoundAnswers((prev) => new Set(Array.from(prev).concat(norm)));

      // Si tous les joueurs sont trouvés, ajouter les cerises immédiatement
      if (newAnswers.length >= 10 && userId && !cerisesAddedRef.current) {
        cerisesAddedRef.current = true;
        const cerisesToAdd = Math.max(1, score + delta);
        console.log(`🎯 Tous les joueurs trouvés ! Ajout de ${cerisesToAdd} cerises`);
        
        cerisesService.addCerises(userId, cerisesToAdd)
          .then((newBalance) => {
            console.log(`💰 Nouveau solde cerises: ${newBalance}`);
            setCerisesEarned(cerisesToAdd);
            
            // Notifier le header de la mise à jour
            console.log('📢 Émission de l\'événement cerises-updated:', { balance: newBalance, added: cerisesToAdd });
            const event = new CustomEvent('cerises-updated', { 
              detail: { balance: newBalance, added: cerisesToAdd } 
            });
            window.dispatchEvent(event);
            
            setUserCerises(newBalance);
          })
          .catch((error) => {
            console.error('❌ Erreur ajout cerises:', error);
            cerisesAddedRef.current = false;
          });
      }

      // DB
      try {
        await supabase.from("submissions").insert({
          game_id: gameId,
          user_id: userId,
          raw_input: value,
          normalized: norm,
          is_correct: true,
          score_delta: delta,
        });
      } catch (e) {
        console.error("submitAnswer (good) failed:", e);
      }
    } else {
      const delta = -BAD_PENALTY;

      // UI
      setStreak(0);
      setScore((prev) => Math.max(0, prev + delta));
      setFeedback({ type: "error", msg: `Mauvaise réponse ${delta}` });

      // DB
      try {
        await supabase.from("submissions").insert({
          game_id: gameId,
          user_id: userId,
          raw_input: value,
          normalized: norm,
          is_correct: false,
          score_delta: delta,
        });
      } catch (e) {
        console.error("submitAnswer (bad) failed:", e);
      }
    }
  };

  // Clôture de partie + refresh leaderboard
  useEffect(() => {
    if (!gameOver || !gameId) return;
    
    let hasRun = false;
    
    (async () => {
      if (hasRun) return;
      hasRun = true;

      try {
        console.log("Ending game:", gameId, "Score:", score, "Answers:", answers.length);
        
        // Sauvegarde désactivée - pas de table games
        console.log("Partie terminée - Score final:", score, "Réponses:", answers.length);

        // Leaderboard désactivé - pas de table games
        console.log("Leaderboard non disponible - pas de table games");
        setLeaderboard([]);
      } catch (e) {
        console.error("endGame/leaderboard failed:", e);
      }
    })();
  }, [gameOver, gameId, score, answers.length, selectedQuestion]);

  // Handle challenge completion at game end (cerises are now handled in timer)
  useEffect(() => {
    if (!gameOver || !gameStarted) return;
    
    const handleGameEnd = async () => {
      try {
        // Complete challenge if in challenge mode (ancien système)
        if (isChallengeMode && completeChallenge) {
          const timeTaken = 60 - timeLeft;
          const success = await completeChallenge(score, timeTaken);
          if (success) {
            console.log('✅ Challenge completed successfully!');
          }
        }

        // Enregistrer les résultats pour le défi multi-joueurs
        const activeChallengeId = existingChallengeId || (createdChallenges.length > 0 ? createdChallenges[0] : null);
        
        if ((isMultiplayerChallenge || isPlayingExistingChallenge) && activeChallengeId && userId) {
          console.log('💾 Enregistrement des résultats du défi multi-joueurs...');
          const timeTaken = 60 - timeLeft;
          
          try {
            // Enregistrer le score du joueur actuel
            await multiplayerChallengesService.playChallenge(
              activeChallengeId,
              userId,
              score,
              timeTaken
            );
            console.log(`✅ Score enregistré: ${score} points en ${timeTaken}s`);
            
            // Récupérer l'état du défi pour voir s'il est terminé
            const challengeDetails = await multiplayerChallengesService.getChallengeById(activeChallengeId);
            console.log(`📊 État du défi:`);
            console.log(`   Status: ${challengeDetails.status}`);
            console.log(`   Participants: ${challengeDetails.participants?.length || 0}`);
            
            const completedCount = challengeDetails.participants?.filter(p => p.status === 'completed').length || 0;
            const totalParticipants = challengeDetails.participants?.length || 0;
            console.log(`   Terminés: ${completedCount}/${totalParticipants}`);
            
            // Rediriger vers la page des résultats après un court délai
            setTimeout(() => {
              console.log(`🎯 Redirection vers /challenge/${activeChallengeId}`);
              navigate(`/challenge/${activeChallengeId}`);
            }, 2000);
          } catch (error) {
            console.error(`❌ Erreur enregistrement résultat:`, error);
          }
        }
      } catch (error) {
        console.error('❌ Failed to handle game end:', error);
      }
    };
    
    handleGameEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  // Couleur timer (utilisée dans le JSX)
  // const timeColor = () => {
  //   if (timeLeft <= 10) return "text-red-600";
  //   if (timeLeft <= 20) return "text-yellow-600";
  //   return "text-green-700";
  // };

  // Fonction pour vérifier si une réponse a été trouvée
  const isAnswerFound = (answerNorm: string) => {
    return answers.some(answer => normalize(answer) === answerNorm);
  };

  // 🎯 Helper pour vérifier si une réponse doit être défloutée
  const isAnswerUnblurred = (answerNorm: string) => {
    return foundAnswers.has(answerNorm);
  };

  // Erreur
  if (loadError) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">Erreur de chargement</h1>
        <p className="text-red-600">{loadError}</p>
        <p className="text-sm text-gray-600">
          Assurez-vous que le thème existe dans Supabase avec le slug correspondant.
        </p>
        <button
          onClick={() => {
            setGameStarted(false);
            setLoadError(null);
          }}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative p-4">
      {/* Motifs ballon en filigrane */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-primary rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header avec sélecteurs */}
        <header className="space-y-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              ⚽ {title} ⚽
            </h1>
            <p className="text-lg text-text/70 font-medium">Testez vos connaissances footballistiques !</p>
            
            {/* Challenge mode indicator */}
            {isChallengeMode && challenge && (
              <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <div>
                    <div className="font-bold">Mode Défi</div>
                    <div className="text-sm opacity-90">
                      Défi contre {challenge.challenger?.pseudo || challenge.challenged?.pseudo || 'Adversaire'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        
        {/* Sélecteur de question */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-accent-light">
          <div>
            <label className="block text-sm font-medium text-text mb-2">🎯 Choisir une question</label>
            
            {questionsLoading && (
              <div className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent text-center">
                <span className="text-primary font-medium">⏳ Chargement des questions...</span>
              </div>
            )}
            
            {questionsError && (
              <div className="w-full p-3 rounded-xl border-2 border-red-200 bg-red-50 text-center">
                <span className="text-red-600 font-medium">❌ {questionsError}</span>
              </div>
            )}
            
            {!questionsLoading && !questionsError && (
              <>
                {isPlayingExistingChallenge && forcedQuestionId && (
                  <div className="w-full p-3 rounded-xl border-2 border-blue-300 bg-blue-50 text-center mb-2">
                    <span className="text-blue-700 font-medium">
                      🎯 Défi imposé : vous devez jouer à la question sélectionnée par le créateur du défi
                    </span>
                  </div>
                )}
                <select
                  value={selectedQuestion}
                  onChange={(e) => setSelectedQuestion(e.target.value)}
                  disabled={(gameStarted && !gameOver) || isPlayingExistingChallenge}
                  className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent font-medium text-text focus:outline-none focus:border-primary transition-colors duration-200 disabled:opacity-50"
                >
                  <option value="">Sélectionnez une question...</option>
                  {availableQuestions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.title}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Bouton Lancer la partie */}
          {!gameStarted && selectedQuestion && !questionsLoading && !questionsError && (
            <button
              onClick={() => {
                setGameStarted(true);
                cerisesAddedRef.current = false; // Réinitialiser le flag pour la nouvelle partie
              }}
              className="w-full px-6 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xl font-black transform hover:scale-105 transition-all shadow-xl"
            >
              🚀 LANCER LA PARTIE 🚀
            </button>
          )}

          {!selectedQuestion && !questionsLoading && !questionsError && (
            <p className="text-sm text-center text-gray-500">
              Veuillez sélectionner une question pour commencer
            </p>
          )}

          {gameStarted && !gameOver && (
            <p className="text-xs text-center text-primary font-semibold">
              🔒 Question verrouillée pendant la partie
            </p>
          )}
        </div>
      </header>

      {/* Score et compteurs - Visible seulement si partie lancée */}
      {gameStarted && (
        <div className="bg-white rounded-3xl shadow-2xl p-4 border border-accent-light">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Timer */}
              <div className={`px-4 py-2 rounded-2xl font-black text-lg shadow-lg ${
                timeLeft <= 10 
                  ? "bg-primary text-white animate-pulse" 
                  : timeLeft <= 20
                  ? "bg-secondary text-text"
                  : "bg-accent text-text"
              }`}>
                {loading ? "⏳" : `⏱️ ${timeLeft}s`}
              </div>

              {/* Streak */}
              <div className="px-4 py-2 rounded-2xl bg-primary text-white font-black text-lg shadow-lg">
                🔥 {streak}
              </div>

              {/* Réponses */}
              <div className="px-4 py-2 rounded-2xl bg-secondary text-text font-black text-lg shadow-lg">
                ✅ {answers.length}/10
              </div>
            </div>

            {/* Score cerises */}
            <div className="px-6 py-2 rounded-2xl bg-primary text-white font-black text-2xl shadow-lg">
              🍒 {score}
            </div>
          </div>
        </div>
      )}

      {/* Saisie - Visible seulement si partie lancée */}
      {gameStarted && (
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
          <AutocompleteInput
            suggestions={suggestions}
            onSelect={onSelectAnswer}
            disabled={loading || gameOver}
            className="flex-1"
            placeholder={loading ? "⏳ Chargement..." : "🔍 Tape au moins 3 caractères..."}
            minChars={3}
          />
        </div>
      )}

      {/* Feedback */}
      {gameStarted && feedback && (
        <div className={`rounded-2xl p-4 text-center font-black text-lg shadow-lg ${
          feedback.type === "ok"
            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
            : feedback.type === "error"
            ? "bg-gradient-to-r from-red-400 to-rose-500 text-white animate-shake"
            : "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Réponses trouvées */}
      {gameStarted && answers.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-accent-light">
          <h3 className="font-black text-primary mb-3 text-lg">🎯 Tes réponses :</h3>
          <div className="grid grid-cols-2 gap-2">
            {answers.map((a, i) => (
              <div key={i} className="bg-primary/10 border-2 border-red-600 rounded-xl px-4 py-2 font-bold text-primary flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 Aperçu progressif des réponses (pendant le jeu) */}
      {gameStarted && !gameOver && allValidAnswers.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-accent-light">
          <h3 className="font-black text-primary mb-3 text-lg">👀 Aperçu du défi :</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche : joueurs 1-5 */}
            <div className="space-y-3">
              {allValidAnswers.slice(0, 5).map((answer, index) => {
                const unblurred = isAnswerUnblurred(answer.answer_norm);
                const flag = getCountryFlag(answer.players?.nationality);
                const statValue = answer.points || answer.goals || answer.assists || 0;
                const statUnit = 'points';
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-accent-light bg-white relative"
                  >
                    <span className="text-2xl font-bold text-primary">
                      {answer.ranking || (index + 1)}.
                    </span>
                    <span className="text-2xl">
                      {flag}
                    </span>
                    <span 
                      className={`font-bold text-text flex-1 transition-all duration-500 ${
                        unblurred ? "" : "blur-md"
                      }`}
                    >
                      {answer.answer}
                    </span>
                    {statValue && (
                      <span className={`text-sm font-semibold text-text bg-accent px-2 py-1 rounded transition-all duration-500 ${
                        unblurred ? "" : "blur-md"
                      }`}>
                        {statValue} {statUnit}
                      </span>
                    )}
                    {unblurred && (
                      <span className="text-primary text-lg">✅</span>
                    )}
                    {!unblurred && (
                      <div className="absolute inset-0 bg-gray-400 opacity-30 rounded-xl"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Colonne droite : joueurs 6-10 */}
            <div className="space-y-3">
              {allValidAnswers.slice(5, 10).map((answer, index) => {
                const unblurred = isAnswerUnblurred(answer.answer_norm);
                const flag = getCountryFlag(answer.players?.nationality);
                const statValue = answer.points || answer.goals || answer.assists || 0;
                const statUnit = 'points';
                
                return (
                  <div
                    key={index + 5}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-accent-light bg-white relative"
                  >
                    <span className="text-2xl font-bold text-primary">
                      {answer.ranking || (index + 6)}.
                    </span>
                    <span className="text-2xl">
                      {flag}
                    </span>
                    <span 
                      className={`font-bold text-text flex-1 transition-all duration-500 ${
                        unblurred ? "" : "blur-md"
                      }`}
                    >
                      {answer.answer}
                    </span>
                    {statValue && (
                      <span className={`text-sm font-semibold text-text bg-accent px-2 py-1 rounded transition-all duration-500 ${
                        unblurred ? "" : "blur-md"
                      }`}>
                        {statValue} {statUnit}
                      </span>
                    )}
                    {unblurred && (
                      <span className="text-primary text-lg">✅</span>
                    )}
                    {!unblurred && (
                      <div className="absolute inset-0 bg-gray-400 opacity-30 rounded-xl"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fin de partie */}
      {gameOver && gameStarted && (
        <div className="bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 border border-accent-light">
          <div className="text-6xl mb-2">
            {answers.length >= 8 ? "🏆" : answers.length >= 4 ? "👍" : "💪"}
          </div>
          <p className="text-2xl font-black text-primary">
            {answers.length >= 8
              ? "LÉGENDE ! Triplé parfait ! 🍒🍒🍒"
              : answers.length >= 4
              ? "Pas mal ! Encore un effort 💪"
              : "On se refait une partie ? 🔄"}
          </p>
          <div className="text-4xl font-black text-primary">
            {score} points ! 🎯
          </div>
          
          {cerisesEarned > 0 && (
            <div className="bg-secondary rounded-2xl p-4 border-2 border-primary">
              <div className="text-2xl font-bold text-primary mb-2">
                🍒 Cerises gagnées !
              </div>
              <div className="text-3xl font-black text-primary">
                +{cerisesEarned} cerises
              </div>
              <div className="text-sm text-primary/70 mt-1">
                Solde total: {userCerises} cerises
              </div>
            </div>
          )}

          {/* Récapitulatif des réponses */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-left border border-accent-light">
            <h3 className="text-xl font-black text-gray-800 mb-4 text-center">
              📋 Récapitulatif des réponses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-60 overflow-y-auto">
              {/* Colonne gauche : joueurs 1-5 */}
              <div className="space-y-3">
                {allValidAnswers.slice(0, 5).map((answer, index) => {
                  const found = isAnswerFound(answer.answer_norm);
                  const unblurred = isAnswerUnblurred(answer.answer_norm);
                  const flag = getCountryFlag(answer.players?.nationality);
                  const statValue = answer.points || answer.goals || answer.assists || 0;
                  const statUnit = 'points';
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all relative ${
                        found
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-400"
                          : "bg-gradient-to-r from-red-100 to-rose-100 border-red-400"
                      }`}
                    >
                      <span className="text-xl font-bold text-purple-600">
                        {answer.ranking || (index + 1)}.
                      </span>
                      <span className="text-2xl">
                        {flag}
                      </span>
                      <span className="text-2xl">
                        {found ? "✅" : "❌"}
                      </span>
                      <span 
                        className={`font-bold flex-1 transition-all duration-500 ${
                          found ? "text-green-800" : "text-red-800"
                        } ${!unblurred ? "blur-md" : ""}`}
                      >
                        {answer.answer}
                      </span>
                      {statValue && (
                        <span className={`text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded ${
                          !unblurred ? "blur-md" : ""
                        }`}>
                          {statValue} {statUnit}
                        </span>
                      )}
                      {!unblurred && (
                        <div className="absolute inset-0 bg-gray-400 opacity-30 rounded-xl"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Colonne droite : joueurs 6-10 */}
              <div className="space-y-3">
                {allValidAnswers.slice(5, 10).map((answer, index) => {
                  const found = isAnswerFound(answer.answer_norm);
                  const unblurred = isAnswerUnblurred(answer.answer_norm);
                  const flag = getCountryFlag(answer.players?.nationality);
                  const statValue = answer.points || answer.goals || answer.assists || 0;
                  const statUnit = 'points';
                  
                  return (
                    <div
                      key={index + 5}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all relative ${
                        found
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-400"
                          : "bg-gradient-to-r from-red-100 to-rose-100 border-red-400"
                      }`}
                    >
                      <span className="text-xl font-bold text-purple-600">
                        {answer.ranking || (index + 6)}.
                      </span>
                      <span className="text-2xl">
                        {flag}
                      </span>
                      <span className="text-2xl">
                        {found ? "✅" : "❌"}
                      </span>
                      <span 
                        className={`font-bold flex-1 transition-all duration-500 ${
                          found ? "text-green-800" : "text-red-800"
                        } ${!unblurred ? "blur-md" : ""}`}
                      >
                        {answer.answer}
                      </span>
                      {statValue && (
                        <span className={`text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded ${
                          !unblurred ? "blur-md" : ""
                        }`}>
                          {statValue} {statUnit}
                        </span>
                      )}
                      {!unblurred && (
                        <div className="absolute inset-0 bg-gray-400 opacity-30 rounded-xl"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 font-semibold">
                {answers.length}/{allValidAnswers.length} réponses trouvées
              </p>
            </div>
          </div>

          <button
            ref={replayBtnRef}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-xl"
            onClick={() => {
              setGameStarted(false);
              setTimeLeft(60);
              setScore(0);
              setStreak(0);
              setAnswers([]);
              setFeedback(null);
              setGameId(null);
              setFoundAnswers(new Set()); // ✅ Réinitialiser les réponses trouvées pour reflouter
              replayBtnRef.current?.blur();
            }}
            disabled={loading}
          >
            🎮 NOUVELLE PARTIE 🎮
          </button>
        </div>
      )}

      {/* Leaderboard */}
      <section className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6">
        <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          🏆 HALL OF FAME 🏆
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 font-semibold py-8">
            Aucun score pour l'instant... Sois le premier ! 🚀
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((row, idx) => (
              <div
                key={`${row.ended_at}-${idx}`}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  idx === 0 
                    ? "bg-gradient-to-r from-yellow-200 to-amber-200 border-2 border-yellow-400"
                    : idx === 1
                    ? "bg-gradient-to-r from-gray-200 to-slate-200 border-2 border-gray-400"
                    : idx === 2
                    ? "bg-gradient-to-r from-orange-200 to-amber-200 border-2 border-orange-400"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </span>
                  <div>
                    <div className="font-black text-lg text-gray-800">{row.final_score} 🍒</div>
                    <div className="text-xs text-gray-600 font-semibold">
                      {row.answers_count}/10 réponses
                    </div>
                  </div>
                </div>
                <time className="text-xs text-gray-500 font-medium">
                  {new Date(row.ended_at).toLocaleDateString('fr-FR')}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
-- ============================================================
-- MIGRATIONS POUR LE JEU "CARRIÈRE INFERNALE"
-- ============================================================
-- Ce fichier contient toutes les évolutions nécessaires
-- pour implémenter le jeu Carrière Infernale selon le cahier des charges
-- ============================================================

-- ============================================================
-- 1. CRÉER/VÉRIFIER LE TYPE DE JEU DANS game_types
-- ============================================================

-- Vérifier si le type existe déjà, sinon l'ajouter
DO $$
DECLARE
  v_game_type_exists BOOLEAN;
BEGIN
  -- Vérifier si CARRIERE_INFERNALE existe déjà
  SELECT EXISTS(
    SELECT 1 FROM game_types WHERE code = 'CARRIERE_INFERNALE'
  ) INTO v_game_type_exists;
  
  -- Si le type n'existe pas, l'ajouter
  IF NOT v_game_type_exists THEN
    INSERT INTO game_types (code, name, description, duration_seconds)
    VALUES (
      'CARRIERE_INFERNALE',
      'Carrière Infernale',
      'Reconstitue la carrière des joueurs en sélectionnant leurs clubs réels parmi 10 logos',
      60
    );
    RAISE NOTICE 'Type de jeu CARRIERE_INFERNALE créé avec succès';
  ELSE
    RAISE NOTICE 'Type de jeu CARRIERE_INFERNALE existe déjà';
  END IF;
END $$;

-- ============================================================
-- 2. FONCTION DE VALIDATION DES RÉPONSES
-- ============================================================
-- Fonction pour valider les réponses de l'utilisateur
-- Format d'entrée: JSONB avec les sélections pour chaque joueur
-- Format: [{"player_id": "...", "selected_club_ids": ["...", "..."]}, ...]
-- 
-- Retourne: JSONB avec le score, les cerises gagnées, etc.

CREATE OR REPLACE FUNCTION validate_carriere_infernale_answers(
  p_question_id UUID,
  p_user_selections JSONB  -- Format: [{"player_id": "...", "selected_club_ids": ["...", "..."]}, ...]
  -- Note: Pas de bonus temps pour Carrière Infernale (contrairement à Club Actuel)
)
RETURNS JSONB AS $$
DECLARE
  v_correct_count INTEGER := 0;  -- Total de bonnes réponses sur TOUS les joueurs
  v_total_possible INTEGER := 0;  -- Total de clubs réels possibles (max 15)
  v_perfect_count INTEGER := 0;  -- Nombre de joueurs "perfect"
  v_score INTEGER := 0;
  v_cerises INTEGER := 0;
  v_selection RECORD;
  v_correct_clubs UUID[];
  v_selected_clubs UUID[];
  v_is_perfect BOOLEAN;
  v_player_correct_count INTEGER;  -- Bonnes réponses pour ce joueur uniquement
BEGIN
  -- Pour chaque sélection utilisateur (jusqu'à 5 joueurs)
  FOR v_selection IN SELECT * FROM jsonb_array_elements(p_user_selections)
  LOOP
    -- Récupérer les clubs réels du joueur depuis question_answers
    -- IMPORTANT: Une question peut avoir jusqu'à 5 joueurs différents
    -- Chaque joueur peut avoir plusieurs lignes dans question_answers (une par club réel)
    SELECT ARRAY_AGG(club_id) INTO v_correct_clubs
    FROM question_answers
    WHERE question_id = p_question_id
      AND player_id = (v_selection->>'player_id')::UUID
      AND club_id IS NOT NULL  -- Les clubs réels ont un club_id
      AND is_active = true;
    
    -- Si aucun club trouvé pour ce joueur, passer au suivant
    IF v_correct_clubs IS NULL OR array_length(v_correct_clubs, 1) = 0 THEN
      CONTINUE;
    END IF;
    
    -- Récupérer les clubs sélectionnés par l'utilisateur pour ce joueur
    SELECT ARRAY_AGG(value::UUID) INTO v_selected_clubs
    FROM jsonb_array_elements_text(v_selection->'selected_club_ids');
    
    -- Compter les bonnes réponses pour CE joueur (clubs sélectionnés qui sont corrects)
    SELECT COUNT(*) INTO v_player_correct_count
    FROM unnest(COALESCE(v_selected_clubs, ARRAY[]::UUID[])) AS selected
    WHERE selected = ANY(v_correct_clubs);
    
    -- Accumuler les bonnes réponses pour tous les joueurs
    v_correct_count := v_correct_count + v_player_correct_count;
    
    -- Vérifier si perfect pour ce joueur
    -- Perfect = nombre de clubs sélectionnés = nombre de clubs réels ET tous sont corrects
    v_is_perfect := (
      array_length(v_correct_clubs, 1) = array_length(COALESCE(v_selected_clubs, ARRAY[]::UUID[]), 1)
      AND v_player_correct_count = array_length(v_correct_clubs, 1)
    );
    
    IF v_is_perfect THEN
      v_perfect_count := v_perfect_count + 1;
    END IF;
    
    -- Ajouter au total possible (pour chaque joueur, on compte ses clubs réels)
    v_total_possible := v_total_possible + array_length(v_correct_clubs, 1);
  END LOOP;
  
  -- Calculer le score (10 cerises par bonne réponse sur tous les joueurs)
  v_score := v_correct_count * 10;
  
  -- Base : 10 cerises par bonne réponse (max 15 bonnes réponses = 150 cerises)
  v_cerises := v_correct_count * 10;
  
  -- Bonus perfect : +5 cerises par joueur perfect (max 50 bonus si 10 joueurs perfect)
  -- Mais on limite à 200 cerises max au total (150 base + 50 bonus perfect max)
  v_cerises := v_cerises + (v_perfect_count * 5);
  
  -- Limiter à 200 cerises max (150 base + 50 bonus perfect max)
  IF v_cerises > 200 THEN
    v_cerises := 200;
  END IF;
  
  -- Note: Pas de bonus temps pour Carrière Infernale (contrairement à Club Actuel)
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'correct_count', v_correct_count,
    'total_possible', v_total_possible,
    'perfect_count', v_perfect_count,
    'score', v_score,
    'cerises_earned', v_cerises
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_carriere_infernale_answers IS 
'Valide les réponses du joueur pour Carrière Infernale. 
Format p_user_selections: [{"player_id": "...", "selected_club_ids": ["...", "..."]}, ...]
Retourne: JSONB avec correct_count, total_possible, perfect_count, score, cerises_earned.
Système de cerises: 10 cerises par bonne réponse (max 150) + 5 cerises par joueur perfect (max 50) = 200 cerises max';

-- ============================================================
-- 3. INDEXES POUR PERFORMANCE
-- ============================================================
-- Indexes pour optimiser les requêtes sur question_answers
-- pour le jeu Carrière Infernale

-- Index composite pour récupérer rapidement les clubs d'un joueur dans une question
CREATE INDEX IF NOT EXISTS idx_question_answers_carriere_infernale 
ON question_answers(question_id, player_id, club_id) 
WHERE club_id IS NOT NULL AND player_id IS NOT NULL AND is_active = true;

COMMENT ON INDEX idx_question_answers_carriere_infernale IS 
'Index pour optimiser les requêtes Carrière Infernale (récupération des clubs réels par joueur)';

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
-- Pour tester la fonction :
-- SELECT validate_carriere_infernale_answers(
--   'question-uuid',
--   '[{"player_id": "player-uuid", "selected_club_ids": ["club-uuid-1", "club-uuid-2"]}]'::JSONB
-- );
-- ============================================================


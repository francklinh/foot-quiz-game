-- ============================================================
-- MISE À JOUR DU SYSTÈME DE POINTS - CARRIÈRE INFERNALE
-- ============================================================
-- Nouveau système :
--   - +10 cerises / bonne réponse
--   - -5 cerises / mauvaise réponse
--   - Streaks de perfects : 3→+10, 6→+10, 9→+15, 10→+15
--   - Bonus temps : uniquement si perfect global (aucune erreur)
--     +1 cerise par seconde restante

-- Supprimer l'ancienne version de la fonction (2 paramètres)
DROP FUNCTION IF EXISTS validate_carriere_infernale_answers(UUID, JSONB);

-- Créer la nouvelle version avec le paramètre time_remaining
CREATE OR REPLACE FUNCTION validate_carriere_infernale_answers(
  p_question_id UUID,
  p_user_selections JSONB,  -- Format: [{"player_id": "...", "selected_club_ids": ["...", "..."]}, ...]
  p_time_remaining INTEGER DEFAULT 0  -- Temps restant en secondes (pour bonus temps si perfect global)
)
RETURNS JSONB AS $$
DECLARE
  v_correct_count INTEGER := 0;  -- Total de bonnes réponses sur TOUS les joueurs
  v_incorrect_count INTEGER := 0;  -- Total de mauvaises réponses (clubs sélectionnés à tort)
  v_total_possible INTEGER := 0;  -- Total de clubs réels possibles (max 15)
  v_perfect_count INTEGER := 0;  -- Nombre de joueurs "perfect"
  v_score INTEGER := 0;
  v_cerises INTEGER := 0;
  v_selection JSONB;  -- Chaque élément du tableau JSONB
  v_correct_clubs UUID[];
  v_selected_clubs UUID[];
  v_is_perfect BOOLEAN;
  v_player_correct_count INTEGER;  -- Bonnes réponses pour ce joueur uniquement
  v_player_incorrect_count INTEGER;  -- Mauvaises réponses pour ce joueur uniquement
  v_streak_bonus INTEGER := 0;  -- Bonus pour les streaks de perfects
  v_time_bonus INTEGER := 0;  -- Bonus temps (uniquement si perfect global)
  v_is_perfect_global BOOLEAN := false;  -- Aucune erreur sur toute la partie
  v_player_details JSONB := '[]'::JSONB;  -- Détails pour chaque joueur (pour la revue)
  v_player_detail JSONB;
BEGIN
  -- Pour chaque sélection utilisateur (jusqu'à 5 joueurs)
  FOR v_selection IN SELECT value FROM jsonb_array_elements(p_user_selections)
  LOOP
    -- Récupérer les clubs réels du joueur depuis question_answers
    SELECT ARRAY_AGG(club_id) INTO v_correct_clubs
    FROM question_answers
    WHERE question_id = p_question_id
      AND player_id = (v_selection->>'player_id')::UUID
      AND club_id IS NOT NULL
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
    
    -- Compter les mauvaises réponses pour CE joueur (clubs sélectionnés qui ne sont PAS corrects)
    SELECT COUNT(*) INTO v_player_incorrect_count
    FROM unnest(COALESCE(v_selected_clubs, ARRAY[]::UUID[])) AS selected
    WHERE selected <> ALL(v_correct_clubs);
    
    -- Accumuler les bonnes et mauvaises réponses pour tous les joueurs
    v_correct_count := v_correct_count + v_player_correct_count;
    v_incorrect_count := v_incorrect_count + v_player_incorrect_count;
    
    -- Vérifier si perfect pour ce joueur
    -- Perfect = nombre de clubs sélectionnés = nombre de clubs réels ET tous sont corrects ET aucune mauvaise sélection
    v_is_perfect := (
      array_length(v_correct_clubs, 1) = array_length(COALESCE(v_selected_clubs, ARRAY[]::UUID[]), 1)
      AND v_player_correct_count = array_length(v_correct_clubs, 1)
      AND v_player_incorrect_count = 0
    );
    
    IF v_is_perfect THEN
      v_perfect_count := v_perfect_count + 1;
    END IF;
    
    -- Ajouter au total possible (pour chaque joueur, on compte ses clubs réels)
    v_total_possible := v_total_possible + array_length(v_correct_clubs, 1);
    
    -- Construire les détails pour ce joueur (pour la revue)
    SELECT jsonb_build_object(
      'player_id', (v_selection->>'player_id')::UUID,
      'correct_clubs', v_correct_clubs,
      'selected_clubs', COALESCE(v_selected_clubs, ARRAY[]::UUID[]),
      'correct_count', v_player_correct_count,
      'incorrect_count', v_player_incorrect_count,
      'is_perfect', v_is_perfect
    ) INTO v_player_detail;
    
    v_player_details := v_player_details || v_player_detail;
  END LOOP;
  
  -- Vérifier si perfect global (aucune erreur sur toute la partie)
  v_is_perfect_global := (v_incorrect_count = 0 AND v_correct_count = v_total_possible);
  
  -- Calculer les cerises de base : +10 par bonne réponse, -5 par mauvaise réponse
  v_cerises := (v_correct_count * 10) - (v_incorrect_count * 5);
  
  -- Calculer les bonus de streaks de perfects
  IF v_perfect_count >= 10 THEN
    v_streak_bonus := 15;
  ELSIF v_perfect_count >= 9 THEN
    v_streak_bonus := 15;
  ELSIF v_perfect_count >= 6 THEN
    v_streak_bonus := 10;
  ELSIF v_perfect_count >= 3 THEN
    v_streak_bonus := 10;
  END IF;
  
  v_cerises := v_cerises + v_streak_bonus;
  
  -- Bonus temps : uniquement si perfect global (aucune erreur)
  IF v_is_perfect_global THEN
    v_time_bonus := GREATEST(0, p_time_remaining);
    v_cerises := v_cerises + v_time_bonus;
  END IF;
  
  -- S'assurer que les cerises ne sont pas négatives
  IF v_cerises < 0 THEN
    v_cerises := 0;
  END IF;
  
  -- Calculer le score (10 points par bonne réponse)
  v_score := v_correct_count * 10;
  
  -- Retourner le résultat avec tous les détails
  RETURN jsonb_build_object(
    'correct_count', v_correct_count,
    'incorrect_count', v_incorrect_count,
    'total_possible', v_total_possible,
    'perfect_count', v_perfect_count,
    'is_perfect_global', v_is_perfect_global,
    'score', v_score,
    'cerises_earned', v_cerises,
    'streak_bonus', v_streak_bonus,
    'time_bonus', v_time_bonus,
    'player_details', v_player_details  -- Détails pour la revue
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_carriere_infernale_answers IS 
'Valide les réponses du joueur pour Carrière Infernale avec le nouveau système de points.
Format p_user_selections: [{"player_id": "...", "selected_club_ids": ["...", "..."]}, ...]
Système de cerises:
  - +10 cerises par bonne réponse
  - -5 cerises par mauvaise réponse
  - Streaks de perfects: 3→+10, 6→+10, 9→+15, 10→+15
  - Bonus temps: uniquement si perfect global (aucune erreur), +1 cerise par seconde restante
Retourne: JSONB avec correct_count, incorrect_count, total_possible, perfect_count, is_perfect_global, score, cerises_earned, streak_bonus, time_bonus, player_details';


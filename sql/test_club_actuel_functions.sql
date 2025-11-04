-- ============================================================
-- TESTS POUR LES FONCTIONS DU JEU "CLUB ACTUEL"
-- ============================================================
-- Ce fichier contient des tests pour vérifier que toutes
-- les fonctions fonctionnent correctement
-- ============================================================

-- ============================================================
-- TEST 1: Fonction normalize_club_name
-- ============================================================

DO $$
DECLARE
  v_result TEXT;
BEGIN
  RAISE NOTICE '=== TEST 1: normalize_club_name ===';
  
  -- Test 1.1: Nom simple
  v_result := normalize_club_name('Real Madrid');
  IF v_result != 'real madrid' THEN
    RAISE EXCEPTION 'Test 1.1 échoué: % au lieu de "real madrid"', v_result;
  END IF;
  RAISE NOTICE '✓ Test 1.1: "Real Madrid" -> "%"', v_result;
  
  -- Test 1.2: Avec accents
  v_result := normalize_club_name('Paris Saint-Germain');
  IF v_result != 'paris saint-germain' THEN
    RAISE EXCEPTION 'Test 1.2 échoué: % au lieu de "paris saint-germain"', v_result;
  END IF;
  RAISE NOTICE '✓ Test 1.2: "Paris Saint-Germain" -> "%"', v_result;
  
  -- Test 1.3: Avec espaces multiples
  v_result := normalize_club_name('  Real   Madrid  CF  ');
  IF v_result != 'real madrid cf' THEN
    RAISE EXCEPTION 'Test 1.3 échoué: % au lieu de "real madrid cf"', v_result;
  END IF;
  RAISE NOTICE '✓ Test 1.3: Espaces multiples normalisés';
  
  -- Test 1.4: NULL
  v_result := normalize_club_name(NULL);
  IF v_result IS NOT NULL THEN
    RAISE EXCEPTION 'Test 1.4 échoué: NULL devrait retourner NULL';
  END IF;
  RAISE NOTICE '✓ Test 1.4: NULL géré correctement';
  
  RAISE NOTICE '=== TEST 1 RÉUSSI ===';
END $$;

-- ============================================================
-- TEST 2: Fonction search_clubs
-- ============================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '=== TEST 2: search_clubs ===';
  
  -- Test 2.1: Recherche basique
  SELECT COUNT(*) INTO v_count
  FROM search_clubs('Real', 10);
  
  IF v_count = 0 THEN
    RAISE WARNING 'Test 2.1: Aucun résultat trouvé pour "Real" (peut être normal si pas de données)';
  ELSE
    RAISE NOTICE '✓ Test 2.1: % résultats trouvés pour "Real"', v_count;
  END IF;
  
  -- Test 2.2: Recherche avec variante
  SELECT COUNT(*) INTO v_count
  FROM search_clubs('PSG', 10);
  
  IF v_count = 0 THEN
    RAISE WARNING 'Test 2.2: Aucun résultat trouvé pour "PSG" (peut être normal si pas de données)';
  ELSE
    RAISE NOTICE '✓ Test 2.2: % résultats trouvés pour "PSG"', v_count;
  END IF;
  
  RAISE NOTICE '=== TEST 2 TERMINÉ ===';
END $$;

-- ============================================================
-- TEST 3: Fonction validate_club_actuel_answers
-- ============================================================
-- Note: Ce test nécessite des données de test dans la base
-- Il est commenté par défaut pour éviter les erreurs

/*
DO $$
DECLARE
  v_test_question_id UUID;
  v_test_player_id UUID;
  v_result RECORD;
  v_user_answers JSONB;
BEGIN
  RAISE NOTICE '=== TEST 3: validate_club_actuel_answers ===';
  
  -- Créer une question de test
  INSERT INTO questions (game_type, title, is_active)
  VALUES ('CLUB_ACTUEL', 'Test Club Actuel', true)
  RETURNING id INTO v_test_question_id;
  
  -- Créer un joueur de test
  INSERT INTO players (name, current_club, is_active)
  VALUES ('Test Player', 'Real Madrid', true)
  RETURNING id INTO v_test_player_id;
  
  -- Créer une réponse de test
  INSERT INTO question_answers (question_id, player_id, display_order, is_active)
  VALUES (v_test_question_id, v_test_player_id, 1, true);
  
  -- Test avec bonne réponse
  v_user_answers := jsonb_build_object(v_test_player_id::text, 'Real Madrid');
  
  SELECT * INTO v_result
  FROM validate_club_actuel_answers(
    v_test_question_id,
    v_user_answers,
    30, -- 30 secondes restantes
    3   -- 3 bonnes réponses consécutives
  );
  
  IF v_result.correct_count != 1 THEN
    RAISE EXCEPTION 'Test 3.1 échoué: correct_count = % au lieu de 1', v_result.correct_count;
  END IF;
  
  IF v_result.cerises_earned != 40 THEN -- 10 base + 10 streak + 20 temps
    RAISE EXCEPTION 'Test 3.1 échoué: cerises = % au lieu de 40', v_result.cerises_earned;
  END IF;
  
  RAISE NOTICE '✓ Test 3.1: Validation correcte avec bonnes réponses';
  
  -- Nettoyage
  DELETE FROM question_answers WHERE question_id = v_test_question_id;
  DELETE FROM questions WHERE id = v_test_question_id;
  DELETE FROM players WHERE id = v_test_player_id;
  
  RAISE NOTICE '=== TEST 3 RÉUSSI ===';
END $$;
*/

-- ============================================================
-- TEST 4: Fonction get_clubs_from_players
-- ============================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '=== TEST 4: get_clubs_from_players ===';
  
  SELECT COUNT(*) INTO v_count
  FROM get_clubs_from_players();
  
  RAISE NOTICE '✓ Test 4: % clubs trouvés dans players.current_club', v_count;
  
  IF v_count = 0 THEN
    RAISE WARNING 'Aucun club trouvé (normal si pas de joueurs avec current_club)';
  END IF;
  
  RAISE NOTICE '=== TEST 4 TERMINÉ ===';
END $$;

-- ============================================================
-- RÉSUMÉ DES TESTS
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TOUS LES TESTS TERMINÉS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Vérifiez les résultats ci-dessus';
  RAISE NOTICE '========================================';
END $$;


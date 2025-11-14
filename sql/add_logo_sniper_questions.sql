-- ============================================================
-- SCRIPT POUR AJOUTER DES QUESTIONS LOGO SNIPER
-- POUR LES NOUVELLES LIGUES (Premier League, Bundesliga, La Liga, Serie A)
-- ============================================================
-- Ce script crée des questions Logo Sniper pour chaque ligue
-- et associe les clubs de chaque ligue à leurs questions respectives
-- ============================================================

-- ============================================================
-- 1. VÉRIFIER/CREER LE TYPE DE JEU LOGO_SNIPER
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_has_game_types BOOLEAN;
BEGIN
  -- Vérifier si la table game_types existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'game_types'
  ) INTO v_has_game_types;

  IF v_has_game_types THEN
    -- Récupérer ou créer l'ID du type de jeu LOGO_SNIPER
    SELECT id INTO v_game_type_id
    FROM game_types
    WHERE code = 'LOGO_SNIPER'
    LIMIT 1;
    
    IF v_game_type_id IS NULL THEN
      INSERT INTO game_types (code, name, description, duration_seconds)
      VALUES ('LOGO_SNIPER', 'Logo Sniper', 'Devine les clubs à partir de leurs logos', 60)
      RETURNING id INTO v_game_type_id;
      RAISE NOTICE '✅ Type de jeu LOGO_SNIPER créé (ID: %)', v_game_type_id;
    ELSE
      RAISE NOTICE '✅ Type de jeu LOGO_SNIPER trouvé (ID: %)', v_game_type_id;
    END IF;
  ELSE
    RAISE WARNING '⚠️ Table game_types n''existe pas. Le script peut échouer.';
  END IF;
END $$;

-- ============================================================
-- 2. CRÉER LES QUESTIONS LOGO SNIPER POUR CHAQUE LIGUE
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_premier_league_question_id UUID;
  v_bundesliga_question_id UUID;
  v_la_liga_question_id UUID;
  v_serie_a_question_id UUID;
  v_has_game_type_id BOOLEAN;
  v_has_content BOOLEAN;
BEGIN
  -- Vérifier la structure de la table questions
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'game_type_id'
  ) INTO v_has_game_type_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'content'
  ) INTO v_has_content;

  IF NOT v_has_game_type_id OR NOT v_has_content THEN
    RAISE EXCEPTION 'La table questions doit avoir les colonnes game_type_id et content';
  END IF;

  -- Récupérer l'ID du type de jeu LOGO_SNIPER
  SELECT id INTO v_game_type_id
  FROM game_types
  WHERE code = 'LOGO_SNIPER'
  LIMIT 1;

  IF v_game_type_id IS NULL THEN
    RAISE EXCEPTION 'Le type de jeu LOGO_SNIPER n''existe pas dans game_types';
  END IF;

  -- Vérifier si la question Premier League existe déjà
  SELECT id INTO v_premier_league_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Premier League'
    AND is_active = true
  LIMIT 1;

  -- Créer la question Premier League si elle n'existe pas
  IF v_premier_league_question_id IS NULL THEN
    INSERT INTO questions (
      game_type_id,
      content,
      season,
      is_active
    )
    VALUES (
      v_game_type_id,
      jsonb_build_object(
        'question', 'Premier League - Logos des clubs anglais',
        'description', 'Devine les clubs de Premier League à partir de leurs logos',
        'league', 'Premier League',
        'country', 'England'
      ),
      '2024-2025',
      true
    )
    RETURNING id INTO v_premier_league_question_id;
    
    RAISE NOTICE '✅ Question Premier League créée (ID: %)', v_premier_league_question_id;
  ELSE
    RAISE NOTICE '✅ Question Premier League existe déjà (ID: %)', v_premier_league_question_id;
  END IF;

  -- Vérifier si la question Bundesliga existe déjà
  SELECT id INTO v_bundesliga_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Bundesliga'
    AND is_active = true
  LIMIT 1;

  -- Créer la question Bundesliga si elle n'existe pas
  IF v_bundesliga_question_id IS NULL THEN
    INSERT INTO questions (
      game_type_id,
      content,
      season,
      is_active
    )
    VALUES (
      v_game_type_id,
      jsonb_build_object(
        'question', 'Bundesliga - Logos des clubs allemands',
        'description', 'Devine les clubs de Bundesliga à partir de leurs logos',
        'league', 'Bundesliga',
        'country', 'Germany'
      ),
      '2024-2025',
      true
    )
    RETURNING id INTO v_bundesliga_question_id;
    
    RAISE NOTICE '✅ Question Bundesliga créée (ID: %)', v_bundesliga_question_id;
  ELSE
    RAISE NOTICE '✅ Question Bundesliga existe déjà (ID: %)', v_bundesliga_question_id;
  END IF;

  -- Vérifier si la question La Liga existe déjà
  SELECT id INTO v_la_liga_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'La Liga'
    AND is_active = true
  LIMIT 1;

  -- Créer la question La Liga si elle n'existe pas
  IF v_la_liga_question_id IS NULL THEN
    INSERT INTO questions (
      game_type_id,
      content,
      season,
      is_active
    )
    VALUES (
      v_game_type_id,
      jsonb_build_object(
        'question', 'La Liga - Logos des clubs espagnols',
        'description', 'Devine les clubs de La Liga à partir de leurs logos',
        'league', 'La Liga',
        'country', 'Spain'
      ),
      '2024-2025',
      true
    )
    RETURNING id INTO v_la_liga_question_id;
    
    RAISE NOTICE '✅ Question La Liga créée (ID: %)', v_la_liga_question_id;
  ELSE
    RAISE NOTICE '✅ Question La Liga existe déjà (ID: %)', v_la_liga_question_id;
  END IF;

  -- Vérifier si la question Serie A existe déjà
  SELECT id INTO v_serie_a_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Serie A'
    AND is_active = true
  LIMIT 1;

  -- Créer la question Serie A si elle n'existe pas
  IF v_serie_a_question_id IS NULL THEN
    INSERT INTO questions (
      game_type_id,
      content,
      season,
      is_active
    )
    VALUES (
      v_game_type_id,
      jsonb_build_object(
        'question', 'Serie A - Logos des clubs italiens',
        'description', 'Devine les clubs de Serie A à partir de leurs logos',
        'league', 'Serie A',
        'country', 'Italy'
      ),
      '2024-2025',
      true
    )
    RETURNING id INTO v_serie_a_question_id;
    
    RAISE NOTICE '✅ Question Serie A créée (ID: %)', v_serie_a_question_id;
  ELSE
    RAISE NOTICE '✅ Question Serie A existe déjà (ID: %)', v_serie_a_question_id;
  END IF;

  RAISE NOTICE '✅ Questions créées:';
  RAISE NOTICE '  Premier League: %', v_premier_league_question_id;
  RAISE NOTICE '  Bundesliga: %', v_bundesliga_question_id;
  RAISE NOTICE '  La Liga: %', v_la_liga_question_id;
  RAISE NOTICE '  Serie A: %', v_serie_a_question_id;

  -- Stocker les IDs dans des variables de session pour les utiliser dans les sections suivantes
  -- Note: On va les récupérer directement dans les sections suivantes
END $$;

-- ============================================================
-- 3. ASSOCIER LES CLUBS DE PREMIER LEAGUE À LA QUESTION
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_question_id UUID;
  v_club RECORD;
  v_display_order INTEGER := 1;
BEGIN
  -- Récupérer l'ID du type de jeu
  SELECT id INTO v_game_type_id
  FROM game_types
  WHERE code = 'LOGO_SNIPER'
  LIMIT 1;

  -- Récupérer l'ID de la question Premier League
  SELECT id INTO v_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Premier League'
    AND is_active = true
  LIMIT 1;

  IF v_question_id IS NULL THEN
    RAISE EXCEPTION 'Question Premier League non trouvée';
  END IF;

  -- Supprimer les anciennes réponses pour cette question
  DELETE FROM question_answers
  WHERE question_id = v_question_id;

  -- Insérer les clubs de Premier League
  FOR v_club IN
    SELECT id, name
    FROM clubs
    WHERE league = 'Premier League'
      AND is_active = true
      AND type = 'CLUB'
    ORDER BY name
  LOOP
    INSERT INTO question_answers (
      question_id,
      club_id,
      display_order,
      is_active,
      points,
      player_id,
      ranking
    )
    VALUES (
      v_question_id,
      v_club.id,
      v_display_order,
      true,
      NULL,
      NULL,
      NULL
    )
    ON CONFLICT DO NOTHING;

    v_display_order := v_display_order + 1;
  END LOOP;

  RAISE NOTICE '✅ % clubs de Premier League associés à la question', v_display_order - 1;
END $$;

-- ============================================================
-- 4. ASSOCIER LES CLUBS DE BUNDESLIGA À LA QUESTION
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_question_id UUID;
  v_club RECORD;
  v_display_order INTEGER := 1;
BEGIN
  -- Récupérer l'ID du type de jeu
  SELECT id INTO v_game_type_id
  FROM game_types
  WHERE code = 'LOGO_SNIPER'
  LIMIT 1;

  -- Récupérer l'ID de la question Bundesliga
  SELECT id INTO v_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Bundesliga'
    AND is_active = true
  LIMIT 1;

  IF v_question_id IS NULL THEN
    RAISE EXCEPTION 'Question Bundesliga non trouvée';
  END IF;

  -- Supprimer les anciennes réponses pour cette question
  DELETE FROM question_answers
  WHERE question_id = v_question_id;

  -- Insérer les clubs de Bundesliga
  FOR v_club IN
    SELECT id, name
    FROM clubs
    WHERE league = 'Bundesliga'
      AND is_active = true
      AND type = 'CLUB'
    ORDER BY name
  LOOP
    INSERT INTO question_answers (
      question_id,
      club_id,
      display_order,
      is_active,
      points,
      player_id,
      ranking
    )
    VALUES (
      v_question_id,
      v_club.id,
      v_display_order,
      true,
      NULL,
      NULL,
      NULL
    )
    ON CONFLICT DO NOTHING;

    v_display_order := v_display_order + 1;
  END LOOP;

  RAISE NOTICE '✅ % clubs de Bundesliga associés à la question', v_display_order - 1;
END $$;

-- ============================================================
-- 5. ASSOCIER LES CLUBS DE LA LIGA À LA QUESTION
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_question_id UUID;
  v_club RECORD;
  v_display_order INTEGER := 1;
BEGIN
  -- Récupérer l'ID du type de jeu
  SELECT id INTO v_game_type_id
  FROM game_types
  WHERE code = 'LOGO_SNIPER'
  LIMIT 1;

  -- Récupérer l'ID de la question La Liga
  SELECT id INTO v_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'La Liga'
    AND is_active = true
  LIMIT 1;

  IF v_question_id IS NULL THEN
    RAISE EXCEPTION 'Question La Liga non trouvée';
  END IF;

  -- Supprimer les anciennes réponses pour cette question
  DELETE FROM question_answers
  WHERE question_id = v_question_id;

  -- Insérer les clubs de La Liga
  FOR v_club IN
    SELECT id, name
    FROM clubs
    WHERE league = 'La Liga'
      AND is_active = true
      AND type = 'CLUB'
    ORDER BY name
  LOOP
    INSERT INTO question_answers (
      question_id,
      club_id,
      display_order,
      is_active,
      points,
      player_id,
      ranking
    )
    VALUES (
      v_question_id,
      v_club.id,
      v_display_order,
      true,
      NULL,
      NULL,
      NULL
    )
    ON CONFLICT DO NOTHING;

    v_display_order := v_display_order + 1;
  END LOOP;

  RAISE NOTICE '✅ % clubs de La Liga associés à la question', v_display_order - 1;
END $$;

-- ============================================================
-- 6. ASSOCIER LES CLUBS DE SERIE A À LA QUESTION
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_question_id UUID;
  v_club RECORD;
  v_display_order INTEGER := 1;
BEGIN
  -- Récupérer l'ID du type de jeu
  SELECT id INTO v_game_type_id
  FROM game_types
  WHERE code = 'LOGO_SNIPER'
  LIMIT 1;

  -- Récupérer l'ID de la question Serie A
  SELECT id INTO v_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Serie A'
    AND is_active = true
  LIMIT 1;

  IF v_question_id IS NULL THEN
    RAISE EXCEPTION 'Question Serie A non trouvée';
  END IF;

  -- Supprimer les anciennes réponses pour cette question
  DELETE FROM question_answers
  WHERE question_id = v_question_id;

  -- Insérer les clubs de Serie A
  FOR v_club IN
    SELECT id, name
    FROM clubs
    WHERE league = 'Serie A'
      AND is_active = true
      AND type = 'CLUB'
    ORDER BY name
  LOOP
    INSERT INTO question_answers (
      question_id,
      club_id,
      display_order,
      is_active,
      points,
      player_id,
      ranking
    )
    VALUES (
      v_question_id,
      v_club.id,
      v_display_order,
      true,
      NULL,
      NULL,
      NULL
    )
    ON CONFLICT DO NOTHING;

    v_display_order := v_display_order + 1;
  END LOOP;

  RAISE NOTICE '✅ % clubs de Serie A associés à la question', v_display_order - 1;
END $$;

-- ============================================================
-- 7. VÉRIFICATION FINALE
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_premier_league_count INTEGER;
  v_bundesliga_count INTEGER;
  v_la_liga_count INTEGER;
  v_serie_a_count INTEGER;
  v_premier_league_question_id UUID;
  v_bundesliga_question_id UUID;
  v_la_liga_question_id UUID;
  v_serie_a_question_id UUID;
BEGIN
  -- Récupérer l'ID du type de jeu
  SELECT id INTO v_game_type_id
  FROM game_types
  WHERE code = 'LOGO_SNIPER'
  LIMIT 1;

  -- Récupérer les IDs des questions
  SELECT id INTO v_premier_league_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Premier League'
    AND is_active = true
  LIMIT 1;

  SELECT id INTO v_bundesliga_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Bundesliga'
    AND is_active = true
  LIMIT 1;

  SELECT id INTO v_la_liga_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'La Liga'
    AND is_active = true
  LIMIT 1;

  SELECT id INTO v_serie_a_question_id
  FROM questions
  WHERE game_type_id = v_game_type_id
    AND content->>'league' = 'Serie A'
    AND is_active = true
  LIMIT 1;

  -- Compter les clubs associés à chaque question
  SELECT COUNT(*) INTO v_premier_league_count
  FROM question_answers
  WHERE question_id = v_premier_league_question_id
    AND is_active = true;

  SELECT COUNT(*) INTO v_bundesliga_count
  FROM question_answers
  WHERE question_id = v_bundesliga_question_id
    AND is_active = true;

  SELECT COUNT(*) INTO v_la_liga_count
  FROM question_answers
  WHERE question_id = v_la_liga_question_id
    AND is_active = true;

  SELECT COUNT(*) INTO v_serie_a_count
  FROM question_answers
  WHERE question_id = v_serie_a_question_id
    AND is_active = true;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'RÉSUMÉ DES QUESTIONS LOGO SNIPER:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Premier League: % clubs', v_premier_league_count;
  RAISE NOTICE 'Bundesliga: % clubs', v_bundesliga_count;
  RAISE NOTICE 'La Liga: % clubs', v_la_liga_count;
  RAISE NOTICE 'Serie A: % clubs', v_serie_a_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total: % clubs', v_premier_league_count + v_bundesliga_count + v_la_liga_count + v_serie_a_count;
  RAISE NOTICE '========================================';
END $$;


-- ============================================================
-- SCRIPT DE DONNÉES DE TEST POUR CLUB ACTUEL
-- ============================================================
-- Ce script crée une question de test avec 15 joueurs
-- pour permettre de tester le jeu Club Actuel
-- ============================================================

-- ============================================================
-- 1. CRÉER OU VÉRIFIER LES JOUEURS DE TEST
-- ============================================================
-- On insère des joueurs célèbres avec leur club actuel
-- Si un joueur existe déjà, on le met à jour

DO $$
DECLARE
  v_player RECORD;
  v_players_data TEXT[][] := ARRAY[
    ['Kylian Mbappé', 'Real Madrid', 'France', 'Attaquant'],
    ['Erling Haaland', 'Manchester City', 'Norway', 'Attaquant'],
    ['Lionel Messi', 'Inter Miami', 'Argentina', 'Attaquant'],
    ['Cristiano Ronaldo', 'Al Nassr', 'Portugal', 'Attaquant'],
    ['Kevin De Bruyne', 'Manchester City', 'Belgium', 'Milieu'],
    ['Virgil van Dijk', 'Liverpool', 'Netherlands', 'Défenseur'],
    ['Luka Modrić', 'Real Madrid', 'Croatia', 'Milieu'],
    ['Robert Lewandowski', 'Barcelona', 'Poland', 'Attaquant'],
    ['Mohamed Salah', 'Liverpool', 'Egypt', 'Attaquant'],
    ['Karim Benzema', 'Al Ittihad', 'France', 'Attaquant'],
    ['Neymar', 'Al Hilal', 'Brazil', 'Attaquant'],
    ['Jude Bellingham', 'Real Madrid', 'England', 'Milieu'],
    ['Harry Kane', 'Bayern Munich', 'England', 'Attaquant'],
    ['Vinícius Júnior', 'Real Madrid', 'Brazil', 'Attaquant'],
    ['Antoine Griezmann', 'Atlético Madrid', 'France', 'Attaquant']
  ];
  v_player_data TEXT[];
  v_existing_id UUID;
BEGIN
  FOREACH v_player_data SLICE 1 IN ARRAY v_players_data
  LOOP
    -- Vérifier si le joueur existe déjà
    SELECT id INTO v_existing_id
    FROM players
    WHERE name = v_player_data[1]
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      -- Mettre à jour le joueur existant
      UPDATE players
      SET 
        current_club = v_player_data[2],
        nationality = COALESCE(v_player_data[3], players.nationality),
        position = COALESCE(v_player_data[4], players.position),
        is_active = true,
        updated_at = NOW()
      WHERE id = v_existing_id;
    ELSE
      -- Créer un nouveau joueur
      INSERT INTO players (name, current_club, nationality, position, is_active)
      VALUES (
        v_player_data[1],
        v_player_data[2],
        v_player_data[3],
        v_player_data[4],
        true
      );
    END IF;
  END LOOP;

  RAISE NOTICE '✅ % joueurs créés ou mis à jour', array_length(v_players_data, 1);
END $$;

-- Note: Si vous avez un doublon (Kylian Mbappé apparaît deux fois), 
-- la contrainte UNIQUE sur name empêchera l'insertion du doublon.
-- Remplacez le dernier par un autre joueur si nécessaire.

-- ============================================================
-- 2. VÉRIFIER LA STRUCTURE RÉELLE DE LA TABLE QUESTIONS
-- ============================================================

DO $$
DECLARE
  v_has_game_type BOOLEAN;
  v_has_game_type_id BOOLEAN;
  v_has_title BOOLEAN;
  v_has_season BOOLEAN;
  v_has_content BOOLEAN;
  v_has_description BOOLEAN;
  v_game_type_id INTEGER;
BEGIN
  -- Vérifier toutes les colonnes possibles
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'game_type'
  ) INTO v_has_game_type;
  
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
    AND column_name = 'title'
  ) INTO v_has_title;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'season'
  ) INTO v_has_season;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'content'
  ) INTO v_has_content;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'description'
  ) INTO v_has_description;
  
  -- Afficher la structure détectée
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STRUCTURE DE LA TABLE questions:';
  RAISE NOTICE '  game_type: %', v_has_game_type;
  RAISE NOTICE '  game_type_id: %', v_has_game_type_id;
  RAISE NOTICE '  title: %', v_has_title;
  RAISE NOTICE '  season: %', v_has_season;
  RAISE NOTICE '  content: %', v_has_content;
  RAISE NOTICE '  description: %', v_has_description;
  RAISE NOTICE '========================================';
  
  -- Gérer game_type / game_type_id
  IF v_has_game_type THEN
    RAISE NOTICE '✅ Table questions utilise la colonne game_type';
  ELSIF v_has_game_type_id THEN
    RAISE NOTICE '✅ Table questions utilise la colonne game_type_id';
    -- Vérifier si game_types existe
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'game_types'
    ) THEN
      -- Récupérer l'ID du type de jeu CLUB_ACTUEL
      SELECT id INTO v_game_type_id
      FROM game_types
      WHERE code = 'CLUB_ACTUEL'
      LIMIT 1;
      
      -- Si le type n'existe pas, le créer
      IF v_game_type_id IS NULL THEN
        RAISE NOTICE '⚠️ Type de jeu CLUB_ACTUEL non trouvé, création...';
        INSERT INTO game_types (code, name, description, duration_seconds)
        VALUES ('CLUB_ACTUEL', 'Club Actuel', 'Devine le club actuel des joueurs présentés', 60)
        RETURNING id INTO v_game_type_id;
        RAISE NOTICE '✅ Type de jeu CLUB_ACTUEL créé (ID: %)', v_game_type_id;
      ELSE
        RAISE NOTICE '✅ ID du type CLUB_ACTUEL: %', v_game_type_id;
      END IF;
    ELSE
      RAISE WARNING '⚠️ Table game_types n''existe pas';
    END IF;
  ELSE
    -- Créer la colonne game_type si aucune des deux n'existe
    RAISE NOTICE '⚠️ Aucune colonne game_type trouvée, création de game_type...';
    ALTER TABLE questions 
    ADD COLUMN game_type VARCHAR(20) CHECK (game_type IN ('TOP10', 'LOGO_SNIPER', 'CLUB_ACTUEL', 'CARRIERE_INFERNALE'));
    v_has_game_type := true;
    RAISE NOTICE '✅ Colonne game_type créée';
  END IF;
  
  -- Créer les colonnes manquantes si nécessaire
  IF NOT v_has_title THEN
    RAISE NOTICE '⚠️ Colonne title manquante, création...';
    ALTER TABLE questions ADD COLUMN title VARCHAR(255);
    v_has_title := true;
    RAISE NOTICE '✅ Colonne title créée';
  END IF;
  
  IF NOT v_has_season THEN
    RAISE NOTICE '⚠️ Colonne season manquante, création...';
    ALTER TABLE questions ADD COLUMN season VARCHAR(20);
    v_has_season := true;
    RAISE NOTICE '✅ Colonne season créée';
  END IF;
END $$;

-- ============================================================
-- 3. CRÉER LA QUESTION DE TEST
-- ============================================================

DO $$
DECLARE
  v_question_id UUID;
  v_has_game_type BOOLEAN;
  v_has_game_type_id BOOLEAN;
  v_has_title BOOLEAN;
  v_has_season BOOLEAN;
  v_has_content BOOLEAN;
  v_has_description BOOLEAN;
  v_has_is_active BOOLEAN;
  v_game_type_id INTEGER;
  v_sql TEXT;
BEGIN
  -- Vérifier la structure
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'game_type'
  ) INTO v_has_game_type;
  
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
    AND column_name = 'title'
  ) INTO v_has_title;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'season'
  ) INTO v_has_season;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'content'
  ) INTO v_has_content;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'description'
  ) INTO v_has_description;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'is_active'
  ) INTO v_has_is_active;
  
  -- Utiliser la structure réelle : game_type_id + content (JSONB)
  IF v_has_game_type_id THEN
    -- Récupérer ou créer l'ID du type de jeu
    SELECT id INTO v_game_type_id
    FROM game_types
    WHERE code = 'CLUB_ACTUEL'
    LIMIT 1;
    
    IF v_game_type_id IS NULL THEN
      INSERT INTO game_types (code, name, description, duration_seconds)
      VALUES ('CLUB_ACTUEL', 'Club Actuel', 'Devine le club actuel des joueurs présentés', 60)
      RETURNING id INTO v_game_type_id;
      RAISE NOTICE '✅ Type de jeu CLUB_ACTUEL créé (ID: %)', v_game_type_id;
    END IF;
    
    -- Créer la question avec la structure réelle
    INSERT INTO questions (
      game_type_id,
      content,
      season,
      is_active
    )
    VALUES (
      v_game_type_id,
      jsonb_build_object(
        'title', 'Top joueurs des 5 grands championnats - Test',
        'description', 'Devine le club actuel de 15 joueurs célèbres'
      ),
      '2024-2025',
      true
    )
    RETURNING id INTO v_question_id;
    
    RAISE NOTICE '✅ Question créée avec game_type_id (ID: %)', v_question_id;
  ELSIF v_has_game_type THEN
    -- Fallback si game_type existe au lieu de game_type_id
    INSERT INTO questions (
      game_type,
      content,
      season,
      is_active
    )
    VALUES (
      'CLUB_ACTUEL',
      jsonb_build_object(
        'title', 'Top joueurs des 5 grands championnats - Test',
        'description', 'Devine le club actuel de 15 joueurs célèbres'
      ),
      '2024-2025',
      true
    )
    RETURNING id INTO v_question_id;
    
    RAISE NOTICE '✅ Question créée avec game_type (ID: %)', v_question_id;
  ELSE
    -- Structure minimale (sans game_type)
    INSERT INTO questions (
      content,
      season,
      is_active
    )
    VALUES (
      jsonb_build_object(
        'title', 'Top joueurs des 5 grands championnats - Test',
        'description', 'Devine le club actuel de 15 joueurs célèbres'
      ),
      '2024-2025',
      true
    )
    RETURNING id INTO v_question_id;
    
    RAISE NOTICE '✅ Question créée sans game_type (ID: %)', v_question_id;
  END IF;
END $$;

-- Sauvegarder l'ID de la question et associer les joueurs
DO $$
DECLARE
  v_question_id UUID;
  v_player_ids UUID[];
  v_has_title BOOLEAN;
  v_has_description BOOLEAN;
  v_has_content BOOLEAN;
  v_sql TEXT;
BEGIN
  -- Vérifier quels champs existent pour identifier la question
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'title'
  ) INTO v_has_title;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'description'
  ) INTO v_has_description;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'content'
  ) INTO v_has_content;
  
  -- Récupérer l'ID de la question créée selon les colonnes disponibles
  IF v_has_content THEN
    -- Utiliser content (JSONB) pour trouver la question
    SELECT id INTO v_question_id
    FROM questions
    WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC
    LIMIT 1;
  ELSIF v_has_title THEN
    SELECT id INTO v_question_id
    FROM questions
    WHERE title = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC
    LIMIT 1;
  ELSIF v_has_description THEN
    SELECT id INTO v_question_id
    FROM questions
    WHERE description = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC
    LIMIT 1;
  ELSE
    -- Récupérer la dernière question créée (moins fiable mais fonctionne)
    SELECT id INTO v_question_id
    FROM questions
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_question_id IS NULL THEN
    RAISE EXCEPTION 'Erreur: La question n''a pas pu être créée ou trouvée';
  END IF;
  
  RAISE NOTICE '✅ Question trouvée: %', v_question_id;

  -- Récupérer les IDs des joueurs (15 joueurs)
  SELECT ARRAY_AGG(id) INTO v_player_ids
  FROM (
    SELECT id
    FROM players
    WHERE name IN (
      'Kylian Mbappé', 'Erling Haaland', 'Lionel Messi', 'Cristiano Ronaldo',
      'Kevin De Bruyne', 'Virgil van Dijk', 'Luka Modrić', 'Robert Lewandowski',
      'Mohamed Salah', 'Karim Benzema', 'Neymar', 'Jude Bellingham',
      'Harry Kane', 'Vinícius Júnior', 'Antoine Griezmann'
    )
    AND is_active = true
    ORDER BY name
    LIMIT 15
  ) subq;

  -- Vérifier qu'on a bien 15 joueurs
  IF array_length(v_player_ids, 1) < 15 THEN
    RAISE WARNING 'Seulement % joueurs trouvés au lieu de 15', array_length(v_player_ids, 1);
  END IF;

  -- Insérer les réponses (question_answers) pour chaque joueur
  -- Pour CLUB_ACTUEL, is_correct est requis par le trigger
  FOR i IN 1..LEAST(array_length(v_player_ids, 1), 15) LOOP
    INSERT INTO question_answers (
      question_id,
      player_id,
      display_order,
      is_correct,
      is_active
    )
    VALUES (
      v_question_id,
      v_player_ids[i],
      i, -- Ordre d'affichage
      true, -- Pour CLUB_ACTUEL, les réponses dans question_answers sont les bonnes réponses attendues
      true
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Mettre à jour la question avec les player_ids
  UPDATE questions
  SET player_ids = v_player_ids
  WHERE id = v_question_id;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'QUESTION DE TEST CRÉÉE AVEC SUCCÈS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ID de la question: %', v_question_id;
  RAISE NOTICE 'Nombre de joueurs: %', array_length(v_player_ids, 1);
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Vous pouvez maintenant tester le jeu avec cette question !';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================
-- 3. VÉRIFICATION DES DONNÉES CRÉÉES
-- ============================================================

-- Afficher les détails de la question créée
DO $$
DECLARE
  v_question_id UUID;
  v_has_title BOOLEAN;
  v_has_description BOOLEAN;
  v_has_content BOOLEAN;
  v_has_season BOOLEAN;
  v_nombre_joueurs INTEGER;
BEGIN
  -- Vérifier les colonnes
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'title'
  ) INTO v_has_title;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'description'
  ) INTO v_has_description;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'season'
  ) INTO v_has_season;
  
  -- Récupérer l'ID de la question
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'content'
  ) INTO v_has_content;
  
  IF v_has_content THEN
    -- Utiliser content (JSONB)
    SELECT id INTO v_question_id
    FROM questions
    WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC LIMIT 1;
  ELSIF v_has_title THEN
    SELECT id INTO v_question_id
    FROM questions
    WHERE title = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC LIMIT 1;
  ELSIF v_has_description THEN
    SELECT id INTO v_question_id
    FROM questions
    WHERE description = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC LIMIT 1;
  ELSE
    SELECT id INTO v_question_id
    FROM questions
    ORDER BY created_at DESC LIMIT 1;
  END IF;
  
  IF v_question_id IS NOT NULL THEN
    -- Compter les joueurs
    SELECT COUNT(*) INTO v_nombre_joueurs
    FROM question_answers
    WHERE question_id = v_question_id AND is_active = true;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'QUESTION DE TEST CRÉÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ID: %', v_question_id;
    RAISE NOTICE 'Nombre de joueurs: %', v_nombre_joueurs;
    RAISE NOTICE '========================================';
  END IF;
END $$;

-- Afficher les joueurs de la question
DO $$
DECLARE
  v_question_id UUID;
  v_has_title BOOLEAN;
  v_has_description BOOLEAN;
  v_has_content BOOLEAN;
  v_player RECORD;
BEGIN
  -- Vérifier si content existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'content'
  ) INTO v_has_content;
  
  -- Récupérer l'ID de la question
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'title'
  ) INTO v_has_title;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'description'
  ) INTO v_has_description;
  
  -- Récupérer l'ID de la question selon les colonnes disponibles
  IF v_has_content THEN
    -- Utiliser content (JSONB)
    SELECT id INTO v_question_id
    FROM questions
    WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC LIMIT 1;
  ELSIF v_has_title THEN
    SELECT id INTO v_question_id
    FROM questions
    WHERE title = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC LIMIT 1;
  ELSIF v_has_description THEN
    SELECT id INTO v_question_id
    FROM questions
    WHERE description = 'Top joueurs des 5 grands championnats - Test'
    ORDER BY created_at DESC LIMIT 1;
  ELSE
    SELECT id INTO v_question_id
    FROM questions
    ORDER BY created_at DESC LIMIT 1;
  END IF;
  
  IF v_question_id IS NOT NULL THEN
    RAISE NOTICE 'Joueurs de la question:';
    FOR v_player IN 
      SELECT 
        qa.display_order,
        p.name,
        p.current_club,
        p.nationality,
        p.position
      FROM question_answers qa
      INNER JOIN players p ON qa.player_id = p.id
      WHERE qa.question_id = v_question_id
      AND qa.is_active = true
      ORDER BY qa.display_order
    LOOP
      RAISE NOTICE '  % - % (% - %)', 
        v_player.display_order, 
        v_player.name, 
        v_player.current_club,
        v_player.nationality;
    END LOOP;
  END IF;
END $$;

-- ============================================================
-- 4. TESTS DE VALIDATION
-- ============================================================

-- Test 1: Vérifier que la question existe
DO $$
DECLARE
  v_question_id UUID;
  v_question_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 1: Vérification de la question';
  RAISE NOTICE '========================================';
  
  SELECT id INTO v_question_id
  FROM questions
  WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_question_id IS NULL THEN
    RAISE EXCEPTION '❌ ERREUR: La question n''a pas été trouvée';
  ELSE
    RAISE NOTICE '✅ Question trouvée: %', v_question_id;
  END IF;
END $$;

-- Test 2: Vérifier que tous les joueurs sont associés
DO $$
DECLARE
  v_question_id UUID;
  v_player_count INTEGER;
  v_expected_count INTEGER := 15;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 2: Vérification des joueurs associés';
  RAISE NOTICE '========================================';
  
  SELECT id INTO v_question_id
  FROM questions
  WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
  ORDER BY created_at DESC
  LIMIT 1;
  
  SELECT COUNT(*) INTO v_player_count
  FROM question_answers
  WHERE question_id = v_question_id
  AND is_active = true
  AND player_id IS NOT NULL;
  
  IF v_player_count < v_expected_count THEN
    RAISE WARNING '⚠️  Seulement % joueurs trouvés au lieu de %', v_player_count, v_expected_count;
  ELSE
    RAISE NOTICE '✅ % joueurs correctement associés', v_player_count;
  END IF;
END $$;

-- Test 3: Vérifier que is_correct est défini pour tous les joueurs
DO $$
DECLARE
  v_question_id UUID;
  v_missing_is_correct INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 3: Vérification de is_correct';
  RAISE NOTICE '========================================';
  
  SELECT id INTO v_question_id
  FROM questions
  WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
  ORDER BY created_at DESC
  LIMIT 1;
  
  SELECT COUNT(*) INTO v_missing_is_correct
  FROM question_answers
  WHERE question_id = v_question_id
  AND is_active = true
  AND is_correct IS NULL;
  
  IF v_missing_is_correct > 0 THEN
    RAISE EXCEPTION '❌ ERREUR: % réponses sans is_correct', v_missing_is_correct;
  ELSE
    RAISE NOTICE '✅ Toutes les réponses ont is_correct défini';
  END IF;
END $$;

-- Test 4: Vérifier que les joueurs ont un current_club
DO $$
DECLARE
  v_question_id UUID;
  v_players_without_club INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 4: Vérification des clubs actuels';
  RAISE NOTICE '========================================';
  
  SELECT id INTO v_question_id
  FROM questions
  WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
  ORDER BY created_at DESC
  LIMIT 1;
  
  SELECT COUNT(*) INTO v_players_without_club
  FROM question_answers qa
  INNER JOIN players p ON qa.player_id = p.id
  WHERE qa.question_id = v_question_id
  AND qa.is_active = true
  AND (p.current_club IS NULL OR p.current_club = '');
  
  IF v_players_without_club > 0 THEN
    RAISE WARNING '⚠️  % joueurs sans club actuel défini', v_players_without_club;
  ELSE
    RAISE NOTICE '✅ Tous les joueurs ont un club actuel défini';
  END IF;
END $$;

-- Test 5: Vérifier que la fonction search_clubs fonctionne
DO $$
DECLARE
  v_club_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 5: Test de la fonction search_clubs';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO v_club_count
  FROM search_clubs('Real', 5);
  
  IF v_club_count = 0 THEN
    RAISE WARNING '⚠️  La fonction search_clubs n''a retourné aucun résultat pour "Real"';
  ELSE
    RAISE NOTICE '✅ La fonction search_clubs fonctionne (% résultats pour "Real")', v_club_count;
  END IF;
END $$;

-- Test 6: Vérifier que la fonction validate_club_actuel_answers existe
DO $$
DECLARE
  v_function_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 6: Vérification de validate_club_actuel_answers';
  RAISE NOTICE '========================================';
  
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'validate_club_actuel_answers'
  ) INTO v_function_exists;
  
  IF NOT v_function_exists THEN
    RAISE WARNING '⚠️  La fonction validate_club_actuel_answers n''existe pas';
  ELSE
    RAISE NOTICE '✅ La fonction validate_club_actuel_answers existe';
  END IF;
END $$;

-- Résumé final
DO $$
DECLARE
  v_question_id UUID;
  v_player_count INTEGER;
  v_club_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RÉSUMÉ FINAL';
  RAISE NOTICE '========================================';
  
  SELECT id INTO v_question_id
  FROM questions
  WHERE content->>'title' = 'Top joueurs des 5 grands championnats - Test'
  ORDER BY created_at DESC
  LIMIT 1;
  
  SELECT COUNT(*) INTO v_player_count
  FROM question_answers
  WHERE question_id = v_question_id
  AND is_active = true;
  
  SELECT COUNT(*) INTO v_club_count
  FROM clubs
  WHERE is_active = true;
  
  RAISE NOTICE 'Question ID: %', v_question_id;
  RAISE NOTICE 'Joueurs associés: %', v_player_count;
  RAISE NOTICE 'Clubs disponibles: %', v_club_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Tous les tests sont terminés !';
  RAISE NOTICE 'Vous pouvez maintenant utiliser cette question pour tester le jeu.';
  RAISE NOTICE '========================================';
END $$;


-- ============================================================
-- VÉRIFICATION DES PRÉREQUIS POUR LA MIGRATION CLUB ACTUEL
-- ============================================================
-- Exécutez ce script AVANT club_actuel_setup.sql pour vérifier
-- que tout est prêt
-- ============================================================

DO $$
DECLARE
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
  v_table_exists BOOLEAN;
  v_column_exists BOOLEAN;
  v_ext_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DES PRÉREQUIS';
  RAISE NOTICE '========================================';
  
  -- 1. Vérifier que la table players existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'players'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    v_errors := array_append(v_errors, 'Table players n''existe pas');
  ELSE
    RAISE NOTICE '✓ Table players existe';
  END IF;
  
  -- 2. Vérifier que la table clubs existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'clubs'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    v_errors := array_append(v_errors, 'Table clubs n''existe pas');
  ELSE
    RAISE NOTICE '✓ Table clubs existe';
    
    -- Vérifier que logo_url existe et est NOT NULL
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'clubs'
      AND column_name = 'logo_url'
      AND is_nullable = 'NO'
    ) INTO v_column_exists;
    
    IF v_column_exists THEN
      RAISE NOTICE '✓ logo_url est NOT NULL (le script utilisera un placeholder)';
    ELSE
      RAISE NOTICE '⚠ logo_url est nullable (pas de problème)';
    END IF;
  END IF;
  
  -- 3. Vérifier que la table question_answers existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'question_answers'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    v_errors := array_append(v_errors, 'Table question_answers n''existe pas');
  ELSE
    RAISE NOTICE '✓ Table question_answers existe';
  END IF;
  
  -- 4. Vérifier l'extension uuid-ossp (pour uuid_generate_v4)
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
  ) INTO v_ext_exists;
  
  IF NOT v_ext_exists THEN
    v_warnings := array_append(v_warnings, 'Extension uuid-ossp non installée (peut être nécessaire)');
    RAISE WARNING 'Extension uuid-ossp non installée';
  ELSE
    RAISE NOTICE '✓ Extension uuid-ossp installée';
  END IF;
  
  -- 5. Vérifier l'extension pg_trgm (optionnelle, pour performance)
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
  ) INTO v_ext_exists;
  
  IF NOT v_ext_exists THEN
    v_warnings := array_append(v_warnings, 'Extension pg_trgm non installée (optionnelle, améliore les performances de recherche)');
    RAISE WARNING 'Extension pg_trgm non installée (optionnelle)';
  ELSE
    RAISE NOTICE '✓ Extension pg_trgm installée (recherche optimisée)';
  END IF;
  
  -- 6. Vérifier qu'il y a des joueurs avec current_club
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'players') THEN
    DECLARE
      v_player_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO v_player_count
      FROM players
      WHERE current_club IS NOT NULL AND is_active = true;
      
      IF v_player_count = 0 THEN
        v_warnings := array_append(v_warnings, 'Aucun joueur avec current_club trouvé');
        RAISE WARNING 'Aucun joueur avec current_club trouvé';
      ELSE
        RAISE NOTICE '✓ % joueurs avec current_club trouvés', v_player_count;
      END IF;
    END;
  END IF;
  
  -- Résumé
  RAISE NOTICE '========================================';
  
  IF array_length(v_errors, 1) > 0 THEN
    RAISE NOTICE '❌ ERREURS DÉTECTÉES:';
    FOR i IN 1..array_length(v_errors, 1) LOOP
      RAISE NOTICE '  - %', v_errors[i];
    END LOOP;
    RAISE EXCEPTION 'Des erreurs bloquantes ont été détectées. Corrigez-les avant de continuer.';
  END IF;
  
  IF array_length(v_warnings, 1) > 0 THEN
    RAISE NOTICE '⚠ AVERTISSEMENTS:';
    FOR i IN 1..array_length(v_warnings, 1) LOOP
      RAISE NOTICE '  - %', v_warnings[i];
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE 'Les avertissements ne bloquent pas la migration, mais peuvent affecter les performances.';
  END IF;
  
  RAISE NOTICE '✅ Tous les prérequis sont OK !';
  RAISE NOTICE 'Vous pouvez maintenant exécuter: club_actuel_setup.sql';
  RAISE NOTICE '========================================';
  
END $$;


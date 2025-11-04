-- ============================================================
-- MIGRATIONS POUR LE JEU "CLUB ACTUEL"
-- ============================================================
-- Ce fichier contient toutes les évolutions nécessaires
-- pour implémenter le jeu Club Actuel selon le cahier des charges
-- ============================================================

-- ============================================================
-- 1. FONCTION DE NORMALISATION DES NOMS DE CLUBS
-- ============================================================
-- Fonction utilitaire pour normaliser les noms de clubs
-- (sans accents, lowercase, trim)
-- Utilisée pour la validation des réponses

CREATE OR REPLACE FUNCTION normalize_club_name(p_name TEXT)
RETURNS TEXT AS $$
BEGIN
  IF p_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN LOWER(TRIM(translate(
    p_name,
    'àáâãäåèéêëìíîïòóôõöùúûüýÿÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸ',
    'aaaaaaeeeeiiiioooouuuuyyAAAAAAEEEEIIIIOOOOUUUUYY'
  )));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_club_name IS 'Normalise un nom de club (sans accents, lowercase, trim) pour la validation';

-- ============================================================
-- 2. FONCTION D'AUTOCOMPLÉTION DES CLUBS
-- ============================================================
-- Fonction pour rechercher et suggérer des clubs lors de la saisie
-- Utilisée pour l'autocomplétion intelligente dans l'interface

-- Fonction search_clubs avec retour JSONB pour meilleure compatibilité Supabase
CREATE OR REPLACE FUNCTION search_clubs(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH ranked_clubs AS (
    SELECT 
      c.id,
      c.name,
      c.name_variations,
      c.type,
      c.country,
      c.league,
      CASE 
        WHEN LOWER(TRIM(c.name)) = LOWER(TRIM(p_search_term)) THEN 1.0
        WHEN LOWER(c.name) LIKE LOWER(TRIM(p_search_term)) || '%' THEN 0.8
        WHEN LOWER(c.name) LIKE '%' || LOWER(TRIM(p_search_term)) || '%' THEN 0.6
        ELSE 0.4
      END as relevance
    FROM clubs c
    WHERE c.is_active = true
    AND (
      LOWER(c.name) LIKE '%' || LOWER(TRIM(p_search_term)) || '%'
      OR (c.name_variations IS NOT NULL AND EXISTS(
        SELECT 1 FROM unnest(c.name_variations) as v
        WHERE LOWER(v) LIKE '%' || LOWER(TRIM(p_search_term)) || '%'
      ))
    )
    ORDER BY relevance DESC, c.name ASC
    LIMIT p_limit
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'name_variations', COALESCE(name_variations, ARRAY[]::TEXT[]),
      'type', COALESCE(type, 'CLUB'),
      'country', country,
      'league', league,
      'relevance', relevance
    )
    ORDER BY relevance DESC, name ASC
  ) INTO v_result
  FROM ranked_clubs;
  
  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Fonction alternative avec retour TABLE (pour compatibilité avec code existant)
-- Note: Cette version peut avoir des problèmes avec Supabase RPC
CREATE OR REPLACE FUNCTION search_clubs_table(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  name_variations TEXT[],
  type TEXT,
  country TEXT,
  league TEXT,
  relevance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::UUID,
    c.name::TEXT,
    c.name_variations,
    COALESCE(c.type, 'CLUB')::TEXT,
    c.country::TEXT,
    c.league::TEXT,
    CASE 
      WHEN LOWER(TRIM(c.name)) = LOWER(TRIM(p_search_term)) THEN 1.0::NUMERIC
      WHEN LOWER(c.name) LIKE LOWER(TRIM(p_search_term)) || '%' THEN 0.8::NUMERIC
      WHEN LOWER(c.name) LIKE '%' || LOWER(TRIM(p_search_term)) || '%' THEN 0.6::NUMERIC
      ELSE 0.4::NUMERIC
    END as relevance
  FROM clubs c
  WHERE c.is_active = true
  AND (
    LOWER(c.name) LIKE '%' || LOWER(TRIM(p_search_term)) || '%'
    OR (c.name_variations IS NOT NULL AND EXISTS(
      SELECT 1 FROM unnest(c.name_variations) as v
      WHERE LOWER(v) LIKE '%' || LOWER(TRIM(p_search_term)) || '%'
    ))
  )
  ORDER BY relevance DESC, c.name ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_clubs IS 'Recherche et autocomplétion des clubs pour le jeu Club Actuel';

-- ============================================================
-- 3. MISE À JOUR DE LA FONCTION DE VALIDATION CLUB ACTUEL
-- ============================================================
-- Remplacement de la fonction existante avec support des streaks,
-- bonus temps, et normalisation améliorée

CREATE OR REPLACE FUNCTION validate_club_actuel_answers(
  p_question_id UUID,
  p_user_answers JSONB, -- Format: {"player_id": "club_name", ...} ou {"player_name": "club_name", ...}
  p_time_remaining INTEGER DEFAULT 0, -- Secondes restantes pour bonus temps
  p_streak_count INTEGER DEFAULT 0 -- Nombre de bonnes réponses consécutives (calculé côté app)
)
RETURNS TABLE(
  correct_count INTEGER,
  total_players INTEGER,
  correct_answers JSONB,
  score INTEGER,
  cerises_earned INTEGER,
  streak_bonus INTEGER,
  time_bonus INTEGER
) AS $$
DECLARE
  v_answer RECORD;
  v_user_club TEXT;
  v_user_club_normalized TEXT;
  v_correct_club_normalized TEXT;
  v_club_name TEXT;
  v_club_variations TEXT[];
  v_is_correct BOOLEAN;
  v_correct JSONB := '{}'::JSONB;
  v_correct_count INTEGER := 0;
  v_total INTEGER;
  v_cerises_base INTEGER := 0;
  v_streak_bonus INTEGER := 0;
  v_time_bonus INTEGER := 0;
  v_cerises_total INTEGER := 0;
BEGIN
  -- Compter le nombre total de joueurs pour cette question (15 par défaut)
  SELECT COUNT(*) INTO v_total
  FROM question_answers qa
  WHERE qa.question_id = p_question_id 
  AND qa.is_active = true 
  AND qa.player_id IS NOT NULL; -- Les réponses CLUB ACTUEL ont un player_id
  
  -- Parcourir les réponses dans l'ordre d'affichage
  FOR v_answer IN 
    SELECT qa.*, p.name as player_name, p.current_club, p.id as player_id_uuid
    FROM question_answers qa
    INNER JOIN players p ON qa.player_id = p.id
    WHERE qa.question_id = p_question_id 
    AND qa.is_active = true 
    AND qa.player_id IS NOT NULL
    ORDER BY qa.display_order, qa.id
  LOOP
    -- Récupérer la réponse utilisateur pour ce joueur (par player_id ou player_name)
    v_user_club := COALESCE(
      p_user_answers->>v_answer.player_id_uuid::text,
      p_user_answers->>v_answer.player_name
    );
    
    IF v_user_club IS NOT NULL THEN
      -- Normaliser la réponse utilisateur
      v_user_club_normalized := normalize_club_name(v_user_club);
      
      -- Récupérer le club correct et ses variantes depuis la table clubs (si disponible)
      SELECT c.name, c.name_variations
      INTO v_club_name, v_club_variations
      FROM clubs c
      WHERE c.name = v_answer.current_club
      OR v_answer.current_club = ANY(c.name_variations)
      LIMIT 1;
      
      -- Normaliser le club correct
      IF v_club_name IS NOT NULL THEN
        v_correct_club_normalized := normalize_club_name(v_club_name);
        -- Vérifier aussi les variantes
        v_is_correct := (
          v_user_club_normalized = v_correct_club_normalized
          OR EXISTS(
            SELECT 1 FROM unnest(v_club_variations) as variant
            WHERE normalize_club_name(variant) = v_user_club_normalized
          )
        );
      ELSE
        -- Si le club n'est pas dans la table clubs, utiliser directement current_club
        v_correct_club_normalized := normalize_club_name(v_answer.current_club);
        v_is_correct := v_user_club_normalized = v_correct_club_normalized;
      END IF;
      
      IF v_is_correct THEN
        v_correct := v_correct || jsonb_build_object(
          v_answer.player_name, 
          jsonb_build_object(
            'user_answer', v_user_club,
            'correct_club', COALESCE(v_club_name, v_answer.current_club),
            'player_id', v_answer.player_id_uuid
          )
        );
        v_correct_count := v_correct_count + 1;
        v_cerises_base := v_cerises_base + 10; -- 10 cerises par bonne réponse
      END IF;
    END IF;
  END LOOP;
  
  -- Calculer les bonus de streak (selon p_streak_count)
  -- Les streaks sont calculés côté application en temps réel
  IF p_streak_count >= 12 THEN
    v_streak_bonus := 15;
  ELSIF p_streak_count >= 9 THEN
    v_streak_bonus := 15;
  ELSIF p_streak_count >= 6 THEN
    v_streak_bonus := 10;
  ELSIF p_streak_count >= 3 THEN
    v_streak_bonus := 10;
  END IF;
  
  -- Bonus temps (1 cerise par seconde restante, hors 200-point cap)
  v_time_bonus := GREATEST(0, p_time_remaining);
  
  -- Calculer le total de cerises (max 200 pour base + streaks, bonus temps en plus)
  v_cerises_total := GREATEST(0, LEAST(200, v_cerises_base + v_streak_bonus)) + v_time_bonus;
  
  RETURN QUERY SELECT
    v_correct_count,
    v_total,
    v_correct,
    v_correct_count * 10, -- Score : 10 points par bonne réponse
    v_cerises_total, -- Cerises totales (base + streaks + temps)
    v_streak_bonus, -- Bonus streaks
    v_time_bonus; -- Bonus temps
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_club_actuel_answers IS 'Valide les réponses du jeu Club Actuel avec calcul des cerises, bonus streaks et temps';

-- ============================================================
-- 4. INDEX POUR PERFORMANCE
-- ============================================================

-- Index sur players.current_club pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_players_current_club 
ON players(current_club) 
WHERE current_club IS NOT NULL AND is_active = true;

COMMENT ON INDEX idx_players_current_club IS 'Index pour optimiser les recherches par club actuel dans le jeu Club Actuel';

-- Index full-text sur clubs.name pour autocomplétion
-- Note: Si l'extension pg_trgm n'est pas installée, utiliser un index simple
DO $$
BEGIN
  -- Vérifier si l'extension pg_trgm est disponible
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
  ) THEN
    -- Index avec trigram pour recherche partielle rapide
    CREATE INDEX IF NOT EXISTS idx_clubs_name_trgm 
    ON clubs USING gin(name gin_trgm_ops)
    WHERE is_active = true;
    
    COMMENT ON INDEX idx_clubs_name_trgm IS 'Index trigram pour recherche rapide de clubs (autocomplétion)';
  ELSE
    -- Index simple si pg_trgm n'est pas disponible
    CREATE INDEX IF NOT EXISTS idx_clubs_name_search 
    ON clubs(name)
    WHERE is_active = true;
    
    COMMENT ON INDEX idx_clubs_name_search IS 'Index simple pour recherche de clubs (autocomplétion)';
  END IF;
END $$;

-- Index sur clubs.name_variations pour recherche dans les variantes
CREATE INDEX IF NOT EXISTS idx_clubs_name_variations 
ON clubs USING gin(name_variations)
WHERE is_active = true AND name_variations IS NOT NULL;

COMMENT ON INDEX idx_clubs_name_variations IS 'Index GIN pour recherche dans les variantes de noms de clubs';

-- ============================================================
-- 5. MIGRATION DES CLUBS DEPUIS players.current_club
-- ============================================================
-- S'assurer que tous les clubs référencés dans players.current_club
-- existent dans la table clubs (avec leurs variantes si possible)
-- 
-- NOTE: Si logo_url est NOT NULL dans la table clubs, on utilise une URL placeholder
-- qui pourra être remplacée plus tard par l'admin

-- Insertion des clubs manquants depuis players.current_club
INSERT INTO clubs (name, type, country, league, logo_url, is_active)
SELECT DISTINCT 
  p.current_club as name,
  'CLUB' as type,
  NULL as country,
  NULL as league,
  -- Utiliser une URL placeholder si logo_url est obligatoire
  -- Vous pouvez remplacer cette URL par une image par défaut ou une URL de votre choix
  'https://via.placeholder.com/200x200?text=' || REPLACE(p.current_club, ' ', '+') as logo_url,
  true as is_active
FROM players p
WHERE p.current_club IS NOT NULL
AND p.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM clubs c 
  WHERE c.name = p.current_club
)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE clubs IS 'Table des clubs et sélections - utilisée pour Logo Sniper et Club Actuel (autocomplétion)';

-- Note importante sur logo_url:
-- Les clubs créés automatiquement depuis players.current_club ont une URL placeholder.
-- Il est recommandé de remplacer ces URLs par les vrais logos via l'interface admin.

-- ============================================================
-- 6. FONCTION HELPER : Récupérer les clubs uniques depuis players
-- ============================================================
-- Utile pour l'admin pour voir quels clubs sont référencés

CREATE OR REPLACE FUNCTION get_clubs_from_players()
RETURNS TABLE(
  club_name VARCHAR,
  player_count BIGINT,
  exists_in_clubs BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.current_club as club_name,
    COUNT(*) as player_count,
    EXISTS(SELECT 1 FROM clubs c WHERE c.name = p.current_club) as exists_in_clubs
  FROM players p
  WHERE p.current_club IS NOT NULL
  AND p.is_active = true
  GROUP BY p.current_club
  ORDER BY player_count DESC, club_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_clubs_from_players IS 'Liste les clubs référencés dans players.current_club avec leur nombre de joueurs';

-- ============================================================
-- 7. VÉRIFICATIONS ET TESTS
-- ============================================================

-- Vérifier que la fonction de normalisation fonctionne
DO $$
DECLARE
  v_test TEXT;
BEGIN
  v_test := normalize_club_name('Paris Saint-Germain');
  IF v_test != 'paris saint-germain' THEN
    RAISE EXCEPTION 'Erreur: normalize_club_name retourne % au lieu de paris saint-germain', v_test;
  END IF;
  
  v_test := normalize_club_name('Real Madrid CF');
  IF v_test != 'real madrid cf' THEN
    RAISE EXCEPTION 'Erreur: normalize_club_name retourne % au lieu de real madrid cf', v_test;
  END IF;
  
  RAISE NOTICE '✓ Tests de normalisation réussis';
END $$;

-- Afficher un résumé de la migration
DO $$
DECLARE
  v_clubs_count INTEGER;
  v_players_with_club INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_clubs_count FROM clubs WHERE is_active = true;
  SELECT COUNT(*) INTO v_players_with_club FROM players WHERE current_club IS NOT NULL AND is_active = true;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION CLUB ACTUEL TERMINÉE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Clubs actifs dans la base: %', v_clubs_count;
  RAISE NOTICE 'Joueurs avec club actuel: %', v_players_with_club;
  RAISE NOTICE '========================================';
END $$;


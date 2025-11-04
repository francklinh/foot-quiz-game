-- Script pour synchroniser la table clubs avec les current_club des joueurs
-- Garantit que les noms dans clubs correspondent EXACTEMENT aux current_club
-- Exécutez ce script dans Supabase

-- ============================================================
-- 1. CRÉER LES CLUBS MANQUANTS DEPUIS players.current_club
-- ============================================================

INSERT INTO clubs (name, logo_url, type, is_active)
SELECT DISTINCT
  p.current_club as name,
  'https://via.placeholder.com/200x200?text=' || REPLACE(p.current_club, ' ', '+') as logo_url,
  'CLUB' as type,
  true as is_active
FROM players p
WHERE p.current_club IS NOT NULL
  AND p.current_club != ''
  AND p.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM clubs c
    WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(p.current_club))
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. DÉSACTIVER LES CLUBS QUI NE CORRESPONDENT PAS AUX current_club
-- ============================================================
-- Désactive les clubs qui ne sont référencés par aucun joueur actif
-- (mais ne les supprime pas pour garder l'historique)

UPDATE clubs c
SET is_active = false
WHERE c.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM players p
  WHERE p.is_active = true
  AND p.current_club IS NOT NULL
  AND LOWER(TRIM(c.name)) = LOWER(TRIM(p.current_club))
);

-- ============================================================
-- 3. RÉACTIVER LES CLUBS QUI CORRESPONDENT AUX current_club
-- ============================================================

UPDATE clubs c
SET is_active = true
WHERE c.is_active = false
AND EXISTS (
  SELECT 1 FROM players p
  WHERE p.is_active = true
  AND p.current_club IS NOT NULL
  AND LOWER(TRIM(c.name)) = LOWER(TRIM(p.current_club))
);

-- ============================================================
-- 4. MISE À JOUR DES name_variations POUR INCLURE LES VARIANTES
-- ============================================================
-- Ajouter les variantes de noms (avec/sans tirets, etc.) dans name_variations
-- pour améliorer la recherche, mais garder le nom principal exact

DO $$
DECLARE
  v_club RECORD;
  v_variations TEXT[];
BEGIN
  FOR v_club IN 
    SELECT DISTINCT
      c.id,
      c.name,
      p.current_club
    FROM clubs c
    INNER JOIN players p ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.current_club))
    WHERE c.is_active = true
    AND p.is_active = true
    AND c.name != p.current_club
  LOOP
    -- Créer les variantes courantes
    v_variations := ARRAY[]::TEXT[];
    
    -- Ajouter la version avec tirets
    IF v_club.name LIKE '%-%' THEN
      v_variations := array_append(v_variations, REPLACE(v_club.name, '-', ' '));
    END IF;
    
    -- Ajouter la version avec espaces
    IF v_club.name LIKE '% %' THEN
      v_variations := array_append(v_variations, REPLACE(v_club.name, ' ', '-'));
    END IF;
    
    -- Mettre à jour les variations si nécessaire
    IF array_length(v_variations, 1) > 0 THEN
      UPDATE clubs
      SET name_variations = array_remove(
        COALESCE(name_variations, ARRAY[]::TEXT[]) || v_variations,
        NULL
      )
      WHERE id = v_club.id;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 5. ASSURER QUE LE NOM PRINCIPAL CORRESPOND EXACTEMENT
-- ============================================================
-- Mettre à jour les noms des clubs pour qu'ils correspondent exactement
-- aux current_club des joueurs (garder le format exact utilisé)

UPDATE clubs c
SET name = (
  SELECT p.current_club
  FROM players p
  WHERE p.is_active = true
  AND p.current_club IS NOT NULL
  AND LOWER(TRIM(c.name)) = LOWER(TRIM(p.current_club))
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM players p
  WHERE p.is_active = true
  AND p.current_club IS NOT NULL
  AND LOWER(TRIM(c.name)) = LOWER(TRIM(p.current_club))
  AND c.name != p.current_club
);

-- ============================================================
-- 6. SUPPRIMER LES DOUBLONS (garder celui qui correspond exactement)
-- ============================================================

-- Supprimer les clubs qui sont des doublons (même nom normalisé mais format différent)
DO $$
DECLARE
  v_duplicate RECORD;
BEGIN
  FOR v_duplicate IN
    WITH normalized_clubs AS (
      SELECT 
        c.id,
        c.name,
        LOWER(REPLACE(REPLACE(c.name, '-', ''), ' ', '')) as normalized_name,
        EXISTS (
          SELECT 1 FROM players p
          WHERE p.is_active = true
          AND p.current_club IS NOT NULL
          AND c.name = p.current_club
        ) as is_exact_match
      FROM clubs c
      WHERE c.is_active = true
    ),
    duplicates AS (
      SELECT 
        normalized_name,
        COUNT(*) as count,
        MAX(is_exact_match::int) as has_exact_match
      FROM normalized_clubs
      GROUP BY normalized_name
      HAVING COUNT(*) > 1
    )
    SELECT 
      nc.id,
      nc.name,
      nc.is_exact_match
    FROM normalized_clubs nc
    INNER JOIN duplicates d ON nc.normalized_name = d.normalized_name
    WHERE d.has_exact_match = 1 AND nc.is_exact_match = false
  LOOP
    -- Désactiver les doublons qui ne correspondent pas exactement
    UPDATE clubs
    SET is_active = false
    WHERE id = v_duplicate.id;
  END LOOP;
END $$;

-- ============================================================
-- 7. RÉSUMÉ
-- ============================================================

DO $$
DECLARE
  v_total_clubs INTEGER;
  v_active_clubs INTEGER;
  v_clubs_with_players INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_clubs FROM clubs;
  SELECT COUNT(*) INTO v_active_clubs FROM clubs WHERE is_active = true;
  SELECT COUNT(DISTINCT p.current_club) INTO v_clubs_with_players
  FROM players p
  WHERE p.current_club IS NOT NULL AND p.is_active = true;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SYNCHRONISATION TERMINÉE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total clubs dans la base: %', v_total_clubs;
  RAISE NOTICE 'Clubs actifs: %', v_active_clubs;
  RAISE NOTICE 'Clubs uniques depuis players: %', v_clubs_with_players;
  RAISE NOTICE '========================================';
END $$;

-- Afficher les clubs actifs
SELECT 
  c.name,
  c.is_active,
  COUNT(DISTINCT p.id) as nombre_joueurs
FROM clubs c
LEFT JOIN players p ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.current_club)) AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.is_active
ORDER BY nombre_joueurs DESC, c.name
LIMIT 20;


-- Script pour corriger la fonction search_clubs
-- Exécutez ce script dans l'éditeur SQL de Supabase pour mettre à jour la fonction

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS search_clubs(TEXT, INTEGER);

-- Créer la nouvelle fonction avec retour JSONB (meilleure compatibilité Supabase)
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

COMMENT ON FUNCTION search_clubs IS 'Recherche et autocomplétion des clubs pour le jeu Club Actuel (retour JSONB pour compatibilité Supabase)';

-- Test de la fonction
SELECT search_clubs('Real', 5) as test_result;


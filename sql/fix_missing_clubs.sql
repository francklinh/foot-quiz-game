-- Script pour ajouter les clubs manquants depuis players.current_club
-- Exécutez ce script dans Supabase pour ajouter tous les clubs manquants

-- Insérer tous les clubs qui sont dans players.current_club mais pas dans clubs
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

-- Afficher les clubs ajoutés
SELECT 
  COUNT(*) as clubs_ajoutes,
  STRING_AGG(name, ', ' ORDER BY name) as noms_clubs
FROM clubs
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Vérifier que Bayern Munich existe maintenant
SELECT 
  id,
  name,
  is_active,
  created_at
FROM clubs
WHERE LOWER(name) LIKE '%bayern%' OR LOWER(name) LIKE '%munich%'
ORDER BY name;


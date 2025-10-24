-- Script pour créer une question TOP 10 de test
-- Insertion d'une question "Top 10 des meilleurs buteurs de Ligue 1 2024-2025"

-- 1. Créer la question TOP 10
INSERT INTO questions (
  id,
  game_type,
  title,
  player_ids,
  season,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'TOP10',
  'Top 10 des meilleurs buteurs de Ligue 1 2024-2025',
  ARRAY[]::uuid[], -- Sera rempli avec les IDs des joueurs
  '2024-2025',
  true,
  NOW(),
  NOW()
);

-- 2. Récupérer l'ID de la question créée
-- (Cette requête sera exécutée séparément pour obtenir l'ID)
SELECT id, title FROM questions 
WHERE title = 'Top 10 des meilleurs buteurs de Ligue 1 2024-2025' 
AND game_type = 'TOP10'
ORDER BY created_at DESC 
LIMIT 1;

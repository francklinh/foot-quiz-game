-- =====================================================
-- MIGRATIONS POUR AJOUTER DRAPEAUX ET CLASSEMENT
-- =====================================================

-- 1. Ajouter la colonne nationality à la table players
ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality VARCHAR(3);

-- 2. Ajouter les colonnes de classement et statistiques à theme_answers
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS ranking INTEGER;
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS goals INTEGER;
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS assists INTEGER;
ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);

-- 3. Créer un index sur ranking pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_theme_answers_ranking ON theme_answers(theme_id, ranking);

-- 4. Créer un index sur nationality pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_players_nationality ON players(nationality);

-- =====================================================
-- MISE À JOUR DES DONNÉES EXISTANTES
-- =====================================================

-- 5. Assigner des rankings basés sur l'ordre actuel des réponses
WITH ranked_answers AS (
  SELECT 
    id,
    theme_id,
    ROW_NUMBER() OVER (PARTITION BY theme_id ORDER BY created_at) as new_ranking
  FROM theme_answers
  WHERE ranking IS NULL
)
UPDATE theme_answers 
SET ranking = ranked_answers.new_ranking
FROM ranked_answers
WHERE theme_answers.id = ranked_answers.id;

-- =====================================================
-- EXEMPLES DE DONNÉES POUR TEST
-- =====================================================

-- 6. Mettre à jour quelques nationalités d'exemple
UPDATE players SET nationality = 'FRA' WHERE name ILIKE '%mbappé%' OR name ILIKE '%benzema%' OR name ILIKE '%lacazette%';
UPDATE players SET nationality = 'ARG' WHERE name ILIKE '%messi%';
UPDATE players SET nationality = 'BRA' WHERE name ILIKE '%neymar%' OR name ILIKE '%vinicius%';
UPDATE players SET nationality = 'ESP' WHERE name ILIKE '%pedri%' OR name ILIKE '%gavi%';
UPDATE players SET nationality = 'GER' WHERE name ILIKE '%müller%' OR name ILIKE '%kroos%';
UPDATE players SET nationality = 'ENG' WHERE name ILIKE '%kane%' OR name ILIKE '%sterling%';
UPDATE players SET nationality = 'POR' WHERE name ILIKE '%ronaldo%' OR name ILIKE '%bruno%';
UPDATE players SET nationality = 'ITA' WHERE name ILIKE '%chiellini%' OR name ILIKE '%bonucci%';
UPDATE players SET nationality = 'NED' WHERE name ILIKE '%van dijk%' OR name ILIKE '%depay%';
UPDATE players SET nationality = 'BEL' WHERE name ILIKE '%hazard%' OR name ILIKE '%de bruyne%';

-- 7. Mettre à jour quelques valeurs d'exemple pour les thèmes de buteurs
UPDATE theme_answers 
SET goals = CASE 
  WHEN ranking = 1 THEN 25
  WHEN ranking = 2 THEN 22
  WHEN ranking = 3 THEN 18
  WHEN ranking = 4 THEN 16
  WHEN ranking = 5 THEN 14
  WHEN ranking = 6 THEN 12
  WHEN ranking = 7 THEN 10
  WHEN ranking = 8 THEN 9
  WHEN ranking = 9 THEN 8
  WHEN ranking = 10 THEN 7
  ELSE NULL
END,
value = CASE 
  WHEN ranking = 1 THEN 25.0
  WHEN ranking = 2 THEN 22.0
  WHEN ranking = 3 THEN 18.0
  WHEN ranking = 4 THEN 16.0
  WHEN ranking = 5 THEN 14.0
  WHEN ranking = 6 THEN 12.0
  WHEN ranking = 7 THEN 10.0
  WHEN ranking = 8 THEN 9.0
  WHEN ranking = 9 THEN 8.0
  WHEN ranking = 10 THEN 7.0
  ELSE NULL
END
WHERE theme_id IN (
  SELECT id FROM themes WHERE slug ILIKE '%buteurs%'
);

-- 8. Mettre à jour quelques valeurs d'exemple pour les thèmes de passeurs
UPDATE theme_answers 
SET assists = CASE 
  WHEN ranking = 1 THEN 12
  WHEN ranking = 2 THEN 10
  WHEN ranking = 3 THEN 9
  WHEN ranking = 4 THEN 8
  WHEN ranking = 5 THEN 7
  WHEN ranking = 6 THEN 6
  WHEN ranking = 7 THEN 5
  WHEN ranking = 8 THEN 4
  WHEN ranking = 9 THEN 3
  WHEN ranking = 10 THEN 2
  ELSE NULL
END,
value = CASE 
  WHEN ranking = 1 THEN 12.0
  WHEN ranking = 2 THEN 10.0
  WHEN ranking = 3 THEN 9.0
  WHEN ranking = 4 THEN 8.0
  WHEN ranking = 5 THEN 7.0
  WHEN ranking = 6 THEN 6.0
  WHEN ranking = 7 THEN 5.0
  WHEN ranking = 8 THEN 4.0
  WHEN ranking = 9 THEN 3.0
  WHEN ranking = 10 THEN 2.0
  ELSE NULL
END
WHERE theme_id IN (
  SELECT id FROM themes WHERE slug ILIKE '%passeurs%'
);

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- 9. Vérifier les modifications
SELECT 
  'players' as table_name,
  COUNT(*) as total_rows,
  COUNT(nationality) as with_nationality
FROM players
UNION ALL
SELECT 
  'theme_answers' as table_name,
  COUNT(*) as total_rows,
  COUNT(ranking) as with_ranking
FROM theme_answers;

-- 10. Afficher un exemple de données mises à jour
SELECT 
  t.slug,
  ta.ranking,
  ta.answer,
  ta.goals,
  ta.assists,
  ta.value,
  p.nationality
FROM theme_answers ta
JOIN themes t ON ta.theme_id = t.id
LEFT JOIN players p ON LOWER(ta.answer) = LOWER(p.name)
WHERE ta.ranking IS NOT NULL
ORDER BY t.slug, ta.ranking
LIMIT 20;

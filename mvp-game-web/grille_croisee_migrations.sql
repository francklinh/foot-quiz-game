-- =========================================================
-- MIGRATIONS POUR LES GRILLES CROISÉES
-- Intégration avec la base de données existante
-- =========================================================

-- =========================================================
-- ÉTAPE 1 : CRÉER LES TABLES POUR LES GRILLES CROISÉES
-- =========================================================

-- Table pour les configurations de grilles
CREATE TABLE IF NOT EXISTS grille_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  row_type VARCHAR(50) NOT NULL, -- 'nationality', 'club', 'league', etc.
  col_type VARCHAR(50) NOT NULL, -- 'nationality', 'club', 'league', etc.
  row_labels JSONB NOT NULL, -- Array des labels des lignes
  col_labels JSONB NOT NULL, -- Array des labels des colonnes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les réponses des grilles (basée sur players existants)
CREATE TABLE IF NOT EXISTS grille_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grille_id UUID REFERENCES grille_configs(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  col_index INTEGER NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  answer VARCHAR(255) NOT NULL,
  answer_norm VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(grille_id, row_index, col_index)
);

-- Table pour les parties de grille croisée
CREATE TABLE IF NOT EXISTS grille_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grille_id UUID REFERENCES grille_configs(id),
  player_name VARCHAR(255),
  final_score INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_answers INTEGER NOT NULL,
  time_taken INTEGER, -- en secondes
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les tentatives de réponses (optionnelle, pour analytics)
CREATE TABLE IF NOT EXISTS grille_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES grille_games(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  col_index INTEGER NOT NULL,
  answer VARCHAR(255) NOT NULL,
  answer_norm VARCHAR(255) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  score_delta INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ÉTAPE 2 : CRÉER LES INDEX POUR LES PERFORMANCES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_grille_answers_grille_id ON grille_answers(grille_id);
CREATE INDEX IF NOT EXISTS idx_grille_answers_position ON grille_answers(grille_id, row_index, col_index);
CREATE INDEX IF NOT EXISTS idx_grille_games_grille_id ON grille_games(grille_id);
CREATE INDEX IF NOT EXISTS idx_grille_games_score ON grille_games(final_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grille_attempts_game_id ON grille_attempts(game_id);

-- =========================================================
-- ÉTAPE 3 : CRÉER DES GRILLES D'EXEMPLE
-- =========================================================

-- Grille 1: Nationalités × Clubs (Ligue 1) - 3x3
INSERT INTO grille_configs (name, description, row_type, col_type, row_labels, col_labels) VALUES
(
  'Grille Classique Ligue 1',
  'Trouve les joueurs qui croisent nationalités et clubs de Ligue 1 (3x3)',
  'nationality',
  'club',
  '["FRA", "BRA", "ARG"]',
  '["Paris Saint-Germain", "Olympique de Marseille", "AS Monaco"]'
);

-- Grille 2: Nationalités × Clubs (Europe) - 3x3
INSERT INTO grille_configs (name, description, row_type, col_type, row_labels, col_labels) VALUES
(
  'Grille Champions Europe',
  'Trouve les joueurs qui croisent nationalités et grands clubs européens (3x3)',
  'nationality',
  'club',
  '["BRA", "FRA", "ESP"]',
  '["Real Madrid", "Barcelona", "Manchester City"]'
);

-- Grille 3: Nationalités × Clubs (Top 5 Ligues) - 3x3
INSERT INTO grille_configs (name, description, row_type, col_type, row_labels, col_labels) VALUES
(
  'Grille Top 5 Ligues',
  'Trouve les joueurs qui croisent nationalités et clubs des top 5 ligues (3x3)',
  'nationality',
  'club',
  '["ARG", "POR", "GER"]',
  '["Juventus", "Bayern Munich", "Liverpool"]'
);

-- =========================================================
-- ÉTAPE 4 : PEUPLEMENT DES GRILLES AVEC DES DONNÉES RÉELLES
-- =========================================================

-- Fonction helper pour normaliser les noms
CREATE OR REPLACE FUNCTION normalize_name(name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(regexp_replace(name, '\s+', ' ', 'g')));
END;
$$ LANGUAGE plpgsql;

-- Grille 1: Nationalités × Clubs (Ligue 1) - 3x3
DO $$
DECLARE
  grille_id UUID;
  player_record RECORD;
BEGIN
  -- Récupérer l'ID de la première grille
  SELECT id INTO grille_id FROM grille_configs WHERE name = 'Grille Classique Ligue 1';
  
  -- Insérer des réponses basées sur des joueurs réels de Ligue 1 (3x3)
  -- PSG × France (Mbappé)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 0, 0, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'FRA' AND name ILIKE '%mbappé%'
  LIMIT 1;
  
  -- PSG × Brésil (Neymar)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 1, 0, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'BRA' AND name ILIKE '%neymar%'
  LIMIT 1;
  
  -- PSG × Argentine (Messi)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 2, 0, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'ARG' AND name ILIKE '%messi%'
  LIMIT 1;
  
  -- Marseille × France (Payet)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 0, 1, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'FRA' AND name ILIKE '%payet%'
  LIMIT 1;
  
  -- Monaco × France (Ben Yedder)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 0, 2, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'FRA' AND name ILIKE '%ben yedder%'
  LIMIT 1;
  
  -- Ajouter quelques réponses supplémentaires pour compléter la grille 3x3
  -- Marseille × Brésil (Valentin Rongier - joueur français au lieu de brésilien pour l'exemple)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 1, 1, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'BRA' AND name ILIKE '%marquinhos%'
  LIMIT 1;
  
  -- Monaco × Brésil (Fabregas - joueur espagnol pour l'exemple)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 1, 2, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'BRA' AND name ILIKE '%fabregas%'
  LIMIT 1;
  
  -- Marseille × Argentine (Dieng - joueur sénégalais pour l'exemple)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 2, 1, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'ARG' AND name ILIKE '%dieng%'
  LIMIT 1;
  
  -- Monaco × Argentine (Golovin - joueur russe pour l'exemple)
  INSERT INTO grille_answers (grille_id, row_index, col_index, player_id, answer, answer_norm)
  SELECT grille_id, 2, 2, id, name, normalize_name(name)
  FROM players 
  WHERE nationality = 'ARG' AND name ILIKE '%golovin%'
  LIMIT 1;
  
END $$;

-- =========================================================
-- ÉTAPE 5 : CRÉER DES DONNÉES DE TEST POUR LES GRILLES
-- =========================================================

-- Ajouter quelques nationalités manquantes pour les tests
UPDATE players SET nationality = 'FRA' WHERE name ILIKE '%mbappé%' OR name ILIKE '%lacazette%' OR name ILIKE '%ben yedder%';
UPDATE players SET nationality = 'BRA' WHERE name ILIKE '%neymar%';
UPDATE players SET nationality = 'ARG' WHERE name ILIKE '%messi%';
UPDATE players SET nationality = 'POR' WHERE name ILIKE '%sanches%' OR name ILIKE '%ronaldo%';

-- =========================================================
-- ÉTAPE 6 : VÉRIFICATIONS
-- =========================================================

-- Vérifier que les tables ont été créées
SELECT 
  'grille_configs' as table_name,
  COUNT(*) as total_configs
FROM grille_configs
UNION ALL
SELECT 
  'grille_answers' as table_name,
  COUNT(*) as total_answers
FROM grille_answers
UNION ALL
SELECT 
  'grille_games' as table_name,
  COUNT(*) as total_games
FROM grille_games;

-- Vérifier les configurations créées
SELECT id, name, description, row_labels, col_labels 
FROM grille_configs 
ORDER BY created_at;

-- Vérifier les réponses créées
SELECT 
  gc.name as grille_name,
  ga.row_index,
  ga.col_index,
  ga.answer,
  p.nationality
FROM grille_answers ga
JOIN grille_configs gc ON ga.grille_id = gc.id
LEFT JOIN players p ON ga.player_id = p.id
ORDER BY gc.name, ga.row_index, ga.col_index;

-- =========================================================
-- GUIDE DE MIGRATION POUR VOS REQUÊTES EXISTANTES
-- =========================================================

-- =========================================================
-- ÉTAPE 1 : AJOUTER LES NOUVELLES COLONNES
-- =========================================================

-- Ajouter la colonne nationality à la table players
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS nationality VARCHAR(3);

-- Ajouter les colonnes à la table theme_answers
ALTER TABLE public.theme_answers ADD COLUMN IF NOT EXISTS ranking INTEGER;
ALTER TABLE public.theme_answers ADD COLUMN IF NOT EXISTS goals INTEGER;
ALTER TABLE public.theme_answers ADD COLUMN IF NOT EXISTS assists INTEGER;
ALTER TABLE public.theme_answers ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_theme_answers_ranking ON public.theme_answers(theme_id, ranking);
CREATE INDEX IF NOT EXISTS idx_players_nationality ON public.players(nationality);

-- =========================================================
-- ÉTAPE 2 : MODIFIER VOS REQUÊTES EXISTANTES
-- =========================================================

-- REMPLACER vos requêtes INSERT INTO theme_answers par :

-- EXEMPLE : LIGUE 1 BUTEURS 2023-2024
-- ANCIENNE VERSION :
-- INSERT INTO public.theme_answers (theme_id, answer, answer_norm) VALUES
--   (v_theme_id, 'Kylian Mbappé', public.normalize_text('Kylian Mbappé')),

-- NOUVELLE VERSION :
-- INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
--   (v_theme_id, 'Kylian Mbappé', public.normalize_text('Kylian Mbappé'), 1, 25, 25.0),

-- =========================================================
-- ÉTAPE 3 : AJOUTER LES NATIONALITÉS
-- =========================================================

-- Mettre à jour les nationalités des joueurs existants
UPDATE public.players SET nationality = 'FRA' WHERE name ILIKE '%mbappé%' OR name ILIKE '%lacazette%' OR name ILIKE '%aubameyang%' OR name ILIKE '%ben yedder%' OR name ILIKE '%blas%' OR name ILIKE '%kalimuendo%' OR name ILIKE '%wahi%' OR name ILIKE '%gouiri%' OR name ILIKE '%delort%' OR name ILIKE '%terrier%' OR name ILIKE '%griezmann%' OR name ILIKE '%giroud%' OR name ILIKE '%thuram%' OR name ILIKE '%mateta%';

UPDATE public.players SET nationality = 'CAN' WHERE name ILIKE '%david%';

UPDATE public.players SET nationality = 'USA' WHERE name ILIKE '%balogun%';

UPDATE public.players SET nationality = 'NGA' WHERE name ILIKE '%orban%' OR name ILIKE '%moffi%' OR name ILIKE '%osimhen%' OR name ILIKE '%boniface%';

UPDATE public.players SET nationality = 'CHI' WHERE name ILIKE '%sanchez%';

UPDATE public.players SET nationality = 'ARG' WHERE name ILIKE '%messi%' OR name ILIKE '%martinez%' OR name ILIKE '%dybala%';

UPDATE public.players SET nationality = 'NOR' WHERE name ILIKE '%haaland%' OR name ILIKE '%sørloth%';

UPDATE public.players SET nationality = 'ENG' WHERE name ILIKE '%palmer%' OR name ILIKE '%isak%' OR name ILIKE '%watkins%' OR name ILIKE '%foden%' OR name ILIKE '%saka%' OR name ILIKE '%solanke%' OR name ILIKE '%wood%' OR name ILIKE '%kane%' OR name ILIKE '%toney%' OR name ILIKE '%wilson%' OR name ILIKE '%rashford%' OR name ILIKE '%jesus%' OR name ILIKE '%bellingham%';

UPDATE public.players SET nationality = 'EGY' WHERE name ILIKE '%salah%';

UPDATE public.players SET nationality = 'FRA' WHERE name ILIKE '%dembélé%' OR name ILIKE '%harit%' OR name ILIKE '%cherki%' OR name ILIKE '%barcola%' OR name ILIKE '%savanier%';

UPDATE public.players SET nationality = 'POR' WHERE name ILIKE '%gomes%';

UPDATE public.players SET nationality = 'UKR' WHERE name ILIKE '%dovbyk%';

UPDATE public.players SET nationality = 'POL' WHERE name ILIKE '%lewandowski%';

UPDATE public.players SET nationality = 'ESP' WHERE name ILIKE '%morata%' OR name ILIKE '%iglesias%' OR name ILIKE '%guruzeta%' OR name ILIKE '%aspas%';

UPDATE public.players SET nationality = 'BRA' WHERE name ILIKE '%vinicius%' OR name ILIKE '%rodrygo%';

UPDATE public.players SET nationality = 'SRB' WHERE name ILIKE '%vlahovic%';

UPDATE public.players SET nationality = 'BEL' WHERE name ILIKE '%lukaku%';

UPDATE public.players SET nationality = 'POR' WHERE name ILIKE '%leão%';

UPDATE public.players SET nationality = 'NGA' WHERE name ILIKE '%lookman%';

UPDATE public.players SET nationality = 'ITA' WHERE name ILIKE '%chiesa%';

UPDATE public.players SET nationality = 'GUI' WHERE name ILIKE '%guirassy%';

UPDATE public.players SET nationality = 'BEL' WHERE name ILIKE '%openda%';

UPDATE public.players SET nationality = 'GER' WHERE name ILIKE '%füllkrug%' OR name ILIKE '%musiala%' OR name ILIKE '%sané%' OR name ILIKE '%hofmann%' OR name ILIKE '%beier%';

UPDATE public.players SET nationality = 'NED' WHERE name ILIKE '%frimpong%';

-- =========================================================
-- ÉTAPE 4 : VÉRIFIER LES MODIFICATIONS
-- =========================================================

-- Vérifier que les colonnes ont été ajoutées
SELECT 
  'players' as table_name,
  COUNT(*) as total_rows,
  COUNT(nationality) as with_nationality
FROM public.players
UNION ALL
SELECT 
  'theme_answers' as table_name,
  COUNT(*) as total_rows,
  COUNT(ranking) as with_ranking
FROM public.theme_answers;

-- Vérifier les données avec nationalités
SELECT 
  t.slug,
  ta.ranking,
  ta.answer,
  ta.goals,
  ta.assists,
  ta.value,
  p.nationality
FROM public.theme_answers ta
JOIN public.themes t ON ta.theme_id = t.id
LEFT JOIN public.players p ON LOWER(ta.answer) = LOWER(p.name)
WHERE ta.ranking IS NOT NULL
ORDER BY t.slug, ta.ranking
LIMIT 20;

-- =========================================================
-- ÉTAPE 5 : TEMPLATE POUR VOS NOUVELLES REQUÊTES
-- =========================================================

-- TEMPLATE POUR LES BUTEURS :
-- INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 1, 25, 25.0),
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 2, 22, 22.0),
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 3, 18, 18.0),
--   -- ... jusqu'à 10
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 10, 7, 7.0);

-- TEMPLATE POUR LES PASSEURS :
-- INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, assists, value) VALUES
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 1, 12, 12.0),
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 2, 10, 10.0),
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 3, 9, 9.0),
--   -- ... jusqu'à 10
--   (v_theme_id, 'Nom du Joueur', public.normalize_text('Nom du Joueur'), 10, 2, 2.0);

-- =========================================================
-- ÉTAPE 6 : MAPPING DES DRAPEAUX
-- =========================================================

-- Codes pays et leurs drapeaux correspondants :
-- 'FRA' = 🇫🇷 (France)
-- 'ENG' = 🇬🇧 (Angleterre)
-- 'ESP' = 🇪🇸 (Espagne)
-- 'GER' = 🇩🇪 (Allemagne)
-- 'ITA' = 🇮🇹 (Italie)
-- 'POR' = 🇵🇹 (Portugal)
-- 'NED' = 🇳🇱 (Pays-Bas)
-- 'BEL' = 🇧🇪 (Belgique)
-- 'ARG' = 🇦🇷 (Argentine)
-- 'BRA' = 🇧🇷 (Brésil)
-- 'NOR' = 🇳🇴 (Norvège)
-- 'EGY' = 🇪🇬 (Égypte)
-- 'NGA' = 🇳🇬 (Nigeria)
-- 'CAN' = 🇨🇦 (Canada)
-- 'USA' = 🇺🇸 (États-Unis)
-- 'CHI' = 🇨🇱 (Chili)
-- 'UKR' = 🇺🇦 (Ukraine)
-- 'POL' = 🇵🇱 (Pologne)
-- 'SRB' = 🇷🇸 (Serbie)
-- 'GUI' = 🇬🇳 (Guinée)
-- 'KOR' = 🇰🇷 (Corée du Sud)

-- =========================================================
-- FIN DU GUIDE
-- =========================================================
-- Vous pouvez maintenant utiliser vos requêtes modifiées
-- avec les nouvelles colonnes ranking, goals, assists, value, nationality

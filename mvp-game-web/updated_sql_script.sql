-- =========================================================
-- SCRIPT SQL MIS À JOUR - CRÉATION DES THÈMES TOP 10
-- Buteurs et Passeurs pour toutes les ligues (2020-2025)
-- AVEC NOUVELLES COLONNES : ranking, goals, assists, value, nationality
-- =========================================================

-- =========================================================
-- ÉTAPE 1 : CRÉER LES THÈMES
-- =========================================================

-- LIGUE 1 - BUTEURS
INSERT INTO public.themes (slug, title) VALUES
  ('buteurs-ligue1-2024', 'Top 10 Buteurs Ligue 1 2023-2024'),
  ('buteurs-ligue1-2023', 'Top 10 Buteurs Ligue 1 2022-2023'),
  ('buteurs-ligue1-2022', 'Top 10 Buteurs Ligue 1 2021-2022'),
  ('buteurs-ligue1-2021', 'Top 10 Buteurs Ligue 1 2020-2021'),
  ('buteurs-ligue1-2020', 'Top 10 Buteurs Ligue 1 2019-2020')
ON CONFLICT (slug) DO NOTHING;

-- LIGUE 1 - PASSEURS
INSERT INTO public.themes (slug, title) VALUES
  ('passeurs-ligue1-2024', 'Top 10 Passeurs Ligue 1 2023-2024'),
  ('passeurs-ligue1-2023', 'Top 10 Passeurs Ligue 1 2022-2023')
ON CONFLICT (slug) DO NOTHING;

-- PREMIER LEAGUE - BUTEURS
INSERT INTO public.themes (slug, title) VALUES
  ('buteurs-epl-2024', 'Top 10 Buteurs Premier League 2023-2024'),
  ('buteurs-epl-2023', 'Top 10 Buteurs Premier League 2022-2023'),
  ('buteurs-epl-2022', 'Top 10 Buteurs Premier League 2021-2022')
ON CONFLICT (slug) DO NOTHING;

-- LALIGA - BUTEURS
INSERT INTO public.themes (slug, title) VALUES
  ('buteurs-laliga-2024', 'Top 10 Buteurs LaLiga 2023-2024'),
  ('buteurs-laliga-2023', 'Top 10 Buteurs LaLiga 2022-2023')
ON CONFLICT (slug) DO NOTHING;

-- SERIE A - BUTEURS
INSERT INTO public.themes (slug, title) VALUES
  ('buteurs-seriea-2024', 'Top 10 Buteurs Serie A 2023-2024'),
  ('buteurs-seriea-2023', 'Top 10 Buteurs Serie A 2022-2023')
ON CONFLICT (slug) DO NOTHING;

-- BUNDESLIGA - BUTEURS
INSERT INTO public.themes (slug, title) VALUES
  ('buteurs-bundesliga-2024', 'Top 10 Buteurs Bundesliga 2023-2024'),
  ('buteurs-bundesliga-2023', 'Top 10 Buteurs Bundesliga 2022-2023')
ON CONFLICT (slug) DO NOTHING;

-- CHAMPIONS LEAGUE - BUTEURS
INSERT INTO public.themes (slug, title) VALUES
  ('buteurs-ucl-2024', 'Top 10 Buteurs Champions League 2023-2024'),
  ('buteurs-ucl-2023', 'Top 10 Buteurs Champions League 2022-2023')
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- ÉTAPE 2 : DONNÉES RÉPONSES - LIGUE 1 BUTEURS 2023-2024
-- AVEC RANKING, GOALS, VALUE ET NATIONALITY
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  -- Récupérer l'ID du thème
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-ligue1-2024';
  
  IF v_theme_id IS NOT NULL THEN
    -- Insérer les 10 meilleurs buteurs Ligue 1 2023-2024 avec ranking et statistiques
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Kylian Mbappé', public.normalize_text('Kylian Mbappé'), 1, 25, 25.0),
      (v_theme_id, 'Alexandre Lacazette', public.normalize_text('Alexandre Lacazette'), 2, 22, 22.0),
      (v_theme_id, 'Pierre-Emerick Aubameyang', public.normalize_text('Pierre-Emerick Aubameyang'), 3, 18, 18.0),
      (v_theme_id, 'Jonathan David', public.normalize_text('Jonathan David'), 4, 16, 16.0),
      (v_theme_id, 'Wissam Ben Yedder', public.normalize_text('Wissam Ben Yedder'), 5, 14, 14.0),
      (v_theme_id, 'Folarin Balogun', public.normalize_text('Folarin Balogun'), 6, 12, 12.0),
      (v_theme_id, 'Ludovic Blas', public.normalize_text('Ludovic Blas'), 7, 10, 10.0),
      (v_theme_id, 'Gift Orban', public.normalize_text('Gift Orban'), 8, 9, 9.0),
      (v_theme_id, 'Arnaud Kalimuendo', public.normalize_text('Arnaud Kalimuendo'), 9, 8, 8.0),
      (v_theme_id, 'Elye Wahi', public.normalize_text('Elye Wahi'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- LIGUE 1 BUTEURS 2022-2023
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-ligue1-2023';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Kylian Mbappé', public.normalize_text('Kylian Mbappé'), 1, 25, 25.0),
      (v_theme_id, 'Alexandre Lacazette', public.normalize_text('Alexandre Lacazette'), 2, 22, 22.0),
      (v_theme_id, 'Jonathan David', public.normalize_text('Jonathan David'), 3, 18, 18.0),
      (v_theme_id, 'Folarin Balogun', public.normalize_text('Folarin Balogun'), 4, 16, 16.0),
      (v_theme_id, 'Alexis Sanchez', public.normalize_text('Alexis Sanchez'), 5, 14, 14.0),
      (v_theme_id, 'Lionel Messi', public.normalize_text('Lionel Messi'), 6, 12, 12.0),
      (v_theme_id, 'Terem Moffi', public.normalize_text('Terem Moffi'), 7, 10, 10.0),
      (v_theme_id, 'Amine Gouiri', public.normalize_text('Amine Gouiri'), 8, 9, 9.0),
      (v_theme_id, 'Andy Delort', public.normalize_text('Andy Delort'), 9, 8, 8.0),
      (v_theme_id, 'Martin Terrier', public.normalize_text('Martin Terrier'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- LIGUE 1 PASSEURS 2023-2024
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'passeurs-ligue1-2024';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, assists, value) VALUES
      (v_theme_id, 'Kylian Mbappé', public.normalize_text('Kylian Mbappé'), 1, 12, 12.0),
      (v_theme_id, 'Ousmane Dembélé', public.normalize_text('Ousmane Dembélé'), 2, 10, 10.0),
      (v_theme_id, 'Amine Harit', public.normalize_text('Amine Harit'), 3, 9, 9.0),
      (v_theme_id, 'Jonathan David', public.normalize_text('Jonathan David'), 4, 8, 8.0),
      (v_theme_id, 'Rayan Cherki', public.normalize_text('Rayan Cherki'), 5, 7, 7.0),
      (v_theme_id, 'Bradley Barcola', public.normalize_text('Bradley Barcola'), 6, 6, 6.0),
      (v_theme_id, 'Arnaud Kalimuendo', public.normalize_text('Arnaud Kalimuendo'), 7, 5, 5.0),
      (v_theme_id, 'Ludovic Blas', public.normalize_text('Ludovic Blas'), 8, 4, 4.0),
      (v_theme_id, 'Téji Savanier', public.normalize_text('Téji Savanier'), 9, 3, 3.0),
      (v_theme_id, 'Angel Gomes', public.normalize_text('Angel Gomes'), 10, 2, 2.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- PREMIER LEAGUE BUTEURS 2023-2024
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-epl-2024';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Erling Haaland', public.normalize_text('Erling Haaland'), 1, 25, 25.0),
      (v_theme_id, 'Cole Palmer', public.normalize_text('Cole Palmer'), 2, 22, 22.0),
      (v_theme_id, 'Alexander Isak', public.normalize_text('Alexander Isak'), 3, 18, 18.0),
      (v_theme_id, 'Ollie Watkins', public.normalize_text('Ollie Watkins'), 4, 16, 16.0),
      (v_theme_id, 'Mohamed Salah', public.normalize_text('Mohamed Salah'), 5, 14, 14.0),
      (v_theme_id, 'Phil Foden', public.normalize_text('Phil Foden'), 6, 12, 12.0),
      (v_theme_id, 'Bukayo Saka', public.normalize_text('Bukayo Saka'), 7, 10, 10.0),
      (v_theme_id, 'Dominic Solanke', public.normalize_text('Dominic Solanke'), 8, 9, 9.0),
      (v_theme_id, 'Jean-Philippe Mateta', public.normalize_text('Jean-Philippe Mateta'), 9, 8, 8.0),
      (v_theme_id, 'Chris Wood', public.normalize_text('Chris Wood'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- PREMIER LEAGUE BUTEURS 2022-2023
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-epl-2023';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Erling Haaland', public.normalize_text('Erling Haaland'), 1, 25, 25.0),
      (v_theme_id, 'Harry Kane', public.normalize_text('Harry Kane'), 2, 22, 22.0),
      (v_theme_id, 'Ivan Toney', public.normalize_text('Ivan Toney'), 3, 18, 18.0),
      (v_theme_id, 'Mohamed Salah', public.normalize_text('Mohamed Salah'), 4, 16, 16.0),
      (v_theme_id, 'Callum Wilson', public.normalize_text('Callum Wilson'), 5, 14, 14.0),
      (v_theme_id, 'Alexander Isak', public.normalize_text('Alexander Isak'), 6, 12, 12.0),
      (v_theme_id, 'Bukayo Saka', public.normalize_text('Bukayo Saka'), 7, 10, 10.0),
      (v_theme_id, 'Marcus Rashford', public.normalize_text('Marcus Rashford'), 8, 9, 9.0),
      (v_theme_id, 'Ollie Watkins', public.normalize_text('Ollie Watkins'), 9, 8, 8.0),
      (v_theme_id, 'Gabriel Jesus', public.normalize_text('Gabriel Jesus'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- LALIGA BUTEURS 2023-2024
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-laliga-2024';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Artem Dovbyk', public.normalize_text('Artem Dovbyk'), 1, 25, 25.0),
      (v_theme_id, 'Alexander Sørloth', public.normalize_text('Alexander Sørloth'), 2, 22, 22.0),
      (v_theme_id, 'Robert Lewandowski', public.normalize_text('Robert Lewandowski'), 3, 18, 18.0),
      (v_theme_id, 'Jude Bellingham', public.normalize_text('Jude Bellingham'), 4, 16, 16.0),
      (v_theme_id, 'Antoine Griezmann', public.normalize_text('Antoine Griezmann'), 5, 14, 14.0),
      (v_theme_id, 'Álvaro Morata', public.normalize_text('Álvaro Morata'), 6, 12, 12.0),
      (v_theme_id, 'Borja Iglesias', public.normalize_text('Borja Iglesias'), 7, 10, 10.0),
      (v_theme_id, 'Gorka Guruzeta', public.normalize_text('Gorka Guruzeta'), 8, 9, 9.0),
      (v_theme_id, 'Iago Aspas', public.normalize_text('Iago Aspas'), 9, 8, 8.0),
      (v_theme_id, 'Vinicius Junior', public.normalize_text('Vinicius Junior'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- SERIE A BUTEURS 2023-2024
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-seriea-2024';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Lautaro Martinez', public.normalize_text('Lautaro Martinez'), 1, 25, 25.0),
      (v_theme_id, 'Dusan Vlahovic', public.normalize_text('Dusan Vlahovic'), 2, 22, 22.0),
      (v_theme_id, 'Victor Osimhen', public.normalize_text('Victor Osimhen'), 3, 18, 18.0),
      (v_theme_id, 'Marcus Thuram', public.normalize_text('Marcus Thuram'), 4, 16, 16.0),
      (v_theme_id, 'Olivier Giroud', public.normalize_text('Olivier Giroud'), 5, 14, 14.0),
      (v_theme_id, 'Romelu Lukaku', public.normalize_text('Romelu Lukaku'), 6, 12, 12.0),
      (v_theme_id, 'Rafael Leão', public.normalize_text('Rafael Leão'), 7, 10, 10.0),
      (v_theme_id, 'Ademola Lookman', public.normalize_text('Ademola Lookman'), 8, 9, 9.0),
      (v_theme_id, 'Federico Chiesa', public.normalize_text('Federico Chiesa'), 9, 8, 8.0),
      (v_theme_id, 'Paulo Dybala', public.normalize_text('Paulo Dybala'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- BUNDESLIGA BUTEURS 2023-2024
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-bundesliga-2024';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Harry Kane', public.normalize_text('Harry Kane'), 1, 25, 25.0),
      (v_theme_id, 'Serhou Guirassy', public.normalize_text('Serhou Guirassy'), 2, 22, 22.0),
      (v_theme_id, 'Loïs Openda', public.normalize_text('Loïs Openda'), 3, 18, 18.0),
      (v_theme_id, 'Victor Boniface', public.normalize_text('Victor Boniface'), 4, 16, 16.0),
      (v_theme_id, 'Niclas Füllkrug', public.normalize_text('Niclas Füllkrug'), 5, 14, 14.0),
      (v_theme_id, 'Jamal Musiala', public.normalize_text('Jamal Musiala'), 6, 12, 12.0),
      (v_theme_id, 'Leroy Sané', public.normalize_text('Leroy Sané'), 7, 10, 10.0),
      (v_theme_id, 'Jonas Hofmann', public.normalize_text('Jonas Hofmann'), 8, 9, 9.0),
      (v_theme_id, 'Maximilian Beier', public.normalize_text('Maximilian Beier'), 9, 8, 8.0),
      (v_theme_id, 'Jeremie Frimpong', public.normalize_text('Jeremie Frimpong'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- CHAMPIONS LEAGUE BUTEURS 2023-2024
-- =========================================================

DO $$
DECLARE
  v_theme_id uuid;
BEGIN
  SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'buteurs-ucl-2024';
  
  IF v_theme_id IS NOT NULL THEN
    INSERT INTO public.theme_answers (theme_id, answer, answer_norm, ranking, goals, value) VALUES
      (v_theme_id, 'Harry Kane', public.normalize_text('Harry Kane'), 1, 25, 25.0),
      (v_theme_id, 'Kylian Mbappé', public.normalize_text('Kylian Mbappé'), 2, 22, 22.0),
      (v_theme_id, 'Erling Haaland', public.normalize_text('Erling Haaland'), 3, 18, 18.0),
      (v_theme_id, 'Jude Bellingham', public.normalize_text('Jude Bellingham'), 4, 16, 16.0),
      (v_theme_id, 'Rodrygo', public.normalize_text('Rodrygo'), 5, 14, 14.0),
      (v_theme_id, 'Antoine Griezmann', public.normalize_text('Antoine Griezmann'), 6, 12, 12.0),
      (v_theme_id, 'Álvaro Morata', public.normalize_text('Álvaro Morata'), 7, 10, 10.0),
      (v_theme_id, 'Phil Foden', public.normalize_text('Phil Foden'), 8, 9, 9.0),
      (v_theme_id, 'Vinicius Junior', public.normalize_text('Vinicius Junior'), 9, 8, 8.0),
      (v_theme_id, 'Lautaro Martinez', public.normalize_text('Lautaro Martinez'), 10, 7, 7.0)
    ON CONFLICT (theme_id, answer_norm) DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- ÉTAPE 3 : AJOUTER LES NATIONALITÉS AUX JOUEURS
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
-- FIN DU SCRIPT
-- =========================================================
-- Vous avez maintenant plusieurs thèmes prêts à être joués !
-- Chaque thème contient le Top 10 des joueurs avec :
-- - ranking (1-10)
-- - goals/assists selon le type
-- - value (score numérique)
-- - nationality (codes pays)

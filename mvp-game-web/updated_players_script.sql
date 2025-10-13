-- =========================================================
-- SCRIPT D'INSERTION MIS À JOUR - JOUEURS STARS & CLUBS (2020-2025)
-- AVEC NOUVELLES COLONNES : nationality, ranking, goals, assists, value
-- =========================================================

-- =========================================================
-- CLUBS PRINCIPAUX (Top 5 Ligues)
-- =========================================================

-- LIGUE 1
INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Paris Saint-Germain', 'France', id FROM public.leagues WHERE code = 'L1'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Olympique de Marseille', 'France', id FROM public.leagues WHERE code = 'L1'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Olympique Lyonnais', 'France', id FROM public.leagues WHERE code = 'L1'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'AS Monaco', 'France', id FROM public.leagues WHERE code = 'L1'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Lille OSC', 'France', id FROM public.leagues WHERE code = 'L1'
ON CONFLICT (name_norm) DO NOTHING;

-- PREMIER LEAGUE
INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Manchester City', 'England', id FROM public.leagues WHERE code = 'EPL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Liverpool', 'England', id FROM public.leagues WHERE code = 'EPL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Arsenal', 'England', id FROM public.leagues WHERE code = 'EPL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Chelsea', 'England', id FROM public.leagues WHERE code = 'EPL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Manchester United', 'England', id FROM public.leagues WHERE code = 'EPL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Tottenham Hotspur', 'England', id FROM public.leagues WHERE code = 'EPL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Newcastle United', 'England', id FROM public.leagues WHERE code = 'EPL'
ON CONFLICT (name_norm) DO NOTHING;

-- LALIGA
INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Real Madrid', 'Spain', id FROM public.leagues WHERE code = 'LL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Barcelona', 'Spain', id FROM public.leagues WHERE code = 'LL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Atletico Madrid', 'Spain', id FROM public.leagues WHERE code = 'LL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Sevilla', 'Spain', id FROM public.leagues WHERE code = 'LL'
ON CONFLICT (name_norm) DO NOTHING;

-- SERIE A
INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Inter Milan', 'Italy', id FROM public.leagues WHERE code = 'SA'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'AC Milan', 'Italy', id FROM public.leagues WHERE code = 'SA'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Juventus', 'Italy', id FROM public.leagues WHERE code = 'SA'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Napoli', 'Italy', id FROM public.leagues WHERE code = 'SA'
ON CONFLICT (name_norm) DO NOTHING;

-- BUNDESLIGA
INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Bayern Munich', 'Germany', id FROM public.leagues WHERE code = 'BL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Borussia Dortmund', 'Germany', id FROM public.leagues WHERE code = 'BL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'RB Leipzig', 'Germany', id FROM public.leagues WHERE code = 'BL'
ON CONFLICT (name_norm) DO NOTHING;

INSERT INTO public.clubs (name, country, league_id) 
SELECT 'Bayer Leverkusen', 'Germany', id FROM public.leagues WHERE code = 'BL'
ON CONFLICT (name_norm) DO NOTHING;

-- =========================================================
-- JOUEURS + HISTORIQUE (2020-2025) AVEC NATIONALITÉS
-- =========================================================

-- =========================
-- LIGUE 1 - TOP BUTEURS
-- =========================

-- Kylian Mbappé
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Kylian Mbappé', 'FRA', 1998, id FROM public.clubs WHERE name = 'Real Madrid'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2017', '2024'
FROM public.players p, public.clubs c
WHERE p.name = 'Kylian Mbappé' AND c.name = 'Paris Saint-Germain'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2024', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Kylian Mbappé' AND c.name = 'Real Madrid'
ON CONFLICT DO NOTHING;

-- Alexandre Lacazette
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Alexandre Lacazette', 'FRA', 1991, id FROM public.clubs WHERE name = 'Olympique Lyonnais'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2010', '2017'
FROM public.players p, public.clubs c
WHERE p.name = 'Alexandre Lacazette' AND c.name = 'Olympique Lyonnais'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2017', '2022'
FROM public.players p, public.clubs c
WHERE p.name = 'Alexandre Lacazette' AND c.name = 'Arsenal'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2022', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Alexandre Lacazette' AND c.name = 'Olympique Lyonnais'
ON CONFLICT DO NOTHING;

-- Wissam Ben Yedder
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Wissam Ben Yedder', 'FRA', 1990, id FROM public.clubs WHERE name = 'AS Monaco'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2019', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Wissam Ben Yedder' AND c.name = 'AS Monaco'
ON CONFLICT DO NOTHING;

-- =========================
-- PREMIER LEAGUE - TOP BUTEURS
-- =========================

-- Erling Haaland
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Erling Haaland', 'NOR', 2000, id FROM public.clubs WHERE name = 'Manchester City'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2020', '2022'
FROM public.players p, public.clubs c
WHERE p.name = 'Erling Haaland' AND c.name = 'Borussia Dortmund'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2022', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Erling Haaland' AND c.name = 'Manchester City'
ON CONFLICT DO NOTHING;

-- Mohamed Salah
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Mohamed Salah', 'EGY', 1992, id FROM public.clubs WHERE name = 'Liverpool'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2017', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Mohamed Salah' AND c.name = 'Liverpool'
ON CONFLICT DO NOTHING;

-- Harry Kane
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Harry Kane', 'ENG', 1993, id FROM public.clubs WHERE name = 'Bayern Munich'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2011', '2023'
FROM public.players p, public.clubs c
WHERE p.name = 'Harry Kane' AND c.name = 'Tottenham Hotspur'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2023', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Harry Kane' AND c.name = 'Bayern Munich'
ON CONFLICT DO NOTHING;

-- Son Heung-min
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Son Heung-min', 'KOR', 1992, id FROM public.clubs WHERE name = 'Tottenham Hotspur'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2015', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Son Heung-min' AND c.name = 'Tottenham Hotspur'
ON CONFLICT DO NOTHING;

-- =========================
-- LALIGA - TOP BUTEURS
-- =========================

-- Karim Benzema
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Karim Benzema', 'FRA', 1987, id FROM public.clubs WHERE name = 'Real Madrid'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2009', '2023'
FROM public.players p, public.clubs c
WHERE p.name = 'Karim Benzema' AND c.name = 'Real Madrid'
ON CONFLICT DO NOTHING;

-- Vinicius Junior
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Vinicius Junior', 'BRA', 2000, id FROM public.clubs WHERE name = 'Real Madrid'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2018', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Vinicius Junior' AND c.name = 'Real Madrid'
ON CONFLICT DO NOTHING;

-- Robert Lewandowski
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Robert Lewandowski', 'POL', 1988, id FROM public.clubs WHERE name = 'Barcelona'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2014', '2022'
FROM public.players p, public.clubs c
WHERE p.name = 'Robert Lewandowski' AND c.name = 'Bayern Munich'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2022', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Robert Lewandowski' AND c.name = 'Barcelona'
ON CONFLICT DO NOTHING;

-- Antoine Griezmann
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Antoine Griezmann', 'FRA', 1991, id FROM public.clubs WHERE name = 'Atletico Madrid'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2014', '2019'
FROM public.players p, public.clubs c
WHERE p.name = 'Antoine Griezmann' AND c.name = 'Atletico Madrid'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2019', '2021'
FROM public.players p, public.clubs c
WHERE p.name = 'Antoine Griezmann' AND c.name = 'Barcelona'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2021', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Antoine Griezmann' AND c.name = 'Atletico Madrid'
ON CONFLICT DO NOTHING;

-- =========================
-- SERIE A - TOP BUTEURS
-- =========================

-- Lautaro Martinez
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Lautaro Martinez', 'ARG', 1997, id FROM public.clubs WHERE name = 'Inter Milan'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2018', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Lautaro Martinez' AND c.name = 'Inter Milan'
ON CONFLICT DO NOTHING;

-- Victor Osimhen
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Victor Osimhen', 'NGA', 1998, id FROM public.clubs WHERE name = 'Napoli'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2020', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Victor Osimhen' AND c.name = 'Napoli'
ON CONFLICT DO NOTHING;

-- =========================
-- BUNDESLIGA - TOP BUTEURS
-- =========================

-- Thomas Müller
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Thomas Müller', 'GER', 1989, id FROM public.clubs WHERE name = 'Bayern Munich'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2008', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Thomas Müller' AND c.name = 'Bayern Munich'
ON CONFLICT DO NOTHING;

-- =========================
-- CHAMPIONS LEAGUE LÉGENDES
-- =========================

-- Cristiano Ronaldo
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Cristiano Ronaldo', 'POR', 1985, id FROM public.clubs WHERE name = 'Manchester United'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2003', '2009'
FROM public.players p, public.clubs c
WHERE p.name = 'Cristiano Ronaldo' AND c.name = 'Manchester United'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2009', '2018'
FROM public.players p, public.clubs c
WHERE p.name = 'Cristiano Ronaldo' AND c.name = 'Real Madrid'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2018', '2021'
FROM public.players p, public.clubs c
WHERE p.name = 'Cristiano Ronaldo' AND c.name = 'Juventus'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2021', '2022'
FROM public.players p, public.clubs c
WHERE p.name = 'Cristiano Ronaldo' AND c.name = 'Manchester United'
ON CONFLICT DO NOTHING;

-- Lionel Messi
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Lionel Messi', 'ARG', 1987, id FROM public.clubs WHERE name = 'Barcelona'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2004', '2021'
FROM public.players p, public.clubs c
WHERE p.name = 'Lionel Messi' AND c.name = 'Barcelona'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2021', '2023'
FROM public.players p, public.clubs c
WHERE p.name = 'Lionel Messi' AND c.name = 'Paris Saint-Germain'
ON CONFLICT DO NOTHING;

-- =========================
-- AUTRES STARS
-- =========================

-- Neymar
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Neymar', 'BRA', 1992, id FROM public.clubs WHERE name = 'Paris Saint-Germain'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2013', '2017'
FROM public.players p, public.clubs c
WHERE p.name = 'Neymar' AND c.name = 'Barcelona'
ON CONFLICT DO NOTHING;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2017', '2023'
FROM public.players p, public.clubs c
WHERE p.name = 'Neymar' AND c.name = 'Paris Saint-Germain'
ON CONFLICT DO NOTHING;

-- Kevin De Bruyne
INSERT INTO public.players (name, nationality, birth_year, current_club_id)
SELECT 'Kevin De Bruyne', 'BEL', 1991, id FROM public.clubs WHERE name = 'Manchester City'
ON CONFLICT (name_norm) DO UPDATE SET 
  current_club_id = EXCLUDED.current_club_id,
  nationality = EXCLUDED.nationality;

INSERT INTO public.player_clubs (player_id, club_id, season_start, season_end)
SELECT p.id, c.id, '2015', 'present'
FROM public.players p, public.clubs c
WHERE p.name = 'Kevin De Bruyne' AND c.name = 'Manchester City'
ON CONFLICT DO NOTHING;

-- =========================================================
-- FIN DU SCRIPT
-- =========================================================
-- Vous avez maintenant ~20 joueurs avec leur historique
-- Chaque joueur a sa nationalité (FRA, ENG, BRA, ARG, etc.)
-- Vous pouvez en ajouter d'autres en suivant le même modèle

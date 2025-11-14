INSERT INTO clubs (name, logo_url, type, country, league, is_active, name_variations)
VALUES
  -- Arsenal
  ('Arsenal', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/arsenal_fc-logo_brandlogos.net_kae1j.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Arsenal FC', 'Arsenal Football Club']),
  -- Aston Villa
  ('Aston Villa', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/aston_villa_fc-logo.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Aston Villa FC', 'Aston Villa Football Club']),
  -- Bournemouth
  ('Bournemouth', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/afc_bournemouth-logo_brandlogos.net_wifjg.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['AFC Bournemouth', 'Bournemouth AFC']),
  -- Brentford
  ('Brentford', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/brentford-fc-logo.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Brentford FC', 'Brentford Football Club']),
  -- Brighton
  ('Brighton', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/brighton-hove-albion-logo.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Brighton & Hove Albion', 'Brighton and Hove Albion', 'Brighton Hove Albion']),
  -- Burnley
  ('Burnley', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/burnley_fc-logo_brandlogos.net_vh9ys.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Burnley FC', 'Burnley Football Club']),
  -- Chelsea
  ('Chelsea', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/chelsea_fc-logo_brandlogos.net_jrklu.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Chelsea FC', 'Chelsea Football Club']),
  -- Crystal Palace
  ('Crystal Palace', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/crystal_palace_fc-logo_brandlogos.net_asddi.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Crystal Palace FC', 'Crystal Palace Football Club', 'CPFC']),
  -- Everton
  ('Everton', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/everton_fc-logo_brandlogos.net_wuxl3.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Everton FC', 'Everton Football Club']),
  -- Fulham
  ('Fulham', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/fulham-fc-logo.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Fulham FC', 'Fulham Football Club']),
  -- Liverpool
  ('Liverpool', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/liverpool_fc-brandlogo.net.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Liverpool FC', 'Liverpool Football Club']),
  -- Luton Town
  ('Luton Town', 'https://example.com/logos/premier-league/luton-town.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Luton Town FC', 'Luton Town Football Club']),
  -- Manchester City
  ('Manchester City', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/manchester-city-fc-logo.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Man City', 'Man. City', 'Manchester City FC', 'MCFC']),
  -- Manchester United
  ('Manchester United', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/manchester_united_f.c.-logo_brandlogos.net_6znjs.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Man United', 'Man. United', 'Manchester United FC', 'Man Utd', 'MUFC']),
  -- Newcastle United
  ('Newcastle United', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/newcastle_united_fc-logo_brandlogos.net_ypslm.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Newcastle', 'Newcastle Utd', 'Newcastle United FC', 'NUFC']),
  -- Nottingham Forest
  ('Nottingham Forest', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/nottingham_forest-logo-brandlogo.net.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Nottingham Forest FC', 'Nottingham Forest Football Club', 'Nottm Forest']),
  -- Sheffield United
  ('Sheffield United', 'https://example.com/logos/premier-league/sheffield-united.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Sheffield Utd', 'Sheffield United FC', 'Sheff Utd']),
  -- Tottenham
  ('Tottenham', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/tottenham-hotspur-fc-logo.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Tottenham Hotspur', 'Tottenham Hotspur FC', 'Spurs', 'Tottenham FC']),
  -- West Ham
  ('West Ham', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/west_ham_united_fc-logo_brandlogos.net_9umrl.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['West Ham United', 'West Ham United FC', 'West Ham Utd', 'WHUFC']),
  -- Wolverhampton
  ('Wolverhampton', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/PL/wolverhampton_wanderers_fc-logo-brandlogo.net.png', 'CLUB', 'ENG', 'Premier League', true, ARRAY['Wolverhampton Wanderers', 'Wolves', 'Wolverhampton Wanderers FC', 'Wolves FC'])
ON CONFLICT (name) DO UPDATE SET
 logo_url = EXCLUDED.logo_url,
 country = EXCLUDED.country,
 league = EXCLUDED.league,
 name_variations = EXCLUDED.name_variations,
 is_active = true;


-- ============================================================
-- BUNDESLIGA (Allemagne) - 18 équipes
-- ============================================================


INSERT INTO clubs (name, logo_url, type, country, league, is_active, name_variations)
VALUES
  -- FC Augsburg
  ('FC Augsburg', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/fc-augsburg-seeklogo.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Augsburg', 'FC Augsburg 1907', 'FCA']),
  -- Bayer Leverkusen
  ('Bayer Leverkusen', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/bayer_04_leverkusen-logo_brandlogos.net_4wzak.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Leverkusen', 'Bayer 04 Leverkusen', 'Bayer Leverkusen FC']),
  -- Bayern Munich
  ('Bayern Munich', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/fc-bayern-munich-logo.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Bayern München', 'FC Bayern Munich', 'FC Bayern München', 'Bayern', 'FC Bayern']),
  -- VfL Bochum
  ('VfL Bochum', 'https://example.com/logos/bundesliga/bochum.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Bochum', 'VfL Bochum 1848']),
  -- Borussia Dortmund
  ('Borussia Dortmund', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/borussia_dortmund-logo_brandlogos.net_etcsv.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Dortmund', 'BVB', 'Borussia Dortmund 09', 'BVB Dortmund']),
  -- Borussia Mönchengladbach
  ('Borussia Mönchengladbach', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/borussia_monchengladbach-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Mönchengladbach', 'Borussia M''gladbach', 'Gladbach', 'BMG']),
  -- Eintracht Frankfurt
  ('Eintracht Frankfurt', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/eintracht_frankfurt-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Frankfurt', 'Eintracht', 'Eintracht Frankfurt FC', 'SGE']),
  -- SC Freiburg
  ('SC Freiburg', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/sc_freiburg-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Freiburg', 'SC Freiburg 1904']),
  -- 1. FC Heidenheim
  ('1. FC Heidenheim', 'https://example.com/logos/bundesliga/heidenheim.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Heidenheim', 'FC Heidenheim', '1. FC Heidenheim 1846']),
  -- TSG Hoffenheim
  ('TSG Hoffenheim', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/tsg_1899_hoffenheim-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Hoffenheim', 'TSG 1899 Hoffenheim', 'TSG Hoffenheim 1899']),
  -- 1. FC Köln
  ('1. FC Köln', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/1._fc_koln-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Köln', 'FC Köln', '1. FC Köln 01', 'Cologne']),
  -- RB Leipzig
  ('RB Leipzig', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/rb_leipzig-logo_brandlogos.net_vnr8y.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Leipzig', 'RasenBallsport Leipzig', 'RB Leipzig FC']),
  -- 1. FSV Mainz 05
  ('1. FSV Mainz 05', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/mainz_05-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Mainz', 'Mainz 05', 'FSV Mainz 05', '1. FSV Mainz']),
  -- VfB Stuttgart
  ('VfB Stuttgart', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/vfb_stuttgart-logo_brandlogos.net_9xh8z.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Stuttgart', 'VfB Stuttgart 1893']),
  -- Union Berlin
  ('Union Berlin', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/union_berlin-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['1. FC Union Berlin', 'Union Berlin FC', 'FC Union Berlin']),
  -- VfL Wolfsburg
  ('VfL Wolfsburg', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/vfl_wolfsburg-logo-brandlogo.net.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['Wolfsburg', 'VfL Wolfsburg 1945']),
  -- SV Werder Bremen
  ('Werder Bremen', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Bundesliga/sv_werder_bremen-logo_brandlogos.net_i3pq5.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['SV Werder Bremen', 'Werder', 'SV Werder Bremen 1899']),
  -- Darmstadt 98
  ('Darmstadt 98', 'https://example.com/logos/bundesliga/darmstadt.png', 'CLUB', 'GER', 'Bundesliga', true, ARRAY['SV Darmstadt 98', 'Darmstadt', 'SV 98 Darmstadt'])
ON CONFLICT (name) DO UPDATE SET
 logo_url = EXCLUDED.logo_url,
 country = EXCLUDED.country,
 league = EXCLUDED.league,
 name_variations = EXCLUDED.name_variations,
 is_active = true;


-- ============================================================
-- LA LIGA (Espagne) - 20 équipes
-- ============================================================


INSERT INTO clubs (name, logo_url, type, country, league, is_active, name_variations)
VALUES
  -- Alavés
  ('Alavés', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/deportivo_alaves-logo_brandlogos.net_g9rbn.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Deportivo Alavés', 'Alavés', 'Deportivo Alavés SAD']),
  -- Almería
  ('Almería', 'https://example.com/logos/la-liga/almeria.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['UD Almería', 'Almería', 'Unión Deportiva Almería']),
  -- Athletic Bilbao
  ('Athletic Bilbao', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/athletic_bilbao-logo_brandlogos.net_ra5i9.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Athletic Club', 'Athletic', 'Athletic Club Bilbao', 'Athletic de Bilbao']),
  -- Atlético Madrid
  ('Atlético Madrid', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/atletico_madrid-logo_brandlogos.net_rksjt.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Atlético', 'Atletico Madrid', 'Atlético de Madrid', 'Atletico', 'Atleti']),
  -- Barcelona
  ('Barcelona', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/fc_barcelona-logo.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['FC Barcelona', 'Barça', 'Barca', 'FCB']),
  -- Cádiz
  ('Cádiz', 'https://example.com/logos/la-liga/cadiz.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Cádiz CF', 'Cádiz', 'Cadiz', 'Cádiz Club de Fútbol']),
  -- Celta Vigo
  ('Celta Vigo', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/celta_vigo-logo_brandlogos.net_kg8rd.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['RC Celta', 'Celta', 'RC Celta de Vigo', 'Celta de Vigo']),
  -- Getafe
  ('Getafe', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/getafe_cf-logo_brandlogos.net_d1a7q.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Getafe CF', 'Getafe', 'Getafe Club de Fútbol']),
  -- Girona
  ('Girona', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/girona_fc-logo_brandlogos.net_s3yku.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Girona FC', 'Girona', 'Girona Futbol Club']),
  -- Granada
  ('Granada', 'https://example.com/logos/la-liga/granada.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Granada CF', 'Granada', 'Granada Club de Fútbol']),
  -- Las Palmas
  ('Las Palmas', 'https://example.com/logos/la-liga/las-palmas.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['UD Las Palmas', 'Las Palmas', 'Unión Deportiva Las Palmas']),
  -- Mallorca
  ('Mallorca', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/rcd_mallorca-logo_brandlogos.net_jd9ue.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['RCD Mallorca', 'Mallorca', 'Real Club Deportivo Mallorca']),
  -- Osasuna
  ('Osasuna', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/ca_osasuna-logo_brandlogos.net_sks0n.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['CA Osasuna', 'Osasuna', 'Club Atlético Osasuna']),
  -- Rayo Vallecano
  ('Rayo Vallecano', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/rayo-vallecano-logo-vector.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Rayo', 'Rayo Vallecano', 'Rayo Vallecano de Madrid']),
  -- Real Betis
  ('Real Betis', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/real_betis-logo_brandlogos.net_5i9f8.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Betis', 'Real Betis Balompié', 'Betis Sevilla']),
  -- Real Madrid
  ('Real Madrid', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/real_madrid_cf-brandlogo.net.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Real Madrid CF', 'Real Madrid', 'Real', 'Real Madrid Club de Fútbol', 'RMCF']),
  -- Real Sociedad
  ('Real Sociedad', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/real-sociedad-logo.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Real Sociedad', 'Sociedad', 'Real Sociedad de Fútbol']),
  -- Sevilla
  ('Sevilla', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/sevilla_fc-logo_brandlogos.net_uv8lu.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Sevilla FC', 'Sevilla', 'Sevilla Fútbol Club']),
  -- Valencia
  ('Valencia', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/valencia_cf-logo_brandlogos.net_iaffl.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Valencia CF', 'Valencia', 'Valencia Club de Fútbol']),
  -- Villarreal
  ('Villarreal', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/La%20Liga/villareal-c-de-f-vector-logo.png', 'CLUB', 'ESP', 'La Liga', true, ARRAY['Villarreal CF', 'Villarreal', 'Villarreal Club de Fútbol', 'El Submarino Amarillo'])
ON CONFLICT (name) DO UPDATE SET
 logo_url = EXCLUDED.logo_url,
 country = EXCLUDED.country,
 league = EXCLUDED.league,
 name_variations = EXCLUDED.name_variations,
 is_active = true;


-- ============================================================
-- SERIE A (Italie) - 20 équipes
-- ============================================================


INSERT INTO clubs (name, logo_url, type, country, league, is_active, name_variations)
VALUES
  -- Atalanta
  ('Atalanta', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/atalanta_bc-logo_brandlogos.net_yq22a.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Atalanta BC', 'Atalanta Bergamo', 'Atalanta Bergamasca Calcio']),
  -- Bologna
  ('Bologna', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/bologna_fc_1909-logo_brandlogos.net_vf54h.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Bologna FC', 'Bologna FC 1909', 'Bologna Football Club']),
  -- Cagliari
  ('Cagliari', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/cagliari-calcio-logo.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Cagliari Calcio', 'Cagliari', 'Cagliari Calcio 1920']),
  -- Empoli
  ('Empoli', 'https://example.com/logos/serie-a/empoli.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Empoli FC', 'Empoli', 'Empoli Football Club']),
  -- Fiorentina
  ('Fiorentina', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/acf_fiorentina-logo.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['ACF Fiorentina', 'AC Fiorentina', 'Fiorentina', 'Viola']),
  -- Frosinone
  ('Frosinone', 'https://example.com/logos/serie-a/frosinone.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Frosinone Calcio', 'Frosinone', 'Frosinone Calcio 1912']),
  -- Genoa
  ('Genoa', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/genoa-cfc-vector-logo.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Genoa CFC', 'Genoa', 'Genoa Cricket and Football Club']),
  -- Hellas Verona
  ('Hellas Verona', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/hellas_verona_fc-logo_brandlogos.net_0b2nl.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Verona', 'Hellas Verona FC', 'Hellas Verona', 'Verona FC']),
  -- Inter Milan
  ('Inter Milan', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/inter-milan-logo.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Inter', 'Inter Milano', 'FC Internazionale Milano', 'Internazionale', 'Inter Milan FC']),
  -- Juventus
  ('Juventus', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/juventus_fc-brandlogo.net.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Juventus FC', 'Juventus', 'Juventus Football Club', 'Juve']),
  -- Lazio
  ('Lazio', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/ss_lazio-logo_brandlogos.net_e4nj6.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['SS Lazio', 'Lazio', 'Società Sportiva Lazio', 'Lazio Roma']),
  -- Lecce
  ('Lecce', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/us_lecce-logo_brandlogos.net_1igcy.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['US Lecce', 'Lecce', 'Unione Sportiva Lecce']),
  -- AC Milan
  ('AC Milan', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/ac_milan-logo_brandlogos.net_xh3sl.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Milan', 'AC Milan', 'Associazione Calcio Milan', 'Milan AC']),
  -- Monza
  ('Monza', 'https://example.com/logos/serie-a/monza.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['AC Monza', 'Monza', 'Associazione Calcio Monza', 'Monza 1912']),
  -- Napoli
  ('Napoli', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/ssc-napoli-vector-logo.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['SSC Napoli', 'Napoli', 'Società Sportiva Calcio Napoli', 'Napoli FC']),
  -- Roma
  ('Roma', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/as_roma_2025-logo_brandlogos.net_nd9ya.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['AS Roma', 'Roma', 'Associazione Sportiva Roma', 'AS Roma FC']),
  -- Salernitana
  ('Salernitana', 'https://example.com/logos/serie-a/salernitana.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['US Salernitana', 'Salernitana', 'Unione Sportiva Salernitana 1919']),
  -- Sassuolo
  ('Sassuolo', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/us_sassuolo_calcio-logo_brandlogos.net_wl1mr.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['US Sassuolo', 'Sassuolo', 'Unione Sportiva Sassuolo Calcio']),
  -- Torino
  ('Torino', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/torino_fc-logo_brandlogos.net_6uytj.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Torino FC', 'Torino', 'Torino Football Club']),
  -- Udinese
  ('Udinese', 'https://qahbsyolfvujrpblnrvy.supabase.co/storage/v1/object/public/clubs-logo/Serie%20A/udinese_calcio-logo_brandlogos.net_ctpcb.png', 'CLUB', 'ITA', 'Serie A', true, ARRAY['Udinese Calcio', 'Udinese', 'Udinese Calcio 1896'])
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  country = EXCLUDED.country,
  league = EXCLUDED.league,
  name_variations = EXCLUDED.name_variations,
  is_active = true;



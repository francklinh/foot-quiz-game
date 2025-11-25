-- ============================================================
-- SCRIPT DE TEST - QUESTIONS CARRIÈRE INFERNALE
-- ============================================================
-- Ce script crée des questions de test pour Carrière Infernale
-- avec 10 joueurs ayant évolué dans au moins 3 clubs
-- parmi les clubs des divisions 1 (France, Angleterre, Espagne, Italie, Allemagne)
-- ============================================================

-- ============================================================
-- 1. CRÉER UNE QUESTION DE TEST
-- ============================================================

DO $$
DECLARE
  v_game_type_id INTEGER;
  v_question_id UUID;
  v_display_order INTEGER := 1;
  
  -- Joueurs et leurs clubs (structure: player_name, clubs[])
  -- Format: nom du joueur, puis liste de clubs où il a joué
  -- Les clubs doivent correspondre EXACTEMENT aux noms dans la table clubs
  -- (Premier League, Bundesliga, La Liga, Serie A uniquement)
  -- Note: Les noms de joueurs doivent correspondre à ceux dans la table players
  v_players_data JSONB := '[
    {
      "player_name": "Cristiano Ronaldo",
      "clubs": ["Manchester United", "Real Madrid", "Juventus"]
    },
    {
      "player_name": "Lionel Messi",
      "clubs": ["Barcelona", "PSG"]
    },
    {
      "player_name": "Karim Benzema",
      "clubs": ["Lyon", "Real Madrid"]
    },
    {
      "player_name": "Neymar",
      "clubs": ["Barcelona", "PSG"]
    },
    {
      "player_name": "Mohamed Salah",
      "clubs": ["Chelsea", "Liverpool"]
    },
    {
      "player_name": "Kevin De Bruyne",
      "clubs": ["Chelsea", "Manchester City"]
    },
    {
      "player_name": "Virgil van Dijk",
      "clubs": ["Southampton", "Liverpool"]
    },
    {
      "player_name": "Luka Modrić",
      "clubs": ["Tottenham", "Real Madrid"]
    },
    {
      "player_name": "Robert Lewandowski",
      "clubs": ["Borussia Dortmund", "Bayern Munich", "Barcelona"]
    },
    {
      "player_name": "Kylian Mbappé",
      "clubs": ["Monaco", "PSG", "Real Madrid"]
    }
  ]'::JSONB;
  
  v_player_data JSONB;
  v_player_id UUID;
  v_club_name TEXT;
  v_club_id UUID;
  v_club_count INTEGER;
  v_total_clubs INTEGER := 0;
BEGIN
  -- Récupérer l'ID du type de jeu CARRIERE_INFERNALE
  SELECT id INTO v_game_type_id
  FROM game_types
  WHERE code = 'CARRIERE_INFERNALE';
  
  IF v_game_type_id IS NULL THEN
    RAISE EXCEPTION 'Type de jeu CARRIERE_INFERNALE non trouvé. Exécutez d''abord carriere_infernale_setup.sql';
  END IF;
  
  -- Créer la question
  INSERT INTO questions (game_type_id, content, season, is_active)
  VALUES (
    v_game_type_id,
    '{"title": "Carrière Infernale - Test - Légendes du football"}'::JSONB,
    '2024-2025',
    true
  )
  RETURNING id INTO v_question_id;
  
  RAISE NOTICE 'Question créée avec ID: %', v_question_id;
  
  -- Parcourir les joueurs
  FOR v_player_data IN SELECT * FROM jsonb_array_elements(v_players_data)
  LOOP
    -- Récupérer l'ID du joueur par son nom (recherche flexible)
    SELECT id INTO v_player_id
    FROM players
    WHERE is_active = true
      AND (
        LOWER(TRIM(name)) = LOWER(TRIM(v_player_data->>'player_name'))
        OR LOWER(TRIM(name)) LIKE '%' || LOWER(TRIM(v_player_data->>'player_name')) || '%'
        OR EXISTS(
          SELECT 1 FROM unnest(COALESCE(name_variations, ARRAY[]::TEXT[])) as variant
          WHERE LOWER(TRIM(variant)) = LOWER(TRIM(v_player_data->>'player_name'))
        )
      )
    LIMIT 1;
    
    IF v_player_id IS NULL THEN
      RAISE NOTICE 'Joueur non trouvé: %', v_player_data->>'player_name';
      CONTINUE;
    END IF;
    
    RAISE NOTICE 'Traitement du joueur: % (ID: %)', v_player_data->>'player_name', v_player_id;
    
    -- Parcourir les clubs de ce joueur
    v_club_count := 0;
    FOR v_club_name IN SELECT * FROM jsonb_array_elements_text(v_player_data->'clubs')
    LOOP
      -- Chercher le club par nom (exact ou dans name_variations)
      -- Filtrer par les ligues des divisions 1 (sans Ligue 1 pour l'instant)
      SELECT id INTO v_club_id
      FROM clubs
      WHERE is_active = true
        AND league IN ('Premier League', 'Bundesliga', 'La Liga', 'Serie A')
        AND (
          LOWER(TRIM(name)) = LOWER(TRIM(v_club_name))
          OR EXISTS(
            SELECT 1 FROM unnest(COALESCE(name_variations, ARRAY[]::TEXT[])) as variant
            WHERE LOWER(TRIM(variant)) = LOWER(TRIM(v_club_name))
          )
        )
      LIMIT 1;
      
      -- Si pas trouvé, essayer aussi avec Ligue 1 (au cas où)
      IF v_club_id IS NULL THEN
        SELECT id INTO v_club_id
        FROM clubs
        WHERE is_active = true
          AND league = 'Ligue 1'
          AND (
            LOWER(TRIM(name)) = LOWER(TRIM(v_club_name))
            OR EXISTS(
              SELECT 1 FROM unnest(COALESCE(name_variations, ARRAY[]::TEXT[])) as variant
              WHERE LOWER(TRIM(variant)) = LOWER(TRIM(v_club_name))
            )
          )
        LIMIT 1;
      END IF;
      
      IF v_club_id IS NULL THEN
        RAISE NOTICE 'Club non trouvé: % (pour joueur: %)', v_club_name, v_player_data->>'player_name';
        CONTINUE;
      END IF;
      
      -- Insérer dans question_answers
      INSERT INTO question_answers (
        question_id,
        player_id,
        club_id,
        display_order,
        is_active
      )
      VALUES (
        v_question_id,
        v_player_id,
        v_club_id,
        v_display_order,
        true
      )
      ON CONFLICT DO NOTHING;
      
      v_club_count := v_club_count + 1;
      v_display_order := v_display_order + 1;
      v_total_clubs := v_total_clubs + 1;
      
      RAISE NOTICE '  Club ajouté: % (ID: %)', v_club_name, v_club_id;
    END LOOP;
    
    IF v_club_count = 0 THEN
      RAISE WARNING 'Aucun club trouvé pour le joueur: %', v_player_data->>'player_name';
    ELSE
      RAISE NOTICE '  Total clubs pour %: %', v_player_data->>'player_name', v_club_count;
    END IF;
    
    -- Arrêter si on a atteint 15 clubs (limite max)
    IF v_total_clubs >= 15 THEN
      RAISE NOTICE 'Limite de 15 clubs atteinte. Arrêt de l''ajout de joueurs.';
      EXIT;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Question de test créée avec succès !';
  RAISE NOTICE 'Question ID: %', v_question_id;
  RAISE NOTICE 'Total clubs réels: %', v_total_clubs;
END $$;

-- ============================================================
-- 2. VÉRIFICATION
-- ============================================================

-- Afficher la question créée
SELECT 
  q.id as question_id,
  q.content->>'title' as title,
  gt.code as game_type,
  COUNT(DISTINCT qa.player_id) as nb_joueurs,
  COUNT(qa.id) as nb_clubs_reels
FROM questions q
INNER JOIN game_types gt ON q.game_type_id = gt.id
LEFT JOIN question_answers qa ON qa.question_id = q.id AND qa.is_active = true
WHERE gt.code = 'CARRIERE_INFERNALE'
  AND q.content->>'title' LIKE '%Test%'
GROUP BY q.id, q.content, gt.code
ORDER BY q.created_at DESC
LIMIT 1;

-- Afficher les détails par joueur
SELECT 
  p.name as joueur,
  COUNT(qa.club_id) as nb_clubs,
  STRING_AGG(c.name, ', ' ORDER BY qa.display_order) as clubs
FROM questions q
INNER JOIN game_types gt ON q.game_type_id = gt.id
INNER JOIN question_answers qa ON qa.question_id = q.id
INNER JOIN players p ON qa.player_id = p.id
INNER JOIN clubs c ON qa.club_id = c.id
WHERE gt.code = 'CARRIERE_INFERNALE'
  AND q.content->>'title' LIKE '%Test%'
  AND qa.is_active = true
GROUP BY p.id, p.name
ORDER BY MIN(qa.display_order);

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================


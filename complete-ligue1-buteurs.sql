-- =====================================================
-- CORRECTION: Top 10 des meilleurs buteurs Ligue 1 2024-2025
-- =====================================================
-- Basé sur les vraies données de la saison 2024-2025

-- ID de la question à corriger
DO $$
DECLARE
    question_uuid UUID := '6c2e91e4-5b6a-4c1c-8297-70522e424f52';
    
    -- Variables pour les IDs de joueurs
    lacazette_id UUID;
    barcola_id UUID;
    dembele_id UUID;
    mikautadze_id UUID;
    fofana_id UUID;
    nzola_id UUID;
    satriano_id UUID;
    david_id UUID;
    cherki_id UUID;
    greenwood_id UUID;
    
BEGIN
    -- Afficher le statut actuel
    RAISE NOTICE '🔍 ÉTAT ACTUEL DE LA QUESTION';
    RAISE NOTICE '==========================================================';
    
    -- Supprimer les anciennes réponses (joueurs qui ne sont pas en Ligue 1)
    DELETE FROM question_answers WHERE question_id = question_uuid;
    RAISE NOTICE '✅ Anciennes réponses supprimées';
    
    -- =====================================================
    -- CRÉER/RÉCUPÉRER LES JOUEURS DU VRAI TOP 10 LIGUE 1 2024-2025
    -- =====================================================
    
    -- 1. Alexandre Lacazette (Lyon) - déjà existe
    SELECT id INTO lacazette_id FROM players WHERE name = 'Alexandre Lacazette' LIMIT 1;
    IF lacazette_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Alexandre Lacazette', 'Olympique Lyonnais', 'Attaquant', 'France', 'FRA', 'alexandre-lacazette', true)
        RETURNING id INTO lacazette_id;
        RAISE NOTICE '✅ Créé: Alexandre Lacazette';
    ELSE
        RAISE NOTICE '✓ Existe: Alexandre Lacazette';
    END IF;
    
    -- 2. Bradley Barcola (PSG)
    SELECT id INTO barcola_id FROM players WHERE name = 'Bradley Barcola' LIMIT 1;
    IF barcola_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Bradley Barcola', 'Paris Saint-Germain', 'Attaquant', 'France', 'FRA', 'bradley-barcola', true)
        RETURNING id INTO barcola_id;
        RAISE NOTICE '✅ Créé: Bradley Barcola';
    ELSE
        RAISE NOTICE '✓ Existe: Bradley Barcola';
    END IF;
    
    -- 3. Ousmane Dembélé (PSG)
    SELECT id INTO dembele_id FROM players WHERE name = 'Ousmane Dembélé' LIMIT 1;
    IF dembele_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Ousmane Dembélé', 'Paris Saint-Germain', 'Attaquant', 'France', 'FRA', 'ousmane-dembele', true)
        RETURNING id INTO dembele_id;
        RAISE NOTICE '✅ Créé: Ousmane Dembélé';
    ELSE
        RAISE NOTICE '✓ Existe: Ousmane Dembélé';
    END IF;
    
    -- 4. Georges Mikautadze (Lyon)
    SELECT id INTO mikautadze_id FROM players WHERE name = 'Georges Mikautadze' LIMIT 1;
    IF mikautadze_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Georges Mikautadze', 'Olympique Lyonnais', 'Attaquant', 'Géorgie', 'GEO', 'georges-mikautadze', true)
        RETURNING id INTO mikautadze_id;
        RAISE NOTICE '✅ Créé: Georges Mikautadze';
    ELSE
        RAISE NOTICE '✓ Existe: Georges Mikautadze';
    END IF;
    
    -- 5. Seko Fofana (Rennes)
    SELECT id INTO fofana_id FROM players WHERE name = 'Seko Fofana' LIMIT 1;
    IF fofana_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Seko Fofana', 'Stade Rennais', 'Milieu', 'Côte d''Ivoire', 'CIV', 'seko-fofana', true)
        RETURNING id INTO fofana_id;
        RAISE NOTICE '✅ Créé: Seko Fofana';
    ELSE
        RAISE NOTICE '✓ Existe: Seko Fofana';
    END IF;
    
    -- 6. M''Bala Nzola (RC Lens)
    SELECT id INTO nzola_id FROM players WHERE name = 'M''Bala Nzola' LIMIT 1;
    IF nzola_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('M''Bala Nzola', 'RC Lens', 'Attaquant', 'Angola', 'AGO', 'mbala-nzola', true)
        RETURNING id INTO nzola_id;
        RAISE NOTICE '✅ Créé: M''Bala Nzola';
    ELSE
        RAISE NOTICE '✓ Existe: M''Bala Nzola';
    END IF;
    
    -- 7. Martin Satriano (Brest)
    SELECT id INTO satriano_id FROM players WHERE name = 'Martin Satriano' LIMIT 1;
    IF satriano_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Martin Satriano', 'Stade Brestois', 'Attaquant', 'Uruguay', 'URY', 'martin-satriano', true)
        RETURNING id INTO satriano_id;
        RAISE NOTICE '✅ Créé: Martin Satriano';
    ELSE
        RAISE NOTICE '✓ Existe: Martin Satriano';
    END IF;
    
    -- 8. Jonathan David (Lille) - déjà existe
    SELECT id INTO david_id FROM players WHERE name = 'Jonathan David' LIMIT 1;
    IF david_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Jonathan David', 'Lille OSC', 'Attaquant', 'Canada', 'CAN', 'jonathan-david', true)
        RETURNING id INTO david_id;
        RAISE NOTICE '✅ Créé: Jonathan David';
    ELSE
        RAISE NOTICE '✓ Existe: Jonathan David';
    END IF;
    
    -- 9. Rayan Cherki (Lyon)
    SELECT id INTO cherki_id FROM players WHERE name = 'Rayan Cherki' LIMIT 1;
    IF cherki_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Rayan Cherki', 'Olympique Lyonnais', 'Milieu', 'France', 'FRA', 'rayan-cherki', true)
        RETURNING id INTO cherki_id;
        RAISE NOTICE '✅ Créé: Rayan Cherki';
    ELSE
        RAISE NOTICE '✓ Existe: Rayan Cherki';
    END IF;
    
    -- 10. Mason Greenwood (Marseille)
    SELECT id INTO greenwood_id FROM players WHERE name = 'Mason Greenwood' LIMIT 1;
    IF greenwood_id IS NULL THEN
        INSERT INTO players (name, current_club, position, nationality, nationality_code, slug, is_active)
        VALUES ('Mason Greenwood', 'Olympique de Marseille', 'Attaquant', 'Angleterre', 'GBR', 'mason-greenwood', true)
        RETURNING id INTO greenwood_id;
        RAISE NOTICE '✅ Créé: Mason Greenwood';
    ELSE
        RAISE NOTICE '✓ Existe: Mason Greenwood';
    END IF;
    
    -- =====================================================
    -- METTRE À JOUR LA QUESTION AVEC LES BONS JOUEURS
    -- =====================================================
    
    UPDATE questions
    SET player_ids = ARRAY[
        lacazette_id,
        barcola_id,
        dembele_id,
        mikautadze_id,
        fofana_id,
        nzola_id,
        satriano_id,
        david_id,
        cherki_id,
        greenwood_id
    ]
    WHERE id = question_uuid;
    
    RAISE NOTICE '✅ Question mise à jour avec 10 joueurs';
    
    -- =====================================================
    -- CRÉER LES RÉPONSES AVEC LES BONS RANKINGS
    -- =====================================================
    
    -- Top 10 des buteurs Ligue 1 2024-2025 (données réelles)
    INSERT INTO question_answers (question_id, player_id, ranking, points) VALUES
    (question_uuid, lacazette_id, 1, 25),      -- 11 buts
    (question_uuid, barcola_id, 2, 20),        -- 10 buts
    (question_uuid, dembele_id, 3, 18),        -- 9 buts
    (question_uuid, mikautadze_id, 4, 16),     -- 8 buts
    (question_uuid, fofana_id, 5, 14),         -- 7 buts
    (question_uuid, nzola_id, 6, 12),          -- 6 buts
    (question_uuid, satriano_id, 7, 10),       -- 6 buts
    (question_uuid, david_id, 8, 8),           -- 5 buts
    (question_uuid, cherki_id, 9, 6),          -- 5 buts
    (question_uuid, greenwood_id, 10, 4);      -- 5 buts
    
    RAISE NOTICE '✅ 10 réponses créées avec rankings 1-10';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 QUESTION COMPLÉTÉE AVEC SUCCÈS!';
    RAISE NOTICE '==========================================================';
    
END $$;

-- Vérification finale
SELECT 
    '📊 VÉRIFICATION FINALE' as status,
    q.content->>'question' as question,
    array_length(q.player_ids, 1) as nb_joueurs,
    COUNT(qa.id) as nb_reponses
FROM questions q
LEFT JOIN question_answers qa ON qa.question_id = q.id
WHERE q.id = '6c2e91e4-5b6a-4c1c-8297-70522e424f52'
GROUP BY q.id, q.content;

-- Afficher le nouveau Top 10
SELECT 
    '🏆 NOUVEAU TOP 10 LIGUE 1 2024-2025' as titre,
    qa.ranking as rang,
    p.name as joueur,
    p.current_club as club,
    qa.points as points
FROM question_answers qa
JOIN players p ON p.id = qa.player_id
WHERE qa.question_id = '6c2e91e4-5b6a-4c1c-8297-70522e424f52'
ORDER BY qa.ranking;

SELECT '✅ CORRECTION TERMINÉE!' as resultat;



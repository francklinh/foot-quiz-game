-- =====================================================
-- NETTOYAGE DES DOUBLONS - TABLE PLAYERS
-- =====================================================
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- ÉTAPE 1: Créer une table temporaire avec les IDs à garder
CREATE TEMP TABLE players_to_keep AS
WITH player_scores AS (
    SELECT 
        players.*,
        -- Calcul du score de complétude
        (
            CASE WHEN players.name IS NOT NULL AND trim(players.name) != '' THEN 10 ELSE 0 END +
            CASE WHEN players.current_club IS NOT NULL AND trim(players.current_club) != '' THEN 5 ELSE 0 END +
            CASE WHEN players.position IS NOT NULL AND trim(players.position) != '' THEN 3 ELSE 0 END +
            CASE WHEN players.nationality IS NOT NULL AND trim(players.nationality) != '' THEN 3 ELSE 0 END +
            CASE WHEN players.nationality_code IS NOT NULL AND trim(players.nationality_code) != '' AND players.nationality_code != 'N/A' THEN 5 ELSE 0 END +
            CASE WHEN players.name_variations IS NOT NULL AND array_length(players.name_variations, 1) > 0 THEN 2 ELSE 0 END +
            CASE WHEN players.club_history IS NOT NULL THEN 2 ELSE 0 END +
            CASE WHEN players.photo_url IS NOT NULL THEN 2 ELSE 0 END +
            CASE WHEN players.is_verified THEN 10 ELSE 0 END +
            CASE WHEN players.slug IS NOT NULL AND trim(players.slug) != '' THEN 1 ELSE 0 END
        ) as completeness_score,
        ROW_NUMBER() OVER (
            PARTITION BY players.name 
            ORDER BY 
                -- Score de complétude (DESC)
                (
                    CASE WHEN players.name IS NOT NULL AND trim(players.name) != '' THEN 10 ELSE 0 END +
                    CASE WHEN players.current_club IS NOT NULL AND trim(players.current_club) != '' THEN 5 ELSE 0 END +
                    CASE WHEN players.position IS NOT NULL AND trim(players.position) != '' THEN 3 ELSE 0 END +
                    CASE WHEN players.nationality IS NOT NULL AND trim(players.nationality) != '' THEN 3 ELSE 0 END +
                    CASE WHEN players.nationality_code IS NOT NULL AND trim(players.nationality_code) != '' AND players.nationality_code != 'N/A' THEN 5 ELSE 0 END +
                    CASE WHEN players.name_variations IS NOT NULL AND array_length(players.name_variations, 1) > 0 THEN 2 ELSE 0 END +
                    CASE WHEN players.club_history IS NOT NULL THEN 2 ELSE 0 END +
                    CASE WHEN players.photo_url IS NOT NULL THEN 2 ELSE 0 END +
                    CASE WHEN players.is_verified THEN 10 ELSE 0 END +
                    CASE WHEN players.slug IS NOT NULL AND trim(players.slug) != '' THEN 1 ELSE 0 END
                ) DESC,
                players.is_verified DESC,
                players.created_at ASC
        ) as rn
    FROM players
)
SELECT id, name, completeness_score
FROM player_scores
WHERE rn = 1;

-- Afficher les joueurs qui seront conservés
SELECT 
    '✅ JOUEURS À CONSERVER' as status,
    COUNT(*) as total
FROM players_to_keep;

-- ÉTAPE 2: Créer un mapping des anciens IDs vers les nouveaux
CREATE TEMP TABLE player_id_mapping AS
SELECT 
    p.id as old_id,
    ptk.id as new_id,
    p.name
FROM players p
INNER JOIN players_to_keep ptk ON p.name = ptk.name
WHERE p.id != ptk.id;

-- Afficher les mappings
SELECT 
    '📋 MAPPINGS (ancien → nouveau)' as status,
    COUNT(*) as total_mappings
FROM player_id_mapping;

-- Quelques exemples de mappings
SELECT 
    name,
    old_id,
    new_id
FROM player_id_mapping
LIMIT 10;

-- ÉTAPE 3: Mettre à jour les références dans questions.player_ids
DO $$
DECLARE
    question_record RECORD;
    old_player_id UUID;
    new_player_ids UUID[];
    needs_update BOOLEAN;
BEGIN
    -- Pour chaque question
    FOR question_record IN 
        SELECT id, player_ids 
        FROM questions 
        WHERE player_ids IS NOT NULL
    LOOP
        new_player_ids := ARRAY[]::UUID[];
        needs_update := FALSE;
        
        -- Pour chaque player_id dans le tableau
        IF question_record.player_ids IS NOT NULL THEN
            FOREACH old_player_id IN ARRAY question_record.player_ids
            LOOP
                -- Chercher si ce player_id doit être remplacé
                DECLARE
                    mapped_id UUID;
                BEGIN
                    SELECT new_id INTO mapped_id
                    FROM player_id_mapping
                    WHERE old_id = old_player_id;
                    
                    IF mapped_id IS NOT NULL THEN
                        -- Utiliser le nouveau ID
                        new_player_ids := array_append(new_player_ids, mapped_id);
                        needs_update := TRUE;
                    ELSE
                        -- Garder l'ancien ID
                        new_player_ids := array_append(new_player_ids, old_player_id);
                    END IF;
                END;
            END LOOP;
            
            -- Retirer les doublons dans le tableau
            new_player_ids := ARRAY(SELECT DISTINCT unnest(new_player_ids));
            
            -- Mettre à jour si nécessaire
            IF needs_update THEN
                UPDATE questions
                SET player_ids = new_player_ids
                WHERE id = question_record.id;
                
                RAISE NOTICE 'Question % mise à jour', question_record.id;
            END IF;
        END IF;
    END LOOP;
END $$;

-- ÉTAPE 4: Mettre à jour question_answers si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'question_answers') THEN
        UPDATE question_answers qa
        SET player_id = pim.new_id
        FROM player_id_mapping pim
        WHERE qa.player_id = pim.old_id;
        
        RAISE NOTICE 'question_answers mis à jour: %', (SELECT COUNT(*) FROM question_answers qa INNER JOIN player_id_mapping pim ON qa.player_id = pim.old_id);
    END IF;
END $$;

-- ÉTAPE 5: Mettre à jour grid_answers si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grid_answers') THEN
        UPDATE grid_answers ga
        SET player_id = pim.new_id
        FROM player_id_mapping pim
        WHERE ga.player_id = pim.old_id;
        
        RAISE NOTICE 'grid_answers mis à jour: %', (SELECT COUNT(*) FROM grid_answers ga INNER JOIN player_id_mapping pim ON ga.player_id = pim.old_id);
    END IF;
END $$;

-- ÉTAPE 6: Supprimer les doublons
DELETE FROM players
WHERE id IN (SELECT old_id FROM player_id_mapping);

-- Afficher le résultat
SELECT 
    '✅ DOUBLONS SUPPRIMÉS' as status,
    (SELECT COUNT(*) FROM player_id_mapping) as total_supprimes;

-- ÉTAPE 7: Vérification finale
SELECT 
    '🔍 VÉRIFICATION FINALE' as status,
    COUNT(*) as total_joueurs,
    COUNT(DISTINCT name) as noms_uniques
FROM players;

-- Vérifier qu'il n'y a plus de doublons
SELECT 
    '⚠️ DOUBLONS RESTANTS' as warning,
    name,
    COUNT(*) as occurrences
FROM players
GROUP BY name
HAVING COUNT(*) > 1;

-- Si aucun résultat ci-dessus, c'est parfait!

-- ÉTAPE 8: Compléter les codes de nationalité manquants
UPDATE players
SET nationality_code = CASE nationality
    WHEN 'France' THEN 'FRA'
    WHEN 'Brésil' THEN 'BRA'
    WHEN 'Argentine' THEN 'ARG'
    WHEN 'Pays-Bas' THEN 'NLD'
    WHEN 'Algérie' THEN 'DZA'
    WHEN 'Cameroun' THEN 'CMR'
    WHEN 'Canada' THEN 'CAN'
    WHEN 'Portugal' THEN 'PRT'
    WHEN 'Espagne' THEN 'ESP'
    WHEN 'Italie' THEN 'ITA'
    WHEN 'Allemagne' THEN 'DEU'
    WHEN 'Belgique' THEN 'BEL'
    WHEN 'Angleterre' THEN 'GBR'
    WHEN 'Royaume-Uni' THEN 'GBR'
    WHEN 'Sénégal' THEN 'SEN'
    WHEN 'Côte d''Ivoire' THEN 'CIV'
    WHEN 'Mali' THEN 'MLI'
    WHEN 'Maroc' THEN 'MAR'
    WHEN 'Égypte' THEN 'EGY'
    WHEN 'Nigéria' THEN 'NGA'
    WHEN 'Ghana' THEN 'GHA'
    WHEN 'Turquie' THEN 'TUR'
    WHEN 'Croatie' THEN 'HRV'
    WHEN 'Serbie' THEN 'SRB'
    WHEN 'Pologne' THEN 'POL'
    WHEN 'Suède' THEN 'SWE'
    WHEN 'Danemark' THEN 'DNK'
    WHEN 'Norvège' THEN 'NOR'
    WHEN 'Suisse' THEN 'CHE'
    WHEN 'Autriche' THEN 'AUT'
    ELSE nationality_code
END
WHERE nationality_code IS NULL OR nationality_code = 'N/A' OR nationality_code = '';

SELECT 
    '✅ CODES NATIONALITÉ MIS À JOUR' as status,
    COUNT(*) as total_avec_code
FROM players
WHERE nationality_code IS NOT NULL AND nationality_code != '' AND nationality_code != 'N/A';

-- RÉSUMÉ FINAL
SELECT 
    '📊 RÉSUMÉ FINAL' as titre,
    (SELECT COUNT(*) FROM players) as total_joueurs,
    (SELECT COUNT(DISTINCT name) FROM players) as noms_uniques,
    (SELECT COUNT(*) FROM players WHERE nationality_code IS NOT NULL AND nationality_code != 'N/A') as avec_code_nationalite,
    (SELECT COUNT(*) FROM players WHERE position IS NOT NULL AND position != '') as avec_position,
    (SELECT COUNT(*) FROM players WHERE is_verified) as verifies;

SELECT '✅ NETTOYAGE TERMINÉ AVEC SUCCÈS!' as resultat;


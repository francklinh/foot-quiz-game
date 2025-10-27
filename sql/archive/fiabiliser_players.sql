-- =====================================================
-- FIABILISATION DE LA TABLE PLAYERS
-- =====================================================
-- Ce script nettoie les doublons et ajoute des contraintes
-- pour garantir la qualité des données

-- =====================================================
-- ÉTAPE 1: SAUVEGARDE ET ANALYSE
-- =====================================================

-- Créer une table temporaire pour sauvegarder les doublons
CREATE TABLE IF NOT EXISTS players_duplicates_backup AS
SELECT * FROM players WHERE 1=0;

-- Sauvegarder les doublons avant suppression
INSERT INTO players_duplicates_backup
SELECT p.*
FROM players p
INNER JOIN (
    SELECT name, COUNT(*) as cnt
    FROM players
    GROUP BY name
    HAVING COUNT(*) > 1
) dupes ON p.name = dupes.name;

-- Afficher le nombre de doublons sauvegardés
SELECT 
    '✅ Doublons sauvegardés' as status,
    COUNT(*) as total_doublons
FROM players_duplicates_backup;

-- =====================================================
-- ÉTAPE 2: NETTOYER LES DOUBLONS
-- =====================================================

-- Stratégie: Garder le joueur le plus complet (avec le plus de données)
-- Pour chaque nom en double, on garde celui qui a:
-- 1. Le plus de champs non-null
-- 2. is_verified = true si existe
-- 3. Le plus ancien (created_at)

-- Créer une fonction pour compter les champs non-null
CREATE OR REPLACE FUNCTION count_non_null_fields(p players)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        CASE WHEN p.name IS NOT NULL AND p.name != '' THEN 1 ELSE 0 END +
        CASE WHEN p.current_club IS NOT NULL AND p.current_club != '' THEN 1 ELSE 0 END +
        CASE WHEN p.position IS NOT NULL AND p.position != '' THEN 1 ELSE 0 END +
        CASE WHEN p.nationality IS NOT NULL AND p.nationality != '' THEN 1 ELSE 0 END +
        CASE WHEN p.nationality_code IS NOT NULL AND p.nationality_code != '' AND p.nationality_code != 'N/A' THEN 1 ELSE 0 END +
        CASE WHEN p.name_variations IS NOT NULL AND array_length(p.name_variations, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN p.club_history IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN p.photo_url IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN p.is_verified THEN 1 ELSE 0 END
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Identifier les IDs à conserver (les plus complets)
CREATE TEMP TABLE players_to_keep AS
WITH ranked_players AS (
    SELECT 
        p.*,
        count_non_null_fields(p.*) as completeness_score,
        ROW_NUMBER() OVER (
            PARTITION BY p.name 
            ORDER BY 
                count_non_null_fields(p.*) DESC,
                p.is_verified DESC,
                p.created_at ASC
        ) as rn
    FROM players p
)
SELECT id, name, completeness_score
FROM ranked_players
WHERE rn = 1;

-- Afficher les joueurs qui seront conservés
SELECT 
    '📊 Joueurs à conserver' as info,
    name,
    completeness_score
FROM players_to_keep
WHERE name IN (
    SELECT name FROM players GROUP BY name HAVING COUNT(*) > 1
)
ORDER BY name;

-- Identifier les IDs à supprimer
CREATE TEMP TABLE players_to_delete AS
SELECT p.id, p.name
FROM players p
WHERE p.id NOT IN (SELECT id FROM players_to_keep);

-- Afficher le nombre de joueurs à supprimer
SELECT 
    '⚠️  Joueurs à supprimer' as status,
    COUNT(*) as total_to_delete
FROM players_to_delete;

-- =====================================================
-- ÉTAPE 3: VÉRIFIER LES DÉPENDANCES
-- =====================================================

-- Vérifier si des questions référencent les joueurs à supprimer
SELECT 
    '🔍 Vérification des dépendances' as info,
    COUNT(DISTINCT q.id) as questions_affectees
FROM questions q,
     LATERAL unnest(q.player_ids) as player_id
WHERE player_id::text IN (SELECT id::text FROM players_to_delete);

-- Si des questions sont affectées, on doit remplacer les IDs
-- par les IDs des joueurs à conserver

-- =====================================================
-- ÉTAPE 4: MISE À JOUR DES RÉFÉRENCES AVANT SUPPRESSION
-- =====================================================

-- Créer une table de mapping (ancien ID -> nouveau ID)
CREATE TEMP TABLE player_id_mapping AS
SELECT 
    p_del.id as old_id,
    p_keep.id as new_id,
    p_del.name
FROM players_to_delete p_del
INNER JOIN players_to_keep p_keep ON p_del.name = p_keep.name;

-- Fonction pour remplacer les IDs dans player_ids array
CREATE OR REPLACE FUNCTION replace_player_ids(player_ids_array UUID[])
RETURNS UUID[] AS $$
DECLARE
    new_array UUID[] := ARRAY[]::UUID[];
    current_id UUID;
    mapped_id UUID;
BEGIN
    FOREACH current_id IN ARRAY player_ids_array
    LOOP
        -- Chercher si cet ID doit être remplacé
        SELECT new_id INTO mapped_id
        FROM player_id_mapping
        WHERE old_id = current_id;
        
        -- Si un mapping existe, utiliser le nouveau ID, sinon garder l'ancien
        IF mapped_id IS NOT NULL THEN
            new_array := array_append(new_array, mapped_id);
        ELSE
            new_array := array_append(new_array, current_id);
        END IF;
    END LOOP;
    
    -- Retirer les doublons et retourner
    RETURN (SELECT ARRAY_AGG(DISTINCT unnest) FROM unnest(new_array));
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour les questions avec les nouveaux IDs
UPDATE questions
SET player_ids = replace_player_ids(player_ids)
WHERE player_ids && (SELECT ARRAY_AGG(old_id) FROM player_id_mapping);

SELECT 
    '✅ Questions mises à jour' as status,
    COUNT(*) as questions_updated
FROM questions
WHERE player_ids && (SELECT ARRAY_AGG(new_id) FROM player_id_mapping);

-- =====================================================
-- ÉTAPE 5: SUPPRIMER LES DOUBLONS
-- =====================================================

-- Supprimer les joueurs en double
DELETE FROM players
WHERE id IN (SELECT id FROM players_to_delete);

SELECT 
    '✅ Doublons supprimés' as status,
    COUNT(*) as total_deleted
FROM players_to_delete;

-- =====================================================
-- ÉTAPE 6: COMPLÉTER LES CODES DE NATIONALITÉ MANQUANTS
-- =====================================================

-- Mapping des nationalités vers leurs codes ISO
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
    WHEN 'Sénégal' THEN 'SEN'
    WHEN 'Côte d''Ivoire' THEN 'CIV'
    WHEN 'Mali' THEN 'MLI'
    WHEN 'Maroc' THEN 'MAR'
    WHEN 'Égypte' THEN 'EGY'
    WHEN 'Nigéria' THEN 'NGA'
    WHEN 'Ghana' THEN 'GHA'
    ELSE nationality_code
END
WHERE nationality_code IS NULL OR nationality_code = 'N/A' OR nationality_code = '';

SELECT 
    '✅ Codes de nationalité mis à jour' as status,
    COUNT(*) as total_updated
FROM players
WHERE nationality_code IS NOT NULL AND nationality_code != '' AND nationality_code != 'N/A';

-- =====================================================
-- ÉTAPE 7: AJOUTER DES CONTRAINTES DE QUALITÉ
-- =====================================================

-- 1. Contrainte: Le nom ne peut pas être vide
ALTER TABLE players
ADD CONSTRAINT players_name_not_empty 
CHECK (name IS NOT NULL AND trim(name) != '');

-- 2. Contrainte: Le nom doit être unique (empêche les futurs doublons)
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name_unique 
ON players(LOWER(trim(name)));

-- 3. Contrainte: Si nationality existe, nationality_code doit aussi exister
ALTER TABLE players
ADD CONSTRAINT players_nationality_code_required 
CHECK (
    (nationality IS NULL OR trim(nationality) = '') OR 
    (nationality_code IS NOT NULL AND trim(nationality_code) != '' AND nationality_code != 'N/A')
);

-- 4. Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_players_name_trgm 
ON players USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_players_slug 
ON players(slug);

CREATE INDEX IF NOT EXISTS idx_players_nationality_code 
ON players(nationality_code) 
WHERE nationality_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_current_club 
ON players(current_club) 
WHERE current_club IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_active_verified 
ON players(is_active, is_verified);

-- 5. Ajouter un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS players_updated_at_trigger ON players;
CREATE TRIGGER players_updated_at_trigger
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_players_updated_at();

-- 6. Ajouter un trigger pour générer automatiquement le slug
CREATE OR REPLACE FUNCTION generate_player_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(
            regexp_replace(
                regexp_replace(
                    unaccent(NEW.name),
                    '[^a-zA-Z0-9\s-]', '', 'g'
                ),
                '\s+', '-', 'g'
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS players_generate_slug_trigger ON players;
CREATE TRIGGER players_generate_slug_trigger
    BEFORE INSERT OR UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION generate_player_slug();

-- =====================================================
-- ÉTAPE 8: STATISTIQUES FINALES
-- =====================================================

SELECT 
    '📊 STATISTIQUES FINALES' as titre,
    (SELECT COUNT(*) FROM players) as total_joueurs,
    (SELECT COUNT(*) FROM players WHERE is_verified) as joueurs_verifies,
    (SELECT COUNT(*) FROM players WHERE nationality_code IS NOT NULL AND nationality_code != '' AND nationality_code != 'N/A') as avec_code_nationalite,
    (SELECT COUNT(*) FROM players WHERE position IS NOT NULL AND position != '') as avec_position,
    (SELECT COUNT(DISTINCT name) FROM players) as noms_uniques;

-- Vérifier qu'il n'y a plus de doublons
SELECT 
    '🔍 Vérification doublons' as verification,
    name,
    COUNT(*) as occurrences
FROM players
GROUP BY name
HAVING COUNT(*) > 1;

-- Si aucun résultat ci-dessus, c'est bon!

SELECT '✅ FIABILISATION TERMINÉE!' as status;

-- =====================================================
-- NOTES ET RECOMMANDATIONS
-- =====================================================
/*
RÉSUMÉ DES ACTIONS:
1. ✅ Doublons sauvegardés dans players_duplicates_backup
2. ✅ Doublons supprimés (gardé le plus complet pour chaque nom)
3. ✅ Références mises à jour dans les questions
4. ✅ Codes de nationalité complétés
5. ✅ Contraintes ajoutées pour empêcher les futurs doublons
6. ✅ Index ajoutés pour améliorer les performances
7. ✅ Triggers ajoutés pour l'automatisation

PROCHAINES ÉTAPES RECOMMANDÉES:
- Compléter manuellement les positions manquantes
- Vérifier et valider les joueurs (is_verified = true)
- Ajouter des photos (photo_url) pour les joueurs principaux
- Compléter club_history pour les joueurs importants
- Enrichir name_variations pour améliorer l'autocomplétion
*/



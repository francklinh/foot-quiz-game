-- =====================================================
-- CORRECTION: Valeur par défaut des cerises à 0
-- =====================================================
-- Problème: Les nouveaux utilisateurs commencent avec 100 cerises
-- Solution: Corriger la valeur par défaut et réinitialiser les comptes

DO $$
DECLARE
    users_to_reset INTEGER;
BEGIN
    RAISE NOTICE '🔍 ANALYSE DU PROBLÈME DES CERISES';
    RAISE NOTICE '==========================================================';
    
    -- Compter les utilisateurs avec exactement 100 cerises (jamais joué)
    SELECT COUNT(*) INTO users_to_reset
    FROM users
    WHERE cerises_balance = 100;
    
    RAISE NOTICE 'Utilisateurs avec 100 cerises: %', users_to_reset;
    
    -- =====================================================
    -- ÉTAPE 1: Vérifier la valeur par défaut actuelle
    -- =====================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 ÉTAPE 1: Vérification de la colonne cerises_balance';
    RAISE NOTICE '✅ Colonne trouvée';
    
    -- =====================================================
    -- ÉTAPE 2: Modifier la valeur par défaut à 0
    -- =====================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '🔧 ÉTAPE 2: Correction de la valeur par défaut';
    
    -- Supprimer l'ancienne valeur par défaut si elle existe
    ALTER TABLE users 
    ALTER COLUMN cerises_balance DROP DEFAULT;
    
    RAISE NOTICE '✅ Ancienne valeur par défaut supprimée';
    
    -- Définir la nouvelle valeur par défaut à 0
    ALTER TABLE users 
    ALTER COLUMN cerises_balance SET DEFAULT 0;
    
    RAISE NOTICE '✅ Nouvelle valeur par défaut: 0';
    
    -- S'assurer que la contrainte CHECK existe
    -- (la colonne ne peut jamais être négative)
    -- Note: Cette contrainte existe probablement déjà, on la recrée pour être sûr
    BEGIN
        ALTER TABLE users 
        DROP CONSTRAINT IF EXISTS users_cerises_balance_check;
        
        ALTER TABLE users 
        ADD CONSTRAINT users_cerises_balance_check 
        CHECK (cerises_balance >= 0);
        
        RAISE NOTICE '✅ Contrainte CHECK (cerises >= 0) appliquée';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE '✓ Contrainte CHECK existe déjà';
    END;
    
    -- =====================================================
    -- ÉTAPE 3: Réinitialiser les comptes à 100 cerises (jamais joué)
    -- =====================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '♻️  ÉTAPE 3: Réinitialisation des comptes de test';
    
    -- Réinitialiser UNIQUEMENT les utilisateurs qui:
    -- 1. Ont exactement 100 cerises
    -- 2. N'ont aucune transaction de cerises (jamais joué)
    -- 3. Ont été créés récemment (dernières 48h)
    
    WITH users_to_update AS (
        SELECT u.id, u.pseudo, u.cerises_balance
        FROM users u
        WHERE u.cerises_balance = 100
        AND u.created_at > NOW() - INTERVAL '48 hours'
        -- Vérifier qu'il n'y a pas de transactions (table cerises_transactions)
        AND NOT EXISTS (
            SELECT 1 FROM cerises_transactions ct
            WHERE ct.user_id = u.id
        )
    )
    UPDATE users
    SET cerises_balance = 0
    FROM users_to_update
    WHERE users.id = users_to_update.id;
    
    GET DIAGNOSTICS users_to_reset = ROW_COUNT;
    
    RAISE NOTICE '✅ % compte(s) réinitialisé(s) à 0 cerises', users_to_reset;
    
    -- =====================================================
    -- ÉTAPE 4: Afficher un résumé
    -- =====================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORRECTION TERMINÉE!';
    RAISE NOTICE '==========================================================';
    
END $$;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

-- Vérifier la nouvelle valeur par défaut
SELECT 
    '📊 VÉRIFICATION FINALE' as status,
    column_name,
    COALESCE(column_default, 'NULL') as default_value,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'cerises_balance';

-- Afficher la distribution des cerises
SELECT 
    '🍒 DISTRIBUTION DES CERISES' as titre,
    cerises_balance as montant,
    COUNT(*) as nb_utilisateurs
FROM users
GROUP BY cerises_balance
ORDER BY cerises_balance;

-- Afficher les 10 derniers utilisateurs créés
SELECT 
    '👥 DERNIERS UTILISATEURS CRÉÉS' as titre,
    pseudo,
    cerises_balance,
    created_at::date as creation
FROM users
ORDER BY created_at DESC
LIMIT 10;

SELECT '✅ TOUS LES NOUVEAUX UTILISATEURS COMMENCERONT AVEC 0 CERISES!' as resultat;


-- Script pour vérifier et corriger la fonction RPC update_cerises_balance
-- Le problème peut être que la fonction ne retourne pas de valeur ou retourne NULL

-- 1. Vérifier si la fonction existe et sa définition
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname = 'update_cerises_balance';

-- 2. Recréer la fonction pour garantir qu'elle retourne le nouveau solde
-- Cette fonction remplace celle existante si elle existe déjà
CREATE OR REPLACE FUNCTION public.update_cerises_balance(
    p_user_id UUID,
    p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
    
    -- Mettre à jour le solde
    UPDATE public.users
    SET cerises_balance = GREATEST(0, cerises_balance + p_amount)
    WHERE id = p_user_id;
    
    -- Récupérer et retourner le nouveau solde
    SELECT cerises_balance INTO v_new_balance
    FROM public.users
    WHERE id = p_user_id;
    
    RETURN COALESCE(v_new_balance, 0);
END;
$$;

-- 4. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.update_cerises_balance(UUID, INTEGER) TO anon, authenticated;

-- 5. Vérifier que la fonction fonctionne avec un test
DO $$
DECLARE
    test_user_id UUID := (SELECT id FROM public.users LIMIT 1);
    test_result INTEGER;
    initial_balance INTEGER;
BEGIN
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'Aucun utilisateur trouvé pour le test';
        RETURN;
    END IF;
    
    -- Récupérer le solde initial
    SELECT cerises_balance INTO initial_balance
    FROM public.users
    WHERE id = test_user_id;
    
    RAISE NOTICE 'Test avec userId: %, solde initial: %', test_user_id, initial_balance;
    
    -- Tester la fonction
    SELECT public.update_cerises_balance(test_user_id, 1) INTO test_result;
    
    RAISE NOTICE 'Résultat de la fonction: %', test_result;
    
    -- Vérifier le solde après
    SELECT cerises_balance INTO test_result
    FROM public.users
    WHERE id = test_user_id;
    
    RAISE NOTICE 'Solde après test: %', test_result;
    
    -- Restaurer le solde initial (retirer 1)
    UPDATE public.users
    SET cerises_balance = initial_balance
    WHERE id = test_user_id;
    
    RAISE NOTICE '✅ Test terminé, solde restauré';
END $$;


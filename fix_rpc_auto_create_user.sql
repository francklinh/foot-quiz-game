-- Script pour modifier la fonction RPC update_cerises_balance
-- afin qu'elle crée automatiquement l'utilisateur dans public.users s'il n'existe pas
-- (l'utilisateur existe toujours dans auth.users car il est connecté)

-- Recréer la fonction avec auto-création de l'utilisateur
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
    v_user_exists BOOLEAN;
BEGIN
    -- Vérifier si l'utilisateur existe dans public.users
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = p_user_id) INTO v_user_exists;
    
    -- Si l'utilisateur n'existe pas, le créer avec un solde de 0
    -- (l'utilisateur existe toujours dans auth.users car il est connecté)
    IF NOT v_user_exists THEN
        -- Créer l'utilisateur avec des valeurs par défaut
        -- L'email et le pseudo seront mis à jour plus tard si nécessaire
        INSERT INTO public.users (id, cerises_balance, email, pseudo, created_at, updated_at)
        VALUES (
            p_user_id,
            0,
            'user_' || SUBSTRING(p_user_id::text, 1, 8) || '@temp.com', -- Email temporaire
            'User', -- Pseudo par défaut
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Utilisateur créé automatiquement dans public.users: %', p_user_id;
    END IF;
    
    -- Mettre à jour le solde
    UPDATE public.users
    SET 
        cerises_balance = GREATEST(0, cerises_balance + p_amount),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Récupérer et retourner le nouveau solde
    SELECT cerises_balance INTO v_new_balance
    FROM public.users
    WHERE id = p_user_id;
    
    RETURN COALESCE(v_new_balance, 0);
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.update_cerises_balance(UUID, INTEGER) TO anon, authenticated;

-- Vérifier que la fonction est bien mise à jour
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname = 'update_cerises_balance';


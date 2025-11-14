-- Script pour créer un trigger qui crée automatiquement un enregistrement
-- dans public.users quand un utilisateur s'inscrit dans auth.users
--
-- Note: Ce trigger fonctionne au niveau de Supabase et doit être créé
-- dans l'interface Supabase Dashboard > Database > Triggers
-- ou via une migration Supabase
--
-- Si vous ne pouvez pas créer le trigger au niveau auth.users,
-- utilisez la fonction RPC modifiée qui crée l'utilisateur à la volée

-- Fonction trigger pour créer l'utilisateur dans public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Créer l'utilisateur dans public.users avec les données de auth.users
    INSERT INTO public.users (id, email, pseudo, cerises_balance, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'pseudo', NEW.email),
        0, -- Solde initial à 0
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- Éviter les doublons
    
    RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users (si possible)
-- Note: Dans Supabase, les triggers sur auth.users peuvent nécessiter
-- des permissions spéciales ou être créés différemment
-- 
-- Si le trigger ne peut pas être créé sur auth.users,
-- vous devrez créer l'utilisateur manuellement lors de l'inscription
-- ou via la fonction RPC update_cerises_balance (qui le crée maintenant automatiquement)

-- Vérifier si le trigger peut être créé
DO $$
BEGIN
    -- Tenter de créer le trigger (peut échouer selon les permissions)
    BEGIN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
        
        RAISE NOTICE '✅ Trigger créé avec succès sur auth.users';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Impossible de créer le trigger sur auth.users: %', SQLERRM;
        RAISE NOTICE '   La fonction RPC update_cerises_balance créera automatiquement les utilisateurs manquants';
    END;
END $$;

-- Alternative: Modifier le service d'inscription pour créer l'utilisateur
-- dans public.users après l'inscription dans auth.users
-- (Voir src/services/auth.service.ts)



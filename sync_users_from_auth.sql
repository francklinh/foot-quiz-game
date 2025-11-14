-- Script pour synchroniser les utilisateurs de public.users avec auth.users
-- Ce script met à jour l'email et le pseudo des utilisateurs existants
-- qui ont été créés automatiquement avec des valeurs temporaires

-- Note: Ce script nécessite d'être exécuté avec les permissions admin
-- car il accède à auth.users

-- Pour chaque utilisateur dans auth.users, créer ou mettre à jour l'enregistrement dans public.users
DO $$
DECLARE
    auth_user RECORD;
    users_created INTEGER := 0;
    users_updated INTEGER := 0;
BEGIN
    -- Parcourir tous les utilisateurs dans auth.users
    FOR auth_user IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users
    LOOP
        -- Vérifier si l'utilisateur existe dans public.users
        IF EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
            -- Mettre à jour l'email et le pseudo si nécessaire
            UPDATE public.users
            SET 
                email = COALESCE(auth_user.email, email),
                pseudo = COALESCE(
                    auth_user.raw_user_meta_data->>'pseudo',
                    SPLIT_PART(auth_user.email, '@', 1),
                    pseudo
                ),
                updated_at = NOW()
            WHERE id = auth_user.id
            AND (email LIKE '%@temp.com' OR pseudo = 'User'); -- Mettre à jour seulement les valeurs temporaires
            
            IF FOUND THEN
                users_updated := users_updated + 1;
            END IF;
        ELSE
            -- Créer l'utilisateur dans public.users
            INSERT INTO public.users (id, email, pseudo, cerises_balance, created_at, updated_at)
            VALUES (
                auth_user.id,
                auth_user.email,
                COALESCE(
                    auth_user.raw_user_meta_data->>'pseudo',
                    SPLIT_PART(auth_user.email, '@', 1)
                ),
                0,
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;
            
            IF FOUND THEN
                users_created := users_created + 1;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Synchronisation terminée: % utilisateurs créés, % utilisateurs mis à jour', users_created, users_updated;
END $$;

-- Afficher les utilisateurs qui ont encore des valeurs temporaires
SELECT 
    id,
    email,
    pseudo,
    cerises_balance,
    created_at
FROM public.users
WHERE email LIKE '%@temp.com' OR pseudo = 'User'
ORDER BY created_at DESC;



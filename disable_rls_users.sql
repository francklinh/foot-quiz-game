-- Script pour désactiver temporairement les RLS sur la table users
-- ATTENTION: Ceci réduit la sécurité, mais permet de contourner les problèmes de RLS pour un MVP
-- À réactiver avec des politiques correctes en production

-- 1. Désactiver RLS sur la table users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que RLS est bien désactivé
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relname = 'users'
            AND c.relrowsecurity = true
        ) THEN
            RAISE NOTICE '✅ RLS est désactivé sur la table users';
        ELSE
            RAISE NOTICE '⚠️  RLS est toujours activé sur la table users';
        END IF;
    ELSE
        RAISE NOTICE '❌ La table users n existe pas';
    END IF;
END $$;

-- 3. Vérifier les politiques existantes (elles seront toujours là mais inactives)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Note: Pour réactiver RLS plus tard:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;



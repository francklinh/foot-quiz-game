-- Script pour déboguer la table users
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Vérifier si RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 4. Lister tous les utilisateurs (en tant que superuser)
SELECT id, email, pseudo, country, cerises_balance, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Vérifier les triggers
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 6. Vérifier les fonctions
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

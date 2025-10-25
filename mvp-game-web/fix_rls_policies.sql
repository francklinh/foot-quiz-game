-- Script pour corriger définitivement les politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS pour tester
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerises_transactions DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to insert users" ON public.users;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.cerises_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.cerises_transactions;

-- 3. Vérifier le contenu de la table users
SELECT COUNT(*) as total_users FROM public.users;
SELECT id, email, pseudo, country, cerises_balance, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerises_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques RLS plus permissives
CREATE POLICY "Enable read access for all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.users
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all transactions" ON public.cerises_transactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all transactions" ON public.cerises_transactions
  FOR INSERT WITH CHECK (true);

-- 6. Vérifier que les politiques sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('users', 'cerises_transactions')
ORDER BY tablename, policyname;

-- Script SQL final simplifié pour configurer la table users
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. S'assurer que la colonne cerises_balance existe
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cerises_balance INTEGER DEFAULT 100;

-- 2. Créer la table cerises_transactions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.cerises_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EARNED', 'SPENT', 'TRANSFER_IN', 'TRANSFER_OUT')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Supprimer l'ancienne fonction s'elle existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 5. Créer une fonction simplifiée avec pays par défaut
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, pseudo, country, cerises_balance, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'pseudo', split_part(NEW.email, '@', 1)),
    'FRA', -- Toujours France par défaut pour éviter les problèmes
    100,
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, on log l'erreur mais on ne bloque pas l'inscription
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Activer RLS sur les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cerises_transactions ENABLE ROW LEVEL SECURITY;

-- 8. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.cerises_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.cerises_transactions;

-- 9. Créer les nouvelles politiques RLS
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions" ON public.cerises_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.cerises_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Créer la fonction pour mettre à jour le solde de cerises
CREATE OR REPLACE FUNCTION public.update_cerises_balance(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Mettre à jour le solde
  UPDATE public.users 
  SET cerises_balance = cerises_balance + p_amount
  WHERE id = p_user_id
  RETURNING cerises_balance INTO new_balance;
  
  -- Enregistrer la transaction
  INSERT INTO public.cerises_transactions (user_id, amount, type, description)
  VALUES (
    p_user_id,
    p_amount,
    CASE 
      WHEN p_amount > 0 THEN 'EARNED'
      ELSE 'SPENT'
    END,
    CASE 
      WHEN p_amount > 0 THEN 'Cerises gagnées'
      ELSE 'Cerises dépensées'
    END
  );
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.cerises_transactions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_cerises_balance TO anon, authenticated;





-- ============================================
-- Correction complète de la table friendships
-- ============================================

-- 1. Ajouter la colonne accepted_at si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'friendships' 
    AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE friendships 
    ADD COLUMN accepted_at timestamp with time zone;
    
    RAISE NOTICE 'Colonne accepted_at ajoutée avec succès';
  ELSE
    RAISE NOTICE 'Colonne accepted_at existe déjà';
  END IF;
END $$;

-- 2. Supprimer l'ancienne contrainte CHECK (si elle existe)
ALTER TABLE friendships 
DROP CONSTRAINT IF EXISTS friendships_status_check;

-- 3. Mettre à jour les statuts existants en minuscules (au cas où)
UPDATE friendships
SET status = LOWER(status)
WHERE status IN ('PENDING', 'ACCEPTED', 'REJECTED');

-- 4. Ajouter la nouvelle contrainte CHECK avec les valeurs en minuscules
ALTER TABLE friendships 
ADD CONSTRAINT friendships_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- 5. Vérifier la structure finale
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name = 'friendships'
ORDER BY ordinal_position;

-- 6. Vérifier la contrainte
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM
  pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
  INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE
  nsp.nspname = 'public'
  AND rel.relname = 'friendships'
  AND con.contype = 'c'
  AND con.conname = 'friendships_status_check';





-- ============================================
-- Correction de la contrainte CHECK pour status
-- ============================================

-- 1. Supprimer l'ancienne contrainte (si elle existe)
ALTER TABLE friendships 
DROP CONSTRAINT IF EXISTS friendships_status_check;

-- 2. Ajouter la nouvelle contrainte avec les valeurs en minuscules
ALTER TABLE friendships 
ADD CONSTRAINT friendships_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- 3. Vérifier la nouvelle contrainte
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





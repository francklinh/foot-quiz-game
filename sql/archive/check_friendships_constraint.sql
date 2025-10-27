-- Script pour vérifier la contrainte CHECK sur la table friendships

-- 1. Vérifier la définition de la contrainte
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
  AND con.contype = 'c';  -- 'c' = CHECK constraint

-- 2. Voir la structure de la colonne status
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
  AND column_name = 'status';





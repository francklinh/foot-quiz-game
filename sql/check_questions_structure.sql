-- Script pour vérifier la structure réelle de la table questions
-- Exécutez ce script pour voir quelles colonnes existent

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'questions'
ORDER BY ordinal_position;


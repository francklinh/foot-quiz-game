-- ============================================
-- Configuration RLS pour la table friendships
-- ============================================

-- 1. Activer RLS sur la table friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can accept friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON friendships;

-- 3. Créer les nouvelles politiques

-- Politique SELECT : Un utilisateur peut voir ses propres amitiés
CREATE POLICY "Users can view their own friendships" 
ON friendships FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

-- Politique INSERT : Un utilisateur peut envoyer des demandes d'ami
CREATE POLICY "Users can send friend requests" 
ON friendships FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id  -- L'utilisateur actuel doit être celui qui envoie la demande
);

-- Politique UPDATE : Un utilisateur peut accepter/rejeter les demandes qui lui sont adressées
CREATE POLICY "Users can accept friend requests" 
ON friendships FOR UPDATE 
TO authenticated
USING (
  auth.uid() = friend_id  -- L'utilisateur actuel doit être le destinataire de la demande
)
WITH CHECK (
  auth.uid() = friend_id
);

-- Politique DELETE : Un utilisateur peut supprimer ses propres amitiés
CREATE POLICY "Users can delete their own friendships" 
ON friendships FOR DELETE 
TO authenticated
USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

-- 4. Vérifier les politiques créées
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'friendships';





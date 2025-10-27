-- ============================================
-- CORRECTIF: Simplification des politiques RLS
-- Pour éviter les récursions infinies
-- ============================================

-- Désactiver temporairement RLS
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view challenges they participate in" ON public.challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Creators can update their challenges" ON public.challenges;
DROP POLICY IF EXISTS "Creators can delete pending challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view participants of their challenges" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can be added as participants" ON public.challenge_participants;
DROP POLICY IF EXISTS "Participants can update their own data" ON public.challenge_participants;
DROP POLICY IF EXISTS "Creators can remove participants from pending challenges" ON public.challenge_participants;

-- ============================================
-- Nouvelles politiques simplifiées pour CHALLENGES
-- ============================================

-- SELECT: Tout utilisateur authentifié peut voir les défis (on filtrera côté client)
CREATE POLICY "Authenticated users can view challenges"
    ON public.challenges
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: N'importe quel utilisateur peut créer un défi
CREATE POLICY "Authenticated users can create challenges"
    ON public.challenges
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = creator_id);

-- UPDATE: Seul le créateur peut mettre à jour
CREATE POLICY "Creators can update their challenges"
    ON public.challenges
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- DELETE: Seul le créateur peut supprimer
CREATE POLICY "Creators can delete their challenges"
    ON public.challenges
    FOR DELETE
    TO authenticated
    USING (auth.uid() = creator_id);

-- ============================================
-- Nouvelles politiques simplifiées pour PARTICIPANTS
-- ============================================

-- SELECT: Tout utilisateur authentifié peut voir les participants
CREATE POLICY "Authenticated users can view participants"
    ON public.challenge_participants
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: N'importe qui peut ajouter un participant
CREATE POLICY "Authenticated users can add participants"
    ON public.challenge_participants
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE: Un utilisateur peut mettre à jour sa propre participation
CREATE POLICY "Users can update their own participation"
    ON public.challenge_participants
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Un utilisateur peut supprimer sa propre participation
CREATE POLICY "Users can delete their own participation"
    ON public.challenge_participants
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- Réactiver RLS
-- ============================================
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Message de succès
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ═══════════════════════════════════════';
    RAISE NOTICE '✅ POLITIQUES RLS CORRIGÉES !';
    RAISE NOTICE '✅ ═══════════════════════════════════════';
    RAISE NOTICE '';
END $$;





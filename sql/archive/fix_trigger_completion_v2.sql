-- ============================================
-- CORRECTIF V2: Trigger de mise à jour du statut
-- Version simplifiée sans min_participants
-- ============================================

-- Supprimer l'ancien trigger et la fonction
DROP TRIGGER IF EXISTS trigger_update_challenge_status ON public.challenge_participants;
DROP FUNCTION IF EXISTS update_challenge_global_status();

-- Recréer la fonction avec une logique ultra-simple
CREATE OR REPLACE FUNCTION update_challenge_global_status()
RETURNS TRIGGER AS $$
DECLARE
    total_participants INTEGER;
    completed_participants INTEGER;
    pending_participants INTEGER;
BEGIN
    -- Compter tous les participants (sauf declined)
    SELECT 
        COUNT(*) FILTER (WHERE status != 'declined'),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'pending')
    INTO 
        total_participants,
        completed_participants,
        pending_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id;
    
    RAISE NOTICE 'Trigger: challenge=%, total=%, completed=%, pending=%', 
        NEW.challenge_id, total_participants, completed_participants, pending_participants;
    
    -- Cas 1: Tous les participants ont terminé
    IF completed_participants > 0 AND pending_participants = 0 AND completed_participants = total_participants THEN
        RAISE NOTICE 'Trigger: Passage à completed';
        UPDATE challenges
        SET 
            status = 'completed',
            completed_at = NOW()
        WHERE id = NEW.challenge_id;
    -- Cas 2: Au moins un participant a joué
    ELSIF completed_participants > 0 THEN
        RAISE NOTICE 'Trigger: Passage à in_progress';
        UPDATE challenges
        SET status = 'in_progress'
        WHERE id = NEW.challenge_id
        AND status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER trigger_update_challenge_status
    AFTER INSERT OR UPDATE OF status, score ON public.challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_global_status();

-- ============================================
-- Test manuel du trigger
-- ============================================
DO $$
DECLARE
    test_challenge_id UUID;
    test_user1_id UUID := 'f99c12d4-526d-4eb9-b241-d66e91ebef68';
    test_user2_id UUID := '4c83f33d-aab6-4893-81dc-76cac814c9b5';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST DU TRIGGER...';
    
    -- Récupérer le dernier défi
    SELECT id INTO test_challenge_id
    FROM challenges
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF test_challenge_id IS NOT NULL THEN
        RAISE NOTICE 'Test sur challenge: %', test_challenge_id;
        
        -- Forcer une mise à jour pour déclencher le trigger
        UPDATE challenge_participants
        SET status = status
        WHERE challenge_id = test_challenge_id;
        
        RAISE NOTICE 'Trigger déclenché manuellement';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ ═══════════════════════════════════════';
    RAISE NOTICE '✅ TRIGGER V2 INSTALLÉ !';
    RAISE NOTICE '✅ ═══════════════════════════════════════';
    RAISE NOTICE '';
END $$;





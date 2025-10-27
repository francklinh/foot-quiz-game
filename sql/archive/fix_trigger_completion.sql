-- ============================================
-- CORRECTIF: Trigger de mise à jour du statut
-- Pour passer à 'completed' quand tous ont joué
-- ============================================

-- Supprimer l'ancien trigger et la fonction
DROP TRIGGER IF EXISTS trigger_update_challenge_status ON public.challenge_participants;
DROP FUNCTION IF EXISTS update_challenge_global_status();

-- Recréer la fonction avec la logique corrigée
CREATE OR REPLACE FUNCTION update_challenge_global_status()
RETURNS TRIGGER AS $$
DECLARE
    total_participants INTEGER;
    completed_participants INTEGER;
    active_participants INTEGER;
BEGIN
    -- Compter UNIQUEMENT les participants actifs (pas declined)
    SELECT COUNT(*) INTO total_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id
    AND status != 'declined';
    
    -- Compter ceux qui ont terminé
    SELECT COUNT(*) INTO completed_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id
    AND status = 'completed';
    
    -- Compter ceux qui sont en train de jouer
    SELECT COUNT(*) INTO active_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id
    AND status = 'active';
    
    -- Mettre à jour le statut global
    IF total_participants > 0 AND completed_participants = total_participants THEN
        -- Tous les participants actifs ont terminé
        UPDATE challenges
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = NEW.challenge_id
        AND status != 'completed';
        
        RAISE NOTICE 'Challenge % passé à completed (%/% participants)', NEW.challenge_id, completed_participants, total_participants;
    ELSIF active_participants > 0 OR completed_participants > 0 THEN
        -- Au moins un participant a commencé
        UPDATE challenges
        SET status = 'in_progress'
        WHERE id = NEW.challenge_id
        AND status = 'pending';
        
        RAISE NOTICE 'Challenge % passé à in_progress', NEW.challenge_id;
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
-- Message de succès
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ═══════════════════════════════════════';
    RAISE NOTICE '✅ TRIGGER DE COMPLÉTION CORRIGÉ !';
    RAISE NOTICE '✅ ═══════════════════════════════════════';
    RAISE NOTICE '';
END $$;





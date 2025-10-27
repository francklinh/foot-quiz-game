-- ============================================
-- VERSION 3 DU TRIGGER DE COMPLÉTION
-- Approche plus simple et robuste
-- ============================================

-- 1. Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS update_challenge_status_trigger ON challenge_participants;
DROP FUNCTION IF EXISTS update_challenge_status CASCADE;

-- 2. Créer une nouvelle fonction simplifiée
CREATE OR REPLACE FUNCTION update_challenge_status()
RETURNS TRIGGER AS $$
DECLARE
    total_participants INTEGER;
    completed_participants INTEGER;
    pending_participants INTEGER;
    new_status TEXT;
BEGIN
    -- Compter les participants
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END),
        COUNT(CASE WHEN status = 'pending' THEN 1 END)
    INTO 
        total_participants,
        completed_participants,
        pending_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id;
    
    -- Déterminer le nouveau statut
    IF completed_participants = total_participants AND total_participants > 0 THEN
        new_status := 'completed';
    ELSIF completed_participants > 0 THEN
        new_status := 'in_progress';
    ELSE
        new_status := 'pending';
    END IF;
    
    -- Mettre à jour le défi
    UPDATE challenges
    SET 
        status = new_status,
        completed_at = CASE 
            WHEN new_status = 'completed' AND completed_at IS NULL THEN NOW()
            ELSE completed_at
        END
    WHERE id = NEW.challenge_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger sur AFTER UPDATE et INSERT
CREATE TRIGGER update_challenge_status_trigger
    AFTER INSERT OR UPDATE OF status
    ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_status();

-- 4. Corriger immédiatement tous les défis existants
UPDATE challenges c
SET 
    status = CASE
        WHEN (
            SELECT COUNT(*) 
            FROM challenge_participants cp 
            WHERE cp.challenge_id = c.id AND cp.status = 'completed'
        ) = (
            SELECT COUNT(*) 
            FROM challenge_participants cp 
            WHERE cp.challenge_id = c.id
        ) AND (
            SELECT COUNT(*) 
            FROM challenge_participants cp 
            WHERE cp.challenge_id = c.id
        ) > 0
        THEN 'completed'
        WHEN (
            SELECT COUNT(*) 
            FROM challenge_participants cp 
            WHERE cp.challenge_id = c.id AND cp.status = 'completed'
        ) > 0
        THEN 'in_progress'
        ELSE 'pending'
    END,
    completed_at = CASE
        WHEN (
            SELECT COUNT(*) 
            FROM challenge_participants cp 
            WHERE cp.challenge_id = c.id AND cp.status = 'completed'
        ) = (
            SELECT COUNT(*) 
            FROM challenge_participants cp 
            WHERE cp.challenge_id = c.id
        ) AND (
            SELECT COUNT(*) 
            FROM challenge_participants cp 
            WHERE cp.challenge_id = c.id
        ) > 0 AND c.completed_at IS NULL
        THEN NOW()
        ELSE c.completed_at
    END
WHERE c.status != 'cancelled' AND c.status != 'expired';

-- 5. Afficher les résultats
SELECT 
    c.id,
    c.status,
    c.created_at,
    c.completed_at,
    COUNT(cp.id) as total_participants,
    COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) as completed_count
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
WHERE c.created_at > NOW() - INTERVAL '1 day'
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 20;

-- 6. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger version 3 installé avec succès';
    RAISE NOTICE '✅ Tous les défis existants ont été corrigés';
END $$;




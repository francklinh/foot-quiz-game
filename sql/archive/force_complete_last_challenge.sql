-- ============================================
-- SCRIPT POUR FORCER LA COMPLÉTION DU DERNIER DÉFI
-- À utiliser pour tester sans le trigger
-- ============================================

-- Mettre à jour le dernier défi à 'completed'
UPDATE challenges
SET 
    status = 'completed',
    completed_at = NOW()
WHERE id = (
    SELECT id 
    FROM challenges 
    ORDER BY created_at DESC 
    LIMIT 1
)
AND status = 'in_progress'
AND NOT EXISTS (
    SELECT 1 
    FROM challenge_participants 
    WHERE challenge_id = challenges.id 
    AND status = 'pending'
);

-- Afficher le résultat
SELECT 
    c.id,
    c.status,
    c.completed_at,
    COUNT(cp.id) as total_participants,
    COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN cp.status = 'pending' THEN 1 END) as pending_count
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
WHERE c.id = (SELECT id FROM challenges ORDER BY created_at DESC LIMIT 1)
GROUP BY c.id;





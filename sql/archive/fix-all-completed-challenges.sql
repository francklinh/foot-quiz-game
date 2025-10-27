-- ============================================
-- SCRIPT POUR CORRIGER TOUS LES DÉFIS TERMINÉS
-- ============================================

-- Afficher les défis qui devraient être "completed" mais ne le sont pas
SELECT 
    c.id,
    c.status as current_status,
    COUNT(cp.id) as total_participants,
    COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN cp.status = 'pending' THEN 1 END) as pending_count
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
WHERE c.status != 'completed'
GROUP BY c.id
HAVING COUNT(cp.id) > 0 
    AND COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) = COUNT(cp.id);

-- Mettre à jour automatiquement ces défis
UPDATE challenges
SET 
    status = 'completed',
    completed_at = NOW()
WHERE id IN (
    SELECT c.id
    FROM challenges c
    LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
    WHERE c.status != 'completed'
    GROUP BY c.id
    HAVING COUNT(cp.id) > 0 
        AND COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) = COUNT(cp.id)
);

-- Afficher le résultat
SELECT 
    c.id,
    c.status,
    c.completed_at,
    COUNT(cp.id) as total_participants,
    COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) as completed_count
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
WHERE c.completed_at > NOW() - INTERVAL '1 hour'
GROUP BY c.id;




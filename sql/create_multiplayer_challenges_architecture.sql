-- ============================================
-- NOUVELLE ARCHITECTURE MULTI-JOUEURS POUR LES DÉFIS
-- Support de 2 à N joueurs par défi
-- ============================================

-- ============================================
-- 1. Supprimer l'ancienne structure (si migration)
-- ============================================
-- ATTENTION: Ceci va supprimer les anciennes données de défis
DROP TABLE IF EXISTS public.challenge_participants CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;

-- ============================================
-- 2. Table CHALLENGES (Métadonnées du défi)
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenges (
    -- Identifiant unique
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Créateur du défi
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Type de jeu
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('TOP10', 'GRILLE', 'CLUB', 'COMING_SOON')),
    
    -- Statut global du défi
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'cancelled')),
    
    -- Gagnant(s) - peut être NULL (égalité) ou contenir plusieurs IDs séparés par des virgules
    winner_ids TEXT DEFAULT NULL,
    
    -- Question/Thème (optionnel, pour TOP10)
    question_id UUID DEFAULT NULL,
    
    -- Configuration
    max_participants INTEGER DEFAULT NULL, -- NULL = illimité
    min_participants INTEGER DEFAULT 2,
    
    -- Dates importantes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Contraintes
    CONSTRAINT valid_expires_at CHECK (expires_at > created_at),
    CONSTRAINT valid_participants CHECK (min_participants >= 2 AND (max_participants IS NULL OR max_participants >= min_participants))
);

-- ============================================
-- 3. Table CHALLENGE_PARTICIPANTS (Un enregistrement par joueur)
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_participants (
    -- Identifiant unique
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Référence au défi
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    
    -- Référence au joueur
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Statut du participant
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
    
    -- Score et temps
    score INTEGER DEFAULT NULL,
    time_taken INTEGER DEFAULT NULL, -- en secondes
    
    -- Classement dans le défi (1 = gagnant, NULL = pas encore calculé)
    rank INTEGER DEFAULT NULL,
    
    -- Dates
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ DEFAULT NULL,
    completed_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Contraintes
    CONSTRAINT unique_challenge_user UNIQUE (challenge_id, user_id),
    CONSTRAINT valid_score CHECK (score IS NULL OR score >= 0),
    CONSTRAINT valid_time CHECK (time_taken IS NULL OR time_taken > 0),
    CONSTRAINT valid_rank CHECK (rank IS NULL OR rank > 0)
);

-- ============================================
-- 4. Index pour améliorer les performances
-- ============================================

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_creator ON public.challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON public.challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_expires_at ON public.challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_challenges_game_type ON public.challenges(game_type);

-- Participants
CREATE INDEX IF NOT EXISTS idx_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.challenge_participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_challenge_status ON public.challenge_participants(challenge_id, status);

-- ============================================
-- 5. Fonction pour mettre à jour le statut global du défi
-- ============================================
CREATE OR REPLACE FUNCTION update_challenge_global_status()
RETURNS TRIGGER AS $$
DECLARE
    total_participants INTEGER;
    completed_participants INTEGER;
    active_participants INTEGER;
    min_required INTEGER;
BEGIN
    -- Compter les participants
    SELECT COUNT(*) INTO total_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id
    AND status != 'declined';
    
    SELECT COUNT(*) INTO completed_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id
    AND status = 'completed';
    
    SELECT COUNT(*) INTO active_participants
    FROM challenge_participants
    WHERE challenge_id = NEW.challenge_id
    AND status = 'active';
    
    -- Récupérer le minimum requis
    SELECT min_participants INTO min_required
    FROM challenges
    WHERE id = NEW.challenge_id;
    
    -- Mettre à jour le statut global
    IF completed_participants >= min_required AND completed_participants = total_participants THEN
        -- Tous les participants ont terminé
        UPDATE challenges
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = NEW.challenge_id
        AND status != 'completed';
    ELSIF active_participants > 0 OR completed_participants > 0 THEN
        -- Au moins un participant a commencé
        UPDATE challenges
        SET status = 'in_progress'
        WHERE id = NEW.challenge_id
        AND status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur les participants
DROP TRIGGER IF EXISTS trigger_update_challenge_status ON public.challenge_participants;
CREATE TRIGGER trigger_update_challenge_status
    AFTER INSERT OR UPDATE OF status, score ON public.challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_global_status();

-- ============================================
-- 6. Fonction pour calculer les classements
-- ============================================
CREATE OR REPLACE FUNCTION calculate_challenge_rankings()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer les rangs uniquement quand le défi est complété
    IF NEW.status = 'completed' THEN
        WITH ranked_participants AS (
            SELECT 
                id,
                RANK() OVER (
                    PARTITION BY challenge_id 
                    ORDER BY 
                        score DESC NULLS LAST,
                        time_taken ASC NULLS LAST
                ) as new_rank
            FROM challenge_participants
            WHERE challenge_id = NEW.id
            AND status = 'completed'
        )
        UPDATE challenge_participants cp
        SET rank = rp.new_rank
        FROM ranked_participants rp
        WHERE cp.id = rp.id;
        
        -- Mettre à jour les winner_ids
        UPDATE challenges
        SET winner_ids = (
            SELECT string_agg(user_id::text, ',')
            FROM challenge_participants
            WHERE challenge_id = NEW.id
            AND rank = 1
        )
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur les challenges
DROP TRIGGER IF EXISTS trigger_calculate_rankings ON public.challenges;
CREATE TRIGGER trigger_calculate_rankings
    AFTER UPDATE OF status ON public.challenges
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION calculate_challenge_rankings();

-- ============================================
-- 7. Row Level Security (RLS)
-- ============================================

-- Activer RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Politiques pour CHALLENGES
CREATE POLICY "Users can view challenges they participate in"
    ON public.challenges
    FOR SELECT
    USING (
        auth.uid() = creator_id
        OR id IN (
            SELECT challenge_id FROM challenge_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create challenges"
    ON public.challenges
    FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their challenges"
    ON public.challenges
    FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete pending challenges"
    ON public.challenges
    FOR DELETE
    USING (auth.uid() = creator_id AND status = 'pending');

-- Politiques pour PARTICIPANTS
CREATE POLICY "Users can view participants of their challenges"
    ON public.challenge_participants
    FOR SELECT
    USING (
        -- Voir ses propres participations
        user_id = auth.uid()
        -- Ou voir les participants des défis qu'on a créés
        OR EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can be added as participants"
    ON public.challenge_participants
    FOR INSERT
    WITH CHECK (
        -- Le créateur peut ajouter des participants
        EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id = auth.uid()
        )
        -- Ou l'utilisateur peut se joindre lui-même
        OR user_id = auth.uid()
    );

CREATE POLICY "Participants can update their own data"
    ON public.challenge_participants
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Creators can remove participants from pending challenges"
    ON public.challenge_participants
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id = auth.uid()
            AND status = 'pending'
        )
    );

-- ============================================
-- 8. Vue pour faciliter les requêtes
-- ============================================
CREATE OR REPLACE VIEW challenge_details AS
SELECT 
    c.id as challenge_id,
    c.creator_id,
    c.game_type,
    c.status as challenge_status,
    c.winner_ids,
    c.question_id,
    c.max_participants,
    c.min_participants,
    c.created_at,
    c.expires_at,
    c.completed_at,
    COUNT(cp.id) as total_participants,
    COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN cp.status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN cp.status = 'pending' THEN 1 END) as pending_count,
    creator.pseudo as creator_name,
    creator.email as creator_email
FROM challenges c
LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
LEFT JOIN users creator ON c.creator_id = creator.id
GROUP BY c.id, creator.id;

-- ============================================
-- 9. Commentaires
-- ============================================
COMMENT ON TABLE public.challenges IS 'Table des défis multi-joueurs (2 à N participants)';
COMMENT ON TABLE public.challenge_participants IS 'Table des participants à un défi (un enregistrement par joueur)';

COMMENT ON COLUMN public.challenges.creator_id IS 'Utilisateur qui a créé le défi';
COMMENT ON COLUMN public.challenges.status IS 'Statut global: pending (en attente), in_progress (en cours), completed (terminé), expired (expiré), cancelled (annulé)';
COMMENT ON COLUMN public.challenges.winner_ids IS 'IDs des gagnants séparés par des virgules (peut être plusieurs en cas d''égalité)';
COMMENT ON COLUMN public.challenges.max_participants IS 'Nombre maximum de participants (NULL = illimité)';
COMMENT ON COLUMN public.challenges.min_participants IS 'Nombre minimum de participants requis pour compléter le défi';

COMMENT ON COLUMN public.challenge_participants.status IS 'Statut du participant: pending (invité), active (en train de jouer), completed (terminé), declined (refusé)';
COMMENT ON COLUMN public.challenge_participants.rank IS 'Classement du participant (1 = gagnant, calculé automatiquement)';
COMMENT ON COLUMN public.challenge_participants.score IS 'Score obtenu par le participant';
COMMENT ON COLUMN public.challenge_participants.time_taken IS 'Temps pris pour compléter le défi (en secondes)';

-- ============================================
-- 10. Message de succès
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ ARCHITECTURE MULTI-JOUEURS CRÉÉE AVEC SUCCÈS !';
    RAISE NOTICE '✅ ═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tables créées:';
    RAISE NOTICE '   ✓ challenges (défis)';
    RAISE NOTICE '   ✓ challenge_participants (participants)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Fonctionnalités:';
    RAISE NOTICE '   ✓ Support de 2 à N joueurs';
    RAISE NOTICE '   ✓ Statuts individuels par participant';
    RAISE NOTICE '   ✓ Calcul automatique des classements';
    RAISE NOTICE '   ✓ Mise à jour automatique du statut global';
    RAISE NOTICE '   ✓ RLS (Row Level Security) configuré';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Prochaines étapes:';
    RAISE NOTICE '   1. Créer les services TypeScript';
    RAISE NOTICE '   2. Créer la page de résultats';
    RAISE NOTICE '   3. Adapter le code existant';
    RAISE NOTICE '';
END $$;


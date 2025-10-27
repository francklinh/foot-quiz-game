-- ============================================
-- Création de la table CHALLENGES
-- Pour les défis entre joueurs/amis
-- ============================================

-- Supprimer la table si elle existe (ATTENTION: supprime les données!)
DROP TABLE IF EXISTS public.challenges CASCADE;

-- Créer la table challenges
CREATE TABLE public.challenges (
    -- Identifiant unique
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Joueur qui lance le défi (challenger)
    challenger_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Joueur défié (challenged)
    challenged_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Type de jeu
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('TOP10', 'GRILLE', 'CLUB', 'COMING_SOON')),
    
    -- Statut du défi
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'cancelled')),
    
    -- Scores
    challenger_score INTEGER DEFAULT NULL,
    challenged_score INTEGER DEFAULT NULL,
    
    -- Temps de jeu (en secondes)
    challenger_time INTEGER DEFAULT NULL,
    challenged_time INTEGER DEFAULT NULL,
    
    -- Gagnant (NULL si pas encore joué ou égalité)
    winner_id UUID DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Question/Thème (optionnel, pour TOP10)
    question_id UUID DEFAULT NULL,
    
    -- Dates importantes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL, -- Date d'expiration (ex: 48h après création)
    completed_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Contraintes
    CONSTRAINT different_players CHECK (challenger_id != challenged_id),
    CONSTRAINT valid_winner CHECK (winner_id IS NULL OR winner_id IN (challenger_id, challenged_id)),
    CONSTRAINT valid_expires_at CHECK (expires_at > created_at)
);

-- ============================================
-- Index pour améliorer les performances
-- ============================================

-- Index sur challenger_id pour trouver rapidement les défis lancés par un joueur
CREATE INDEX idx_challenges_challenger ON public.challenges(challenger_id);

-- Index sur challenged_id pour trouver rapidement les défis reçus par un joueur
CREATE INDEX idx_challenges_challenged ON public.challenges(challenged_id);

-- Index sur status pour filtrer par statut
CREATE INDEX idx_challenges_status ON public.challenges(status);

-- Index sur created_at pour trier par date
CREATE INDEX idx_challenges_created_at ON public.challenges(created_at DESC);

-- Index sur expires_at pour trouver les défis expirés
CREATE INDEX idx_challenges_expires_at ON public.challenges(expires_at);

-- Index composite pour les requêtes courantes
CREATE INDEX idx_challenges_user_status ON public.challenges(challenger_id, status);
CREATE INDEX idx_challenges_challenged_status ON public.challenges(challenged_id, status);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Activer RLS sur la table
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Un utilisateur peut voir ses propres défis (envoyés ou reçus)
CREATE POLICY "Users can view their own challenges"
    ON public.challenges
    FOR SELECT
    USING (
        auth.uid() = challenger_id 
        OR auth.uid() = challenged_id
    );

-- Politique INSERT: Un utilisateur peut créer un défi (en tant que challenger)
CREATE POLICY "Users can create challenges"
    ON public.challenges
    FOR INSERT
    WITH CHECK (
        auth.uid() = challenger_id
        AND challenger_id != challenged_id
    );

-- Politique UPDATE: Un utilisateur peut mettre à jour un défi s'il y participe
-- (pour enregistrer son score, marquer comme complété, etc.)
CREATE POLICY "Users can update their challenges"
    ON public.challenges
    FOR UPDATE
    USING (
        auth.uid() = challenger_id 
        OR auth.uid() = challenged_id
    )
    WITH CHECK (
        auth.uid() = challenger_id 
        OR auth.uid() = challenged_id
    );

-- Politique DELETE: Un utilisateur peut supprimer un défi qu'il a créé (avant qu'il soit complété)
CREATE POLICY "Users can delete pending challenges they created"
    ON public.challenges
    FOR DELETE
    USING (
        auth.uid() = challenger_id 
        AND status IN ('pending', 'expired')
    );

-- ============================================
-- Fonction pour marquer automatiquement les défis expirés
-- ============================================

CREATE OR REPLACE FUNCTION mark_expired_challenges()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.challenges
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW()
    AND status != 'expired';
END;
$$;

-- ============================================
-- Commentaires sur les colonnes
-- ============================================

COMMENT ON TABLE public.challenges IS 'Table pour gérer les défis entre joueurs/amis';
COMMENT ON COLUMN public.challenges.id IS 'Identifiant unique du défi';
COMMENT ON COLUMN public.challenges.challenger_id IS 'ID du joueur qui lance le défi';
COMMENT ON COLUMN public.challenges.challenged_id IS 'ID du joueur défié';
COMMENT ON COLUMN public.challenges.game_type IS 'Type de jeu: TOP10, GRILLE, CLUB, COMING_SOON';
COMMENT ON COLUMN public.challenges.status IS 'Statut: pending, in_progress, completed, expired, cancelled';
COMMENT ON COLUMN public.challenges.challenger_score IS 'Score du challenger';
COMMENT ON COLUMN public.challenges.challenged_score IS 'Score du challenged';
COMMENT ON COLUMN public.challenges.challenger_time IS 'Temps de jeu du challenger (en secondes)';
COMMENT ON COLUMN public.challenges.challenged_time IS 'Temps de jeu du challenged (en secondes)';
COMMENT ON COLUMN public.challenges.winner_id IS 'ID du gagnant (NULL si égalité ou pas encore joué)';
COMMENT ON COLUMN public.challenges.question_id IS 'ID de la question (pour TOP10)';
COMMENT ON COLUMN public.challenges.created_at IS 'Date de création du défi';
COMMENT ON COLUMN public.challenges.expires_at IS 'Date d''expiration du défi';
COMMENT ON COLUMN public.challenges.completed_at IS 'Date de complétion du défi';

-- ============================================
-- Afficher un message de succès
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Table challenges créée avec succès!';
    RAISE NOTICE '✅ Index créés';
    RAISE NOTICE '✅ Politiques RLS configurées';
    RAISE NOTICE '✅ Fonction mark_expired_challenges() créée';
END $$;





-- ============================================
-- Mise à jour de la table CHALLENGES
-- Ajout de statuts par joueur
-- ============================================

-- Ajouter les colonnes de statut par joueur
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS challenger_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (challenger_status IN ('pending', 'active', 'completed'));

ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS challenged_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (challenged_status IN ('pending', 'active', 'completed'));

-- Mettre à jour les données existantes
-- Si un joueur a un score, son statut est 'completed'
UPDATE public.challenges
SET challenger_status = CASE
    WHEN challenger_score IS NOT NULL THEN 'completed'
    ELSE 'pending'
END,
challenged_status = CASE
    WHEN challenged_score IS NOT NULL THEN 'completed'
    ELSE 'pending'
END
WHERE challenger_status IS NULL OR challenged_status IS NULL;

-- ============================================
-- Fonction trigger pour mettre à jour le statut global
-- ============================================

CREATE OR REPLACE FUNCTION update_challenge_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Déterminer le statut global basé sur les statuts individuels
    IF NEW.challenger_status = 'completed' AND NEW.challenged_status = 'completed' THEN
        -- Les deux joueurs ont terminé
        NEW.status := 'completed';
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at := NOW();
        END IF;
    ELSIF (NEW.challenger_status = 'completed' OR NEW.challenged_status = 'completed' OR
           NEW.challenger_status = 'active' OR NEW.challenged_status = 'active') THEN
        -- Au moins un joueur a commencé ou terminé, mais pas les deux terminés
        NEW.status := 'in_progress';
    ELSE
        -- Aucun joueur n'a commencé
        NEW.status := 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS challenge_status_update ON public.challenges;

CREATE TRIGGER challenge_status_update
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_status();

-- ============================================
-- Commentaires
-- ============================================

COMMENT ON COLUMN public.challenges.challenger_status IS 'Statut du challenger: pending (pas encore joué), active (en train de jouer), completed (a terminé)';
COMMENT ON COLUMN public.challenges.challenged_status IS 'Statut du challenged: pending (pas encore joué), active (en train de jouer), completed (a terminé)';

-- ============================================
-- Afficher un message de succès
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Table challenges mise à jour avec succès!';
    RAISE NOTICE '✅ Colonnes challenger_status et challenged_status ajoutées';
    RAISE NOTICE '✅ Trigger de mise à jour automatique du statut créé';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Logique des statuts:';
    RAISE NOTICE '   - pending: Joueur n''a pas encore commencé';
    RAISE NOTICE '   - active: Joueur est en train de jouer';
    RAISE NOTICE '   - completed: Joueur a terminé';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Statut global (calculé automatiquement):';
    RAISE NOTICE '   - pending: Tous les joueurs sont en pending';
    RAISE NOTICE '   - in_progress: Au moins un joueur a commencé (active)';
    RAISE NOTICE '   - completed: Tous les joueurs ont terminé (completed)';
END $$;


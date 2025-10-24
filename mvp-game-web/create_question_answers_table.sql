-- Script pour créer la table question_answers
-- Cette table stocke les réponses des questions TOP 10 et CLUB

CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  ranking INTEGER CHECK (ranking >= 1 AND ranking <= 10), -- Pour TOP 10 (1-10)
  points INTEGER DEFAULT 0, -- Points selon le classement
  is_correct BOOLEAN, -- Pour CLUB (vrai/faux)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT check_top10_has_ranking CHECK (
    (ranking IS NOT NULL AND points IS NOT NULL AND is_correct IS NULL) OR
    (ranking IS NULL AND points IS NULL AND is_correct IS NOT NULL)
  ),
  
  -- Un joueur ne peut avoir qu'une réponse par question
  UNIQUE(question_id, player_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_player_id ON question_answers(player_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_ranking ON question_answers(ranking) WHERE ranking IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_question_answers_correct ON question_answers(is_correct) WHERE is_correct IS NOT NULL;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_question_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_answers_updated_at
  BEFORE UPDATE ON question_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_answers_updated_at();

-- Commentaires
COMMENT ON TABLE question_answers IS 'Réponses des questions TOP 10 et CLUB';
COMMENT ON COLUMN question_answers.ranking IS 'Classement pour TOP 10 (1-10)';
COMMENT ON COLUMN question_answers.points IS 'Points selon le classement TOP 10';
COMMENT ON COLUMN question_answers.is_correct IS 'Réponse correcte/incorrecte pour CLUB';

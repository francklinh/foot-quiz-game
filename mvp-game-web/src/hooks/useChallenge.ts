import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChallengesService, Challenge } from '../services/challenges.service';

export function useChallenge() {
  const [searchParams] = useSearchParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const challengesService = new ChallengesService();
  const challengeId = searchParams.get('challenge');

  useEffect(() => {
    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId]);

  const loadChallenge = async () => {
    if (!challengeId) return;

    setLoading(true);
    setError(null);

    try {
      const challengeData = await challengesService.getChallengeById(challengeId);
      setChallenge(challengeData);
    } catch (err) {
      setError('Failed to load challenge');
      console.error('Challenge load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (score: number, timeTaken: number) => {
    if (!challenge || !challengeId) return;

    try {
      const results = {
        challenger_score: challenge.challenger_id === challenge.challenger_id ? score : 0,
        challenged_score: challenge.challenger_id === challenge.challenger_id ? 0 : score,
        challenger_time: challenge.challenger_id === challenge.challenger_id ? timeTaken : 0,
        challenged_time: challenge.challenger_id === challenge.challenger_id ? 0 : timeTaken,
        winner_id: challenge.challenger_id // Simplified for now
      };

      await challengesService.completeChallenge(challengeId, results);
      
      return true;
    } catch (err) {
      console.error('Failed to complete challenge:', err);
      return false;
    }
  };

  return {
    challenge,
    loading,
    error,
    isChallengeMode: !!challengeId,
    completeChallenge
  };
}

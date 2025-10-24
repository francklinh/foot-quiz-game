import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChallengesService, Challenge } from '../services/challenges.service';
import { CreateChallengeModal } from '../components/CreateChallengeModal';
import { ActiveChallengesList } from '../components/ActiveChallengesList';
import { ChallengeResultsModal } from '../components/ChallengeResultsModal';
import { FloatingBall } from '../components/FloatingBall';

export function Challenges() {
  // Services
  const challengesService = new ChallengesService();

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Load user authentication
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreateSuccess = () => {
    // Refresh challenges list
    window.location.reload(); // Simple refresh for now
  };

  const handleChallengeAccepted = (challengeId: string) => {
    console.log('Challenge accepted:', challengeId);
    // Could show success message or refresh
  };

  const handleChallengeRejected = (challengeId: string) => {
    console.log('Challenge rejected:', challengeId);
    // Could show success message or refresh
  };

  const handleViewResults = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowResultsModal(true);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <div className="text-2xl font-bold text-primary">Connexion requise</div>
          <p className="text-gray-600 mt-2">Veuillez vous connecter pour accéder aux défis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">⚔️ Défis</h1>
              <p className="text-xl opacity-90">Défiez vos amis et comparez vos performances !</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              + Créer un défi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-2xl font-bold text-primary">Défis Actifs</div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-primary">Victoires</div>
            <div className="text-sm text-gray-600">Ce mois</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-primary">Classement</div>
            <div className="text-sm text-gray-600">Global</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Défis Actifs */}
          <div>
            <ActiveChallengesList
              userId={userId}
              onChallengeAccepted={handleChallengeAccepted}
              onChallengeRejected={handleChallengeRejected}
            />
          </div>

          {/* Guide des Défis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-primary mb-4">📖 Comment ça marche ?</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">1️⃣</div>
                <div>
                  <h4 className="font-semibold text-primary">Créer un défi</h4>
                  <p className="text-sm text-gray-600">Choisissez un ami et un type de jeu</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-2xl">2️⃣</div>
                <div>
                  <h4 className="font-semibold text-primary">Attendre l'acceptation</h4>
                  <p className="text-sm text-gray-600">Votre adversaire doit accepter le défi</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-2xl">3️⃣</div>
                <div>
                  <h4 className="font-semibold text-primary">Jouer le défi</h4>
                  <p className="text-sm text-gray-600">Lancez le jeu et donnez le meilleur de vous-même</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-2xl">4️⃣</div>
                <div>
                  <h4 className="font-semibold text-primary">Comparer les résultats</h4>
                  <p className="text-sm text-gray-600">Découvrez qui a gagné et par combien</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent-light rounded-lg">
              <h4 className="font-semibold text-primary mb-2">💡 Conseils</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Choisissez des adversaires de niveau similaire</li>
                <li>• Les défis expirent après la durée choisie</li>
                <li>• Plus vous gagnez, plus vous montez dans le classement</li>
                <li>• Les défis ajoutent de l'excitation aux jeux !</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSuccess={handleCreateSuccess}
        currentUserId={userId}
      />

      <ChallengeResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        challenge={selectedChallenge}
        currentUserId={userId}
      />

      <FloatingBall />
    </div>
  );
}

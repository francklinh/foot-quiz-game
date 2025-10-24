import React, { useState, useEffect } from 'react';
import { ChallengesService, Challenge } from '../services/challenges.service';
import { ChallengeCard } from './ChallengeCard';

interface ChallengesListProps {
  userId: string;
  className?: string;
}

export function ChallengesList({ 
  userId, 
  className = '' 
}: ChallengesListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const challengesService = new ChallengesService();

  useEffect(() => {
    loadChallenges();
  }, [userId]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const challengesList = await challengesService.getUserChallenges(userId, 'sent');
      setChallenges(challengesList);
    } catch (err) {
      setError('Error loading challenges');
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshChallenges = () => {
    loadChallenges();
  };

  const handleChallengeUpdate = (updatedChallenge: Challenge) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      )
    );
  };

  const filteredChallenges = challenges.filter(challenge => {
    switch (activeTab) {
      case 'pending':
        return challenge.status === 'PENDING';
      case 'active':
        return challenge.status === 'ACCEPTED';
      case 'completed':
        return challenge.status === 'COMPLETED';
      default:
        return true;
    }
  });

  const tabs = [
    { key: 'all', label: 'Tous', count: challenges.length },
    { key: 'pending', label: 'En attente', count: challenges.filter(c => c.status === 'PENDING').length },
    { key: 'active', label: 'Actifs', count: challenges.filter(c => c.status === 'ACCEPTED').length },
    { key: 'completed', label: 'Terminés', count: challenges.filter(c => c.status === 'COMPLETED').length },
  ];

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-lg font-bold text-primary mb-4">Mes Défis</h3>
        <div className="text-center text-gray-500">Loading challenges...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-lg font-bold text-primary mb-4">Mes Défis</h3>
        <div className="text-center text-red-500 mb-2">{error}</div>
        <button 
          onClick={refreshChallenges}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-lg font-bold text-primary mb-4">Mes Défis</h3>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredChallenges.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {activeTab === 'all' ? 'Aucun défi pour le moment' : `Aucun défi ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              currentUserId={userId}
              onChallengeUpdate={handleChallengeUpdate}
            />
          ))}
        </div>
      )}

      <button 
        onClick={refreshChallenges}
        className="w-full mt-4 bg-secondary text-primary py-2 px-4 rounded-lg hover:bg-secondary-dark transition-colors"
      >
        Actualiser
      </button>
    </div>
  );
}

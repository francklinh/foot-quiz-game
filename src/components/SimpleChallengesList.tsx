import React, { useState, useEffect } from 'react';

interface SimpleChallenge {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
  created_at: string;
}

interface SimpleChallengesListProps {
  userId: string;
  className?: string;
}

export function SimpleChallengesList({ 
  userId, 
  className = '' 
}: SimpleChallengesListProps) {
  const [challenges, setChallenges] = useState<SimpleChallenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadChallenges();
  }, [userId]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simuler un chargement avec des données d'exemple
      const timer = setTimeout(() => {
        const mockChallenges: SimpleChallenge[] = [
          {
            id: '1',
            title: 'Défi TOP 10',
            description: 'Terminer un TOP 10 en moins de 5 minutes',
            status: 'PENDING',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Défi GRILLE',
            description: 'Compléter une grille sans erreur',
            status: 'ACCEPTED',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Défi CLUB',
            description: 'Gagner 3 parties de CLUB consécutives',
            status: 'COMPLETED',
            created_at: new Date().toISOString()
          }
        ];
        setChallenges(mockChallenges);
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    } catch (err) {
      setError('Error loading challenges');
      setLoading(false);
    }
  };

  const refreshChallenges = () => {
    loadChallenges();
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
            <div 
              key={challenge.id}
              className="p-4 bg-white rounded-lg shadow-sm border border-accent-light"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-primary">{challenge.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  challenge.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  challenge.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {challenge.status === 'PENDING' ? 'En attente' :
                   challenge.status === 'ACCEPTED' ? 'Actif' : 'Terminé'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
              <div className="text-xs text-gray-400">
                {new Date(challenge.created_at).toLocaleDateString()}
              </div>
            </div>
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





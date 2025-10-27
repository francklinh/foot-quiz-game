import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FriendsService, Friend, User } from '../services/friends.service';
import { FloatingBall } from '../components/FloatingBall';

export function Friends() {
  const friendsService = new FriendsService();

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Friends data
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load user authentication
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          setCurrentUser(session.user);
          await loadFriendsData(session.user.id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setCurrentUser(session.user);
        loadFriendsData(session.user.id);
      } else {
        setUserId(null);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFriendsData = async (uid: string) => {
    try {
      setLoading(true);
      const [friendsList, pendingList] = await Promise.all([
        friendsService.getFriends(uid),
        friendsService.getPendingRequests(uid)
      ]);
      
      setFriends(friendsList);
      
      // Séparer les demandes reçues et envoyées
      setPendingRequests(pendingList.filter(req => req.friend_id === uid));
      setSentRequests(pendingList.filter(req => req.user_id === uid));
    } catch (error) {
      console.error('Failed to load friends data:', error);
      showMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !userId) return;

    console.log('🔍 Recherche d\'amis:', searchQuery);
    setIsSearching(true);
    try {
      const results = await friendsService.searchUsers(searchQuery);
      console.log('✅ Résultats bruts de la recherche:', results);
      
      // Filtrer l'utilisateur actuel et les amis existants
      const filteredResults = results.filter(user => 
        user.id !== userId && 
        !friends.some(f => f.friend_id === user.id)
      );
      console.log('📋 Résultats filtrés:', filteredResults);
      console.log('👤 userId actuel:', userId);
      console.log('👥 Amis actuels:', friends);
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('❌ Search failed:', error);
      showMessage('error', 'Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    if (!userId) {
      console.error('❌ Pas de userId pour envoyer la demande');
      return;
    }

    console.log('📤 Envoi demande d\'ami:', { from: userId, to: friendId });

    try {
      const result = await friendsService.sendFriendRequest(userId, friendId);
      console.log('✅ Demande envoyée avec succès:', result);
      showMessage('success', 'Demande d\'ami envoyée ! 🎉');
      
      // Retirer de la liste de recherche
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
      
      // Recharger les données
      await loadFriendsData(userId);
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de la demande:', error);
      showMessage('error', error.message || 'Erreur lors de l\'envoi de la demande');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsService.acceptFriendRequest(requestId);
      showMessage('success', 'Ami ajouté avec succès ! 🎉');
      
      if (userId) {
        await loadFriendsData(userId);
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'acceptation');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendsService.rejectFriendRequest(requestId);
      showMessage('success', 'Demande refusée');
      
      if (userId) {
        await loadFriendsData(userId);
      }
    } catch (error) {
      showMessage('error', 'Erreur lors du refus');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet ami ?')) return;

    if (!userId) return;

    try {
      await friendsService.removeFriend(userId, friendId);
      showMessage('success', 'Ami retiré');
      await loadFriendsData(userId);
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <div className="text-2xl font-bold text-primary">Connexion requise</div>
          <p className="text-gray-600 mt-2">Veuillez vous connecter pour accéder à vos amis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-2">👥 Mes Amis</h1>
          <p className="text-xl opacity-90">Gérez vos amis et envoyez des demandes</p>
        </div>
      </div>

      {/* Message notification */}
      {message && (
        <div className={`max-w-6xl mx-auto px-4 mt-4`}>
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-lg mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-6 rounded-md font-bold transition-colors ${
              activeTab === 'friends'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Mes Amis ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-6 rounded-md font-bold transition-colors ${
              activeTab === 'search'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔍 Rechercher
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-6 rounded-md font-bold transition-colors ${
              activeTab === 'requests'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📬 Demandes ({pendingRequests.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-4xl mb-4">⏳</div>
                <div className="text-gray-600">Chargement...</div>
              </div>
            </div>
          ) : (
            <>
              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4">Mes Amis</h3>
                  {friends.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">😔</div>
                      <p className="text-gray-600 text-lg">Vous n'avez pas encore d'amis</p>
                      <button
                        onClick={() => setActiveTab('search')}
                        className="mt-4 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Rechercher des amis
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between p-4 bg-accent-light rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {friend.friend?.pseudo?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-primary">{friend.friend?.pseudo || 'Inconnu'}</div>
                              <div className="text-sm text-gray-500">{friend.friend?.email || ''}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFriend(friend.friend_id)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            Retirer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Search Tab */}
              {activeTab === 'search' && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4">Rechercher des amis</h3>
                  
                  {/* Search Bar */}
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Rechercher par pseudo ou email..."
                      className="flex-1 p-3 border-2 border-primary rounded-lg focus:outline-none focus:border-primary-dark"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? '🔍...' : '🔍 Rechercher'}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((user) => {
                        const isPending = sentRequests.some(req => req.friend_id === user.id);
                        
                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 bg-accent-light rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {user.pseudo?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="font-semibold text-primary">{user.pseudo || 'Inconnu'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            {isPending ? (
                              <div className="text-sm text-gray-500 italic">Demande envoyée</div>
                            ) : (
                              <button
                                onClick={() => handleSendFriendRequest(user.id)}
                                className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                              >
                                ➕ Ajouter
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-600">
                        {searchQuery ? 'Aucun résultat trouvé' : 'Recherchez des utilisateurs pour les ajouter en ami'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4">Demandes d'amitié</h3>
                  
                  {/* Received Requests */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">📨 Reçues ({pendingRequests.length})</h4>
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Aucune demande reçue</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {request.user?.pseudo?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="font-semibold text-primary">{request.user?.pseudo || 'Inconnu'}</div>
                                <div className="text-sm text-gray-500">{request.user?.email || ''}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                              >
                                ✓ Accepter
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                ✗ Refuser
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sent Requests */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">📤 Envoyées ({sentRequests.length})</h4>
                    {sentRequests.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Aucune demande envoyée</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sentRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {request.friend?.pseudo?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="font-semibold text-primary">{request.friend?.pseudo || 'Inconnu'}</div>
                                <div className="text-sm text-gray-500">{request.friend?.email || ''}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 italic">En attente...</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}


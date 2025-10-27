import React, { useState, useEffect } from 'react';
import { ApiFriendsService, ApiFriend } from '../services/api-friends.service';

interface ApiFriendsListProps {
  userId: string;
  onFriendSelect?: (friend: ApiFriend) => void;
  className?: string;
}

export function ApiFriendsList({ 
  userId, 
  onFriendSelect, 
  className = '' 
}: ApiFriendsListProps) {
  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const friendsService = new ApiFriendsService();

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const friendsList = await friendsService.getFriends(userId);
      setFriends(friendsList);
    } catch (err) {
      setError('Error loading friends');
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshFriends = () => {
    loadFriends();
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-lg font-bold text-primary mb-4">Mes Amis</h3>
        <div className="text-center text-gray-500">Loading friends...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-lg font-bold text-primary mb-4">Mes Amis</h3>
        <div className="text-center text-red-500 mb-2">{error}</div>
        <button 
          onClick={refreshFriends}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-lg font-bold text-primary mb-4">Mes Amis</h3>
        <div className="text-center text-gray-500 mb-4">Aucun ami pour le moment</div>
        <button 
          onClick={refreshFriends}
          className="w-full bg-secondary text-primary py-2 px-4 rounded-lg hover:bg-secondary-dark transition-colors"
        >
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-lg font-bold text-primary mb-4">Mes Amis ({friends.length})</h3>
      <div className="space-y-2">
        {friends.map((friend) => (
          <div 
            key={friend.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-accent-light hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onFriendSelect?.(friend)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {friend.pseudo.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-primary">{friend.pseudo}</div>
                <div className="text-sm text-gray-500">{friend.email}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(friend.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





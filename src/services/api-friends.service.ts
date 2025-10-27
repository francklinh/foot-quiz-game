// Service API direct pour les amis
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

export interface ApiFriend {
  id: string;
  pseudo: string;
  email: string;
  created_at: string;
}

export class ApiFriendsService {
  private async getAuthHeaders() {
    const token = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const tokenData = JSON.parse(token);
    if (!tokenData.access_token) {
      throw new Error('No access token found');
    }
    
    return {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
  }

  async getFriends(userId: string): Promise<ApiFriend[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Récupérer les amitiés où l'utilisateur est l'initiateur (user_id)
      const sentResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/friendships?select=*,friend:users!friendships_friend_id_fkey(id,pseudo,email)&user_id=eq.${userId}&status=eq.accepted`,
        {
          method: 'GET',
          headers
        }
      );

      if (!sentResponse.ok) {
        throw new Error(`HTTP ${sentResponse.status}: ${sentResponse.statusText}`);
      }

      const sentData = await sentResponse.json();
      
      // Récupérer les amitiés où l'utilisateur est le destinataire (friend_id)
      const receivedResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/friendships?select=*,initiator:users!friendships_user_id_fkey(id,pseudo,email)&friend_id=eq.${userId}&status=eq.accepted`,
        {
          method: 'GET',
          headers
        }
      );

      if (!receivedResponse.ok) {
        throw new Error(`HTTP ${receivedResponse.status}: ${receivedResponse.statusText}`);
      }

      const receivedData = await receivedResponse.json();
      
      // Transformer et combiner les deux listes
      const sentFriends = sentData.map((item: any) => ({
        id: item.friend?.id || item.id,
        pseudo: item.friend?.pseudo || item.friend?.email?.split('@')[0] || 'Unknown',
        email: item.friend?.email || '',
        created_at: item.created_at
      }));

      const receivedFriends = receivedData.map((item: any) => ({
        id: item.initiator?.id || item.id,
        pseudo: item.initiator?.pseudo || item.initiator?.email?.split('@')[0] || 'Unknown',
        email: item.initiator?.email || '',
        created_at: item.created_at
      }));

      // Combiner et supprimer les doublons
      const allFriends = [...sentFriends, ...receivedFriends];
      const uniqueFriends = allFriends.filter((friend, index, self) =>
        index === self.findIndex((f) => f.id === friend.id)
      );

      return uniqueFriends;
    } catch (error) {
      console.error('Error getting friends:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }
}


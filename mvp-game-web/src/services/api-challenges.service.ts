// Service API direct pour les défis
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

export interface ApiChallenge {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
  created_at: string;
}

export class ApiChallengesService {
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

  async getChallenges(userId: string): Promise<ApiChallenge[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Récupérer les défis depuis la table challenges
      const response = await fetch(`${SUPABASE_URL}/rest/v1/challenges?select=*&user_id=eq.${userId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformer les données pour correspondre à l'interface
      return data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Défi sans titre',
        description: item.description || 'Aucune description',
        status: item.status || 'PENDING',
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('Error getting challenges:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }
}

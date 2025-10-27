// Service simplifié pour les cerises utilisant l'API directe
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

export class SimpleCerisesService {
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

  async getUserCerises(userId: string): Promise<number> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=cerises_balance&id=eq.${userId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data[0]?.cerises_balance || 0;
    } catch (error) {
      console.error('Error getting user cerises:', error);
      return 0; // Retourner 0 en cas d'erreur
    }
  }

  async addCerises(userId: string, amount: number): Promise<number> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/update_cerises_balance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_user_id: userId,
          p_amount: amount
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding cerises:', error);
      throw error;
    }
  }

  async spendCerises(userId: string, amount: number): Promise<number> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/update_cerises_balance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_user_id: userId,
          p_amount: -amount
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error spending cerises:', error);
      throw error;
    }
  }
}
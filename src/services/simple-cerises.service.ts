// Service simplifié pour les cerises utilisant l'API directe
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

export class SimpleCerisesService {
  private async getAuthHeaders() {
    const token = localStorage.getItem('sb-qahbsyolfvujrpblnrvy-auth-token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const tokenData = JSON.parse(token);
      
      // Essayer différentes structures possibles pour le token
      let accessToken = tokenData.access_token || 
                       tokenData.currentSession?.access_token ||
                       tokenData.session?.access_token ||
                       null;
      
      if (!accessToken && tokenData.currentSession?.user) {
        // Si on a la session mais pas le token directement, essayer de récupérer depuis supabase
        console.warn('⚠️  SimpleCerisesService - Token non trouvé dans localStorage, tentative avec Supabase client');
      }
      
      if (!accessToken) {
        throw new Error('No access token found in localStorage');
      }
      
      return {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      };
    } catch (e) {
      console.error('❌ SimpleCerisesService - Erreur parsing token:', e);
      throw new Error(`Failed to parse token: ${e}`);
    }
  }

  async getUserCerises(userId: string): Promise<number> {
    try {
      // Essayer d'abord avec l'authentification
      try {
        const headers = await this.getAuthHeaders();
        console.log(`🔐 SimpleCerisesService.getUserCerises - Utilisation du token d'authentification`);
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=cerises_balance&id=eq.${userId}`, {
          method: 'GET',
          headers
        });

        if (response.ok) {
          const data = await response.json();
          const balance = data[0]?.cerises_balance ?? (data.length === 0 ? null : 0);
          
          if (balance === null) {
            console.warn(`⚠️  SimpleCerisesService - Aucune donnée retournée pour userId ${userId}`);
            // Essayer sans auth en fallback
            throw new Error('No data returned');
          }
          
          console.log(`✅ SimpleCerisesService (avec auth): ${balance} cerises pour userId ${userId}`);
          return balance;
        } else {
          const errorText = await response.text();
          console.error(`❌ SimpleCerisesService - HTTP ${response.status} avec auth:`, errorText);
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (authError: any) {
        console.warn('⚠️  SimpleCerisesService - Erreur avec auth, tentative sans auth:', authError?.message || authError);
      }

      // Fallback : utiliser seulement l'API key (comme dans GlobalHeader)
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=cerises_balance&id=eq.${userId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        console.error(`❌ SimpleCerisesService - HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const balance = data[0]?.cerises_balance || 0;
      console.log(`✅ SimpleCerisesService (sans auth): ${balance} cerises pour userId ${userId}`);
      return balance;
    } catch (error) {
      console.error('❌ SimpleCerisesService - Erreur getUserCerises:', error);
      console.error(`   userId: ${userId}`);
      throw error; // Ne plus retourner 0 silencieusement
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
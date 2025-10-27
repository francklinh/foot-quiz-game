// src/services/supabase-local.service.ts
// Service Supabase utilisant l'API REST directement (sans client)

const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

class SupabaseLocalService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    
    const defaultHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Supabase Local Service Error:', error);
      throw error;
    }
  }

  // Game Types
  async getGameTypes() {
    return this.request('game_types?select=*');
  }

  async createGameType(data: any) {
    return this.request('game_types', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGameType(id: string, data: any) {
    return this.request(`game_types?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteGameType(id: string) {
    return this.request(`game_types?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  // Players
  async getPlayers() {
    return this.request('players?select=*&order=name.asc');
  }

  async getPlayer(id: string) {
    const result = await this.request(`players?id=eq.${id}&select=*`);
    return result[0] || null;
  }

  async createPlayer(data: any) {
    return this.request('players', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePlayer(id: string, data: any) {
    return this.request(`players?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deletePlayer(id: string) {
    return this.request(`players?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  async searchPlayers(searchTerm: string) {
    return this.request(`players?name=ilike.%${searchTerm}%&select=*`);
  }

  // Questions
  async getQuestions() {
    return this.request('questions?select=*&order=created_at.desc');
  }

  async getQuestion(id: string) {
    const result = await this.request(`questions?id=eq.${id}&select=*`);
    return result[0] || null;
  }

  async createQuestion(data: any) {
    return this.request('questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateQuestion(id: string, data: any) {
    return this.request(`questions?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`questions?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  async searchQuestions(searchTerm: string) {
    return this.request(`questions?content->>question=ilike.%${searchTerm}%&select=*`);
  }

  // Grid Answers
  async getGridAnswers() {
    return this.request('grid_answers?select=*&order=created_at.desc');
  }

  async createGridAnswer(data: any) {
    return this.request('grid_answers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGridAnswer(id: string, data: any) {
    return this.request(`grid_answers?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteGridAnswer(id: string) {
    return this.request(`grid_answers?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  // Question Answers (TOP 10 et CLUB)
  async getQuestionAnswers(questionId?: string) {
    const endpoint = questionId 
      ? `question_answers?question_id=eq.${questionId}&select=*&order=ranking.asc`
      : 'question_answers?select=*&order=created_at.desc';
    return this.request(endpoint);
  }

  async getQuestionAnswer(id: string) {
    const result = await this.request(`question_answers?id=eq.${id}&select=*`);
    return result[0] || null;
  }

  async createQuestionAnswer(data: any) {
    return this.request('question_answers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateQuestionAnswer(id: string, data: any) {
    return this.request(`question_answers?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteQuestionAnswer(id: string) {
    return this.request(`question_answers?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  async getQuestionAnswersWithPlayers(questionId: string) {
    const url = `${SUPABASE_URL}/rest/v1/question_answers?question_id=eq.${questionId}&select=*,players(name,current_club,nationality)&order=ranking.asc`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Statistics
  async getStats() {
    const [games, players, questions] = await Promise.all([
      this.getGameTypes(),
      this.getPlayers(),
      this.getQuestions()
    ]);

    const activeQuestions = questions.filter((q: any) => q.is_active).length;

    return {
      totalGames: games.length,
      totalPlayers: players.length,
      totalQuestions: questions.length,
      activeQuestions
    };
  }

  // Test de connexion simple
  async testConnection() {
    try {
      const result = await this.getGameTypes();
      return {
        success: true,
        message: 'Connexion réussie !',
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur: ${error.message}`,
        error: error
      };
    }
  }
}

export const supabaseLocalService = new SupabaseLocalService();

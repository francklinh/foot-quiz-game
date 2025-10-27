// src/services/admin-fetch.service.ts
// Service admin utilisant Fetch API au lieu du client Supabase

const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

class AdminFetchService {
  private async fetchData(endpoint: string, options: RequestInit = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    
    const defaultHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

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
  }

  // Game Types
  async getGameTypes() {
    return this.fetchData('game_types?select=*');
  }

  async createGameType(data: any) {
    return this.fetchData('game_types', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGameType(id: string, data: any) {
    return this.fetchData(`game_types?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteGameType(id: string) {
    return this.fetchData(`game_types?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  // Players
  async getPlayers() {
    return this.fetchData('players?select=*&order=name.asc');
  }

  async getPlayer(id: string) {
    const result = await this.fetchData(`players?id=eq.${id}&select=*`);
    return result[0] || null;
  }

  async createPlayer(data: any) {
    return this.fetchData('players', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePlayer(id: string, data: any) {
    return this.fetchData(`players?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deletePlayer(id: string) {
    return this.fetchData(`players?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  async searchPlayers(searchTerm: string) {
    return this.fetchData(`players?name=ilike.%${searchTerm}%&select=*`);
  }

  // Questions
  async getQuestions() {
    return this.fetchData('questions?select=*&order=created_at.desc');
  }

  async getQuestion(id: string) {
    const result = await this.fetchData(`questions?id=eq.${id}&select=*`);
    return result[0] || null;
  }

  async createQuestion(data: any) {
    return this.fetchData('questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateQuestion(id: string, data: any) {
    return this.fetchData(`questions?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteQuestion(id: string) {
    return this.fetchData(`questions?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  async searchQuestions(searchTerm: string) {
    return this.fetchData(`questions?content->>question=ilike.%${searchTerm}%&select=*`);
  }

  // Grid Answers
  async getGridAnswers() {
    return this.fetchData('grid_answers?select=*&order=created_at.desc');
  }

  async createGridAnswer(data: any) {
    return this.fetchData('grid_answers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateGridAnswer(id: string, data: any) {
    return this.fetchData(`grid_answers?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteGridAnswer(id: string) {
    return this.fetchData(`grid_answers?id=eq.${id}`, {
      method: 'DELETE'
    });
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
}

export const adminFetchService = new AdminFetchService();





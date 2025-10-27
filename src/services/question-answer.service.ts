// src/services/question-answer.service.ts
// Service pour gérer les réponses des questions TOP 10 et CLUB

const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

// Types pour les réponses
export interface QuestionAnswer {
  id: string;
  question_id: string;
  player_id: string;
  ranking?: number; // Pour TOP 10 (1-10)
  points?: number; // Pour TOP 10 (points selon le classement)
  is_correct?: boolean; // Pour CLUB (vrai/faux)
  created_at: string;
  updated_at: string;
}

export interface QuestionAnswerCreate {
  question_id: string;
  player_id: string;
  ranking?: number;
  points?: number;
  is_correct?: boolean;
}

export interface QuestionAnswerUpdate {
  player_id?: string;
  ranking?: number;
  points?: number;
  is_correct?: boolean;
}

class QuestionAnswerService {
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
      console.error('QuestionAnswer Service Error:', error);
      throw error;
    }
  }

  // Récupérer toutes les réponses d'une question
  async getAnswersByQuestion(questionId: string): Promise<QuestionAnswer[]> {
    return this.request(`question_answers?question_id=eq.${questionId}&select=*&order=ranking.asc`);
  }

  // Récupérer une réponse par ID
  async getAnswer(answerId: string): Promise<QuestionAnswer | null> {
    const result = await this.request(`question_answers?id=eq.${answerId}&select=*`);
    return result[0] || null;
  }

  // Créer une nouvelle réponse
  async createAnswer(data: QuestionAnswerCreate): Promise<QuestionAnswer> {
    const result = await this.request('question_answers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result[0];
  }

  // Mettre à jour une réponse
  async updateAnswer(answerId: string, data: QuestionAnswerUpdate): Promise<QuestionAnswer> {
    const result = await this.request(`question_answers?id=eq.${answerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return result[0];
  }

  // Supprimer une réponse
  async deleteAnswer(answerId: string): Promise<void> {
    await this.request(`question_answers?id=eq.${answerId}`, {
      method: 'DELETE'
    });
  }

  // Créer plusieurs réponses en lot (pour TOP 10)
  async createMultipleAnswers(answers: QuestionAnswerCreate[]): Promise<QuestionAnswer[]> {
    const result = await this.request('question_answers', {
      method: 'POST',
      body: JSON.stringify(answers)
    });
    return result;
  }

  // Mettre à jour le classement d'une question TOP 10
  async updateRanking(questionId: string, answers: { id: string; ranking: number }[]): Promise<void> {
    // Mettre à jour chaque réponse avec son nouveau classement
    for (const answer of answers) {
      await this.updateAnswer(answer.id, { 
        ranking: answer.ranking,
        points: this.calculatePoints(answer.ranking)
      });
    }
  }

  // Calculer les points selon le classement (TOP 10)
  private calculatePoints(ranking: number): number {
    const pointsMap: { [key: number]: number } = {
      1: 25, 2: 20, 3: 18, 4: 16, 5: 14,
      6: 12, 7: 10, 8: 8, 9: 6, 10: 4
    };
    return pointsMap[ranking] || 0;
  }

  // Récupérer les réponses avec les informations des joueurs
  async getAnswersWithPlayers(questionId: string): Promise<any[]> {
    return this.request(`
      question_answers?question_id=eq.${questionId}
      &select=*,players(name,current_club,nationality)
      &order=ranking.asc
    `);
  }

  // Rechercher des réponses par joueur
  async searchAnswersByPlayer(playerName: string): Promise<QuestionAnswer[]> {
    return this.request(`
      question_answers?select=*,players!inner(name)
      &players.name=ilike.%${playerName}%
    `);
  }

  // Statistiques des réponses
  async getAnswerStats(questionId: string): Promise<{
    totalAnswers: number;
    topAnswers: QuestionAnswer[];
    averagePoints: number;
  }> {
    const answers = await this.getAnswersByQuestion(questionId);
    const totalAnswers = answers.length;
    const topAnswers = answers.slice(0, 5);
    const averagePoints = answers.reduce((sum, answer) => sum + (answer.points || 0), 0) / totalAnswers;

    return {
      totalAnswers,
      topAnswers,
      averagePoints: Math.round(averagePoints * 100) / 100
    };
  }

  // Valider les données d'une réponse
  validateAnswerData(data: QuestionAnswerCreate, gameType: string): string[] {
    const errors: string[] = [];

    if (!data.question_id) {
      errors.push('ID de question requis');
    }

    if (!data.player_id) {
      errors.push('ID de joueur requis');
    }

    if (gameType === 'TOP10') {
      if (data.ranking === undefined || data.ranking < 1 || data.ranking > 10) {
        errors.push('Classement requis (1-10) pour TOP 10');
      }
    }

    if (gameType === 'CLUB') {
      if (data.is_correct === undefined) {
        errors.push('Statut correct/incorrect requis pour CLUB');
      }
    }

    return errors;
  }
}

export const questionAnswerService = new QuestionAnswerService();





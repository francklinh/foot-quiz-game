// Script pour tester le service supabaseLocalService
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

// Simuler le service supabaseLocalService
class TestSupabaseService {
  async request(endpoint, options = {}) {
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
      console.error('Service Error:', error);
      throw error;
    }
  }

  async getQuestions() {
    return this.request('questions?select=*&order=created_at.desc');
  }
}

async function testService() {
  try {
    console.log('🧪 Test du service supabaseLocalService...');

    const service = new TestSupabaseService();
    const questions = await service.getQuestions();
    
    console.log(`📋 Questions récupérées par le service: ${questions.length}`);
    
    if (questions.length > 0) {
      console.log('\n📝 Détail des questions:');
      questions.forEach((question, index) => {
        console.log(`\n--- Question ${index + 1} ---`);
        console.log('ID:', question.id);
        console.log('game_type_id:', question.game_type_id, '(type:', typeof question.game_type_id, ')');
        console.log('content:', JSON.stringify(question.content, null, 2));
        console.log('is_active:', question.is_active);
        
        // Test du filtre utilisé dans l'admin
        const isTop10 = question.game_type_id === 1;
        const isClub = question.game_type_id === 3;
        const wouldShowInAdmin = isTop10 || isClub;
        
        console.log('Filtre admin (game_type_id === 1 || game_type_id === 3):', wouldShowInAdmin);
      });

      // Test du filtre exact utilisé dans l'interface
      const filteredQuestions = questions.filter(q => q.game_type_id === 1 || q.game_type_id === 3);
      console.log(`\n✅ Questions qui passeraient le filtre admin: ${filteredQuestions.length}`);
      
      filteredQuestions.forEach((q, index) => {
        const typeLabel = q.game_type_id === 1 ? 'TOP10' : 'CLUB';
        const title = q.content?.question || q.title || 'Sans titre';
        console.log(`  ${index + 1}. ${title} (${typeLabel})`);
      });
    } else {
      console.log('❌ Aucune question récupérée par le service !');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test du service:', error);
  }
}

// Exécuter le test
testService();

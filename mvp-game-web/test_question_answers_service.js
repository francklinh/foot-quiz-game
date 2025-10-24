// Script pour tester le service getQuestionAnswersWithPlayers
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

  async getQuestionAnswersWithPlayers(questionId) {
    return this.request(`
      question_answers?question_id=eq.${questionId}
      &select=*,players(name,current_club,nationality)
      &order=ranking.asc
    `);
  }
}

async function testQuestionAnswersService() {
  try {
    console.log('🧪 Test du service getQuestionAnswersWithPlayers...');

    const service = new TestSupabaseService();
    
    // 1. Récupérer la question TOP 10
    const questionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/questions?game_type_id=eq.1&select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!questionsResponse.ok) {
      throw new Error(`Erreur récupération question: ${questionsResponse.status}`);
    }

    const questions = await questionsResponse.json();
    if (questions.length === 0) {
      throw new Error('Aucune question TOP 10 trouvée');
    }

    const question = questions[0];
    const questionId = question.id;
    console.log('📋 Question TOP 10:', question.content.question);
    console.log('🆔 Question ID:', questionId);

    // 2. Tester le service getQuestionAnswersWithPlayers
    console.log('\n🔍 Test du service getQuestionAnswersWithPlayers...');
    
    try {
      const answers = await service.getQuestionAnswersWithPlayers(questionId);
      console.log('✅ Service fonctionne !');
      console.log(`📊 Nombre de réponses: ${answers.length}`);
      
      if (answers.length > 0) {
        console.log('\n📝 Détail des réponses:');
        answers.forEach((answer, index) => {
          console.log(`\n--- Réponse ${index + 1} ---`);
          console.log('ID:', answer.id);
          console.log('Classement:', answer.ranking);
          console.log('Points:', answer.points);
          console.log('Joueur:', answer.players?.name || 'Non trouvé');
          console.log('Club:', answer.players?.current_club || 'Non défini');
          console.log('Nationalité:', answer.players?.nationality || 'Non définie');
        });
      } else {
        console.log('⚠️ Aucune réponse trouvée pour cette question');
      }
      
    } catch (serviceError) {
      console.error('❌ Erreur du service:', serviceError);
      
      // 3. Tester la requête brute
      console.log('\n🔍 Test de la requête brute...');
      const rawEndpoint = `question_answers?question_id=eq.${questionId}&select=*,players(name,current_club,nationality)&order=ranking.asc`;
      console.log('Endpoint:', rawEndpoint);
      
      const rawResponse = await fetch(`${SUPABASE_URL}/rest/v1/${rawEndpoint}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (rawResponse.ok) {
        const rawData = await rawResponse.json();
        console.log('✅ Requête brute fonctionne !');
        console.log('Données:', rawData);
      } else {
        console.error('❌ Requête brute échoue:', rawResponse.status, rawResponse.statusText);
        const errorText = await rawResponse.text();
        console.error('Détails:', errorText);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le test
testQuestionAnswersService();

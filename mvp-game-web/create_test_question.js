// Script pour créer une question TOP 10 de test via l'API Supabase
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function createTestQuestion() {
  try {
    console.log('🚀 Création d\'une question TOP 10 de test...');

    // 1. Créer la question
    const questionData = {
      game_type: 'TOP10',
      title: 'Top 10 des meilleurs buteurs de Ligue 1 2024-2025',
      player_ids: [], // Sera rempli plus tard
      season: '2024-2025',
      is_active: true
    };

    const questionResponse = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(questionData)
    });

    if (!questionResponse.ok) {
      throw new Error(`Erreur création question: ${questionResponse.status} ${questionResponse.statusText}`);
    }

    const question = await questionResponse.json();
    const questionId = question[0].id;
    console.log('✅ Question créée:', question[0]);

    // 2. Récupérer quelques joueurs existants
    const playersResponse = await fetch(`${SUPABASE_URL}/rest/v1/players?select=id,name&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!playersResponse.ok) {
      throw new Error(`Erreur récupération joueurs: ${playersResponse.status} ${playersResponse.statusText}`);
    }

    const players = await playersResponse.json();
    console.log('📋 Joueurs disponibles:', players);

    // 3. Créer des réponses TOP 10 avec les premiers joueurs
    const answers = [];
    for (let i = 0; i < Math.min(5, players.length); i++) {
      const ranking = i + 1;
      const points = calculatePoints(ranking);
      
      answers.push({
        question_id: questionId,
        player_id: players[i].id,
        ranking: ranking,
        points: points
      });
    }

    console.log('🎯 Réponses à créer:', answers);

    // 4. Insérer les réponses
    for (const answer of answers) {
      const answerResponse = await fetch(`${SUPABASE_URL}/rest/v1/question_answers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(answer)
      });

      if (!answerResponse.ok) {
        console.error(`Erreur création réponse ${answer.ranking}:`, answerResponse.status, answerResponse.statusText);
      } else {
        const createdAnswer = await answerResponse.json();
        console.log(`✅ Réponse ${answer.ranking} créée:`, createdAnswer[0]);
      }
    }

    console.log('🎉 Question TOP 10 de test créée avec succès !');
    console.log('📊 Question ID:', questionId);
    console.log('🔗 Vous pouvez maintenant tester dans l\'interface admin');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

function calculatePoints(ranking) {
  const pointsMap = {
    1: 25, 2: 20, 3: 18, 4: 16, 5: 14,
    6: 12, 7: 10, 8: 8, 9: 6, 10: 4
  };
  return pointsMap[ranking] || 0;
}

// Exécuter le script
createTestQuestion();

// Script pour créer des réponses pour la question TOP 10 existante
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function createTestAnswers() {
  try {
    console.log('🚀 Création de réponses pour la question TOP 10 existante...');

    // 1. Récupérer la question TOP 10
    const questionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/questions?game_type_id=eq.1&select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!questionsResponse.ok) {
      throw new Error(`Erreur récupération question: ${questionsResponse.status} ${questionsResponse.statusText}`);
    }

    const questions = await questionsResponse.json();
    if (questions.length === 0) {
      throw new Error('Aucune question TOP 10 trouvée');
    }

    const question = questions[0];
    const questionId = question.id;
    console.log('📋 Question TOP 10 trouvée:', question.content.question);

    // 2. Récupérer les joueurs de cette question
    const playerIds = question.player_ids;
    console.log('👥 Joueurs de la question:', playerIds);

    // 3. Récupérer les détails des joueurs
    const playersResponse = await fetch(`${SUPABASE_URL}/rest/v1/players?select=id,name,current_club,nationality&id=in.(${playerIds.join(',')})`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!playersResponse.ok) {
      throw new Error(`Erreur récupération joueurs: ${playersResponse.status} ${playersResponse.statusText}`);
    }

    const players = await playersResponse.json();
    console.log('👥 Détails des joueurs:', players);

    // 4. Vérifier s'il y a déjà des réponses
    const existingAnswersResponse = await fetch(`${SUPABASE_URL}/rest/v1/question_answers?question_id=eq.${questionId}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (existingAnswersResponse.ok) {
      const existingAnswers = await existingAnswersResponse.json();
      console.log('📊 Réponses existantes:', existingAnswers.length);
      
      if (existingAnswers.length > 0) {
        console.log('✅ Des réponses existent déjà pour cette question');
        return;
      }
    }

    // 5. Créer les réponses TOP 10
    console.log('🎯 Création des réponses TOP 10...');
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const ranking = i + 1;
      const points = calculatePoints(ranking);
      
      const answerData = {
        question_id: questionId,
        player_id: player.id,
        ranking: ranking,
        points: points
      };

      console.log(`📝 Création réponse ${ranking}: ${player.name} (${points} points)`);

      const answerResponse = await fetch(`${SUPABASE_URL}/rest/v1/question_answers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(answerData)
      });

      if (!answerResponse.ok) {
        const errorText = await answerResponse.text();
        console.error(`❌ Erreur création réponse ${ranking}:`, answerResponse.status, errorText);
      } else {
        const createdAnswer = await answerResponse.json();
        console.log(`✅ Réponse ${ranking} créée:`, createdAnswer[0]);
      }
    }

    console.log('🎉 Réponses TOP 10 créées avec succès !');
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
createTestAnswers();

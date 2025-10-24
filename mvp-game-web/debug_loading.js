// Script pour déboguer le chargement des données
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function debugLoading() {
  try {
    console.log('🔍 Débogage du chargement des données...');

    const questionId = '6c2e91e4-5b6a-4c1c-8297-70522e424f52'; // ID de la question TOP 10
    console.log('🆔 Question ID à tester:', questionId);

    // 1. Tester le service getQuestionAnswersWithPlayers
    console.log('\n🧪 Test du service getQuestionAnswersWithPlayers...');
    
    const url = `${SUPABASE_URL}/rest/v1/question_answers?question_id=eq.${questionId}&select=*,players(name,current_club,nationality)&order=ranking.asc`;
    console.log('URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Service fonctionne !');
      console.log(`📊 Nombre de réponses: ${data.length}`);
      
      if (data.length > 0) {
        console.log('📝 Réponses récupérées:');
        data.forEach((answer, index) => {
          console.log(`  ${index + 1}. ${answer.players?.name || 'Joueur inconnu'}`);
          console.log(`     - Question ID: ${answer.question_id}`);
          console.log(`     - Classement: ${answer.ranking}`);
          console.log(`     - Points: ${answer.points}`);
        });
      } else {
        console.log('❌ Aucune réponse récupérée');
      }
    } else {
      console.error('❌ Erreur service:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
    }

    // 2. Vérifier les questions disponibles
    console.log('\n🔍 Vérification des questions disponibles...');
    const questionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (questionsResponse.ok) {
      const questions = await questionsResponse.json();
      console.log('📋 Questions disponibles:');
      questions.forEach((question, index) => {
        console.log(`  ${index + 1}. ${question.content?.question || 'Sans titre'}`);
        console.log(`     - ID: ${question.id}`);
        console.log(`     - Type: ${question.game_type_id === 1 ? 'TOP10' : question.game_type_id === 2 ? 'GRILLE' : question.game_type_id === 3 ? 'CLUB' : 'INCONNU'}`);
        console.log(`     - Est la question sélectionnée: ${question.id === questionId ? 'OUI' : 'NON'}`);
      });
    }

    // 3. Tester avec l'ID de la question CLUB
    console.log('\n🔍 Test avec la question CLUB...');
    const clubQuestionId = 'b2f41b1d-a259-46fa-993a-edc892f06bbe'; // ID de la question CLUB
    
    const clubUrl = `${SUPABASE_URL}/rest/v1/question_answers?question_id=eq.${clubQuestionId}&select=*,players(name,current_club,nationality)&order=ranking.asc`;
    console.log('URL CLUB:', clubUrl);
    
    const clubResponse = await fetch(clubUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (clubResponse.ok) {
      const clubData = await clubResponse.json();
      console.log(`📊 Nombre de réponses CLUB: ${clubData.length}`);
      
      if (clubData.length > 0) {
        console.log('📝 Réponses CLUB:');
        clubData.forEach((answer, index) => {
          console.log(`  ${index + 1}. ${answer.players?.name || 'Joueur inconnu'}`);
        });
      } else {
        console.log('❌ Aucune réponse CLUB');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
debugLoading();

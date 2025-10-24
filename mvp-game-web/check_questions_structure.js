// Script pour vérifier la structure de la table questions
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function checkQuestionsStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table questions...');

    // 1. Vérifier les questions existantes
    const questionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!questionsResponse.ok) {
      console.error('❌ Erreur récupération questions:', questionsResponse.status, questionsResponse.statusText);
      const errorText = await questionsResponse.text();
      console.error('Détails:', errorText);
      return;
    }

    const questions = await questionsResponse.json();
    console.log('📋 Questions existantes:', questions);

    // 2. Vérifier la structure d'une question
    if (questions.length > 0) {
      console.log('🔍 Structure d\'une question:');
      console.log('Clés disponibles:', Object.keys(questions[0]));
      console.log('Exemple de question:', questions[0]);
    }

    // 3. Vérifier les types de jeux disponibles
    const gameTypesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_types?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (gameTypesResponse.ok) {
      const gameTypes = await gameTypesResponse.json();
      console.log('🎮 Types de jeux disponibles:', gameTypes);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
checkQuestionsStructure();

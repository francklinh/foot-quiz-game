// Script pour vérifier les tables disponibles dans la base
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables disponibles...');

    // Tables à vérifier
    const tables = [
      'questions',
      'question_answers', 
      'theme_answers',
      'grid_answers',
      'players',
      'game_types'
    ];

    for (const table of tables) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Table '${table}' existe (${data.length} entrées testées)`);
        } else {
          console.log(`❌ Table '${table}' n'existe pas (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ Erreur table '${table}':`, error.message);
      }
    }

    // Vérifier spécifiquement theme_answers
    console.log('\n🔍 Vérification détaillée de theme_answers...');
    const themeAnswersResponse = await fetch(`${SUPABASE_URL}/rest/v1/theme_answers?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (themeAnswersResponse.ok) {
      const themeAnswers = await themeAnswersResponse.json();
      console.log('📋 Réponses theme_answers:', themeAnswers);
    } else {
      console.log('❌ Erreur theme_answers:', themeAnswersResponse.status, themeAnswersResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
checkTables();

// Script pour vérifier si la table question_answers existe
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function checkQuestionAnswersTable() {
  try {
    console.log('🔍 Vérification de la table question_answers...');

    // 1. Tenter de récupérer des données de la table question_answers
    const response = await fetch(`${SUPABASE_URL}/rest/v1/question_answers?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Table question_answers existe !');
      console.log(`📊 Nombre d\'entrées: ${data.length}`);
      
      if (data.length > 0) {
        console.log('📝 Exemple d\'entrée:', data[0]);
      }
    } else {
      console.log('❌ Table question_answers n\'existe pas !');
      console.log('Status:', response.status);
      console.log('Message:', response.statusText);
      
      const errorText = await response.text();
      console.log('Détails:', errorText);
    }

    // 2. Vérifier les tables disponibles
    console.log('\n🔍 Vérification des tables disponibles...');
    const tables = ['questions', 'players', 'question_answers', 'grid_answers'];
    
    for (const table of tables) {
      try {
        const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });

        if (tableResponse.ok) {
          console.log(`✅ Table '${table}' existe`);
        } else {
          console.log(`❌ Table '${table}' n'existe pas (${tableResponse.status})`);
        }
      } catch (error) {
        console.log(`❌ Erreur table '${table}':`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
checkQuestionAnswersTable();

// Script pour déboguer les questions et leur structure
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function debugQuestions() {
  try {
    console.log('🔍 Débogage des questions...');

    // 1. Récupérer toutes les questions
    const questionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!questionsResponse.ok) {
      throw new Error(`Erreur récupération questions: ${questionsResponse.status} ${questionsResponse.statusText}`);
    }

    const questions = await questionsResponse.json();
    console.log('📋 Toutes les questions:', questions.length);

    // 2. Analyser chaque question
    questions.forEach((question, index) => {
      console.log(`\n📝 Question ${index + 1}:`);
      console.log('  ID:', question.id);
      console.log('  game_type_id:', question.game_type_id, '(type:', typeof question.game_type_id, ')');
      console.log('  content:', question.content);
      console.log('  title:', question.title);
      console.log('  is_active:', question.is_active);
      
      // Vérifier le filtrage
      const isTop10 = question.game_type_id === 'TOP10';
      const isClub = question.game_type_id === 'CLUB';
      const isTop10Numeric = question.game_type_id === 1;
      const isClubNumeric = question.game_type_id === 3;
      
      console.log('  Filtres:');
      console.log('    === "TOP10":', isTop10);
      console.log('    === "CLUB":', isClub);
      console.log('    === 1 (TOP10):', isTop10Numeric);
      console.log('    === 3 (CLUB):', isClubNumeric);
      console.log('    Passerait le filtre actuel:', isTop10 || isClub);
    });

    // 3. Vérifier les types de jeux
    console.log('\n🎮 Types de jeux:');
    const gameTypesResponse = await fetch(`${SUPABASE_URL}/rest/v1/game_types?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (gameTypesResponse.ok) {
      const gameTypes = await gameTypesResponse.json();
      gameTypes.forEach(gt => {
        console.log(`  ${gt.id}: ${gt.code} - ${gt.name}`);
      });
    }

    // 4. Questions qui passeraient le filtre corrigé
    console.log('\n✅ Questions qui passeraient le filtre corrigé:');
    const filteredQuestions = questions.filter(q => 
      q.game_type_id === 1 || q.game_type_id === 3 || 
      q.game_type_id === 'TOP10' || q.game_type_id === 'CLUB'
    );
    
    console.log('Nombre:', filteredQuestions.length);
    filteredQuestions.forEach(q => {
      console.log(`  - ${q.content?.question || q.title} (type: ${q.game_type_id})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
debugQuestions();

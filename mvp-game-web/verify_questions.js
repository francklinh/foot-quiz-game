// Script pour vérifier les questions dans la base de données
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function verifyQuestions() {
  try {
    console.log('🔍 Vérification des questions dans la base de données...');

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
    console.log(`📋 Nombre total de questions: ${questions.length}`);

    if (questions.length === 0) {
      console.log('❌ AUCUNE QUESTION TROUVÉE dans la base de données !');
      return;
    }

    // 2. Analyser chaque question
    console.log('\n📝 Détail des questions:');
    questions.forEach((question, index) => {
      console.log(`\n--- Question ${index + 1} ---`);
      console.log('ID:', question.id);
      console.log('game_type_id:', question.game_type_id, '(type:', typeof question.game_type_id, ')');
      console.log('content:', JSON.stringify(question.content, null, 2));
      console.log('title:', question.title);
      console.log('is_active:', question.is_active);
      console.log('created_at:', question.created_at);
      
      // Vérifier le filtrage pour l'interface admin
      const isTop10 = question.game_type_id === 1;
      const isClub = question.game_type_id === 3;
      const wouldShowInAdmin = isTop10 || isClub;
      
      console.log('Filtrage admin:');
      console.log('  - Est TOP 10 (game_type_id === 1):', isTop10);
      console.log('  - Est CLUB (game_type_id === 3):', isClub);
      console.log('  - Apparaîtrait dans l\'admin:', wouldShowInAdmin);
    });

    // 3. Compter les questions par type
    const top10Questions = questions.filter(q => q.game_type_id === 1);
    const clubQuestions = questions.filter(q => q.game_type_id === 3);
    const grilleQuestions = questions.filter(q => q.game_type_id === 2);
    
    console.log('\n📊 Statistiques par type:');
    console.log(`TOP 10 (game_type_id = 1): ${top10Questions.length}`);
    console.log(`CLUB (game_type_id = 3): ${clubQuestions.length}`);
    console.log(`GRILLE (game_type_id = 2): ${grilleQuestions.length}`);
    console.log(`Autres: ${questions.length - top10Questions.length - clubQuestions.length - grilleQuestions.length}`);

    // 4. Questions qui apparaîtraient dans l'admin
    const adminQuestions = questions.filter(q => q.game_type_id === 1 || q.game_type_id === 3);
    console.log(`\n✅ Questions visibles dans l'admin: ${adminQuestions.length}`);
    
    if (adminQuestions.length > 0) {
      console.log('Liste des questions visibles:');
      adminQuestions.forEach((q, index) => {
        const typeLabel = q.game_type_id === 1 ? 'TOP10' : 'CLUB';
        const title = q.content?.question || q.title || 'Sans titre';
        console.log(`  ${index + 1}. ${title} (${typeLabel})`);
      });
    } else {
      console.log('❌ Aucune question TOP 10 ou CLUB trouvée !');
    }

    // 5. Vérifier les types de jeux
    console.log('\n🎮 Types de jeux disponibles:');
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

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
verifyQuestions();

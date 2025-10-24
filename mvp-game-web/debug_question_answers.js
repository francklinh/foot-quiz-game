// Script pour déboguer les réponses des questions
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function debugQuestionAnswers() {
  try {
    console.log('🔍 Débogage des réponses des questions...');

    // 1. Récupérer toutes les questions
    const questionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!questionsResponse.ok) {
      throw new Error(`Erreur récupération questions: ${questionsResponse.status}`);
    }

    const questions = await questionsResponse.json();
    console.log(`📋 Nombre total de questions: ${questions.length}`);

    // 2. Analyser chaque question
    for (const question of questions) {
      console.log(`\n--- Question: ${question.content?.question || 'Sans titre'} ---`);
      console.log('ID:', question.id);
      console.log('game_type_id:', question.game_type_id);
      console.log('Type:', question.game_type_id === 1 ? 'TOP10' : question.game_type_id === 2 ? 'GRILLE' : question.game_type_id === 3 ? 'CLUB' : 'INCONNU');

      // 3. Récupérer les réponses pour cette question
      const answersResponse = await fetch(`${SUPABASE_URL}/rest/v1/question_answers?question_id=eq.${question.id}&select=*,players(name,current_club,nationality)&order=ranking.asc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (answersResponse.ok) {
        const answers = await answersResponse.json();
        console.log(`📊 Nombre de réponses: ${answers.length}`);
        
        if (answers.length > 0) {
          console.log('📝 Réponses:');
          answers.forEach((answer, index) => {
            console.log(`  ${index + 1}. ${answer.players?.name || 'Joueur inconnu'}`);
            console.log(`     - Classement: ${answer.ranking || 'N/A'}`);
            console.log(`     - Points: ${answer.points || 'N/A'}`);
            console.log(`     - Correct: ${answer.is_correct !== null ? answer.is_correct : 'N/A'}`);
            console.log(`     - Club: ${answer.players?.current_club || 'N/A'}`);
            console.log(`     - Nationalité: ${answer.players?.nationality || 'N/A'}`);
          });
        } else {
          console.log('❌ Aucune réponse trouvée');
        }
      } else {
        console.log('❌ Erreur récupération réponses:', answersResponse.status);
      }
    }

    // 4. Vérifier toutes les réponses dans la table
    console.log('\n🔍 Toutes les réponses dans la table question_answers:');
    const allAnswersResponse = await fetch(`${SUPABASE_URL}/rest/v1/question_answers?select=*,players(name,current_club,nationality),questions(content)&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (allAnswersResponse.ok) {
      const allAnswers = await allAnswersResponse.json();
      console.log(`📊 Total réponses dans la table: ${allAnswers.length}`);
      
      allAnswers.forEach((answer, index) => {
        console.log(`\n--- Réponse ${index + 1} ---`);
        console.log('ID:', answer.id);
        console.log('Question ID:', answer.question_id);
        console.log('Question:', answer.questions?.content?.question || 'Non trouvée');
        console.log('Joueur:', answer.players?.name || 'Non trouvé');
        console.log('Classement:', answer.ranking);
        console.log('Points:', answer.points);
        console.log('Correct:', answer.is_correct);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
debugQuestionAnswers();

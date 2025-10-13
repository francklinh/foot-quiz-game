// Script de test pour vérifier les migrations de la base de données
// À exécuter dans la console du navigateur sur votre application

async function testMigrations() {
  console.log('🧪 Test des migrations de la base de données');
  console.log('=' * 50);
  
  try {
    // Test 1: Vérifier la structure de la table players
    console.log('📋 Test 1: Structure de la table players');
    const playersResponse = await supabase
      .from('players')
      .select('id, name, nationality')
      .limit(5);
    
    if (playersResponse.error) {
      console.error('❌ Erreur players:', playersResponse.error);
    } else {
      console.log('✅ Table players accessible');
      console.log('📊 Données:', playersResponse.data);
    }
    
    // Test 2: Vérifier la structure de la table theme_answers
    console.log('\n📋 Test 2: Structure de la table theme_answers');
    const themeAnswersResponse = await supabase
      .from('theme_answers')
      .select('id, answer, ranking, goals, assists, value')
      .limit(5);
    
    if (themeAnswersResponse.error) {
      console.error('❌ Erreur theme_answers:', themeAnswersResponse.error);
    } else {
      console.log('✅ Table theme_answers accessible');
      console.log('📊 Données:', themeAnswersResponse.data);
    }
    
    // Test 3: Vérifier les jointures
    console.log('\n📋 Test 3: Jointure players + theme_answers');
    const joinResponse = await supabase
      .from('theme_answers')
      .select(`
        id,
        answer,
        ranking,
        goals,
        assists,
        value,
        players!inner(nationality)
      `)
      .limit(5);
    
    if (joinResponse.error) {
      console.error('❌ Erreur jointure:', joinResponse.error);
    } else {
      console.log('✅ Jointure fonctionnelle');
      console.log('📊 Données avec nationalité:', joinResponse.data);
    }
    
    // Test 4: Vérifier le tri par ranking
    console.log('\n📋 Test 4: Tri par ranking');
    const sortedResponse = await supabase
      .from('theme_answers')
      .select('answer, ranking, value')
      .not('ranking', 'is', null)
      .order('ranking', { ascending: true })
      .limit(10);
    
    if (sortedResponse.error) {
      console.error('❌ Erreur tri:', sortedResponse.error);
    } else {
      console.log('✅ Tri par ranking fonctionnel');
      console.log('📊 Top 10 trié:', sortedResponse.data);
    }
    
    console.log('\n🎉 Tests terminés !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour tester l'affichage des drapeaux
function testFlagDisplay() {
  console.log('\n🏳️ Test d\'affichage des drapeaux');
  
  const countryFlags = {
    'FRA': '🇫🇷',
    'ESP': '🇪🇸', 
    'BRA': '🇧🇷',
    'ARG': '🇦🇷',
    'GER': '🇩🇪',
    'ENG': '🇬🇧',
    'POR': '🇵🇹',
    'ITA': '🇮🇹',
    'NED': '🇳🇱',
    'BEL': '🇧🇪'
  };
  
  console.log('📊 Mapping des drapeaux:');
  Object.entries(countryFlags).forEach(([code, flag]) => {
    console.log(`${code}: ${flag}`);
  });
}

// Exécuter les tests
testMigrations();
testFlagDisplay();

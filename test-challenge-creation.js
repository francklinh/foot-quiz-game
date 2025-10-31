const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testChallengeCreation() {
  console.log('🧪 Test de création de défi - Vérification des duplications\n');

  try {
    // 1. Connexion en tant qu'utilisateur test
    console.log('1️⃣ Connexion avec ugo.arnopoulos@gmail.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'ugo.arnopoulos@gmail.com',
      password: 'test123'
    });

    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError.message);
      return;
    }

    const userId = authData.user.id;
    console.log(`✅ Connecté en tant que: ${userId}\n`);

    // 2. Récupérer un autre utilisateur pour créer un défi
    console.log('2️⃣ Récupération d\'un autre utilisateur pour le défi...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, pseudo, email')
      .neq('id', userId)
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ Impossible de trouver un autre utilisateur');
      return;
    }

    const participantId = users[0].id;
    console.log(`✅ Participant trouvé: ${users[0].pseudo} (${users[0].email})\n`);

    // 3. Compter les défis avant création
    console.log('3️⃣ Comptage des défis existants...');
    const { count: countBefore, error: countErrorBefore } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    if (countErrorBefore) {
      console.error('❌ Erreur lors du comptage:', countErrorBefore);
      return;
    }

    console.log(`   Défis existants avant création: ${countBefore || 0}\n`);

    // 4. Créer un défi
    console.log('4️⃣ Création d\'un nouveau défi...');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert({
        creator_id: userId,
        game_type: 'TOP10',
        status: 'pending',
        expires_at: expiresAt,
        min_participants: 2,
        max_participants: 3
      })
      .select()
      .single();

    if (challengeError) {
      console.error('❌ Erreur lors de la création:', challengeError);
      return;
    }

    console.log(`✅ Défi créé avec succès !`);
    console.log(`   ID: ${challenge.id}\n`);

    // 5. Ajouter les participants
    console.log('5️⃣ Ajout des participants...');
    const participantsData = [
      { challenge_id: challenge.id, user_id: userId, status: 'pending' },
      { challenge_id: challenge.id, user_id: participantId, status: 'pending' }
    ];

    const { error: participantsError } = await supabase
      .from('challenge_participants')
      .insert(participantsData);

    if (participantsError) {
      console.error('❌ Erreur lors de l\'ajout des participants:', participantsError);
      return;
    }

    console.log('✅ Participants ajoutés\n');

    // 6. Compter les défis après création
    console.log('6️⃣ Comptage des défis après création...');
    const { count: countAfter, error: countErrorAfter } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    if (countErrorAfter) {
      console.error('❌ Erreur lors du comptage:', countErrorAfter);
      return;
    }

    console.log(`   Défis après création: ${countAfter || 0}`);
    console.log(`   Différence: ${(countAfter || 0) - (countBefore || 0)} défis créés\n`);

    // 7. Récupérer les défis avec getUserChallenges (simulation)
    console.log('7️⃣ Test de getUserChallenges (simulation)...');
    
    // Récupérer les IDs des défis où l'utilisateur participe
    const { data: participations } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .eq('user_id', userId);

    const participantChallengeIds = participations?.map(p => p.challenge_id) || [];

    // Récupérer les défis (créés OU participés)
    let query = supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (participantChallengeIds.length > 0) {
      query = query.or(`creator_id.eq.${userId},id.in.(${participantChallengeIds.join(',')})`);
    } else {
      query = query.eq('creator_id', userId);
    }

    const { data: challenges, error: challengesError } = await query;

    if (challengesError) {
      console.error('❌ Erreur lors de la récupération:', challengesError);
      return;
    }

    // Dédupliquer
    const uniqueChallenges = Array.from(
      new Map(challenges.map(ch => [ch.id, ch])).values()
    );

    console.log(`   Défis récupérés (bruts): ${challenges.length}`);
    console.log(`   Défis uniques (après déduplication): ${uniqueChallenges.length}`);
    
    // Compter les occurrences de chaque défi
    const challengeIds = challenges.map(ch => ch.id);
    const duplicates = challengeIds.filter((id, index) => challengeIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      console.log(`   ⚠️  Doublons détectés: ${[...new Set(duplicates)].length} défis apparaissent plusieurs fois`);
      const duplicateCounts = {};
      challengeIds.forEach(id => {
        duplicateCounts[id] = (duplicateCounts[id] || 0) + 1;
      });
      Object.entries(duplicateCounts).forEach(([id, count]) => {
        if (count > 1) {
          console.log(`      - Défi ${id}: apparaît ${count} fois`);
        }
      });
    } else {
      console.log(`   ✅ Aucun doublon détecté\n`);
    }

    // 8. Résumé
    console.log('\n📊 RÉSUMÉ DU TEST:');
    console.log(`   ✅ Défi créé: 1`);
    console.log(`   ✅ Défis dans la base: ${countAfter - countBefore} nouveau(x)`);
    console.log(`   ✅ Défis récupérés: ${challenges.length}`);
    console.log(`   ✅ Défis uniques: ${uniqueChallenges.length}`);
    
    if (challenges.length === uniqueChallenges.length && (countAfter - countBefore) === 1) {
      console.log('\n🎉 TEST RÉUSSI ! Pas de duplication détectée.');
    } else {
      console.log('\n⚠️  PROBLÈME DÉTECTÉ ! Il y a une duplication.');
    }

    // Nettoyage optionnel (commenté pour garder les données)
    // console.log('\n🧹 Nettoyage...');
    // await supabase.from('challenge_participants').delete().eq('challenge_id', challenge.id);
    // await supabase.from('challenges').delete().eq('id', challenge.id);
    // console.log('✅ Défi de test supprimé');

  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

// Exécuter le test
testChallengeCreation().catch(console.error);

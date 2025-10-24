// Script pour exécuter la migration de création de la table question_answers
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

async function executeMigration() {
  try {
    console.log('🚀 Exécution de la migration pour créer la table question_answers...');
    console.log('⚠️  Note: Cette migration doit être exécutée dans l\'interface Supabase SQL Editor');
    console.log('📋 Contenu de la migration:');
    console.log('');
    
    const fs = require('fs');
    const migrationContent = fs.readFileSync('create_question_answers_table.sql', 'utf8');
    console.log(migrationContent);
    
    console.log('');
    console.log('📝 Instructions:');
    console.log('1. Allez sur https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Allez dans SQL Editor');
    console.log('4. Copiez-collez le contenu ci-dessus');
    console.log('5. Exécutez la requête');
    console.log('');
    console.log('✅ Une fois la migration exécutée, vous pourrez créer des réponses TOP 10');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
executeMigration();

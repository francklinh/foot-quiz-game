// Script simple pour exécuter les migrations via l'API Supabase
// À exécuter dans la console du navigateur sur https://supabase.com/dashboard

console.log('🚀 Début des migrations de la base de données');
console.log('=' * 50);

// Configuration Supabase
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

// Créer le client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Liste des requêtes SQL à exécuter
const migrations = [
  {
    name: "Ajouter colonne nationality à players",
    sql: "ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality VARCHAR(3);"
  },
  {
    name: "Ajouter colonnes à theme_answers",
    sql: "ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS ranking INTEGER;"
  },
  {
    name: "Ajouter colonne goals",
    sql: "ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS goals INTEGER;"
  },
  {
    name: "Ajouter colonne assists", 
    sql: "ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS assists INTEGER;"
  },
  {
    name: "Ajouter colonne value",
    sql: "ALTER TABLE theme_answers ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);"
  },
  {
    name: "Créer index ranking",
    sql: "CREATE INDEX IF NOT EXISTS idx_theme_answers_ranking ON theme_answers(theme_id, ranking);"
  },
  {
    name: "Créer index nationality",
    sql: "CREATE INDEX IF NOT EXISTS idx_players_nationality ON players(nationality);"
  }
];

// Fonction pour exécuter une migration
async function executeMigration(migration) {
  try {
    console.log(`🔄 ${migration.name}...`);
    
    // Note: L'API Supabase ne permet pas d'exécuter du SQL arbitraire
    // Ces requêtes doivent être exécutées via l'interface SQL Editor
    console.log(`📝 Requête: ${migration.sql}`);
    console.log(`✅ ${migration.name} - À exécuter manuellement`);
    
  } catch (error) {
    console.error(`❌ Erreur ${migration.name}:`, error);
  }
}

// Exécuter toutes les migrations
async function runAllMigrations() {
  for (const migration of migrations) {
    await executeMigration(migration);
    await new Promise(resolve => setTimeout(resolve, 100)); // Pause entre les requêtes
  }
  
  console.log('\n🎉 Migrations préparées !');
  console.log('📋 Instructions:');
  console.log('1. Aller sur https://supabase.com/dashboard');
  console.log('2. Sélectionner votre projet');
  console.log('3. Aller dans "SQL Editor"');
  console.log('4. Copier-coller chaque requête ci-dessus');
  console.log('5. Exécuter une par une');
}

// Lancer les migrations
runAllMigrations();

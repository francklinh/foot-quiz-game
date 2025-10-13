#!/usr/bin/env python3
"""
Script pour exécuter les migrations de la base de données Supabase
Ajoute les colonnes pour les drapeaux et le classement
"""

import os
import sys
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://qahbsyolfvujrpblnrvy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA"

def create_supabase_client() -> Client:
    """Créer le client Supabase"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def execute_sql_queries(supabase: Client, queries: list[str]):
    """Exécuter une liste de requêtes SQL"""
    for i, query in enumerate(queries, 1):
        try:
            print(f"🔄 Exécution de la requête {i}/{len(queries)}...")
            print(f"📝 Requête: {query[:100]}...")
            
            result = supabase.rpc('exec_sql', {'sql': query}).execute()
            print(f"✅ Requête {i} exécutée avec succès")
            
        except Exception as e:
            print(f"❌ Erreur lors de l'exécution de la requête {i}: {e}")
            print(f"📝 Requête problématique: {query}")
            # Continue avec les autres requêtes
            continue

def main():
    """Fonction principale"""
    print("🚀 Début des migrations de la base de données")
    print("=" * 50)
    
    # Créer le client Supabase
    try:
        supabase = create_supabase_client()
        print("✅ Connexion à Supabase établie")
    except Exception as e:
        print(f"❌ Erreur de connexion à Supabase: {e}")
        sys.exit(1)
    
    # Lire le fichier SQL
    try:
        with open('database_migrations.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
        print("✅ Fichier SQL lu avec succès")
    except Exception as e:
        print(f"❌ Erreur lors de la lecture du fichier SQL: {e}")
        sys.exit(1)
    
    # Diviser les requêtes (séparées par des points-virgules)
    queries = [q.strip() for q in sql_content.split(';') if q.strip() and not q.strip().startswith('--')]
    
    print(f"📊 {len(queries)} requêtes à exécuter")
    print("=" * 50)
    
    # Exécuter les requêtes
    execute_sql_queries(supabase, queries)
    
    print("=" * 50)
    print("🎉 Migrations terminées !")
    
    # Vérifications finales
    print("\n🔍 Vérifications finales...")
    try:
        # Vérifier les colonnes ajoutées
        players_result = supabase.table('players').select('id, name, nationality').limit(5).execute()
        print(f"✅ Table players: {len(players_result.data)} enregistrements avec nationalité")
        
        theme_answers_result = supabase.table('theme_answers').select('id, answer, ranking, goals, assists, value').limit(5).execute()
        print(f"✅ Table theme_answers: {len(theme_answers_result.data)} enregistrements avec classement")
        
    except Exception as e:
        print(f"⚠️ Erreur lors des vérifications: {e}")

if __name__ == "__main__":
    main()

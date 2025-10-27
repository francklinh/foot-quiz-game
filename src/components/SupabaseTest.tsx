import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      // Test 1: Vérifier la connexion de base
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        throw error;
      }

      setConnectionStatus('connected');
      
      // Test 2: Récupérer les tables disponibles
      await getAvailableTables();
      
      // Test 3: Vérifier l'authentification
      await checkAuthentication();
      
    } catch (err: any) {
      setConnectionStatus('error');
      setErrorMessage(err.message);
      console.error('Supabase connection error:', err);
    }
  };

  const getAvailableTables = async () => {
    try {
      // Test des principales tables
      const tableTests = [
        { name: 'users', query: () => supabase.from('users').select('id').limit(1) },
        { name: 'players', query: () => supabase.from('players').select('id').limit(1) },
        { name: 'themes', query: () => supabase.from('themes').select('id').limit(1) },
        { name: 'theme_answers', query: () => supabase.from('theme_answers').select('id').limit(1) },
        { name: 'questions', query: () => supabase.from('questions').select('id').limit(1) },
        { name: 'grid_answers', query: () => supabase.from('grid_answers').select('id').limit(1) },
        { name: 'cerises_transactions', query: () => supabase.from('cerises_transactions').select('id').limit(1) },
        { name: 'friendships', query: () => supabase.from('friendships').select('id').limit(1) },
        { name: 'challenges', query: () => supabase.from('challenges').select('id').limit(1) },
        { name: 'game_results', query: () => supabase.from('game_results').select('id').limit(1) },
        { name: 'shop_items', query: () => supabase.from('shop_items').select('id').limit(1) },
        { name: 'user_purchases', query: () => supabase.from('user_purchases').select('id').limit(1) }
      ];

      const availableTables: string[] = [];
      
      for (const table of tableTests) {
        try {
          await table.query();
          availableTables.push(table.name);
        } catch (err) {
          console.log(`Table ${table.name} not accessible:`, err);
        }
      }
      
      setTables(availableTables);
    } catch (err) {
      console.error('Error checking tables:', err);
    }
  };

  const checkAuthentication = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        setUserInfo({
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.created_at
        });
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }
  };

  const testSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (error) throw error;
      console.log('Sign up test result:', data);
    } catch (err: any) {
      console.error('Sign up test error:', err.message);
    }
  };

  const testSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (error) throw error;
      console.log('Sign in test result:', data);
    } catch (err: any) {
      console.error('Sign in test error:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-pattern p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card-primary p-6 mb-6">
          <h1 className="text-3xl font-bold text-primary mb-4">🔍 Test de Connexion Supabase</h1>
          
          {/* Statut de connexion */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-3">Statut de Connexion</h2>
            <div className={`p-4 rounded-lg ${
              connectionStatus === 'connected' ? 'bg-success-light text-success' :
              connectionStatus === 'error' ? 'bg-danger-light text-danger' :
              'bg-warning-light text-warning'
            }`}>
              {connectionStatus === 'testing' && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Test de connexion en cours...
                </div>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  Connexion Supabase réussie !
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">❌</span>
                  Erreur de connexion: {errorMessage}
                </div>
              )}
            </div>
          </div>

          {/* Tables disponibles */}
          {tables.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary mb-3">Tables Disponibles ({tables.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {tables.map(table => (
                  <div key={table} className="bg-accent-light text-primary px-3 py-2 rounded-lg text-sm font-medium">
                    ✅ {table}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informations utilisateur */}
          {userInfo && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-primary mb-3">Utilisateur Connecté</h2>
              <div className="bg-accent-light p-4 rounded-lg">
                <p><strong>ID:</strong> {userInfo.id}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Créé le:</strong> {new Date(userInfo.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Tests d'authentification */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-3">Tests d'Authentification</h2>
            <div className="flex gap-4">
              <button
                onClick={testSignUp}
                className="btn-primary px-4 py-2 rounded-lg"
              >
                Test Inscription
              </button>
              <button
                onClick={testSignIn}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                Test Connexion
              </button>
            </div>
          </div>

          {/* Configuration */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-3">Configuration</h2>
            <div className="bg-accent-light p-4 rounded-lg">
              <p><strong>URL Supabase:</strong> https://qahbsyolfvujrpblnrvy.supabase.co</p>
              <p><strong>Clé Anon:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
              <p><strong>Statut:</strong> {connectionStatus === 'connected' ? '✅ Configuré' : '❌ Problème'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={testSupabaseConnection}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              🔄 Retester la Connexion
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-6 py-3 rounded-lg"
            >
              🚀 Ouvrir Supabase Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}





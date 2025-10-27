// src/components/SupabaseConnectionTest.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ConnectionTestProps {
  className?: string;
}

export function SupabaseConnectionTest({ className }: ConnectionTestProps) {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);

      // Test 1: Vérifier la connexion de base avec timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de connexion')), 10000)
      );

      const connectionPromise = supabase
        .from('game_types')
        .select('*')
        .limit(1);

      const { data: tablesData, error: tablesError } = await Promise.race([
        connectionPromise,
        timeoutPromise
      ]) as any;

      if (tablesError) {
        throw new Error(`Erreur de connexion: ${tablesError.message}`);
      }

      // Test 2: Lister les tables disponibles
      const availableTables = [
        'users', 'players', 'questions', 'game_types', 'matches', 
        'grid_answers', 'leagues', 'friendships', 'admins', 'notifications',
        'match_participants', 'match_questions', 'league_members', 
        'invitations', 'push_tokens', 'admin_audit_log'
      ];

      const testResults: Record<string, boolean> = {};
      
      // Test chaque table
      for (const table of availableTables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          testResults[table] = !error;
        } catch (err) {
          testResults[table] = false;
        }
      }

      setTables(availableTables);
      setTestResults(testResults);
      setConnectionStatus('connected');
    } catch (err: any) {
      console.error('Erreur de connexion Supabase:', err);
      
      let errorMessage = err.message;
      
      // Gestion spécifique des erreurs
      if (err.message.includes('Load failed')) {
        errorMessage = 'Erreur de réseau - Vérifiez votre connexion internet et les paramètres CORS de Supabase';
      } else if (err.message.includes('Timeout')) {
        errorMessage = 'Timeout de connexion - Le serveur Supabase ne répond pas';
      } else if (err.message.includes('CORS')) {
        errorMessage = 'Erreur CORS - Vérifiez la configuration des domaines autorisés dans Supabase';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage = 'Erreur d\'authentification - Vérifiez la clé API Supabase';
      }
      
      setError(errorMessage);
      setConnectionStatus('error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Test de Connexion Supabase</h2>
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tester à nouveau
        </button>
      </div>

      {/* Status général */}
      <div className={`p-4 rounded-lg mb-4 ${getStatusColor(connectionStatus)}`}>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getStatusIcon(connectionStatus)}</span>
          <div>
            <p className="font-medium">
              {connectionStatus === 'connected' && 'Connexion réussie !'}
              {connectionStatus === 'error' && 'Erreur de connexion'}
              {connectionStatus === 'testing' && 'Test en cours...'}
            </p>
            {error && (
              <p className="text-sm mt-1">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Résultats des tests par table */}
      {connectionStatus === 'connected' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">État des Tables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tables.map((table) => (
              <div
                key={table}
                className={`p-3 rounded-lg border ${
                  testResults[table] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{table}</span>
                  <span className="text-lg">
                    {testResults[table] ? '✅' : '❌'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {testResults[table] ? 'Accessible' : 'Inaccessible'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations de connexion */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Informations de Connexion</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>URL:</strong> https://qahbsyolfvujrpblnrvy.supabase.co</p>
          <p><strong>URL Env:</strong> {process.env.REACT_APP_SUPABASE_URL || 'Non définie'}</p>
          <p><strong>Status:</strong> {connectionStatus === 'connected' ? 'Connecté' : 'Non connecté'}</p>
          <p><strong>Tables disponibles:</strong> {tables.length}</p>
          <p><strong>Tables accessibles:</strong> {Object.values(testResults).filter(Boolean).length}</p>
          <p><strong>Environnement:</strong> {process.env.NODE_ENV || 'development'}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
        </div>
      </div>

      {/* Actions de débogage */}
      {connectionStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-900 mb-2">Actions de Débogage</h3>
          <div className="text-sm text-red-700 space-y-2">
            <p><strong>1. Vérifiez votre connexion internet</strong></p>
            <p><strong>2. Vérifiez les paramètres CORS dans Supabase :</strong></p>
            <ul className="ml-4 list-disc">
              <li>Allez dans Settings → API</li>
              <li>Ajoutez <code>http://localhost:3000</code> aux domaines autorisés</li>
              <li>Vérifiez que "Enable CORS" est activé</li>
            </ul>
            <p><strong>3. Vérifiez la console du navigateur (F12) pour plus de détails</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

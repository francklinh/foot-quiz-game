// src/components/SimpleSupabaseTest.tsx
import React, { useState } from 'react';
import { supabaseLocalService } from '../services/supabase-local.service';

export function SimpleSupabaseTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [data, setData] = useState<any>(null);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Test de connexion simple en cours...');

    try {
      const result = await supabaseLocalService.testConnection();
      
      if (result.success) {
        setStatus('success');
        setMessage('✅ Connexion Supabase réussie !');
        setData(result.data);
      } else {
        setStatus('error');
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erreur: ${error.message}`);
    }
  };

  const testStats = async () => {
    setStatus('testing');
    setMessage('Récupération des statistiques...');

    try {
      const stats = await supabaseLocalService.getStats();
      
      setStatus('success');
      setMessage('✅ Statistiques récupérées !');
      setData(stats);
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">🚀 Test Supabase Simple (Sans CORS)</h3>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={testConnection}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Test en cours...' : 'Tester Connexion'}
        </button>
        
        <button
          onClick={testStats}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Test en cours...' : 'Récupérer Stats'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {message}
        </div>
      )}

      {data && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Données récupérées :</h4>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <h4 className="text-sm font-medium text-green-800 mb-2">✅ Avantages de cette approche</h4>
        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
          <li><strong>Pas de CORS</strong> : Utilise Fetch API directement</li>
          <li><strong>Plus simple</strong> : Pas de configuration complexe</li>
          <li><strong>Plus rapide</strong> : Moins de couches d'abstraction</li>
          <li><strong>Plus fiable</strong> : Contrôle total sur les requêtes</li>
        </ul>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Méthode:</strong> Fetch API direct vers Supabase REST</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>CORS:</strong> Non requis</p>
      </div>
    </div>
  );
}





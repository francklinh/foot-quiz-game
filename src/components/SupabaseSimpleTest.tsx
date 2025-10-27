// src/components/SupabaseSimpleTest.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function SupabaseSimpleTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [data, setData] = useState<any>(null);

  const testSupabase = async () => {
    setStatus('testing');
    setMessage('Test Supabase en cours...');

    try {
      // Test simple avec Supabase client
      const { data: result, error } = await supabase
        .from('game_types')
        .select('*')
        .limit(3);

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage(`✅ Supabase fonctionne ! ${result?.length || 0} jeu(x) trouvé(s)`);
      setData(result);
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erreur Supabase: ${error.message}`);
      console.error('Erreur Supabase:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Test Supabase Client</h3>
      
      <div className="mb-4">
        <button
          onClick={testSupabase}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Test en cours...' : 'Tester Supabase Client'}
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
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Méthode:</strong> Supabase Client</p>
        <p><strong>Status:</strong> {status}</p>
      </div>
    </div>
  );
}





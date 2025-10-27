// src/components/AdminFetchTest.tsx
import React, { useState } from 'react';
import { adminFetchService } from '../services/admin-fetch.service';

export function AdminFetchTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [data, setData] = useState<any>(null);

  const testFetchService = async () => {
    setStatus('testing');
    setMessage('Test du service Fetch en cours...');

    try {
      // Test avec le service Fetch
      const stats = await adminFetchService.getStats();

      setStatus('success');
      setMessage(`✅ Service Fetch fonctionne ! Statistiques récupérées`);
      setData(stats);
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erreur Service Fetch: ${error.message}`);
      console.error('Erreur Service Fetch:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Test Service Admin Fetch</h3>
      
      <div className="mb-4">
        <button
          onClick={testFetchService}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Test en cours...' : 'Tester le Service Fetch'}
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
          <h4 className="font-medium mb-2">Statistiques récupérées :</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Jeux :</span> {data.totalGames}
            </div>
            <div>
              <span className="font-medium">Joueurs :</span> {data.totalPlayers}
            </div>
            <div>
              <span className="font-medium">Questions :</span> {data.totalQuestions}
            </div>
            <div>
              <span className="font-medium">Questions actives :</span> {data.activeQuestions}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Méthode:</strong> Service Admin Fetch API</p>
        <p><strong>Status:</strong> {status}</p>
      </div>
    </div>
  );
}





// src/components/SimpleConnectionTest.tsx
import React, { useState } from 'react';

export function SimpleConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Test en cours...');

    try {
      // Test simple avec fetch
      const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/game_types?select=*&limit=1', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(`✅ Connexion réussie ! ${data.length} jeu(x) trouvé(s)`);
      } else {
        setStatus('error');
        setMessage(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Test de Connexion Simple</h3>
      
      <div className="mb-4">
        <button
          onClick={testConnection}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
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

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>URL testée:</strong> https://qahbsyolfvujrpblnrvy.supabase.co</p>
        <p><strong>Méthode:</strong> Fetch API direct</p>
        <p><strong>Status:</strong> {status}</p>
      </div>
    </div>
  );
}





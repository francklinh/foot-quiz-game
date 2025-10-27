// src/components/CorsTest.tsx
import React, { useState } from 'react';

export function CorsTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<any>(null);

  const testCors = async () => {
    setStatus('testing');
    setMessage('Test CORS en cours...');

    try {
      // Test 1: Simple fetch vers l'API Supabase
      const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/game_types?select=*', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setStatus('success');
      setMessage('✅ CORS configuré correctement !');
      setDetails({
        status: response.status,
        statusText: response.statusText,
        dataCount: data.length,
        headers: Object.fromEntries(response.headers.entries())
      });

    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erreur CORS: ${error.message}`);
      setDetails({
        error: error.message,
        type: error.name
      });
    }
  };

  const testPreflight = async () => {
    setStatus('testing');
    setMessage('Test Preflight CORS en cours...');

    try {
      // Test OPTIONS (preflight request)
      const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/game_types', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, apikey'
        }
      });

      setStatus('success');
      setMessage('✅ Preflight CORS configuré correctement !');
      setDetails({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erreur Preflight CORS: ${error.message}`);
      setDetails({
        error: error.message,
        type: error.name
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Test Configuration CORS</h3>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={testCors}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Test en cours...' : 'Tester CORS Simple'}
        </button>
        
        <button
          onClick={testPreflight}
          disabled={status === 'testing'}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Test en cours...' : 'Tester Preflight CORS'}
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

      {details && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Détails du test :</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>URL testée:</strong> https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/game_types</p>
        <p><strong>Status:</strong> {status}</p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Instructions CORS</h4>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Allez sur <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">supabase.com/dashboard</a></li>
          <li>Sélectionnez votre projet</li>
          <li>Settings → API</li>
          <li>Ajoutez <code>http://localhost:3000</code> aux domaines autorisés</li>
          <li>Settings → Authentication</li>
          <li>Site URL: <code>http://localhost:3000</code></li>
        </ol>
      </div>
    </div>
  );
}





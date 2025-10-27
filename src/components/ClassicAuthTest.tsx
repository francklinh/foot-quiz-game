import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function ClassicAuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testSignup = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔄 Test inscription pour:', email);
      
      // Utiliser fetch() directement au lieu du client Supabase
      const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            pseudo: email.split('@')[0],
            country: 'France'
          }
        })
      });

      console.log('📊 Réponse inscription - Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Inscription réussie - Données complètes:', data);
        console.log('📊 Session:', data.session);
        console.log('📊 User:', data.user);
        
        if (data.session) {
          setResult(`✅ Inscription réussie et session créée: ${data.session.user.email}`);
        } else {
          setResult(`✅ Inscription réussie mais confirmation email requise pour: ${data.user?.email || email}\n\nDétails: ${JSON.stringify(data, null, 2)}`);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur HTTP:', response.status, errorData);
        setResult(`❌ Erreur HTTP ${response.status}: ${errorData.msg || errorData.error || 'Erreur inconnue'}`);
      }
    } catch (err: any) {
      console.error('💥 Erreur:', err);
      setResult(`💥 Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔄 Test connexion pour:', email);
      
      // Utiliser fetch() directement au lieu du client Supabase
      const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      console.log('📊 Réponse connexion - Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connexion réussie:', data);
        setResult(`✅ Connexion réussie: ${data.user?.email}`);
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur HTTP:', response.status, errorData);
        setResult(`❌ Erreur HTTP ${response.status}: ${errorData.msg || errorData.error || 'Erreur inconnue'}`);
      }
    } catch (err: any) {
      console.error('💥 Erreur:', err);
      setResult(`💥 Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult(`❌ Erreur session: ${error.message}`);
      } else if (session) {
        setResult(`✅ Session active: ${session.user.email}\nMétadonnées: ${JSON.stringify(session.user.user_metadata, null, 2)}`);
      } else {
        setResult('❌ Aucune session active');
      }
    } catch (err: any) {
      setResult(`💥 Erreur: ${err.message}`);
    }
  };

  const forceConfirmUser = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔄 Tentative de confirmation forcée pour:', email);
      
      // Essayer de créer une session directement avec les tokens
      const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      console.log('📊 Réponse confirmation - Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Confirmation réussie:', data);
        setResult(`✅ Confirmation réussie: ${data.user?.email}\n\nDétails: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur HTTP:', response.status, errorData);
        setResult(`❌ Erreur HTTP ${response.status}: ${errorData.msg || errorData.error || 'Erreur inconnue'}\n\nDétails: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (err: any) {
      console.error('💥 Erreur:', err);
      setResult(`💥 Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-green-100 rounded-lg">
      <h3 className="font-bold mb-4">🔐 Test Authentification Classique</h3>
      
      <div className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe (min 6 caractères)"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={testSignup}
            disabled={loading || !email || !password}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading || !email || !password}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Vérifier Session
          </button>
          
          <button
            onClick={forceConfirmUser}
            disabled={loading || !email || !password}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Confirmation...' : 'Forcer Confirmation'}
          </button>
          
          <button
            onClick={() => {
              setEmail('franck.handou@gmail.com');
              setPassword('test123456');
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            Remplir Test 1
          </button>
          
          <button
            onClick={() => {
              setEmail('test.user.123@gmail.com');
              setPassword('password123');
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Remplir Test 2
          </button>
        </div>
        
        {result && (
          <div className="p-2 bg-white rounded border text-sm">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

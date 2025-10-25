import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function MagicLinkDebug() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testMagicLink = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔄 Test lien magique pour:', email);
      
      // Utiliser fetch() directement au lieu du client Supabase
      const response = await fetch('https://qahbsyolfvujrpblnrvy.supabase.co/auth/v1/otp', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          options: {
            emailRedirectTo: 'http://localhost:3000/home'
          }
        })
      });

      console.log('📊 Réponse fetch - Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Lien magique envoyé:', data);
        setResult(`✅ Lien magique envoyé ! Vérifiez votre email: ${email}`);
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
      console.log('🔄 Vérification de la session...');
      
      // Vérifier s'il y a des tokens dans l'URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const urlParams = new URLSearchParams(window.location.search);
      
      console.log('🔍 Hash params:', Object.fromEntries(hashParams));
      console.log('🔍 URL params:', Object.fromEntries(urlParams));
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('📊 Session data:', session);
      console.log('📊 Session error:', error);
      
      if (error) {
        setResult(`❌ Erreur session: ${error.message}`);
      } else if (session) {
        setResult(`✅ Session active: ${session.user.email}\nID: ${session.user.id}\nMétadonnées: ${JSON.stringify(session.user.user_metadata, null, 2)}`);
      } else {
        let message = '❌ Aucune session active';
        
        // Vérifier s'il y a des tokens dans l'URL
        if (hashParams.has('access_token') || urlParams.has('access_token')) {
          message += '\n⚠️ Tokens détectés dans l\'URL mais session non créée';
        }
        
        setResult(message);
      }
    } catch (err: any) {
      console.error('💥 Erreur lors de la vérification:', err);
      setResult(`💥 Erreur: ${err.message}`);
    }
  };

  const processTokens = async () => {
    try {
      console.log('🔄 Traitement manuel des tokens...');
      
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const urlParams = new URLSearchParams(window.location.search);
      
      const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
      
      if (accessToken) {
        console.log('🔑 Token trouvé, tentative de création de session...');
        
        // Essayer de créer une session avec les tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (error) {
          setResult(`❌ Erreur lors du traitement des tokens: ${error.message}`);
        } else if (data.session) {
          setResult(`✅ Session créée manuellement: ${data.session.user.email}`);
        } else {
          setResult('❌ Impossible de créer la session avec les tokens');
        }
      } else {
        setResult('❌ Aucun token trouvé dans l\'URL');
      }
    } catch (err: any) {
      console.error('💥 Erreur lors du traitement:', err);
      setResult(`💥 Erreur: ${err.message}`);
    }
  };

  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h3 className="font-bold mb-4">🔗 Test Lien Magique</h3>
      
      <div className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={testMagicLink}
            disabled={loading || !email}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Envoyer Lien Magique'}
          </button>
          
          <button
            onClick={() => setEmail('franck.handou@gmail.com')}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Utiliser Email Test
          </button>
          
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Vérifier Session
          </button>
          
          <button
            onClick={processTokens}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            Traiter Tokens
          </button>
        </div>
        
        {result && (
          <div className="p-2 bg-white rounded border">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

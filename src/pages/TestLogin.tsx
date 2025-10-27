// Page de test de connexion avec gestion de session
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function TestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('✅ Utilisateur déjà connecté:', session.user.email);
        navigate('/home');
      }
    };
    checkSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 TestLogin - Changement d\'état:', event, session?.user?.email);
      if (session?.user) {
        console.log('✅ TestLogin - Utilisateur connecté, redirection...');
        navigate('/home');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Test de connexion avec Supabase client...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erreur connexion:', error);
        setError(error.message);
      } else {
        console.log('✅ Connexion réussie:', data);
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => navigate('/home'), 1000);
      }
    } catch (err: any) {
      console.error('💥 Erreur lors de la connexion:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Test de connexion avec token direct...');
      
      // Récupérer le token depuis l'inscription précédente
      const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';
      
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (response.ok) {
        const tokenData = await response.json();
        console.log('✅ Token récupéré:', tokenData);
        
        // Utiliser le token pour créer une session
        const { data, error } = await supabase.auth.setSession({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token
        });

        if (error) {
          console.error('❌ Erreur création session:', error);
          setError(error.message);
        } else {
          console.log('✅ Session créée:', data);
          setSuccess('Session créée ! Redirection...');
          setTimeout(() => navigate('/home'), 1000);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur token:', errorData);
        setError(errorData.msg || `Erreur HTTP: ${response.status}`);
      }
    } catch (err: any) {
      console.error('💥 Erreur lors de la connexion:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Test Connexion</h2>
        
        {/* Connexion avec Supabase client */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Se connecter (Supabase Client)'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Connexion avec token direct */}
        <form onSubmit={handleLoginWithToken} className="space-y-4">
          <button
            type="submit"
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading || !email || !password}
          >
            {loading ? 'Chargement...' : 'Se connecter (Token Direct)'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/test-register" className="font-medium text-indigo-600 hover:text-indigo-500">
            ← Test d'inscription
          </Link>
        </p>
        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}





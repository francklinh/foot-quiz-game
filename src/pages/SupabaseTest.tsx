// Page de test simple avec le client Supabase
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SupabaseTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Test d\'inscription avec client Supabase...');
      console.log('📡 URL Supabase: https://qahbsyolfvujrpblnrvy.supabase.co');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            pseudo: email.split('@')[0],
            country: 'France'
          }
        }
      });

      if (error) {
        console.error('❌ Erreur inscription:', error);
        setError(error.message);
      } else {
        console.log('✅ Inscription réussie:', data);
        if (data.user) {
          setSuccess('Compte créé avec succès ! Connexion automatique...');
          setTimeout(() => navigate('/home'), 1500);
        } else {
          setSuccess('Compte créé avec succès ! Veuillez vous connecter.');
        }
      }
    } catch (err: any) {
      console.error('💥 Erreur lors de l\'inscription:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Test de connexion avec client Supabase...');
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Test Supabase Client</h2>
        
        {/* Inscription */}
        <form onSubmit={handleSignUp} className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Inscription</h3>
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
            {loading ? 'Chargement...' : 'S\'inscrire (Client Supabase)'}
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

        {/* Connexion */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Connexion</h3>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading || !email || !password}
          >
            {loading ? 'Chargement...' : 'Se connecter (Client Supabase)'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            ← Inscription normale
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

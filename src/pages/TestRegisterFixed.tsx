// Page de test d'inscription avec gestion de session via localStorage
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function TestRegisterFixed() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [country, setCountry] = useState('France');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const PAYS_OPTIONS = [
    "France", "Brésil", "Argentine", "Espagne", "Angleterre", "Allemagne",
    "Italie", "Portugal", "Pays-Bas", "Belgique", "Pologne", "Croatie",
    "Norvège", "Égypte", "Corée du Sud", "Nigeria", "Canada", "Maroc",
    "Sénégal", "Algérie", "Tunisie", "Côte d'Ivoire", "Ghana", "Cameroun"
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation côté client
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Test d\'inscription avec fetch direct...');
      
      const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';
      
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          options: {
            data: {
              pseudo: pseudo || email.split('@')[0],
              country: country || 'France'
            }
          }
        })
      });

      console.log('📊 Réponse inscription - Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Inscription réussie:', data);
        
        // Si on a un token, sauvegarder dans localStorage
        if (data.access_token) {
          console.log('🔄 Sauvegarde de la session dans localStorage...');
          
          // Créer un objet session personnalisé
          const sessionData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            user: {
              id: data.user?.id || 'temp_id',
              email: email,
              user_metadata: {
                pseudo: pseudo || email.split('@')[0],
                country: country || 'France'
              }
            }
          };
          
          // Sauvegarder dans localStorage
          localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
          localStorage.setItem('simple_auth_user', JSON.stringify({
            id: data.user?.id || 'temp_id',
            email: email,
            pseudo: pseudo || email.split('@')[0],
            country: country || 'France'
          }));
          
          console.log('✅ Session sauvegardée dans localStorage');
          setSuccess('Compte créé et session établie ! Redirection...');
          
          // Forcer le rechargement de la page pour que l'App.tsx détecte la session
          setTimeout(() => {
            window.location.href = '/home';
          }, 1000);
        } else {
          setSuccess('Compte créé avec succès ! Veuillez vous connecter.');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur inscription:', errorData);
        setError(errorData.msg || `Erreur HTTP: ${response.status}`);
      }
    } catch (err: any) {
      console.error('💥 Erreur lors de l\'inscription:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Test Inscription (Fixé)</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700">Pseudo</label>
            <input
              type="text"
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Votre pseudo de jeu"
            />
          </div>
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
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Pays</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {PAYS_OPTIONS.map((pays) => (
                <option key={pays} value={pays}>
                  {pays}
                </option>
              ))}
            </select>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Chargement...' : 'S\'inscrire (Fixé)'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/test-login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Test de connexion
          </Link>
          {' | '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Inscription normale
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





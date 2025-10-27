// Page d'inscription simplifiée avec Supabase Auth
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SimpleRegister() {
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

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('✅ Utilisateur déjà connecté, redirection vers l\'accueil');
        navigate('/home');
      }
    };
    checkSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        console.log('✅ Utilisateur connecté, redirection vers l\'accueil');
        navigate('/home');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            pseudo: pseudo || email.split('@')[0],
            country: country || 'France'
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('✅ Inscription réussie:', data);
        
        if (data.session) {
          // Session créée automatiquement
          setSuccess('Compte créé avec succès ! Connexion automatique...');
          setTimeout(() => navigate('/home'), 1500);
        } else {
          // Pas de session créée, essayer de se connecter automatiquement
          setSuccess('Compte créé avec succès ! Connexion en cours...');
          
          // Attendre un peu pour que l'utilisateur soit créé
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            console.log('🔄 Tentative de connexion automatique...');
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (loginError) {
              console.error('❌ Erreur connexion automatique:', loginError);
              setError(`Compte créé mais connexion échouée: ${loginError.message}. Veuillez vous connecter manuellement.`);
            } else {
              console.log('✅ Connexion automatique réussie:', loginData.user?.email);
              setSuccess('Compte créé et connexion réussie ! Redirection...');
              setTimeout(() => navigate('/home'), 1500);
            }
          } catch (loginErr: any) {
            console.error('❌ Erreur connexion automatique:', loginErr);
            setError(`Compte créé mais connexion échouée: ${loginErr.message}. Veuillez vous connecter manuellement.`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Inscription</h2>
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
            {loading ? 'Chargement...' : 'S\'inscrire'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Se connecter
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

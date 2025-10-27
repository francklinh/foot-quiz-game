// Page de connexion simplifiée avec Supabase Auth
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SimpleLogin() {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => navigate('/home'), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Magic link envoyé ! Vérifiez votre email.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-red-600 to-accent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Motifs ballon en filigrane */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-white rounded-full"></div>
      </div>

      <div className="bg-accent/95 backdrop-blur rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border-4 border-primary">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">⚽</div>
          <h2 className="text-3xl font-black text-primary mb-2">CONNEXION</h2>
          <p className="text-sm text-text/70">Prêt à relever le défi ?</p>
        </div>
        
        {/* Connexion par email/mot de passe */}
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-text mb-1">📧 Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-primary/30 bg-white font-medium text-text focus:outline-none focus:border-primary transition-colors duration-200"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-text mb-1">🔒 Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-primary/30 bg-white font-medium text-text focus:outline-none focus:border-primary transition-colors duration-200"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
              ✅ {success}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-red-700 text-white font-black text-lg hover:from-red-700 hover:to-primary transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '⚽ CHARGEMENT...' : '⚽ SE CONNECTER'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-primary/30" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-accent font-bold text-text">OU</span>
          </div>
        </div>

        {/* Magic Link */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <button
            type="submit"
            className="w-full py-3 px-6 border-2 border-primary rounded-xl shadow-sm font-bold text-primary bg-white hover:bg-primary hover:text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !email}
          >
            {loading ? '✉️ ENVOI EN COURS...' : '✨ LIEN MAGIQUE'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-primary/20">
          <p className="text-center text-sm font-medium text-text mb-4">
            Pas encore de compte ?
          </p>
          <Link 
            to="/register" 
            className="block w-full py-3 px-6 rounded-xl bg-white border-2 border-primary text-primary font-bold text-center hover:bg-primary hover:text-white transition-all transform hover:scale-105"
          >
            🎯 S'INSCRIRE
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-text/70 hover:text-primary font-medium text-sm transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

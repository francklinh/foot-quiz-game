import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Register() {
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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('🔄 Register - Session existante trouvée:', session.user.email);
        navigate('/home');
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Register - Changement d\'état d\'authentification:', event, session?.user?.email);
      if (session?.user) {
        console.log('✅ Register - Utilisateur connecté, redirection vers /home');
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

    try {
      console.log('🔄 Tentative d\'inscription pour:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            pseudo: pseudo || email.split('@')[0],
            country: country,
          },
          emailRedirectTo: 'http://localhost:3000/home'
        }
      });

      if (error) {
        console.error('❌ Erreur inscription:', error);
        setError(error.message);
      } else {
        console.log('✅ Utilisateur créé:', data.user?.id);
        setSuccess('Compte créé avec succès ! Un email de confirmation a été envoyé. Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.');
        
        // Rediriger vers login après inscription
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('💥 Erreur lors de l\'inscription:', err);
      setError(err.message || 'Erreur lors de la création du compte');
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
          <div className="text-6xl mb-2">🎯</div>
          <h2 className="text-3xl font-black text-primary mb-2">INSCRIPTION</h2>
          <p className="text-sm text-text/70">Rejoignez l'équipe !</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="pseudo" className="block text-sm font-bold text-text mb-1">👤 Pseudo</label>
            <input
              type="text"
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-primary/30 bg-white font-medium text-text focus:outline-none focus:border-primary transition-colors duration-200"
              placeholder="Votre pseudo de champion"
            />
          </div>
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
            <label htmlFor="country" className="block text-sm font-bold text-text mb-1">🌍 Pays</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-primary/30 bg-white font-medium text-text focus:outline-none focus:border-primary transition-colors duration-200"
            >
              {PAYS_OPTIONS.map((pays) => (
                <option key={pays} value={pays}>
                  {pays}
                </option>
              ))}
            </select>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-text mb-1">🔒 Confirmer</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? '⚽ CHARGEMENT...' : '🎯 S\'INSCRIRE'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-primary/20">
          <p className="text-center text-sm font-medium text-text mb-4">
            Déjà un compte ?
          </p>
          <Link 
            to="/login" 
            className="block w-full py-3 px-6 rounded-xl bg-white border-2 border-primary text-primary font-bold text-center hover:bg-primary hover:text-white transition-all transform hover:scale-105"
          >
            ⚽ SE CONNECTER
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
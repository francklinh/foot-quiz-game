import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { simpleSupabaseAuthService } from '../services/simple-supabase-auth.service';

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const currentUser = simpleSupabaseAuthService.getCurrentUser();
    if (currentUser) {
      console.log('✅ Utilisateur déjà connecté, redirection vers l\'accueil');
      navigate('/home');
    }

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = simpleSupabaseAuthService.onAuthStateChange((user) => {
      if (user) {
        console.log('✅ Utilisateur connecté, redirection vers l\'accueil');
        navigate('/home');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await simpleSupabaseAuthService.signInWithMagicLink(email);
      
      if (result.success) {
        setSuccess(result.error || 'Magic link envoyé ! Vérifiez votre email.');
      } else {
        setError(result.error || 'Erreur lors de l\'envoi du magic link');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Connexion</h2>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Votre adresse email"
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
            {loading ? 'Envoi en cours...' : 'Envoyer le lien magique'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            S'inscrire
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
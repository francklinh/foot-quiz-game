// Page de callback pour l'authentification Supabase
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Traitement du callback d\'authentification...');
        
        // Récupérer la session depuis l'URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erreur callback:', error);
          navigate('/login?error=callback_error');
          return;
        }

        if (data.session?.user) {
          console.log('✅ Authentification réussie via callback');
          navigate('/home');
        } else {
          console.log('⚠️ Aucune session trouvée');
          navigate('/login');
        }
      } catch (error) {
        console.error('❌ Erreur callback:', error);
        navigate('/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Authentification en cours...</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous vous connectons.</p>
      </div>
    </div>
  );
}





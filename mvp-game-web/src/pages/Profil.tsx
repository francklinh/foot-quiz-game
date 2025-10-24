import { useState, useEffect } from "react";
import { GlobalHeader } from "../components/GlobalHeader";
import { CerisesDisplay } from "../components/CerisesDisplay";
import { FriendsList } from "../components/FriendsList";
import { ChallengesList } from "../components/ChallengesList";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  pseudo: string;
  email: string | null;
  pays: string;
  photo: string;
};

const PAYS_OPTIONS = [
  "France", "Brésil", "Argentine", "Espagne", "Angleterre", "Allemagne",
  "Italie", "Portugal", "Pays-Bas", "Belgique", "Pologne", "Croatie",
  "Norvège", "Égypte", "Corée du Sud", "Nigeria", "Canada", "Maroc",
  "Sénégal", "Algérie", "Tunisie", "Côte d'Ivoire", "Ghana", "Cameroun"
];

const AVATAR_OPTIONS = [
  "👤", "⚽", "🏆", "🥅", "⚽", "🎯", "🔥", "⭐", "💪", "🚀"
];

export function Profil() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Charger l'utilisateur depuis Supabase
    const loadUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Profil - Erreur session:', error);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        console.log('✅ Profil - Utilisateur chargé:', session.user.email);
      } else {
        console.log('❌ Profil - Aucun utilisateur connecté');
      }
    };

    loadUser();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Profil - Changement d\'état:', event, session?.user?.email);
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    if (user) {
      const updatedUser = { ...user, [field]: value };
      setUser(updatedUser);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    if (user) {
      try {
        // Sauvegarder via Supabase
        const { error } = await supabase.auth.updateUser({
          data: {
            pseudo: user.user_metadata?.pseudo || user.email?.split('@')[0],
            country: user.user_metadata?.country || 'France'
          }
        });
        
        if (error) {
          alert(`Erreur: ${error.message}`);
        } else {
          setIsEditing(false);
          setHasChanges(false);
          alert("Profil sauvegardé ! ✅");
        }
      } catch (error: any) {
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHasChanges(false);
    // Recharger les données originales
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {user ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Photo de profil */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">
                  👤
                </div>
                {isEditing && (
                  <button
                    onClick={() => {/* Logique de sélection de photo */}}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors duration-200"
                  >
                    ✏️
                  </button>
                )}
              </div>
            </div>

            {/* Formulaire */}
            <div className="space-y-6">
              {/* PLAYER ID */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2 italic">
                  PLAYER ID
                </label>
                <input
                  type="text"
                  value={user.user_metadata?.pseudo || user.email?.split('@')[0] || ''}
                  onChange={(e) => handleInputChange('pseudo', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-lg border-2 transition-colors duration-200 ${
                    isEditing 
                      ? 'border-primary bg-accent text-text focus:outline-none focus:border-primary-dark' 
                      : 'border-primary bg-white text-text'
                  }`}
                />
              </div>

              {/* MAIL */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2 italic">
                  MAIL
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-lg border-2 transition-colors duration-200 ${
                    isEditing 
                      ? 'border-primary bg-accent text-text focus:outline-none focus:border-primary-dark' 
                      : 'border-primary bg-white text-text'
                  }`}
                />
              </div>

              {/* COUNTRY */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2 italic">
                  COUNTRY
                </label>
                <select
                  value={user.user_metadata?.country || 'France'}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-lg border-2 transition-colors duration-200 ${
                    isEditing 
                      ? 'border-primary bg-accent text-text focus:outline-none focus:border-primary-dark' 
                      : 'border-primary bg-white text-text'
                  }`}
                >
                  {PAYS_OPTIONS.map(pays => (
                    <option key={pays} value={pays}>{pays}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-center gap-4 mt-8">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors duration-200 shadow-lg"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors duration-200 shadow-lg"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`px-8 py-3 font-bold rounded-xl transition-colors duration-200 shadow-lg ${
                    hasChanges
                      ? 'bg-primary hover:bg-primary-dark text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  SAVE
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-500">Veuillez vous connecter pour voir votre profil</p>
          </div>
        )}

        {/* Section Cerises */}
        {user && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Mes Cerises</h2>
            <CerisesDisplay 
              userId={user.id} 
              className="text-center"
            />
          </div>
        )}

        {/* Section Amis */}
        {user && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <FriendsList userId={user.id} />
          </div>
        )}

        {/* Section Défis */}
        {user && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <ChallengesList userId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
}

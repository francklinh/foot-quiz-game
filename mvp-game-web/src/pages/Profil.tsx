import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { GlobalHeader } from "../components/GlobalHeader";

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
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    pseudo: "",
    email: null,
    pays: "France",
    photo: "👤"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);
      if (email && session?.user) {
        setProfile(prev => ({
          ...prev,
          id: session.user.id,
          email: email,
          pseudo: email.split('@')[0]
        }));
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        const email = data.session.user.email;
        setUserEmail(email);
        setProfile(prev => ({
          ...prev,
          id: data.session!.user.id,
          email: email,
          pseudo: email.split('@')[0]
        }));
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Ici on pourrait sauvegarder en base de données
    console.log("Sauvegarde du profil:", profile);
    setIsEditing(false);
    setHasChanges(false);
    alert("Profil sauvegardé ! ✅");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHasChanges(false);
    // Recharger les données originales
    if (userEmail) {
      setProfile(prev => ({
        ...prev,
        pseudo: userEmail.split('@')[0],
        pays: "France"
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Photo de profil */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">
                {profile.photo}
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
                value={profile.pseudo}
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
                value={profile.email || ""}
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
                value={profile.pays}
                onChange={(e) => handleInputChange('pays', e.target.value)}
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
          <div className="flex justify-center mt-8">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors duration-200 shadow-lg"
              >
                Modifier
              </button>
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
      </div>
    </div>
  );
}

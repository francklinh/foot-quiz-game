import React, { useState, useEffect } from 'react';
import { simpleAuthService, SimpleUser } from '../services/simple-auth.service';

export function SimpleAuth() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const currentUser = simpleAuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      console.log('✅ Utilisateur trouvé au démarrage:', currentUser);
    }
  }, []);


  const handleAutoLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const autoUser = await simpleAuthService.autoLogin(email);
      setUser(autoUser);
      setSuccess(`✅ Connexion automatique réussie ! Bienvenue ${autoUser.pseudo}`);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    simpleAuthService.logout();
    setUser(null);
    setSuccess('✅ Déconnexion réussie');
  };

  const handleUpdateProfile = (field: keyof SimpleUser, value: string) => {
    if (user) {
      const updatedUser = { ...user, [field]: value };
      simpleAuthService.updateProfile(updatedUser);
      setUser(updatedUser);
    }
  };

  // Si connecté, afficher le profil
  if (user) {
    return (
      <div className="p-6 bg-green-100 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-green-800">✅ Connecté</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => handleUpdateProfile('email', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Pseudo</label>
            <input
              type="text"
              value={user.pseudo}
              onChange={(e) => handleUpdateProfile('pseudo', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Pays</label>
            <input
              type="text"
              value={user.country}
              onChange={(e) => handleUpdateProfile('country', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Déconnexion
          </button>
        </div>
      </div>
    );
  }

  // Si pas connecté, afficher le formulaire de connexion automatique
  return (
    <div className="p-6 bg-blue-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-blue-800">🔐 Connexion Simple</h3>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      
      <div className="space-y-4">
        {/* Connexion automatique */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg"
            required
          />
          <button
            onClick={handleAutoLogin}
            disabled={loading || !email}
            className="w-full px-4 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 text-lg font-semibold"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        {/* Boutons de test rapide */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">Ou utilisez un email de test :</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setEmail('franck.handou@gmail.com')}
              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Franck
            </button>
            <button
              onClick={() => setEmail('test.user@gmail.com')}
              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Test User
            </button>
            <button
              onClick={() => setEmail('demo@example.com')}
              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

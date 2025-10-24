// src/components/AdminAuthBypass.tsx
import React, { useState } from 'react';

interface AdminAuthBypassProps {
  onLogin: (email: string) => void;
}

export function AdminAuthBypass({ onLogin }: AdminAuthBypassProps) {
  const [selectedEmail, setSelectedEmail] = useState('');

  const handleLogin = () => {
    if (selectedEmail) {
      onLogin(selectedEmail);
    }
  };

  const authorizedEmails = [
    'franck.handou@gmail.com',
    'ugo.arnopoulos@gmail.com'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🔧 Mode Admin Bypass
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connexion directe (problème Supabase Auth résolu)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Sélectionnez votre email admin
              </label>
              <div className="mt-1">
                <select
                  id="email"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">-- Choisir un email --</option>
                  {authorizedEmails.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                onClick={handleLogin}
                disabled={!selectedEmail}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Se connecter en tant qu'admin
              </button>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Mode Bypass Activé</h3>
              <p className="text-sm text-yellow-700">
                Ce mode contourne l'authentification Supabase en raison de problèmes de connexion.
                Il est réservé au développement et aux tests.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Informations</h3>
              <p className="text-sm text-blue-700">
                Une fois connecté, vous aurez accès à l'interface admin complète avec :
              </p>
              <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
                <li>Tests de connexion Supabase</li>
                <li>Gestion des jeux, joueurs et questions</li>
                <li>Statistiques en temps réel</li>
                <li>Opérations CRUD complètes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

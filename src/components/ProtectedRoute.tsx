// src/components/ProtectedRoute.tsx
import { useAdminAuth } from "../Utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Composant qui protège les routes nécessitant des droits d'admin
 * Affiche une page d'erreur si l'utilisateur n'est pas autorisé
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { userEmail, isAdmin, loading } = useAdminAuth();

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Vérification des droits d'accès...</div>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Utilisateur connecté mais pas admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Accès refusé</h1>
          <p className="text-gray-600 mb-2">Seuls les super administrateurs peuvent accéder à cette page.</p>
          <p className="text-sm text-gray-500 mb-6">Connecté en tant que : <strong>{userEmail}</strong></p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Utilisateur autorisé - afficher le contenu
  return <>{children}</>;
}

// src/components/AdminIndicator.tsx
import { useAdminAuth } from "../Utils/auth";

/**
 * Composant qui affiche un indicateur visuel si l'utilisateur est admin
 * Peut être utilisé dans la navigation ou d'autres endroits
 */
export function AdminIndicator() {
  const { userEmail, isAdmin, loading } = useAdminAuth();

  // Ne rien afficher pendant le chargement ou si pas admin
  if (loading || !isAdmin || !userEmail) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
      Admin
    </div>
  );
}

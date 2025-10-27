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
    <div className="flex items-center gap-2 px-3 py-1 bg-secondary/20 text-secondary-dark rounded-full text-xs font-semibold border border-secondary/30">
      <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
      Admin
    </div>
  );
}

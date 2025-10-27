// src/pages/Admin.tsx
import React, { useState } from "react";
import { AdminDashboard } from "../components/AdminDashboard";
import { AdminAuthBypass } from "../components/AdminAuthBypass";
import { useAdminAuth } from "../Utils/auth";

export function Admin() {
  const { isAdmin, loading } = useAdminAuth();
  const [bypassAuth, setBypassAuth] = useState(false);
  const [bypassEmail, setBypassEmail] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Vérification des droits d'administration...</div>
        </div>
      </div>
    );
  }

  const handleBypassLogin = (email: string) => {
    setBypassEmail(email);
    setBypassAuth(true);
  };

  // Si on utilise le bypass, afficher le dashboard
  if (bypassAuth && bypassEmail) {
    return <AdminDashboard />;
  }

  // Si pas admin et pas de bypass, afficher les options de connexion
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <AdminAuthBypass onLogin={handleBypassLogin} />
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Essayer l'authentification Supabase normale
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
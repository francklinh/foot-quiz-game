// src/utils/auth.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// 🔐 Liste des super admins autorisés
export const SUPER_ADMIN_EMAILS = [
  "franck.handou@gmail.com", // Votre email principal (avec point)
  "ugo.arnopoulos@gmail.com", // Ajoutez d'autres emails d'admins ici
  // "admin2@example.com",
  // "admin3@example.com",
];

/**
 * Vérifie si l'utilisateur actuel est un super admin
 * @returns Promise<boolean> - true si l'utilisateur est un super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return false;
    }
    
    return SUPER_ADMIN_EMAILS.includes(session.user.email);
  } catch (error) {
    console.error("Erreur lors de la vérification des droits d'admin:", error);
    return false;
  }
}

/**
 * Récupère l'email de l'utilisateur actuellement connecté
 * @returns Promise<string | null> - L'email de l'utilisateur ou null si non connecté
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'email:", error);
    return null;
  }
}

/**
 * Hook pour vérifier les droits d'admin en temps réel
 * @returns { userEmail: string | null, isAdmin: boolean, loading: boolean }
 */
export function useAdminAuth() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const email = await getCurrentUserEmail();
        setUserEmail(email);
        
        if (email) {
          setIsAdmin(SUPER_ADMIN_EMAILS.includes(email));
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
        setUserEmail(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || null;
      setUserEmail(email);
      
      if (email) {
        setIsAdmin(SUPER_ADMIN_EMAILS.includes(email));
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userEmail, isAdmin, loading };
}

// Force TypeScript to recognize this as a module
export {};
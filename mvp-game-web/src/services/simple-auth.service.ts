// Service d'authentification ultra-simple
const SUPABASE_URL = 'https://qahbsyolfvujrpblnrvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA';

// Stockage local simple
const STORAGE_KEY = 'simple_auth_user';

export interface SimpleUser {
  id: string;
  email: string;
  pseudo: string;
  country: string;
}

class SimpleAuthService {
  private currentUser: SimpleUser | null = null;

  constructor() {
    // Charger l'utilisateur depuis le localStorage au démarrage
    this.loadFromStorage();
  }

  // Charger depuis le localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        console.log('✅ Utilisateur chargé depuis localStorage:', this.currentUser);
      }
    } catch (error) {
      console.error('❌ Erreur chargement localStorage:', error);
      this.currentUser = null;
    }
  }

  // Sauvegarder dans le localStorage
  private saveToStorage(user: SimpleUser) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      console.log('✅ Utilisateur sauvegardé dans localStorage:', user);
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }
  }

  // Supprimer du localStorage
  private clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ localStorage vidé');
    } catch (error) {
      console.error('❌ Erreur suppression localStorage:', error);
    }
  }


  // Connexion automatique (sans mot de passe)
  async autoLogin(email: string): Promise<SimpleUser> {
    console.log('🔄 Connexion automatique pour:', email);
    
    // Créer un utilisateur simple sans vérification
    const user: SimpleUser = {
      id: `user_${Date.now()}`,
      email,
      pseudo: email.split('@')[0],
      country: 'France'
    };

    // Sauvegarder et définir comme utilisateur actuel
    this.currentUser = user;
    this.saveToStorage(user);

    console.log('✅ Connexion automatique réussie:', user);
    return user;
  }

  // Déconnexion
  logout() {
    console.log('🔄 Déconnexion');
    this.currentUser = null;
    this.clearStorage();
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): SimpleUser | null {
    return this.currentUser;
  }

  // Vérifier si connecté
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Mettre à jour le profil
  updateProfile(updates: Partial<SimpleUser>) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates };
      this.saveToStorage(this.currentUser);
      console.log('✅ Profil mis à jour:', this.currentUser);
    }
  }
}

// Instance unique
export const simpleAuthService = new SimpleAuthService();

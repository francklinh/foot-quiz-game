// Service d'authentification Supabase simplifié
import { supabase } from '../lib/supabase';

export interface SimpleUser {
  id: string;
  email: string;
  pseudo?: string;
  country?: string;
}

export interface AuthResult {
  success: boolean;
  user?: SimpleUser;
  error?: string;
}

class SimpleSupabaseAuthService {
  private currentUser: SimpleUser | null = null;

  constructor() {
    // Charger la session existante au démarrage
    this.loadSession();
  }

  // Charger la session existante
  private async loadSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.currentUser = {
          id: session.user.id,
          email: session.user.email || '',
          pseudo: session.user.user_metadata?.pseudo || session.user.email?.split('@')[0] || '',
          country: session.user.user_metadata?.country || 'France'
        };
        console.log('✅ Session chargée:', this.currentUser);
      }
    } catch (error) {
      console.error('❌ Erreur chargement session:', error);
    }
  }

  // Inscription simplifiée
  async signUp(email: string, password: string, pseudo?: string, country?: string): Promise<AuthResult> {
    try {
      console.log('🔄 Inscription en cours...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            pseudo: pseudo || email.split('@')[0],
            country: country || 'France'
          },
          emailRedirectTo: undefined // Désactiver la confirmation email
        }
      });

      if (error) {
        console.error('❌ Erreur inscription:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser = {
          id: data.user.id,
          email: data.user.email || '',
          pseudo: data.user.user_metadata?.pseudo || pseudo || email.split('@')[0],
          country: data.user.user_metadata?.country || country || 'France'
        };

        console.log('✅ Inscription réussie:', this.currentUser);
        return { success: true, user: this.currentUser };
      }

      return { success: false, error: 'Erreur lors de la création du compte' };
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  }

  // Connexion simplifiée
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔄 Connexion en cours...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erreur connexion:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser = {
          id: data.user.id,
          email: data.user.email || '',
          pseudo: data.user.user_metadata?.pseudo || data.user.email?.split('@')[0] || '',
          country: data.user.user_metadata?.country || 'France'
        };

        console.log('✅ Connexion réussie:', this.currentUser);
        return { success: true, user: this.currentUser };
      }

      return { success: false, error: 'Erreur lors de la connexion' };
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  }

  // Connexion par magic link
  async signInWithMagicLink(email: string): Promise<AuthResult> {
    try {
      console.log('🔄 Envoi du magic link...');
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ Erreur magic link:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Magic link envoyé');
      return { success: true, error: 'Vérifiez votre email et cliquez sur le lien' };
    } catch (error: any) {
      console.error('❌ Erreur magic link:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
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
  async updateProfile(updates: Partial<SimpleUser>): Promise<AuthResult> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          pseudo: updates.pseudo,
          country: updates.country
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser = {
          ...this.currentUser,
          pseudo: data.user.user_metadata?.pseudo || this.currentUser.pseudo,
          country: data.user.user_metadata?.country || this.currentUser.country
        };
        return { success: true, user: this.currentUser };
      }

      return { success: false, error: 'Erreur lors de la mise à jour' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  }

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: SimpleUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUser = {
          id: session.user.id,
          email: session.user.email || '',
          pseudo: session.user.user_metadata?.pseudo || session.user.email?.split('@')[0] || '',
          country: session.user.user_metadata?.country || 'France'
        };
      } else {
        this.currentUser = null;
      }
      callback(this.currentUser);
    });
  }
}

// Instance unique
export const simpleSupabaseAuthService = new SimpleSupabaseAuthService();





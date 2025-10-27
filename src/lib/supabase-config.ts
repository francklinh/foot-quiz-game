// Configuration Supabase avec gestion d'erreurs
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Configuration Supabase
const SUPABASE_URL = "https://qahbsyolfvujrpblnrvy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA";

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          pseudo: string;
          cerises_balance: number;
          total_score: number;
          games_played: number;
          win_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          pseudo: string;
          cerises_balance?: number;
          total_score?: number;
          games_played?: number;
          win_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          pseudo?: string;
          cerises_balance?: number;
          total_score?: number;
          games_played?: number;
          win_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          name: string;
          nationality: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nationality: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nationality?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      theme_answers: {
        Row: {
          id: string;
          theme_id: string;
          answer: string;
          answer_norm: string;
          ranking: number;
          goals: number;
          assists: number;
          value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          theme_id: string;
          answer: string;
          answer_norm: string;
          ranking: number;
          goals: number;
          assists: number;
          value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          theme_id?: string;
          answer?: string;
          answer_norm?: string;
          ranking?: number;
          goals?: number;
          assists?: number;
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Création du client Supabase avec gestion d'erreurs
let supabaseClient: SupabaseClient<Database> | null = null;

export const createSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    try {
      supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création du client Supabase:', error);
      throw new Error('Impossible de se connecter à Supabase');
    }
  }
  return supabaseClient;
};

// Export du client par défaut
export const supabase = createSupabaseClient();

// Fonction de test de connexion
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  error?: string;
  tables?: string[];
}> => {
  try {
    // Test de connexion de base
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      throw error;
    }

    // Test des tables principales
    const tables = ['users', 'players', 'themes', 'theme_answers'];
    const availableTables: string[] = [];
    
    for (const table of tables) {
      try {
        await supabase.from(table as any).select('id').limit(1);
        availableTables.push(table);
      } catch (err) {
        console.log(`Table ${table} non accessible:`, err);
      }
    }

    return {
      success: true,
      tables: availableTables
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction de vérification de l'authentification
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error: any) {
    return { session: null, error: error.message };
  }
};

// Configuration des RLS (Row Level Security)
export const RLS_POLICIES = {
  users: {
    select: "auth.uid() = id",
    update: "auth.uid() = id",
    insert: "auth.uid() = id"
  },
  players: {
    select: "true", // Public read
    insert: "auth.role() = 'service_role'", // Admin only
    update: "auth.role() = 'service_role'", // Admin only
    delete: "auth.role() = 'service_role'" // Admin only
  },
  themes: {
    select: "true", // Public read
    insert: "auth.role() = 'service_role'", // Admin only
    update: "auth.role() = 'service_role'", // Admin only
    delete: "auth.role() = 'service_role'" // Admin only
  }
};

export default supabase;





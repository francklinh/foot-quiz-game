// Configuration Supabase avec URL forcée
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qahbsyolfvujrpblnrvy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA";

// Fonction fetch personnalisée qui force l'URL correcte
const customFetch = (url: string | URL | Request, options?: RequestInit) => {
  const urlString = url.toString();
  const correctedUrl = urlString.replace('.supabase.com', '.supabase.co');
  return fetch(correctedUrl, options);
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Changement de 'implicit' vers 'pkce'
    storage: {
      getItem: (key: string) => {
        return localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    },
    fetch: customFetch
  }
});
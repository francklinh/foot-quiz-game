export interface UserData {
  email: string;
  password: string;
  pseudo: string;
  country?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export interface SessionResult {
  session?: any;
  error?: string;
}

export class AuthService {
  async register(userData: UserData): Promise<AuthResult> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            pseudo: userData.pseudo,
            country: userData.country,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed',
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  async logout(): Promise<AuthResult> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Logout failed',
      };
    }
  }

  async getCurrentSession(): Promise<SessionResult> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return {
          error: error.message,
        };
      }

      return {
        session: data.session,
      };
    } catch (error) {
      return {
        error: 'Failed to get session',
      };
    }
  }
}





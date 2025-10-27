import { AuthService } from '../auth.service';

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    test('should register new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        pseudo: 'testuser',
        country: 'FRA',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123', email: userData.email } },
        error: null,
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            pseudo: userData.pseudo,
            country: userData.country,
          },
        },
      });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    test('should handle registration errors', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: '123',
        pseudo: 'a',
        country: 'FRA',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email format' },
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });
  });

  describe('User Login', () => {
    test('should login user successfully', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: 'user-123', email: credentials.email },
          session: { access_token: 'token-123' }
        },
        error: null,
      });

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    test('should handle login errors', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('User Logout', () => {
    test('should logout user successfully', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const result = await authService.logout();

      // Assert
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('Session Management', () => {
    test('should get current session', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Act
      const result = await authService.getCurrentSession();

      // Assert
      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
      expect(result.session).toEqual(mockSession);
    });
  });
});





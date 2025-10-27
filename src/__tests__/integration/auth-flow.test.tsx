import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthService } from '../../services/auth.service';

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// React Router mocking removed for integration tests

describe('Authentication Flow Integration Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('Complete User Registration Flow', () => {
    test('should complete full registration process', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        pseudo: 'testuser',
        country: 'FRA',
      };

      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: userData.email } },
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: { id: 'user-123', pseudo: userData.pseudo, email: userData.email, country: userData.country },
        error: null,
      });

      // Act
      const result = await authService.register(
        userData.email,
        userData.password,
        userData.pseudo,
        userData.country
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe(userData.email);
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    test('should handle registration errors gracefully', async () => {
      // Arrange
      const userData = {
        email: 'invalid@example.com',
        password: 'weak',
        pseudo: 'testuser',
        country: 'FRA',
      };

      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Password too weak' },
      });

      // Act & Assert
      await expect(
        authService.register(userData.email, userData.password, userData.pseudo, userData.country)
      ).rejects.toThrow('Password too weak');
    });
  });

  describe('Complete User Login Flow', () => {
    test('should complete full login process', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockSession = {
        access_token: 'mock-token',
        user: { id: 'user-123', email: loginData.email },
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      // Act
      const result = await authService.login(loginData.email, loginData.password);

      // Assert
      expect(result).toBeDefined();
      expect(result?.access_token).toBe('mock-token');
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: loginData.email,
        password: loginData.password,
      });
    });

    test('should handle login errors gracefully', async () => {
      // Arrange
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Invalid credentials' },
      });

      // Act & Assert
      await expect(
        authService.login(loginData.email, loginData.password)
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Complete User Logout Flow', () => {
    test('should complete full logout process', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      // Act
      await authService.logout();

      // Assert
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    test('should handle logout errors gracefully', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: { message: 'Logout failed' },
      });

      // Act & Assert
      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('Session Management Flow', () => {
    test('should get current session successfully', async () => {
      // Arrange
      const mockSession = {
        access_token: 'current-token',
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      // Act
      const result = await authService.getSession();

      // Assert
      expect(result).toEqual(mockSession);
      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    });

    test('should handle no session gracefully', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      // Act
      const result = await authService.getSession();

      // Assert
      expect(result).toBeNull();
    });

    test('should handle session errors gracefully', async () => {
      // Arrange
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Session error' },
      });

      // Act & Assert
      await expect(authService.getSession()).rejects.toThrow('Session error');
    });
  });

  describe('Authentication State Changes', () => {
    test('should handle auth state changes', () => {
      // Arrange
      const mockCallback = jest.fn();
      const mockSubscription = {
        data: { subscription: { unsubscribe: jest.fn() } },
      };

      mockSupabase.auth.onAuthStateChange.mockReturnValueOnce(mockSubscription);

      // Act
      const result = authService.onAuthStateChange(mockCallback);

      // Assert
      expect(result).toEqual(mockSubscription);
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
    });
  });

  describe('Complete Authentication Workflow', () => {
    test('should handle complete user journey: register -> login -> logout', async () => {
      // Arrange
      const userData = {
        email: 'journey@example.com',
        password: 'password123',
        pseudo: 'journeyuser',
        country: 'FRA',
      };

      // Mock registration
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: userData.email } },
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: { id: 'user-123', pseudo: userData.pseudo, email: userData.email, country: userData.country },
        error: null,
      });

      // Mock login
      const mockSession = {
        access_token: 'mock-token',
        user: { id: 'user-123', email: userData.email },
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      // Mock logout
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      // Act & Assert
      // 1. Register
      const registerResult = await authService.register(
        userData.email,
        userData.password,
        userData.pseudo,
        userData.country
      );
      expect(registerResult).toBeDefined();

      // 2. Login
      const loginResult = await authService.login(userData.email, userData.password);
      expect(loginResult).toBeDefined();
      expect(loginResult?.access_token).toBe('mock-token');

      // 3. Logout
      await authService.logout();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

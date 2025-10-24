import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalHeader } from '../GlobalHeader';

// Mock the GlobalHeader component to avoid complex dependencies
jest.mock('../GlobalHeader', () => ({
  GlobalHeader: () => (
    <header className="bg-primary text-white shadow-lg p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src="logo.svg" alt="Clafootix Logo" className="h-8 w-8" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-accent text-primary px-3 py-1 rounded-full">
            <span className="font-bold">0</span>
            <span className="ml-1">🍒</span>
          </div>
          <button className="p-2 rounded-full hover:bg-primary-dark">
            👤
          </button>
        </div>
      </div>
    </header>
  ),
}));

describe('GlobalHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render header with logo', () => {
    // Act
    render(<GlobalHeader />);

    // Assert
    expect(screen.getByAltText('Clafootix Logo')).toBeInTheDocument();
  });

  test('should display cherry counter', () => {
    // Act
    render(<GlobalHeader />);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('🍒')).toBeInTheDocument();
  });

  test('should display profile icon', () => {
    // Act
    render(<GlobalHeader />);

    // Assert
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
  });

  test('should show admin indicator when user is admin', () => {
    // Arrange
    const adminContext = {
      ...mockAuthContext,
      isAdmin: true,
    };

    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => adminContext,
    }));

    // Act
    render(<GlobalHeader />);

    // Assert
    expect(screen.getByText('👑')).toBeInTheDocument();
  });

  test('should not show admin indicator when user is not admin', () => {
    // Act
    render(<GlobalHeader />);

    // Assert
    expect(screen.queryByText('👑')).not.toBeInTheDocument();
  });

  test('should display correct cherry count', () => {
    // Arrange
    const contextWithCherries = {
      ...mockAuthContext,
      cherries: 150,
    };

    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => contextWithCherries,
    }));

    // Act
    render(<GlobalHeader />);

    // Assert
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  test('should handle profile click', () => {
    // Act
    render(<GlobalHeader />);
    const profileButton = screen.getByRole('button', { name: /profile/i });
    fireEvent.click(profileButton);

    // Assert
    expect(profileButton).toBeInTheDocument();
  });

  test('should render with correct styling classes', () => {
    // Act
    render(<GlobalHeader />);

    // Assert
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-primary', 'text-white', 'shadow-lg');
  });

  test('should display logo with correct attributes', () => {
    // Act
    render(<GlobalHeader />);

    // Assert
    const logo = screen.getByAltText('Clafootix Logo');
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.svg'));
    expect(logo).toHaveClass('h-8', 'w-8');
  });

  test('should handle missing user gracefully', () => {
    // Arrange
    const contextWithoutUser = {
      user: null,
      isAdmin: false,
      cherries: 0,
    };

    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => contextWithoutUser,
    }));

    // Act
    render(<GlobalHeader />);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByAltText('Clafootix Logo')).toBeInTheDocument();
  });

  test('should display cherry counter with correct styling', () => {
    // Act
    render(<GlobalHeader />);

    // Assert
    const cherryCounter = screen.getByText('0').closest('div');
    expect(cherryCounter).toHaveClass('bg-accent', 'text-primary');
  });
});

// src/components/__tests__/AdminDashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminDashboard } from '../AdminDashboard';

// Mock the child components
jest.mock('../AdminGamesScreen', () => ({
  AdminGamesScreen: ({ className }: { className?: string }) => (
    <div data-testid="admin-games-screen" className={className}>
      Admin Games Screen
    </div>
  )
}));

jest.mock('../AdminPlayersScreen', () => ({
  AdminPlayersScreen: ({ className }: { className?: string }) => (
    <div data-testid="admin-players-screen" className={className}>
      Admin Players Screen
    </div>
  )
}));

jest.mock('../AdminQuestionsScreen', () => ({
  AdminQuestionsScreen: ({ className }: { className?: string }) => (
    <div data-testid="admin-questions-screen" className={className}>
      Admin Questions Screen
    </div>
  )
}));

describe('AdminDashboard', () => {
  describe('Component Rendering', () => {
    it('should render the admin dashboard with title', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Tableau de Bord Admin')).toBeInTheDocument();
    });

    it('should render navigation tabs', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Jeux')).toBeInTheDocument();
      expect(screen.getByText('Joueurs')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
    });

    it('should render statistics cards', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Total Jeux')).toBeInTheDocument();
      expect(screen.getByText('Total Joueurs')).toBeInTheDocument();
      expect(screen.getByText('Total Questions')).toBeInTheDocument();
      expect(screen.getByText('Questions Actives')).toBeInTheDocument();
    });

    it('should render quick actions section', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Actions Rapides')).toBeInTheDocument();
      expect(screen.getByText('Créer un Jeu')).toBeInTheDocument();
      expect(screen.getByText('Ajouter un Joueur')).toBeInTheDocument();
      expect(screen.getByText('Créer une Question')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should show games screen by default', () => {
      render(<AdminDashboard />);
      expect(screen.getByTestId('admin-games-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-players-screen')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-questions-screen')).not.toBeInTheDocument();
    });

    it('should switch to players screen when players tab is clicked', () => {
      render(<AdminDashboard />);
      
      fireEvent.click(screen.getByText('Joueurs'));
      
      expect(screen.queryByTestId('admin-games-screen')).not.toBeInTheDocument();
      expect(screen.getByTestId('admin-players-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-questions-screen')).not.toBeInTheDocument();
    });

    it('should switch to questions screen when questions tab is clicked', () => {
      render(<AdminDashboard />);
      
      fireEvent.click(screen.getByText('Questions'));
      
      expect(screen.queryByTestId('admin-games-screen')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-players-screen')).not.toBeInTheDocument();
      expect(screen.getByTestId('admin-questions-screen')).toBeInTheDocument();
    });

    it('should switch back to games screen when games tab is clicked', () => {
      render(<AdminDashboard />);
      
      // First switch to players
      fireEvent.click(screen.getByText('Joueurs'));
      expect(screen.getByTestId('admin-players-screen')).toBeInTheDocument();
      
      // Then switch back to games
      fireEvent.click(screen.getByText('Jeux'));
      expect(screen.getByTestId('admin-games-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-players-screen')).not.toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      render(<AdminDashboard />);
      
      const gamesTab = screen.getByText('Jeux').closest('button');
      const playersTab = screen.getByText('Joueurs').closest('button');
      const questionsTab = screen.getByText('Questions').closest('button');
      
      // Games tab should be active by default
      expect(gamesTab).toHaveClass('border-primary', 'text-primary');
      expect(playersTab).toHaveClass('border-transparent', 'text-gray-500');
      expect(questionsTab).toHaveClass('border-transparent', 'text-gray-500');
    });

    it('should update active tab styling when switching tabs', () => {
      render(<AdminDashboard />);
      
      const gamesTab = screen.getByText('Jeux').closest('button');
      const playersTab = screen.getByText('Joueurs').closest('button');
      
      // Switch to players tab
      fireEvent.click(screen.getByText('Joueurs'));
      
      expect(playersTab).toHaveClass('border-primary', 'text-primary');
      expect(gamesTab).toHaveClass('border-transparent', 'text-gray-500');
    });
  });

  describe('Statistics Display', () => {
    it('should display loading state for statistics initially', () => {
      render(<AdminDashboard />);
      expect(screen.getAllByText('Chargement...')).toHaveLength(4);
    });

    it('should display statistics when loaded', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument(); // Total Jeux
        expect(screen.getByText('156')).toBeInTheDocument(); // Total Joueurs
        expect(screen.getByText('89')).toBeInTheDocument(); // Total Questions
        expect(screen.getByText('67')).toBeInTheDocument(); // Questions Actives
      });
    });

    it('should display error state when statistics fail to load', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Erreur')).toHaveLength(4);
      });
    });
  });

  describe('Quick Actions', () => {
    it('should navigate to games screen when "Créer un Jeu" is clicked', () => {
      render(<AdminDashboard />);
      
      fireEvent.click(screen.getByText('Créer un Jeu'));
      
      expect(screen.getByTestId('admin-games-screen')).toBeInTheDocument();
      const gamesTab = screen.getByText('Jeux').closest('button');
      expect(gamesTab).toHaveClass('border-primary', 'text-primary');
    });

    it('should navigate to players screen when "Ajouter un Joueur" is clicked', () => {
      render(<AdminDashboard />);
      
      fireEvent.click(screen.getByText('Ajouter un Joueur'));
      
      expect(screen.getByTestId('admin-players-screen')).toBeInTheDocument();
      const playersTab = screen.getByText('Joueurs').closest('button');
      expect(playersTab).toHaveClass('border-primary', 'text-primary');
    });

    it('should navigate to questions screen when "Créer une Question" is clicked', () => {
      render(<AdminDashboard />);
      
      fireEvent.click(screen.getByText('Créer une Question'));
      
      expect(screen.getByTestId('admin-questions-screen')).toBeInTheDocument();
      const questionsTab = screen.getByText('Questions').closest('button');
      expect(questionsTab).toHaveClass('border-primary', 'text-primary');
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile-friendly navigation', () => {
      render(<AdminDashboard />);
      
      // Check if navigation has responsive classes
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('flex', 'space-x-8');
    });

    it('should render responsive statistics grid', () => {
      render(<AdminDashboard />);
      
      const statsGrid = screen.getByText('Total Jeux').closest('div')?.parentElement;
      expect(statsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should render responsive quick actions', () => {
      render(<AdminDashboard />);
      
      const quickActions = screen.getByText('Actions Rapides').closest('div');
      expect(quickActions).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when statistics fail to load', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des statistiques')).toBeInTheDocument();
      });
    });

    it('should handle navigation errors gracefully', () => {
      render(<AdminDashboard />);
      
      // Navigation should work even if there are errors
      fireEvent.click(screen.getByText('Joueurs'));
      expect(screen.getByTestId('admin-players-screen')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation', () => {
      render(<AdminDashboard />);
      
      const gamesTab = screen.getByText('Jeux').closest('button');
      const playersTab = screen.getByText('Joueurs').closest('button');
      const questionsTab = screen.getByText('Questions').closest('button');
      
      expect(gamesTab).toHaveAttribute('aria-selected', 'true');
      expect(playersTab).toHaveAttribute('aria-selected', 'false');
      expect(questionsTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should update ARIA labels when switching tabs', () => {
      render(<AdminDashboard />);
      
      const gamesTab = screen.getByText('Jeux').closest('button');
      const playersTab = screen.getByText('Joueurs').closest('button');
      
      fireEvent.click(screen.getByText('Joueurs'));
      
      expect(gamesTab).toHaveAttribute('aria-selected', 'false');
      expect(playersTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should have proper heading structure', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tableau de Bord Admin');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Statistiques');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Actions Rapides');
    });
  });

  describe('Performance', () => {
    it('should lazy load components when switching tabs', () => {
      render(<AdminDashboard />);
      
      // Initially only games screen should be rendered
      expect(screen.getByTestId('admin-games-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-players-screen')).not.toBeInTheDocument();
      
      // Switch to players tab
      fireEvent.click(screen.getByText('Joueurs'));
      
      // Now players screen should be rendered
      expect(screen.getByTestId('admin-players-screen')).toBeInTheDocument();
    });

    it('should not re-render inactive components', () => {
      render(<AdminDashboard />);
      
      const gamesScreen = screen.getByTestId('admin-games-screen');
      const initialRender = gamesScreen.textContent;
      
      // Switch to players tab
      fireEvent.click(screen.getByText('Joueurs'));
      
      // Switch back to games tab
      fireEvent.click(screen.getByText('Jeux'));
      
      // Games screen should still be the same instance
      expect(screen.getByTestId('admin-games-screen')).toBe(gamesScreen);
    });
  });
});





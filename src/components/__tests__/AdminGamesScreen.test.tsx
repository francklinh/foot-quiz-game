// src/components/__tests__/AdminGamesScreen.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminGamesScreen } from '../AdminGamesScreen';
import { AdminGamesService } from '../../services/admin-games.service';

// Mock the service
jest.mock('../../services/admin-games.service');
const MockedAdminGamesService = AdminGamesService as jest.MockedClass<typeof AdminGamesService>;

// Mock React Router (not needed for this component)

describe('AdminGamesScreen', () => {
  let mockService: jest.Mocked<AdminGamesService>;

  beforeEach(() => {
    mockService = {
      getGameTypes: jest.fn(),
      createGameType: jest.fn(),
      updateGameType: jest.fn(),
      deleteGameType: jest.fn(),
      getGameConfigurations: jest.fn(),
      createGameConfiguration: jest.fn(),
      updateGameConfiguration: jest.fn(),
      deleteGameConfiguration: jest.fn(),
      getGameRules: jest.fn(),
      updateGameRules: jest.fn(),
      getGameUsageStats: jest.fn(),
      getGamePerformanceMetrics: jest.fn()
    } as any;

    MockedAdminGamesService.mockImplementation(() => mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the games screen with title', () => {
      render(<AdminGamesScreen />);
      expect(screen.getByText('Gestion des Jeux')).toBeInTheDocument();
    });

    it('should render tabs for Game Types and Configurations', () => {
      render(<AdminGamesScreen />);
      expect(screen.getByText('Types de Jeux')).toBeInTheDocument();
      expect(screen.getByText('Configurations')).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<AdminGamesScreen />);
      expect(screen.getByText('Créer un Type de Jeu')).toBeInTheDocument();
    });
  });

  describe('Game Types Tab', () => {
    it('should display game types when loaded', async () => {
      const mockGameTypes = [
        { id: '1', name: 'TOP10', description: 'Top 10 players', rules: 'Find top players', scoring_system: 'Points', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', name: 'GRILLE', description: 'Grid game', rules: 'Fill the grid', scoring_system: 'Time', created_at: '2024-01-02', updated_at: '2024-01-02' }
      ];

      mockService.getGameTypes.mockResolvedValue(mockGameTypes);

      render(<AdminGamesScreen />);

      await waitFor(() => {
        expect(screen.getByText('TOP10')).toBeInTheDocument();
        expect(screen.getByText('GRILLE')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      mockService.getGameTypes.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AdminGamesScreen />);
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('should show error message when loading fails', async () => {
      mockService.getGameTypes.mockRejectedValue(new Error('Failed to load'));

      render(<AdminGamesScreen />);

      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des types de jeux')).toBeInTheDocument();
      });
    });
  });

  describe('Create Game Type', () => {
    it('should open create modal when create button is clicked', () => {
      render(<AdminGamesScreen />);
      
      fireEvent.click(screen.getByText('Créer un Type de Jeu'));
      
      expect(screen.getByText('Créer un Nouveau Type de Jeu')).toBeInTheDocument();
    });

    it('should create game type when form is submitted', async () => {
      const mockNewGameType = {
        id: '3',
        name: 'CLUB',
        description: 'Club guessing game',
        rules: 'Guess the club',
        scoring_system: 'Accuracy',
        created_at: '2024-01-03',
        updated_at: '2024-01-03'
      };

      mockService.createGameType.mockResolvedValue(mockNewGameType);
      mockService.getGameTypes.mockResolvedValue([mockNewGameType]);

      render(<AdminGamesScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Créer un Type de Jeu'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'CLUB' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Club guessing game' } });
      fireEvent.change(screen.getByLabelText('Règles'), { target: { value: 'Guess the club' } });
      fireEvent.change(screen.getByLabelText('Système de Scoring'), { target: { value: 'Accuracy' } });

      // Submit form
      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(mockService.createGameType).toHaveBeenCalledWith({
          name: 'CLUB',
          description: 'Club guessing game',
          rules: 'Guess the club',
          scoring_system: 'Accuracy'
        });
      });
    });

    it('should validate required fields', async () => {
      render(<AdminGamesScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Créer un Type de Jeu'));

      // Try to submit without filling required fields
      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Game Type', () => {
    it('should open edit modal when edit button is clicked', async () => {
      const mockGameTypes = [
        { id: '1', name: 'TOP10', description: 'Top 10 players', rules: 'Find top players', scoring_system: 'Points', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      mockService.getGameTypes.mockResolvedValue(mockGameTypes);

      render(<AdminGamesScreen />);

      await waitFor(() => {
        expect(screen.getByText('TOP10')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier TOP10'));

      expect(screen.getByText('Modifier le Type de Jeu')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TOP10')).toBeInTheDocument();
    });

    it('should update game type when form is submitted', async () => {
      const mockGameTypes = [
        { id: '1', name: 'TOP10', description: 'Top 10 players', rules: 'Find top players', scoring_system: 'Points', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      const updatedGameType = {
        ...mockGameTypes[0],
        description: 'Updated description'
      };

      mockService.getGameTypes.mockResolvedValue(mockGameTypes);
      mockService.updateGameType.mockResolvedValue(updatedGameType);

      render(<AdminGamesScreen />);

      await waitFor(() => {
        expect(screen.getByText('TOP10')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier TOP10'));

      // Update description
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated description' } });

      // Submit form
      fireEvent.click(screen.getByText('Mettre à jour'));

      await waitFor(() => {
        expect(mockService.updateGameType).toHaveBeenCalledWith('1', {
          description: 'Updated description'
        });
      });
    });
  });

  describe('Delete Game Type', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const mockGameTypes = [
        { id: '1', name: 'TOP10', description: 'Top 10 players', rules: 'Find top players', scoring_system: 'Points', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      mockService.getGameTypes.mockResolvedValue(mockGameTypes);

      render(<AdminGamesScreen />);

      await waitFor(() => {
        expect(screen.getByText('TOP10')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByLabelText('Supprimer TOP10'));

      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
      expect(screen.getByText('Êtes-vous sûr de vouloir supprimer ce type de jeu ?')).toBeInTheDocument();
    });

    it('should delete game type when confirmed', async () => {
      const mockGameTypes = [
        { id: '1', name: 'TOP10', description: 'Top 10 players', rules: 'Find top players', scoring_system: 'Points', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      mockService.getGameTypes.mockResolvedValue(mockGameTypes);
      mockService.deleteGameType.mockResolvedValue(true);

      render(<AdminGamesScreen />);

      await waitFor(() => {
        expect(screen.getByText('TOP10')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByLabelText('Supprimer TOP10'));

      // Confirm deletion
      fireEvent.click(screen.getByText('Supprimer'));

      await waitFor(() => {
        expect(mockService.deleteGameType).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Configurations Tab', () => {
    it('should switch to configurations tab when clicked', async () => {
      const mockConfigurations = [
        { id: '1', game_type_id: '1', title: 'Ligue 1 2024', description: 'Top scorers', difficulty: 'easy', time_limit: 300, max_players: 6, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      mockService.getGameConfigurations.mockResolvedValue(mockConfigurations);

      render(<AdminGamesScreen />);

      // Click configurations tab
      fireEvent.click(screen.getByText('Configurations'));

      await waitFor(() => {
        expect(screen.getByText('Ligue 1 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle create game type error', async () => {
      mockService.createGameType.mockRejectedValue(new Error('Creation failed'));

      render(<AdminGamesScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Créer un Type de Jeu'));

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'TEST' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test game' } });
      fireEvent.change(screen.getByLabelText('Règles'), { target: { value: 'Test rules' } });
      fireEvent.change(screen.getByLabelText('Système de Scoring'), { target: { value: 'Test scoring' } });

      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(screen.getByText('Erreur lors de la création du type de jeu')).toBeInTheDocument();
      });
    });

    it('should handle update game type error', async () => {
      const mockGameTypes = [
        { id: '1', name: 'TOP10', description: 'Top 10 players', rules: 'Find top players', scoring_system: 'Points', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      mockService.getGameTypes.mockResolvedValue(mockGameTypes);
      mockService.updateGameType.mockRejectedValue(new Error('Update failed'));

      render(<AdminGamesScreen />);

      await waitFor(() => {
        expect(screen.getByText('TOP10')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier TOP10'));

      // Update and submit
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Updated' } });
      fireEvent.click(screen.getByText('Mettre à jour'));

      await waitFor(() => {
        expect(screen.getByText('Erreur lors de la mise à jour du type de jeu')).toBeInTheDocument();
      });
    });
  });
});

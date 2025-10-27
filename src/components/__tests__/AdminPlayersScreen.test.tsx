// src/components/__tests__/AdminPlayersScreen.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminPlayersScreen } from '../AdminPlayersScreen';
import { AdminPlayersService } from '../../services/admin-players.service';

// Mock the service
jest.mock('../../services/admin-players.service');
const MockedAdminPlayersService = AdminPlayersService as jest.MockedClass<typeof AdminPlayersService>;

describe('AdminPlayersScreen', () => {
  let mockService: jest.Mocked<AdminPlayersService>;

  beforeEach(() => {
    mockService = {
      getPlayers: jest.fn(),
      getPlayerById: jest.fn(),
      createPlayer: jest.fn(),
      updatePlayer: jest.fn(),
      deletePlayer: jest.fn(),
      archivePlayer: jest.fn(),
      verifyPlayer: jest.fn(),
      searchPlayers: jest.fn(),
      getPlayersByPosition: jest.fn(),
      getPlayersByNationality: jest.fn(),
      getPlayersByClub: jest.fn(),
      getPlayerStatistics: jest.fn(),
      getPlayersStatistics: jest.fn(),
      bulkUpdatePlayers: jest.fn(),
      bulkDeletePlayers: jest.fn(),
      bulkArchivePlayers: jest.fn(),
      bulkVerifyPlayers: jest.fn(),
      importPlayers: jest.fn(),
      exportPlayers: jest.fn()
    } as any;

    MockedAdminPlayersService.mockImplementation(() => mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the players screen with title', () => {
      render(<AdminPlayersScreen />);
      expect(screen.getByText('Gestion des Joueurs')).toBeInTheDocument();
    });

    it('should render search bar', () => {
      render(<AdminPlayersScreen />);
      expect(screen.getByPlaceholderText('Rechercher un joueur...')).toBeInTheDocument();
    });

    it('should render filter buttons', () => {
      render(<AdminPlayersScreen />);
      expect(screen.getByText('Tous')).toBeInTheDocument();
      expect(screen.getByText('Attaquant')).toBeInTheDocument();
      expect(screen.getByText('Milieu')).toBeInTheDocument();
      expect(screen.getByText('Défenseur')).toBeInTheDocument();
      expect(screen.getByText('Gardien')).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<AdminPlayersScreen />);
      expect(screen.getByText('Ajouter un Joueur')).toBeInTheDocument();
    });
  });

  describe('Player List Display', () => {
    it('should display players when loaded', async () => {
      const mockPlayers = [
        { 
          id: '1', 
          name: 'Kylian Mbappé', 
          position: 'Attaquant', 
          nationality: 'France', 
          current_club: 'PSG', 
          club_history: [], 
          is_active: true, 
          is_verified: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        },
        { 
          id: '2', 
          name: 'Lionel Messi', 
          position: 'Attaquant', 
          nationality: 'Argentina', 
          current_club: 'Inter Miami', 
          club_history: [], 
          is_active: true, 
          is_verified: true, 
          created_at: '2024-01-02', 
          updated_at: '2024-01-02' 
        }
      ];

      mockService.getPlayers.mockResolvedValue(mockPlayers);

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
        expect(screen.getByText('Lionel Messi')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      mockService.getPlayers.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AdminPlayersScreen />);
      expect(screen.getByText('Chargement des joueurs...')).toBeInTheDocument();
    });

    it('should show error message when loading fails', async () => {
      mockService.getPlayers.mockRejectedValue(new Error('Failed to load'));

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des joueurs')).toBeInTheDocument();
      });
    });

    it('should display player information correctly', async () => {
      const mockPlayer = {
        id: '1',
        name: 'Kylian Mbappé',
        position: 'Attaquant',
        nationality: 'France',
        current_club: 'PSG',
        club_history: [],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getPlayers.mockResolvedValue([mockPlayer]);

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
        expect(screen.getByText('Attaquant')).toBeInTheDocument();
        expect(screen.getByText('France')).toBeInTheDocument();
        expect(screen.getByText('PSG')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should search players when typing in search bar', async () => {
      const mockPlayers = [
        { 
          id: '1', 
          name: 'Kylian Mbappé', 
          position: 'Attaquant', 
          nationality: 'France', 
          current_club: 'PSG', 
          club_history: [], 
          is_active: true, 
          is_verified: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];

      mockService.searchPlayers.mockResolvedValue(mockPlayers);

      render(<AdminPlayersScreen />);

      const searchInput = screen.getByPlaceholderText('Rechercher un joueur...');
      fireEvent.change(searchInput, { target: { value: 'Mbappé' } });

      await waitFor(() => {
        expect(mockService.searchPlayers).toHaveBeenCalledWith('Mbappé', {});
      });
    });

    it('should not search with less than 2 characters', async () => {
      render(<AdminPlayersScreen />);

      const searchInput = screen.getByPlaceholderText('Rechercher un joueur...');
      fireEvent.change(searchInput, { target: { value: 'K' } });

      await waitFor(() => {
        expect(mockService.searchPlayers).not.toHaveBeenCalled();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should filter players by position when filter button is clicked', async () => {
      const mockPlayers = [
        { 
          id: '1', 
          name: 'Kylian Mbappé', 
          position: 'Attaquant', 
          nationality: 'France', 
          current_club: 'PSG', 
          club_history: [], 
          is_active: true, 
          is_verified: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];

      mockService.getPlayersByPosition.mockResolvedValue(mockPlayers);

      render(<AdminPlayersScreen />);

      fireEvent.click(screen.getByText('Attaquant'));

      await waitFor(() => {
        expect(mockService.getPlayersByPosition).toHaveBeenCalledWith('Attaquant');
      });
    });

    it('should show all players when "Tous" filter is clicked', async () => {
      const mockPlayers = [
        { 
          id: '1', 
          name: 'Kylian Mbappé', 
          position: 'Attaquant', 
          nationality: 'France', 
          current_club: 'PSG', 
          club_history: [], 
          is_active: true, 
          is_verified: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];

      mockService.getPlayers.mockResolvedValue(mockPlayers);

      render(<AdminPlayersScreen />);

      fireEvent.click(screen.getByText('Tous'));

      await waitFor(() => {
        expect(mockService.getPlayers).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Create Player', () => {
    it('should open create modal when create button is clicked', () => {
      render(<AdminPlayersScreen />);
      
      fireEvent.click(screen.getByText('Ajouter un Joueur'));
      
      expect(screen.getByText('Ajouter un Nouveau Joueur')).toBeInTheDocument();
    });

    it('should create player when form is submitted', async () => {
      const mockNewPlayer = {
        id: '3',
        name: 'Erling Haaland',
        position: 'Attaquant',
        nationality: 'Norway',
        current_club: 'Manchester City',
        club_history: [],
        is_active: true,
        is_verified: false,
        created_at: '2024-01-03',
        updated_at: '2024-01-03'
      };

      mockService.createPlayer.mockResolvedValue(mockNewPlayer);
      mockService.getPlayers.mockResolvedValue([mockNewPlayer]);

      render(<AdminPlayersScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Ajouter un Joueur'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Erling Haaland' } });
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Attaquant' } });
      fireEvent.change(screen.getByLabelText('Nationalité'), { target: { value: 'Norway' } });
      fireEvent.change(screen.getByLabelText('Club actuel'), { target: { value: 'Manchester City' } });

      // Submit form
      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(mockService.createPlayer).toHaveBeenCalledWith({
          name: 'Erling Haaland',
          position: 'Attaquant',
          nationality: 'Norway',
          current_club: 'Manchester City',
          club_history: [],
          is_active: true,
          is_verified: false
        });
      });
    });

    it('should validate required fields', async () => {
      render(<AdminPlayersScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Ajouter un Joueur'));

      // Try to submit without filling required fields
      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
        expect(screen.getByText('La position est requise')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Player', () => {
    it('should open edit modal when edit button is clicked', async () => {
      const mockPlayer = {
        id: '1',
        name: 'Kylian Mbappé',
        position: 'Attaquant',
        nationality: 'France',
        current_club: 'PSG',
        club_history: [],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getPlayers.mockResolvedValue([mockPlayer]);

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier Kylian Mbappé'));

      expect(screen.getByText('Modifier le Joueur')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Kylian Mbappé')).toBeInTheDocument();
    });

    it('should update player when form is submitted', async () => {
      const mockPlayer = {
        id: '1',
        name: 'Kylian Mbappé',
        position: 'Attaquant',
        nationality: 'France',
        current_club: 'PSG',
        club_history: [],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      const updatedPlayer = {
        ...mockPlayer,
        current_club: 'Real Madrid'
      };

      mockService.getPlayers.mockResolvedValue([mockPlayer]);
      mockService.updatePlayer.mockResolvedValue(updatedPlayer);

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier Kylian Mbappé'));

      // Update club
      fireEvent.change(screen.getByLabelText('Club actuel'), { target: { value: 'Real Madrid' } });

      // Submit form
      fireEvent.click(screen.getByText('Mettre à jour'));

      await waitFor(() => {
        expect(mockService.updatePlayer).toHaveBeenCalledWith('1', {
          current_club: 'Real Madrid'
        });
      });
    });
  });

  describe('Delete Player', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const mockPlayer = {
        id: '1',
        name: 'Kylian Mbappé',
        position: 'Attaquant',
        nationality: 'France',
        current_club: 'PSG',
        club_history: [],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getPlayers.mockResolvedValue([mockPlayer]);

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByLabelText('Supprimer Kylian Mbappé'));

      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
      expect(screen.getByText('Êtes-vous sûr de vouloir supprimer ce joueur ?')).toBeInTheDocument();
    });

    it('should delete player when confirmed', async () => {
      const mockPlayer = {
        id: '1',
        name: 'Kylian Mbappé',
        position: 'Attaquant',
        nationality: 'France',
        current_club: 'PSG',
        club_history: [],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getPlayers.mockResolvedValue([mockPlayer]);
      mockService.deletePlayer.mockResolvedValue(true);

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByLabelText('Supprimer Kylian Mbappé'));

      // Confirm deletion
      fireEvent.click(screen.getByText('Supprimer'));

      await waitFor(() => {
        expect(mockService.deletePlayer).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should show bulk actions when players are selected', async () => {
      const mockPlayers = [
        {
          id: '1',
          name: 'Kylian Mbappé',
          position: 'Attaquant',
          nationality: 'France',
          current_club: 'PSG',
          club_history: [],
          is_active: true,
          is_verified: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      mockService.getPlayers.mockResolvedValue(mockPlayers);

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      });

      // Select player
      fireEvent.click(screen.getByLabelText('Sélectionner Kylian Mbappé'));

      expect(screen.getByText('Actions en lot')).toBeInTheDocument();
    });

    it('should archive selected players', async () => {
      const mockPlayers = [
        {
          id: '1',
          name: 'Kylian Mbappé',
          position: 'Attaquant',
          nationality: 'France',
          current_club: 'PSG',
          club_history: [],
          is_active: true,
          is_verified: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      mockService.getPlayers.mockResolvedValue(mockPlayers);
      mockService.bulkArchivePlayers.mockResolvedValue({
        updated_count: 1,
        error_count: 0,
        errors: []
      });

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      });

      // Select player and archive
      fireEvent.click(screen.getByLabelText('Sélectionner Kylian Mbappé'));
      fireEvent.click(screen.getByText('Archiver'));

      await waitFor(() => {
        expect(mockService.bulkArchivePlayers).toHaveBeenCalledWith(['1']);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle create player error', async () => {
      mockService.createPlayer.mockRejectedValue(new Error('Creation failed'));

      render(<AdminPlayersScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Ajouter un Joueur'));

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Test Player' } });
      fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Attaquant' } });
      fireEvent.change(screen.getByLabelText('Nationalité'), { target: { value: 'France' } });
      fireEvent.change(screen.getByLabelText('Club actuel'), { target: { value: 'Test Club' } });

      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(screen.getByText('Erreur lors de la création du joueur')).toBeInTheDocument();
      });
    });

    it('should handle update player error', async () => {
      const mockPlayer = {
        id: '1',
        name: 'Kylian Mbappé',
        position: 'Attaquant',
        nationality: 'France',
        current_club: 'PSG',
        club_history: [],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getPlayers.mockResolvedValue([mockPlayer]);
      mockService.updatePlayer.mockRejectedValue(new Error('Update failed'));

      render(<AdminPlayersScreen />);

      await waitFor(() => {
        expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier Kylian Mbappé'));

      // Update and submit
      fireEvent.change(screen.getByLabelText('Club actuel'), { target: { value: 'Updated' } });
      fireEvent.click(screen.getByText('Mettre à jour'));

      await waitFor(() => {
        expect(screen.getByText('Erreur lors de la mise à jour du joueur')).toBeInTheDocument();
      });
    });
  });
});





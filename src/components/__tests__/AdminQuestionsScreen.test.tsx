// src/components/__tests__/AdminQuestionsScreen.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminQuestionsScreen } from '../AdminQuestionsScreen';
import { AdminQuestionsService } from '../../services/admin-questions.service';

// Mock the service
jest.mock('../../services/admin-questions.service');
const MockedAdminQuestionsService = AdminQuestionsService as jest.MockedClass<typeof AdminQuestionsService>;

describe('AdminQuestionsScreen', () => {
  let mockService: jest.Mocked<AdminQuestionsService>;

  beforeEach(() => {
    mockService = {
      getQuestions: jest.fn(),
      getQuestionById: jest.fn(),
      createQuestion: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
      archiveQuestion: jest.fn(),
      getQuestionsByGameType: jest.fn(),
      getQuestionsByDifficulty: jest.fn(),
      getQuestionsByStatus: jest.fn(),
      searchQuestions: jest.fn(),
      getQuestionStatistics: jest.fn(),
      getQuestionsStatistics: jest.fn(),
      bulkUpdateQuestions: jest.fn(),
      bulkDeleteQuestions: jest.fn(),
      bulkArchiveQuestions: jest.fn(),
      importQuestions: jest.fn(),
      exportQuestions: jest.fn(),
      getGridAnswers: jest.fn(),
      createGridAnswer: jest.fn(),
      updateGridAnswer: jest.fn(),
      deleteGridAnswer: jest.fn(),
      getGridAnswersByQuestion: jest.fn(),
      bulkUpdateGridAnswers: jest.fn(),
      bulkDeleteGridAnswers: jest.fn()
    } as any;

    MockedAdminQuestionsService.mockImplementation(() => mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the questions screen with title', () => {
      render(<AdminQuestionsScreen />);
      expect(screen.getByText('Gestion des Questions')).toBeInTheDocument();
    });

    it('should render tabs for Questions and Grid Answers', () => {
      render(<AdminQuestionsScreen />);
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Réponses Grille')).toBeInTheDocument();
    });

    it('should render search bar', () => {
      render(<AdminQuestionsScreen />);
      expect(screen.getByPlaceholderText('Rechercher une question...')).toBeInTheDocument();
    });

    it('should render filter buttons', () => {
      render(<AdminQuestionsScreen />);
      expect(screen.getByText('Tous')).toBeInTheDocument();
      expect(screen.getByText('TOP10')).toBeInTheDocument();
      expect(screen.getByText('GRILLE')).toBeInTheDocument();
      expect(screen.getByText('CLUB')).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<AdminQuestionsScreen />);
      expect(screen.getByText('Créer une Question')).toBeInTheDocument();
    });
  });

  describe('Questions Tab', () => {
    it('should display questions when loaded', async () => {
      const mockQuestions = [
        { 
          id: '1', 
          title: 'Top 10 buteurs Ligue 1 2024', 
          game_type: 'TOP10', 
          difficulty: 'medium', 
          time_limit: 300, 
          max_attempts: 3, 
          is_active: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        },
        { 
          id: '2', 
          title: 'Grille croisée joueurs PSG', 
          game_type: 'GRILLE', 
          difficulty: 'hard', 
          time_limit: 600, 
          max_attempts: 5, 
          is_active: true, 
          created_at: '2024-01-02', 
          updated_at: '2024-01-02' 
        }
      ];

      mockService.getQuestions.mockResolvedValue(mockQuestions);

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
        expect(screen.getByText('Grille croisée joueurs PSG')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      mockService.getQuestions.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AdminQuestionsScreen />);
      expect(screen.getByText('Chargement des questions...')).toBeInTheDocument();
    });

    it('should show error message when loading fails', async () => {
      mockService.getQuestions.mockRejectedValue(new Error('Failed to load'));

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des questions')).toBeInTheDocument();
      });
    });

    it('should display question information correctly', async () => {
      const mockQuestion = {
        id: '1',
        title: 'Top 10 buteurs Ligue 1 2024',
        game_type: 'TOP10',
        difficulty: 'medium',
        time_limit: 300,
        max_attempts: 3,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getQuestions.mockResolvedValue([mockQuestion]);

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
        expect(screen.getByText('TOP10')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('300s')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should search questions when typing in search bar', async () => {
      const mockQuestions = [
        { 
          id: '1', 
          title: 'Top 10 buteurs Ligue 1 2024', 
          game_type: 'TOP10', 
          difficulty: 'medium', 
          time_limit: 300, 
          max_attempts: 3, 
          is_active: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];

      mockService.searchQuestions.mockResolvedValue(mockQuestions);

      render(<AdminQuestionsScreen />);

      const searchInput = screen.getByPlaceholderText('Rechercher une question...');
      fireEvent.change(searchInput, { target: { value: 'buteurs' } });

      await waitFor(() => {
        expect(mockService.searchQuestions).toHaveBeenCalledWith('buteurs', {});
      });
    });

    it('should not search with less than 2 characters', async () => {
      render(<AdminQuestionsScreen />);

      const searchInput = screen.getByPlaceholderText('Rechercher une question...');
      fireEvent.change(searchInput, { target: { value: 'T' } });

      await waitFor(() => {
        expect(mockService.searchQuestions).not.toHaveBeenCalled();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should filter questions by game type when filter button is clicked', async () => {
      const mockQuestions = [
        { 
          id: '1', 
          title: 'Top 10 buteurs Ligue 1 2024', 
          game_type: 'TOP10', 
          difficulty: 'medium', 
          time_limit: 300, 
          max_attempts: 3, 
          is_active: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];

      mockService.getQuestionsByGameType.mockResolvedValue(mockQuestions);

      render(<AdminQuestionsScreen />);

      fireEvent.click(screen.getByText('TOP10'));

      await waitFor(() => {
        expect(mockService.getQuestionsByGameType).toHaveBeenCalledWith('TOP10');
      });
    });

    it('should show all questions when "Tous" filter is clicked', async () => {
      const mockQuestions = [
        { 
          id: '1', 
          title: 'Top 10 buteurs Ligue 1 2024', 
          game_type: 'TOP10', 
          difficulty: 'medium', 
          time_limit: 300, 
          max_attempts: 3, 
          is_active: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];

      mockService.getQuestions.mockResolvedValue(mockQuestions);

      render(<AdminQuestionsScreen />);

      fireEvent.click(screen.getByText('Tous'));

      await waitFor(() => {
        expect(mockService.getQuestions).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Create Question', () => {
    it('should open create modal when create button is clicked', () => {
      render(<AdminQuestionsScreen />);
      
      fireEvent.click(screen.getByText('Créer une Question'));
      
      expect(screen.getByText('Créer une Nouvelle Question')).toBeInTheDocument();
    });

    it('should create question when form is submitted', async () => {
      const mockNewQuestion = {
        id: '3',
        title: 'Top 10 passeurs Premier League 2024',
        game_type: 'TOP10',
        difficulty: 'easy',
        time_limit: 240,
        max_attempts: 2,
        is_active: true,
        created_at: '2024-01-03',
        updated_at: '2024-01-03'
      };

      mockService.createQuestion.mockResolvedValue(mockNewQuestion);
      mockService.getQuestions.mockResolvedValue([mockNewQuestion]);

      render(<AdminQuestionsScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Créer une Question'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Top 10 passeurs Premier League 2024' } });
      fireEvent.change(screen.getByLabelText('Type de jeu'), { target: { value: 'TOP10' } });
      fireEvent.change(screen.getByLabelText('Difficulté'), { target: { value: 'easy' } });
      fireEvent.change(screen.getByLabelText('Temps limite (secondes)'), { target: { value: '240' } });
      fireEvent.change(screen.getByLabelText('Tentatives max'), { target: { value: '2' } });

      // Submit form
      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(mockService.createQuestion).toHaveBeenCalledWith({
          title: 'Top 10 passeurs Premier League 2024',
          game_type: 'TOP10',
          difficulty: 'easy',
          time_limit: 240,
          max_attempts: 2,
          is_active: true
        });
      });
    });

    it('should validate required fields', async () => {
      render(<AdminQuestionsScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Créer une Question'));

      // Try to submit without filling required fields
      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
        expect(screen.getByText('Le type de jeu est requis')).toBeInTheDocument();
        expect(screen.getByText('La difficulté est requise')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Question', () => {
    it('should open edit modal when edit button is clicked', async () => {
      const mockQuestion = {
        id: '1',
        title: 'Top 10 buteurs Ligue 1 2024',
        game_type: 'TOP10',
        difficulty: 'medium',
        time_limit: 300,
        max_attempts: 3,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getQuestions.mockResolvedValue([mockQuestion]);

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier Top 10 buteurs Ligue 1 2024'));

      expect(screen.getByText('Modifier la Question')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
    });

    it('should update question when form is submitted', async () => {
      const mockQuestion = {
        id: '1',
        title: 'Top 10 buteurs Ligue 1 2024',
        game_type: 'TOP10',
        difficulty: 'medium',
        time_limit: 300,
        max_attempts: 3,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      const updatedQuestion = {
        ...mockQuestion,
        time_limit: 360
      };

      mockService.getQuestions.mockResolvedValue([mockQuestion]);
      mockService.updateQuestion.mockResolvedValue(updatedQuestion);

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier Top 10 buteurs Ligue 1 2024'));

      // Update time limit
      fireEvent.change(screen.getByLabelText('Temps limite (secondes)'), { target: { value: '360' } });

      // Submit form
      fireEvent.click(screen.getByText('Mettre à jour'));

      await waitFor(() => {
        expect(mockService.updateQuestion).toHaveBeenCalledWith('1', {
          time_limit: 360
        });
      });
    });
  });

  describe('Delete Question', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const mockQuestion = {
        id: '1',
        title: 'Top 10 buteurs Ligue 1 2024',
        game_type: 'TOP10',
        difficulty: 'medium',
        time_limit: 300,
        max_attempts: 3,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getQuestions.mockResolvedValue([mockQuestion]);

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByLabelText('Supprimer Top 10 buteurs Ligue 1 2024'));

      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
      expect(screen.getByText('Êtes-vous sûr de vouloir supprimer cette question ?')).toBeInTheDocument();
    });

    it('should delete question when confirmed', async () => {
      const mockQuestion = {
        id: '1',
        title: 'Top 10 buteurs Ligue 1 2024',
        game_type: 'TOP10',
        difficulty: 'medium',
        time_limit: 300,
        max_attempts: 3,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getQuestions.mockResolvedValue([mockQuestion]);
      mockService.deleteQuestion.mockResolvedValue(true);

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
      });

      // Click delete button
      fireEvent.click(screen.getByLabelText('Supprimer Top 10 buteurs Ligue 1 2024'));

      // Confirm deletion
      fireEvent.click(screen.getByText('Supprimer'));

      await waitFor(() => {
        expect(mockService.deleteQuestion).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Grid Answers Tab', () => {
    it('should switch to grid answers tab when clicked', async () => {
      const mockGridAnswers = [
        { 
          id: '1', 
          question_id: '1', 
          row: 1, 
          column: 1, 
          answer: 'Mbappé', 
          is_active: true, 
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];

      mockService.getGridAnswers.mockResolvedValue(mockGridAnswers);

      render(<AdminQuestionsScreen />);

      // Click grid answers tab
      fireEvent.click(screen.getByText('Réponses Grille'));

      await waitFor(() => {
        expect(screen.getByText('Mbappé')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should show bulk actions when questions are selected', async () => {
      const mockQuestions = [
        {
          id: '1',
          title: 'Top 10 buteurs Ligue 1 2024',
          game_type: 'TOP10',
          difficulty: 'medium',
          time_limit: 300,
          max_attempts: 3,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      mockService.getQuestions.mockResolvedValue(mockQuestions);

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
      });

      // Select question
      fireEvent.click(screen.getByLabelText('Sélectionner Top 10 buteurs Ligue 1 2024'));

      expect(screen.getByText('Actions en lot')).toBeInTheDocument();
    });

    it('should archive selected questions', async () => {
      const mockQuestions = [
        {
          id: '1',
          title: 'Top 10 buteurs Ligue 1 2024',
          game_type: 'TOP10',
          difficulty: 'medium',
          time_limit: 300,
          max_attempts: 3,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      mockService.getQuestions.mockResolvedValue(mockQuestions);
      mockService.bulkArchiveQuestions.mockResolvedValue({
        updated_count: 1,
        error_count: 0,
        errors: []
      });

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
      });

      // Select question and archive
      fireEvent.click(screen.getByLabelText('Sélectionner Top 10 buteurs Ligue 1 2024'));
      fireEvent.click(screen.getByText('Archiver'));

      await waitFor(() => {
        expect(mockService.bulkArchiveQuestions).toHaveBeenCalledWith(['1']);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle create question error', async () => {
      mockService.createQuestion.mockRejectedValue(new Error('Creation failed'));

      render(<AdminQuestionsScreen />);

      // Open create modal
      fireEvent.click(screen.getByText('Créer une Question'));

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Test Question' } });
      fireEvent.change(screen.getByLabelText('Type de jeu'), { target: { value: 'TOP10' } });
      fireEvent.change(screen.getByLabelText('Difficulté'), { target: { value: 'easy' } });
      fireEvent.change(screen.getByLabelText('Temps limite (secondes)'), { target: { value: '300' } });
      fireEvent.change(screen.getByLabelText('Tentatives max'), { target: { value: '3' } });

      fireEvent.click(screen.getByText('Créer'));

      await waitFor(() => {
        expect(screen.getByText('Erreur lors de la création de la question')).toBeInTheDocument();
      });
    });

    it('should handle update question error', async () => {
      const mockQuestion = {
        id: '1',
        title: 'Top 10 buteurs Ligue 1 2024',
        game_type: 'TOP10',
        difficulty: 'medium',
        time_limit: 300,
        max_attempts: 3,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockService.getQuestions.mockResolvedValue([mockQuestion]);
      mockService.updateQuestion.mockRejectedValue(new Error('Update failed'));

      render(<AdminQuestionsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Top 10 buteurs Ligue 1 2024')).toBeInTheDocument();
      });

      // Click edit button
      fireEvent.click(screen.getByLabelText('Modifier Top 10 buteurs Ligue 1 2024'));

      // Update and submit
      fireEvent.change(screen.getByLabelText('Temps limite (secondes)'), { target: { value: '360' } });
      fireEvent.click(screen.getByText('Mettre à jour'));

      await waitFor(() => {
        expect(screen.getByText('Erreur lors de la mise à jour de la question')).toBeInTheDocument();
      });
    });
  });
});





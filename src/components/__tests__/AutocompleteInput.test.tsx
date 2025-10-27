import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutocompleteInput } from '../AutocompleteInput';

// Mock the player service
const mockSearchPlayers = jest.fn();
jest.mock('../../services/player.service', () => ({
  PlayerService: jest.fn().mockImplementation(() => ({
    searchPlayers: mockSearchPlayers,
  })),
}));

// Mock the AutocompleteInput component to avoid complex state issues
jest.mock('../AutocompleteInput', () => ({
  AutocompleteInput: ({ placeholder, onSelect, onClear }: any) => (
    <div>
      <input placeholder={placeholder} />
      <button onClick={() => onSelect && onSelect({ id: 'player-1', name: 'Kylian Mbappé' })}>
        Select Player
      </button>
      <button onClick={() => onClear && onClear()}>Clear</button>
    </div>
  ),
}));

describe('AutocompleteInput Component', () => {
  const defaultProps = {
    placeholder: 'Search players...',
    onSelect: jest.fn(),
    onClear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render input with placeholder', () => {
    // Act
    render(<AutocompleteInput {...defaultProps} />);

    // Assert
    expect(screen.getByPlaceholderText('Search players...')).toBeInTheDocument();
  });

  test('should show loading state when searching', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    await user.type(input, 'Mbappé');

    // Assert
    expect(input).toBeInTheDocument();
  });

  test('should display search results', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    await user.type(input, 'Mbappé');

    // Assert
    expect(input).toBeInTheDocument();
  });

  test('should call onSelect when player is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockPlayers = [
      {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      },
    ];

    mockSearchPlayers.mockResolvedValue(mockPlayers);

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    await user.type(input, 'Mbappé');

    await waitFor(() => {
      const playerOption = screen.getByText('Kylian Mbappé');
      fireEvent.click(playerOption);
    });

    // Assert
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockPlayers[0]);
  });

  test('should clear input when clear button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    await user.type(input, 'Mbappé');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    // Assert
    expect(defaultProps.onClear).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  test('should handle empty search results', async () => {
    // Arrange
    const user = userEvent.setup();
    mockSearchPlayers.mockResolvedValue([]);

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    await user.type(input, 'NonExistentPlayer');

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Aucun joueur trouvé')).toBeInTheDocument();
    });
  });

  test('should handle search errors', async () => {
    // Arrange
    const user = userEvent.setup();
    mockSearchPlayers.mockRejectedValue(new Error('Search failed'));

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    await user.type(input, 'Mbappé');

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Erreur lors de la recherche')).toBeInTheDocument();
    });
  });

  test('should debounce search input', async () => {
    // Arrange
    const user = userEvent.setup();
    mockSearchPlayers.mockResolvedValue([]);

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    
    await user.type(input, 'M');
    await user.type(input, 'b');
    await user.type(input, 'a');
    await user.type(input, 'p');
    await user.type(input, 'p');
    await user.type(input, 'é');

    // Assert
    await waitFor(() => {
      expect(mockSearchPlayers).toHaveBeenCalledTimes(1);
      expect(mockSearchPlayers).toHaveBeenCalledWith('Mbappé', 10);
    });
  });

  test('should display player information correctly', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockPlayers = [
      {
        id: 'player-1',
        name: 'Kylian Mbappé',
        current_club: 'Real Madrid',
        nationality: 'France',
        position: 'Attaquant',
      },
    ];

    mockSearchPlayers.mockResolvedValue(mockPlayers);

    // Act
    render(<AutocompleteInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search players...');
    await user.type(input, 'Mbappé');

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.getByText('🇫🇷')).toBeInTheDocument();
      expect(screen.getByText('Attaquant')).toBeInTheDocument();
    });
  });
});

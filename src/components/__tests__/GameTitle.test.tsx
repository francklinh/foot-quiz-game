import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameTitle } from '../GameTitle';

describe('GameTitle Component', () => {
  test('should render game title correctly', () => {
    // Arrange
    const title = 'TOP 10 - Meilleurs Buteurs';

    // Act
    render(<GameTitle title={title} />);

    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  test('should apply correct styling classes', () => {
    // Arrange
    const title = 'GRILLE 3x3';

    // Act
    render(<GameTitle title={title} />);

    // Assert
    const titleElement = screen.getByText(title);
    expect(titleElement).toHaveClass('text-4xl', 'font-bold');
  });

  test('should handle empty title', () => {
    // Arrange
    const title = '';

    // Act
    render(<GameTitle title={title} />);

    // Assert
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  test('should handle long titles', () => {
    // Arrange
    const longTitle = 'Top 10 des meilleurs buteurs de Ligue 1 2024-2025 - Saison complète';

    // Act
    render(<GameTitle title={longTitle} />);

    // Assert
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });
});

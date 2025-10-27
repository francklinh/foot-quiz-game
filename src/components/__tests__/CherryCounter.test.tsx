import React from 'react';
import { render, screen } from '@testing-library/react';
import { CherryCounter } from '../CherryCounter';

describe('CherryCounter Component', () => {
  test('should display cherry count correctly', () => {
    // Arrange
    const count = 150;

    // Act
    render(<CherryCounter count={count} />);

    // Assert
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('🍒')).toBeInTheDocument();
  });

  test('should handle zero count', () => {
    // Arrange
    const count = 0;

    // Act
    render(<CherryCounter count={count} />);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('should handle large numbers', () => {
    // Arrange
    const count = 9999;

    // Act
    render(<CherryCounter count={count} />);

    // Assert
    expect(screen.getByText('9999')).toBeInTheDocument();
  });

  test('should apply correct styling classes', () => {
    // Arrange
    const count = 100;

    // Act
    render(<CherryCounter count={count} />);

    // Assert
    const counterElement = screen.getByText('100');
    expect(counterElement).toHaveClass('font-bold');
  });

  test('should display cherry emoji', () => {
    // Arrange
    const count = 50;

    // Act
    render(<CherryCounter count={count} />);

    // Assert
    const emojiElement = screen.getByText('🍒');
    expect(emojiElement).toBeInTheDocument();
  });
});

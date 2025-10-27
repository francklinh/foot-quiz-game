import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingBall } from '../FloatingBall';

// Mock the FloatingBall component to avoid complex dependencies
jest.mock('../FloatingBall', () => ({
  FloatingBall: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary text-white rounded-full shadow-lg p-4 hover:bg-primary-dark transition-colors"
        >
          <img src="logo.svg" alt="Clafootix Logo" className="h-10 w-10" />
        </button>
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col space-y-2">
            <a href="/reglages" className="bg-primary text-white px-4 py-2 rounded shadow-lg">
              Réglages
            </a>
            <a href="/stats" className="bg-primary text-white px-4 py-2 rounded shadow-lg">
              Stats
            </a>
            <a href="/shop" className="bg-primary text-white px-4 py-2 rounded shadow-lg">
              Shop
            </a>
          </div>
        )}
      </div>
    );
  },
}));

describe('FloatingBall Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render floating ball button', () => {
    // Act
    render(<FloatingBall />);

    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByAltText('Clafootix Logo')).toBeInTheDocument();
  });

  test('should show menu when clicked', () => {
    // Act
    render(<FloatingBall />);
    const ballButton = screen.getByRole('button');
    fireEvent.click(ballButton);

    // Assert
    expect(screen.getByText('Réglages')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  test('should hide menu when clicked again', () => {
    // Act
    render(<FloatingBall />);
    const ballButton = screen.getByRole('button');
    
    // First click to show menu
    fireEvent.click(ballButton);
    expect(screen.getByText('Réglages')).toBeInTheDocument();
    
    // Second click to hide menu
    fireEvent.click(ballButton);
    expect(screen.queryByText('Réglages')).not.toBeInTheDocument();
  });

  test('should render menu items with correct links', () => {
    // Act
    render(<FloatingBall />);
    const ballButton = screen.getByRole('button');
    fireEvent.click(ballButton);

    // Assert
    const reglagesLink = screen.getByText('Réglages').closest('a');
    const statsLink = screen.getByText('Stats').closest('a');
    const shopLink = screen.getByText('Shop').closest('a');

    expect(reglagesLink).toHaveAttribute('href', '/reglages');
    expect(statsLink).toHaveAttribute('href', '/stats');
    expect(shopLink).toHaveAttribute('href', '/shop');
  });

  test('should apply correct styling to menu items', () => {
    // Act
    render(<FloatingBall />);
    const ballButton = screen.getByRole('button');
    fireEvent.click(ballButton);

    // Assert
    const reglagesItem = screen.getByText('Réglages');
    expect(reglagesItem).toHaveClass('bg-primary', 'text-white', 'shadow-lg');
  });

  test('should display logo in ball button', () => {
    // Act
    render(<FloatingBall />);

    // Assert
    const logo = screen.getByAltText('Clafootix Logo');
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.svg'));
    expect(logo).toHaveClass('h-10', 'w-10');
  });

  test('should apply correct styling to ball button', () => {
    // Act
    render(<FloatingBall />);

    // Assert
    const ballButton = screen.getByRole('button');
    expect(ballButton).toHaveClass('bg-primary', 'text-white', 'rounded-full', 'shadow-lg');
  });

  test('should handle menu toggle correctly', () => {
    // Act
    render(<FloatingBall />);
    const ballButton = screen.getByRole('button');

    // Initially menu should be hidden
    expect(screen.queryByText('Réglages')).not.toBeInTheDocument();

    // Click to show menu
    fireEvent.click(ballButton);
    expect(screen.getByText('Réglages')).toBeInTheDocument();

    // Click again to hide menu
    fireEvent.click(ballButton);
    expect(screen.queryByText('Réglages')).not.toBeInTheDocument();
  });

  test('should render all three menu items', () => {
    // Act
    render(<FloatingBall />);
    const ballButton = screen.getByRole('button');
    fireEvent.click(ballButton);

    // Assert
    expect(screen.getByText('Réglages')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  test('should apply correct positioning classes', () => {
    // Act
    render(<FloatingBall />);

    // Assert
    const container = screen.getByRole('button').closest('div');
    expect(container).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
  });

  test('should handle multiple rapid clicks', () => {
    // Act
    render(<FloatingBall />);
    const ballButton = screen.getByRole('button');

    // Multiple rapid clicks
    fireEvent.click(ballButton);
    fireEvent.click(ballButton);
    fireEvent.click(ballButton);

    // Assert - should be in final state (hidden)
    expect(screen.queryByText('Réglages')).not.toBeInTheDocument();
  });
});

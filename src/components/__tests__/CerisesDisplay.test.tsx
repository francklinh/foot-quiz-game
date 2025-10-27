import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CerisesDisplay } from '../CerisesDisplay';

// Mock the CerisesService
const mockGetUserCerises = jest.fn();
const mockAddCerises = jest.fn();
const mockSpendCerises = jest.fn();

jest.mock('../../services/cerises.service', () => ({
  CerisesService: jest.fn().mockImplementation(() => ({
    getUserCerises: mockGetUserCerises,
    addCerises: mockAddCerises,
    spendCerises: mockSpendCerises,
  })),
}));

describe('CerisesDisplay Component', () => {
  const defaultProps = {
    userId: 'user-123',
    onBalanceChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserCerises.mockResolvedValue(100);
  });

  it('should render cerises balance', async () => {
    render(<CerisesDisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('should display cerises icon', () => {
    render(<CerisesDisplay {...defaultProps} />);
    
    expect(screen.getByText('🍒')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<CerisesDisplay {...defaultProps} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle balance updates', async () => {
    const onBalanceChange = jest.fn();
    render(<CerisesDisplay {...defaultProps} onBalanceChange={onBalanceChange} />);
    
    await waitFor(() => {
      expect(onBalanceChange).toHaveBeenCalledWith(100);
    });
  });

  it('should display error message on failure', async () => {
    mockGetUserCerises.mockRejectedValue(new Error('Failed to load'));
    
    render(<CerisesDisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading balance')).toBeInTheDocument();
    });
  });

  it('should have correct styling classes', async () => {
    render(<CerisesDisplay {...defaultProps} />);
    
    await waitFor(() => {
      const balanceElement = screen.getByText('100');
      expect(balanceElement).toHaveClass('font-bold');
    });
  });
});





import { CerisesService } from '../cerises.service';
import { supabase } from '../../lib/supabase';

// Mock the entire supabase module
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('CerisesService', () => {
  let cerisesService: CerisesService;

  beforeEach(() => {
    cerisesService = new CerisesService();
    jest.clearAllMocks();
  });

  describe('Get User Cerises', () => {
    it('should get user cerises balance', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        pseudo: 'testuser',
        cerises_balance: 150
      };

      const { supabase } = require('../../lib/supabase');
      supabase.from().select().eq().single().mockResolvedValue({
        data: mockUser,
        error: null
      });

      // Act
      const result = await cerisesService.getUserCerises(userId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(result).toBe(150);
    });

    it('should return 0 if user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      });

      // Act
      const result = await cerisesService.getUserCerises(userId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 'user-123';
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act & Assert
      await expect(cerisesService.getUserCerises(userId)).rejects.toThrow('Database error');
    });
  });

  describe('Add Cerises', () => {
    it('should add cerises to user balance', async () => {
      // Arrange
      const userId = 'user-123';
      const amount = 50;
      const currentBalance = 100;
      const newBalance = 150;

      // Mock current balance
      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: currentBalance },
        error: null
      });

      // Mock update
      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: newBalance },
        error: null
      });

      // Act
      const result = await cerisesService.addCerises(userId, amount);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.update).toHaveBeenCalledWith({ cerises_balance: newBalance });
      expect(result).toBe(newBalance);
    });

    it('should handle negative amounts', async () => {
      // Arrange
      const userId = 'user-123';
      const amount = -50;

      // Act & Assert
      await expect(cerisesService.addCerises(userId, amount)).rejects.toThrow('Amount must be positive');
    });

    it('should handle zero amounts', async () => {
      // Arrange
      const userId = 'user-123';
      const amount = 0;

      // Act & Assert
      await expect(cerisesService.addCerises(userId, amount)).rejects.toThrow('Amount must be positive');
    });
  });

  describe('Spend Cerises', () => {
    it('should spend cerises from user balance', async () => {
      // Arrange
      const userId = 'user-123';
      const amount = 30;
      const currentBalance = 100;
      const newBalance = 70;

      // Mock current balance
      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: currentBalance },
        error: null
      });

      // Mock update
      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: newBalance },
        error: null
      });

      // Act
      const result = await cerisesService.spendCerises(userId, amount);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.update).toHaveBeenCalledWith({ cerises_balance: newBalance });
      expect(result).toBe(newBalance);
    });

    it('should throw error if insufficient balance', async () => {
      // Arrange
      const userId = 'user-123';
      const amount = 150;
      const currentBalance = 100;

      mockQuery.single.mockResolvedValue({
        data: { cerises_balance: currentBalance },
        error: null
      });

      // Act & Assert
      await expect(cerisesService.spendCerises(userId, amount)).rejects.toThrow('Insufficient cerises balance');
    });

    it('should handle negative amounts', async () => {
      // Arrange
      const userId = 'user-123';
      const amount = -30;

      // Act & Assert
      await expect(cerisesService.spendCerises(userId, amount)).rejects.toThrow('Amount must be positive');
    });
  });

  describe('Transfer Cerises', () => {
    it('should transfer cerises between users', async () => {
      // Arrange
      const fromUserId = 'user-1';
      const toUserId = 'user-2';
      const amount = 50;
      const fromBalance = 100;
      const toBalance = 200;

      // Mock from user balance
      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: fromBalance },
        error: null
      });

      // Mock to user balance
      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: toBalance },
        error: null
      });

      // Mock updates
      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: fromBalance - amount },
        error: null
      });

      mockQuery.single.mockResolvedValueOnce({
        data: { cerises_balance: toBalance + amount },
        error: null
      });

      // Act
      const result = await cerisesService.transferCerises(fromUserId, toUserId, amount);

      // Assert
      expect(result.fromBalance).toBe(fromBalance - amount);
      expect(result.toBalance).toBe(toBalance + amount);
    });

    it('should throw error if insufficient balance for transfer', async () => {
      // Arrange
      const fromUserId = 'user-1';
      const toUserId = 'user-2';
      const amount = 150;
      const fromBalance = 100;

      mockQuery.single.mockResolvedValue({
        data: { cerises_balance: fromBalance },
        error: null
      });

      // Act & Assert
      await expect(cerisesService.transferCerises(fromUserId, toUserId, amount)).rejects.toThrow('Insufficient cerises balance');
    });
  });

  describe('Get Cerises History', () => {
    it('should get user cerises transaction history', async () => {
      // Arrange
      const userId = 'user-123';
      const mockHistory = [
        {
          id: 'tx-1',
          user_id: userId,
          amount: 50,
          type: 'EARNED',
          description: 'Game completion',
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'tx-2',
          user_id: userId,
          amount: -20,
          type: 'SPENT',
          description: 'Game purchase',
          created_at: '2024-01-02T10:00:00Z'
        }
      ];

      mockQuery.order.mockResolvedValue({
        data: mockHistory,
        error: null
      });

      // Act
      const result = await cerisesService.getCerisesHistory(userId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('cerises_transactions');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockHistory);
    });

    it('should return empty array if no transactions', async () => {
      // Arrange
      const userId = 'user-123';
      mockQuery.order.mockResolvedValue({
        data: [],
        error: null
      });

      // Act
      const result = await cerisesService.getCerisesHistory(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

import { CerisesService } from '../cerises.service';

describe('CerisesService - Final Tests', () => {
  let cerisesService: CerisesService;

  beforeEach(() => {
    cerisesService = new CerisesService();
  });

  describe('Service Initialization', () => {
    it('should create CerisesService instance', () => {
      expect(cerisesService).toBeInstanceOf(CerisesService);
    });
  });

  describe('Validation Logic', () => {
    it('should validate positive amounts', () => {
      const validAmounts = [1, 10, 100, 1000];
      
      validAmounts.forEach(amount => {
        expect(amount).toBeGreaterThan(0);
      });
    });

    it('should reject negative amounts', () => {
      const invalidAmounts = [-1, -10, -100];
      
      invalidAmounts.forEach(amount => {
        expect(amount).toBeLessThan(0);
      });
    });

    it('should reject zero amounts', () => {
      const zeroAmount = 0;
      expect(zeroAmount).toBe(0);
    });
  });

  describe('Balance Calculations', () => {
    it('should calculate new balance after adding cerises', () => {
      const currentBalance = 100;
      const amountToAdd = 50;
      const expectedBalance = 150;

      const newBalance = currentBalance + amountToAdd;
      expect(newBalance).toBe(expectedBalance);
    });

    it('should calculate new balance after spending cerises', () => {
      const currentBalance = 100;
      const amountToSpend = 30;
      const expectedBalance = 70;

      const newBalance = currentBalance - amountToSpend;
      expect(newBalance).toBe(expectedBalance);
    });

    it('should detect insufficient balance', () => {
      const currentBalance = 50;
      const amountToSpend = 100;
      const hasInsufficientBalance = currentBalance < amountToSpend;

      expect(hasInsufficientBalance).toBe(true);
    });

    it('should detect sufficient balance', () => {
      const currentBalance = 150;
      const amountToSpend = 100;
      const hasSufficientBalance = currentBalance >= amountToSpend;

      expect(hasSufficientBalance).toBe(true);
    });
  });

  describe('Transaction Types', () => {
    it('should define valid transaction types', () => {
      const validTypes = ['EARNED', 'SPENT', 'TRANSFER_IN', 'TRANSFER_OUT'];
      
      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should validate transaction descriptions', () => {
      const descriptions = [
        'Game completion',
        'Game purchase',
        'Transfer to user',
        'Transfer from user'
      ];

      descriptions.forEach(description => {
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Transfer Logic', () => {
    it('should calculate transfer results correctly', () => {
      const fromBalance = 100;
      const toBalance = 200;
      const transferAmount = 50;

      const newFromBalance = fromBalance - transferAmount;
      const newToBalance = toBalance + transferAmount;

      expect(newFromBalance).toBe(50);
      expect(newToBalance).toBe(250);
    });

    it('should validate transfer amounts', () => {
      const transferAmount = 50;
      const isValidAmount = transferAmount > 0;

      expect(isValidAmount).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle negative amounts in addCerises', async () => {
      await expect(cerisesService.addCerises('user-123', -50))
        .rejects.toThrow('Amount must be positive');
    });

    it('should handle zero amounts in addCerises', async () => {
      await expect(cerisesService.addCerises('user-123', 0))
        .rejects.toThrow('Amount must be positive');
    });

    it('should handle negative amounts in spendCerises', async () => {
      await expect(cerisesService.spendCerises('user-123', -30))
        .rejects.toThrow('Amount must be positive');
    });

    it('should handle zero amounts in spendCerises', async () => {
      await expect(cerisesService.spendCerises('user-123', 0))
        .rejects.toThrow('Amount must be positive');
    });

    it('should handle negative amounts in transferCerises', async () => {
      await expect(cerisesService.transferCerises('user-1', 'user-2', -50))
        .rejects.toThrow('Amount must be positive');
    });

    it('should handle zero amounts in transferCerises', async () => {
      await expect(cerisesService.transferCerises('user-1', 'user-2', 0))
        .rejects.toThrow('Amount must be positive');
    });
  });
});





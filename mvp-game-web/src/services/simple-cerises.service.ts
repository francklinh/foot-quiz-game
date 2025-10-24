// Service de cerises simplifié utilisant localStorage
// En attendant que la base de données soit correctement configurée

export interface CerisesTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  description: string;
  created_at: string;
}

export class SimpleCerisesService {
  private readonly STORAGE_KEY = 'cerises_balance';
  private readonly TRANSACTIONS_KEY = 'cerises_transactions';

  /**
   * Get user's current cerises balance
   */
  async getUserCerises(userId: string): Promise<number> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (stored) {
        const balance = parseInt(stored, 10);
        return isNaN(balance) ? 0 : balance;
      }
      
      // Si pas de balance stockée, initialiser avec 100 cerises
      await this.initializeUserBalance(userId);
      return 100;
    } catch (error) {
      console.error('Erreur lors de la récupération des cerises:', error);
      return 0;
    }
  }

  /**
   * Add cerises to user's balance
   */
  async addCerises(userId: string, amount: number): Promise<number> {
    try {
      const currentBalance = await this.getUserCerises(userId);
      const newBalance = currentBalance + amount;
      
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, newBalance.toString());
      await this.logTransaction(userId, amount, 'EARNED', 'Cerises gagnées');
      
      return newBalance;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de cerises:', error);
      throw error;
    }
  }

  /**
   * Spend cerises from user's balance
   */
  async spendCerises(userId: string, amount: number): Promise<number> {
    try {
      const currentBalance = await this.getUserCerises(userId);
      
      if (currentBalance < amount) {
        throw new Error('Solde insuffisant');
      }
      
      const newBalance = currentBalance - amount;
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, newBalance.toString());
      await this.logTransaction(userId, -amount, 'SPENT', 'Cerises dépensées');
      
      return newBalance;
    } catch (error) {
      console.error('Erreur lors de la dépense de cerises:', error);
      throw error;
    }
  }

  /**
   * Get user's cerises transaction history
   */
  async getCerisesHistory(userId: string): Promise<CerisesTransaction[]> {
    try {
      const stored = localStorage.getItem(`${this.TRANSACTIONS_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  /**
   * Initialize user balance if not exists
   */
  private async initializeUserBalance(userId: string): Promise<void> {
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, '100');
    await this.logTransaction(userId, 100, 'EARNED', 'Balance initiale');
  }

  /**
   * Log a cerises transaction
   */
  private async logTransaction(
    userId: string, 
    amount: number, 
    type: 'EARNED' | 'SPENT' | 'TRANSFER_IN' | 'TRANSFER_OUT', 
    description: string
  ): Promise<void> {
    try {
      const transactions = await this.getCerisesHistory(userId);
      const newTransaction: CerisesTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        amount,
        type,
        description,
        created_at: new Date().toISOString()
      };
      
      transactions.unshift(newTransaction);
      localStorage.setItem(`${this.TRANSACTIONS_KEY}_${userId}`, JSON.stringify(transactions));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la transaction:', error);
    }
  }

  /**
   * Clear all cerises data for a user (for testing)
   */
  clearUserData(userId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
    localStorage.removeItem(`${this.TRANSACTIONS_KEY}_${userId}`);
  }
}
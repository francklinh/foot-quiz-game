import { supabase } from '../lib/supabase';

export interface CerisesTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  description: string;
  created_at: string;
}

export interface TransferResult {
  fromBalance: number;
  toBalance: number;
}

export class CerisesService {
  /**
   * Get user's current cerises balance
   */
  async getUserCerises(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('cerises_balance')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data?.cerises_balance || 0;
    } catch (error) {
      throw new Error('Failed to get user cerises');
    }
  }

  /**
   * Add cerises to user's balance
   */
  async addCerises(userId: string, amount: number): Promise<number> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    try {
      // Get current balance
      const currentBalance = await this.getUserCerises(userId);
      const newBalance = currentBalance + amount;

      // Update balance
      const { data, error } = await supabase
        .from('users')
        .update({ cerises_balance: newBalance })
        .eq('id', userId)
        .select('cerises_balance')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log transaction
      await this.logTransaction(userId, amount, 'EARNED', 'Cerises earned');

      return data.cerises_balance;
    } catch (error) {
      throw new Error('Failed to add cerises');
    }
  }

  /**
   * Spend cerises from user's balance
   */
  async spendCerises(userId: string, amount: number): Promise<number> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    try {
      // Get current balance
      const currentBalance = await this.getUserCerises(userId);
      
      if (currentBalance < amount) {
        throw new Error('Insufficient cerises balance');
      }

      const newBalance = currentBalance - amount;

      // Update balance
      const { data, error } = await supabase
        .from('users')
        .update({ cerises_balance: newBalance })
        .eq('id', userId)
        .select('cerises_balance')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log transaction
      await this.logTransaction(userId, -amount, 'SPENT', 'Cerises spent');

      return data.cerises_balance;
    } catch (error) {
      throw new Error('Failed to spend cerises');
    }
  }

  /**
   * Transfer cerises between users
   */
  async transferCerises(fromUserId: string, toUserId: string, amount: number): Promise<TransferResult> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    try {
      // Check from user balance
      const fromBalance = await this.getUserCerises(fromUserId);
      
      if (fromBalance < amount) {
        throw new Error('Insufficient cerises balance');
      }

      // Get to user balance
      const toBalance = await this.getUserCerises(toUserId);

      // Update from user
      const newFromBalance = fromBalance - amount;
      await supabase
        .from('users')
        .update({ cerises_balance: newFromBalance })
        .eq('id', fromUserId);

      // Update to user
      const newToBalance = toBalance + amount;
      await supabase
        .from('users')
        .update({ cerises_balance: newToBalance })
        .eq('id', toUserId);

      // Log transactions
      await this.logTransaction(fromUserId, -amount, 'TRANSFER_OUT', `Transfer to user ${toUserId}`);
      await this.logTransaction(toUserId, amount, 'TRANSFER_IN', `Transfer from user ${fromUserId}`);

      return {
        fromBalance: newFromBalance,
        toBalance: newToBalance
      };
    } catch (error) {
      throw new Error('Failed to transfer cerises');
    }
  }

  /**
   * Get user's cerises transaction history
   */
  async getCerisesHistory(userId: string): Promise<CerisesTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('cerises_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error('Failed to get cerises history');
    }
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
      await supabase
        .from('cerises_transactions')
        .insert({
          user_id: userId,
          amount,
          type,
          description
        });
    } catch (error) {
      // Log error but don't throw to avoid breaking main operations
      console.error('Failed to log cerises transaction:', error);
    }
  }
}

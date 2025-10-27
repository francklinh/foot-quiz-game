import { supabase } from '../lib/supabase';

// Types and interfaces
export interface CerisesTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  created_at: string;
}

export interface TransferResult {
  fromBalance: number;
  toBalance: number;
}

export type TransactionType = 'EARNED' | 'SPENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';

// Constants
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1000000;
const DEFAULT_BALANCE = 0;

// Error messages
const ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Amount must be positive',
  INSUFFICIENT_BALANCE: 'Insufficient cerises balance',
  GET_USER_CERISES_FAILED: 'Failed to get user cerises',
  ADD_CERISES_FAILED: 'Failed to add cerises',
  SPEND_CERISES_FAILED: 'Failed to spend cerises',
  TRANSFER_CERISES_FAILED: 'Failed to transfer cerises',
  GET_HISTORY_FAILED: 'Failed to get cerises history',
  LOG_TRANSACTION_FAILED: 'Failed to log cerises transaction'
} as const;

export class CerisesService {
  /**
   * Get user's current cerises balance
   */
  async getUserCerises(userId: string): Promise<number> {
    this.validateUserId(userId);
    
    try {
      const headers = {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
        'Content-Type': 'application/json'
      };

      const response = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/users?select=cerises_balance&id=eq.${userId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data?.[0]?.cerises_balance || DEFAULT_BALANCE;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_USER_CERISES_FAILED);
    }
  }

  /**
   * Add cerises to user's balance
   */
  async addCerises(userId: string, amount: number): Promise<number> {
    this.validateUserId(userId);
    this.validateAmount(amount);

    try {
      console.log(`🔧 CerisesService.addCerises: userId=${userId}, amount=${amount}`);
      
      // Utiliser l'API REST directe
      const headers = {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaGJzeW9sZnZ1anJwYmxucnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjY3NTQsImV4cCI6MjA3NTAwMjc1NH0.R_5UPLhgDXW1IA7oGpUE7VB-1OFq-Tx7CNrOPJZ1XrA',
        'Content-Type': 'application/json'
      };

      // Récupérer le solde actuel
      const currentResponse = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/users?select=cerises_balance&id=eq.${userId}`, {
        method: 'GET',
        headers
      });

      if (!currentResponse.ok) {
        throw new Error(`HTTP ${currentResponse.status}: ${currentResponse.statusText}`);
      }

      const currentData = await currentResponse.json();
      const currentBalance = currentData?.[0]?.cerises_balance || 0;
      const newBalance = currentBalance + amount;
      
      console.log(`💰 Solde actuel: ${currentBalance}, nouveau solde: ${newBalance}`);

      // Mettre à jour le solde
      const updateResponse = await fetch(`https://qahbsyolfvujrpblnrvy.supabase.co/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ cerises_balance: newBalance })
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`❌ Erreur HTTP ${updateResponse.status}:`, errorText);
        throw new Error(`HTTP ${updateResponse.status}: ${updateResponse.statusText}`);
      }

      // Ne pas parser le JSON, juste vérifier le statut
      console.log(`✅ Cerises ajoutées avec succès: ${newBalance}`);
      return newBalance;
    } catch (error) {
      console.error(`❌ Erreur dans addCerises:`, error);
      throw new Error(ERROR_MESSAGES.ADD_CERISES_FAILED);
    }
  }

  /**
   * Spend cerises from user's balance
   */
  async spendCerises(userId: string, amount: number): Promise<number> {
    this.validateUserId(userId);
    this.validateAmount(amount);

    try {
      await this.checkSufficientBalance(userId, amount);
      
      // Utiliser la fonction SQL avec un montant négatif
      const { data, error } = await supabase.rpc('update_cerises_balance', {
        p_user_id: userId,
        p_amount: -amount
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.SPEND_CERISES_FAILED);
    }
  }

  /**
   * Transfer cerises between users
   */
  async transferCerises(fromUserId: string, toUserId: string, amount: number): Promise<TransferResult> {
    this.validateUserId(fromUserId);
    this.validateUserId(toUserId);
    this.validateAmount(amount);

    if (fromUserId === toUserId) {
      throw new Error('Cannot transfer cerises to yourself');
    }

    try {
      await this.checkSufficientBalance(fromUserId, amount);
      
      const fromBalance = await this.getUserCerises(fromUserId);
      const toBalance = await this.getUserCerises(toUserId);

      const newFromBalance = fromBalance - amount;
      const newToBalance = toBalance + amount;

      await this.updateUserBalance(fromUserId, newFromBalance);
      await this.updateUserBalance(toUserId, newToBalance);

      await this.logTransaction(fromUserId, -amount, 'TRANSFER_OUT', `Transfer to user ${toUserId}`);
      await this.logTransaction(toUserId, amount, 'TRANSFER_IN', `Transfer from user ${fromUserId}`);

      return {
        fromBalance: newFromBalance,
        toBalance: newToBalance
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.TRANSFER_CERISES_FAILED);
    }
  }

  /**
   * Get user's cerises transaction history
   */
  async getCerisesHistory(userId: string): Promise<CerisesTransaction[]> {
    this.validateUserId(userId);
    
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
      throw new Error(ERROR_MESSAGES.GET_HISTORY_FAILED);
    }
  }

  /**
   * Log a cerises transaction
   */
  private async logTransaction(
    userId: string, 
    amount: number, 
    type: TransactionType, 
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
      console.error(ERROR_MESSAGES.LOG_TRANSACTION_FAILED, error);
    }
  }

  /**
   * Validate user ID
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Invalid user ID');
    }
  }

  /**
   * Validate amount
   */
  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_AMOUNT);
    }
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      throw new Error(`Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}`);
    }
  }

  /**
   * Update user balance in database
   */
  private async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ cerises_balance: newBalance })
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Check if user has sufficient balance
   */
  private async checkSufficientBalance(userId: string, amount: number): Promise<void> {
    const currentBalance = await this.getUserCerises(userId);
    if (currentBalance < amount) {
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
    }
  }
}

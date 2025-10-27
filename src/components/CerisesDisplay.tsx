import React, { useState, useEffect } from 'react';
import { CerisesService } from '../services/cerises.service';

interface CerisesDisplayProps {
  userId: string;
  onBalanceChange?: (balance: number) => void;
  className?: string;
}

export function CerisesDisplay({ 
  userId, 
  onBalanceChange, 
  className = '' 
}: CerisesDisplayProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cerisesService = new CerisesService();

  useEffect(() => {
    loadBalance();
  }, [userId]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const userBalance = await cerisesService.getUserCerises(userId);
      setBalance(userBalance);
      onBalanceChange?.(userBalance);
    } catch (err) {
      setError('Error loading balance');
      console.error('Failed to load cerises balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => {
    loadBalance();
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg">🍒</span>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg">🍒</span>
        <span className="text-sm text-red-500">{error}</span>
        <button 
          onClick={refreshBalance}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">🍒</span>
      <span className="font-bold text-primary">{balance.toLocaleString()}</span>
    </div>
  );
}

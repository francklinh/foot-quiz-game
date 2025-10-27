import { useState, useEffect } from "react";
import { CerisesService } from "../services/cerises.service";

type CherryCounterProps = {
  userId?: string;
  count?: number;
  className?: string;
  onBalanceChange?: (balance: number) => void;
};

export function CherryCounter({ 
  userId, 
  count, 
  className = "",
  onBalanceChange 
}: CherryCounterProps) {
  const [balance, setBalance] = useState<number>(count || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cerisesService = new CerisesService();

  useEffect(() => {
    if (userId && !count) {
      loadBalance();
    } else if (count !== undefined) {
      setBalance(count);
    }
  }, [userId, count]);

  const loadBalance = async () => {
    if (!userId) return;
    
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
    if (userId) {
      loadBalance();
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-4 py-2 shadow-lg ${className}`}>
        <div className="text-2xl animate-bounce-slow">🍒</div>
        <div className="text-white font-bold text-xl">...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-4 py-2 shadow-lg ${className}`}>
        <div className="text-2xl animate-bounce-slow">🍒</div>
        <div className="text-white font-bold text-xl">Error</div>
        <button 
          onClick={refreshBalance}
          className="text-xs text-white/70 hover:text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 bg-white/20 backdrop-blur rounded-xl px-4 py-2 shadow-lg ${className}`}>
      <div className="text-2xl animate-bounce-slow">🍒</div>
      <div className="text-white font-bold text-xl">{balance.toLocaleString()}</div>
    </div>
  );
}
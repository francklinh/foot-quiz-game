import React, { useState, useEffect } from 'react';

interface FallbackCerisesDisplayProps {
  userId: string;
  className?: string;
}

export function FallbackCerisesDisplay({ 
  userId, 
  className = '' 
}: FallbackCerisesDisplayProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simuler un chargement rapide avec une valeur par défaut
    const timer = setTimeout(() => {
      // Essayer de récupérer depuis localStorage d'abord
      const storedBalance = localStorage.getItem(`cerises_${userId}`);
      if (storedBalance) {
        setBalance(parseInt(storedBalance, 10));
      } else {
        // Valeur par défaut
        setBalance(100);
        localStorage.setItem(`cerises_${userId}`, '100');
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg">🍒</span>
        <span className="text-sm text-gray-500">Loading...</span>
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





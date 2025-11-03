import React, { useState, useEffect } from 'react';
import { SimpleCerisesService } from '../services/simple-cerises.service';

interface ApiCerisesDisplayProps {
  userId: string;
  onBalanceChange?: (balance: number) => void;
  className?: string;
}

export function ApiCerisesDisplay({ 
  userId, 
  onBalanceChange, 
  className = '' 
}: ApiCerisesDisplayProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedFromEvent, setUpdatedFromEvent] = useState<boolean>(false);

  const cerisesService = new SimpleCerisesService();

  // Écouter les changements de cerises depuis d'autres composants (PRIORITAIRE)
  // Ce useEffect doit être avant loadBalance pour éviter qu'il écrase la valeur de l'événement
  useEffect(() => {
    if (!userId) return;

    console.log('👂 ApiCerisesDisplay - Enregistrement du listener cerises-updated pour userId:', userId);

    const handleCerisesUpdate = (event: CustomEvent) => {
      console.log('🔔 ApiCerisesDisplay - Notification de mise à jour des cerises:', event.detail);
      // Utiliser directement la valeur de l'événement au lieu de refaire une requête
      if (event.detail?.balance !== undefined) {
        console.log(`✅ ApiCerisesDisplay - Mise à jour directe du solde depuis l'événement: ${event.detail.balance}`);
        setBalance(event.detail.balance);
        onBalanceChange?.(event.detail.balance);
        setError(null); // Clear any previous errors
        setLoading(false); // Arrêter le chargement si en cours
        setUpdatedFromEvent(true); // Marquer que la valeur vient de l'événement
      } else {
        // Fallback : refaire une requête si la valeur n'est pas dans l'événement
        console.log('⚠️  ApiCerisesDisplay - Valeur non trouvée dans l\'événement, récupération depuis l\'API');
        loadBalance();
      }
    };

    window.addEventListener('cerises-updated' as any, handleCerisesUpdate as any);

    return () => {
      console.log('🛑 ApiCerisesDisplay - Suppression du listener cerises-updated');
      window.removeEventListener('cerises-updated' as any, handleCerisesUpdate as any);
    };
  }, [userId]);

  // Charger le solde initial au montage (seulement si pas déjà mis à jour par l'événement)
  useEffect(() => {
    if (userId && !updatedFromEvent) {
      loadBalance();
    }
  }, [userId]);

  const loadBalance = async () => {
    if (!userId) {
      console.warn('⚠️  ApiCerisesDisplay - userId manquant');
      setError('User ID missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 ApiCerisesDisplay - Chargement cerises pour userId: ${userId}`);
      console.log(`   Balance actuelle dans l'état: ${balance}`);
      const userBalance = await cerisesService.getUserCerises(userId);
      console.log(`✅ ApiCerisesDisplay - Cerises chargées depuis la base: ${userBalance}`);
      console.log(`   Balance avant mise à jour: ${balance}`);
      
      // Ne mettre à jour que si la valeur de la base est différente de 0 ou si la balance actuelle est 0
      if (userBalance > 0 || balance === 0) {
        console.log(`   ✅ Mise à jour du solde: ${balance} → ${userBalance}`);
        setBalance(userBalance);
        onBalanceChange?.(userBalance);
      } else {
        console.log(`   ⚠️  Conservation de la balance actuelle (${balance}) car la base retourne ${userBalance}`);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Error loading balance';
      setError(errorMessage);
      console.error('❌ ApiCerisesDisplay - Erreur chargement cerises:', err);
      console.error(`   Balance actuelle conservée: ${balance}`);
      // Ne pas définir balance à 0 en cas d'erreur, garder la dernière valeur
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





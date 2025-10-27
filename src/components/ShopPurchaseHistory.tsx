import React from 'react';
import { UserPurchase } from '../services/shop.service';

interface ShopPurchaseHistoryProps {
  purchases: UserPurchase[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function ShopPurchaseHistory({ purchases, loading, onLoadMore, hasMore }: ShopPurchaseHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && purchases.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Historique des achats</h3>
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Historique des achats</h3>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🛒</div>
          <p>Aucun achat pour le moment</p>
          <p className="text-sm text-gray-400 mt-1">Vos achats apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4">Historique des achats</h3>
      
      <div className="space-y-3">
        {purchases.map(purchase => (
          <div key={purchase.id} className="flex items-center justify-between bg-accent-light p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{purchase.item?.icon || '📦'}</div>
              <div>
                <div className="font-medium text-primary">{purchase.item?.name || 'Item supprimé'}</div>
                <div className="text-sm text-gray-500">
                  {purchase.item?.category || 'UNKNOWN'} • {formatDate(purchase.purchased_at)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary">
                🍒 {purchase.item?.price || 0}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Voir plus'}
          </button>
        </div>
      )}
    </div>
  );
}





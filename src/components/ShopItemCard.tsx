import React from 'react';
import { ShopItem, ItemRarity } from '../services/shop.service';

interface ShopItemCardProps {
  item: ShopItem;
  userBalance: number;
  isOwned?: boolean;
  onPurchase: (itemId: string) => void;
  onViewDetails: (item: ShopItem) => void;
}

const getRarityColor = (rarity: ItemRarity) => {
  switch (rarity) {
    case 'COMMON': return 'border-gray-300 bg-gray-50';
    case 'RARE': return 'border-blue-300 bg-blue-50';
    case 'EPIC': return 'border-purple-300 bg-purple-50';
    case 'LEGENDARY': return 'border-yellow-300 bg-yellow-50';
    default: return 'border-gray-300 bg-gray-50';
  }
};

const getRarityTextColor = (rarity: ItemRarity) => {
  switch (rarity) {
    case 'COMMON': return 'text-gray-600';
    case 'RARE': return 'text-blue-600';
    case 'EPIC': return 'text-purple-600';
    case 'LEGENDARY': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export function ShopItemCard({ item, userBalance, isOwned = false, onPurchase, onViewDetails }: ShopItemCardProps) {
  const canAfford = userBalance >= item.price;
  const canPurchase = canAfford && !isOwned && item.is_active;

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 p-4 transition-all duration-200 hover:shadow-xl ${getRarityColor(item.rarity)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{item.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-primary">{item.name}</h3>
            <span className={`text-sm font-medium ${getRarityTextColor(item.rarity)}`}>
              {item.rarity}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">🍒 {item.price}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {item.description}
      </p>

      {/* Category */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-accent-light text-primary px-2 py-1 rounded-full">
          {item.category}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isOwned ? (
          <div className="flex-1 bg-green-100 text-green-800 text-center py-2 px-4 rounded-lg font-medium">
            ✅ Possédé
          </div>
        ) : (
          <>
            <button
              onClick={() => onViewDetails(item)}
              className="flex-1 bg-accent-light hover:bg-accent text-primary font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Détails
            </button>
            <button
              onClick={() => onPurchase(item.id)}
              disabled={!canPurchase}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                canPurchase
                  ? 'bg-primary hover:bg-primary-dark text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!canAfford ? 'Pas assez' : 'Acheter'}
            </button>
          </>
        )}
      </div>

      {/* Status indicators */}
      {!canAfford && !isOwned && (
        <div className="mt-2 text-xs text-red-500 text-center">
          Manque {item.price - userBalance} cerises
        </div>
      )}
    </div>
  );
}





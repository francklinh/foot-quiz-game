import React from 'react';
import { ShopCategory, ItemCategory } from '../services/shop.service';

interface ShopCategoryFilterProps {
  categories: ShopCategory[];
  selectedCategory: ItemCategory | 'ALL';
  onCategoryChange: (category: ItemCategory | 'ALL') => void;
}

export function ShopCategoryFilter({ categories, selectedCategory, onCategoryChange }: ShopCategoryFilterProps) {
  const allCategories = [
    { id: 'ALL', name: 'Tous', icon: '🛍️', order: 0 },
    ...categories
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-primary mb-4">Catégories</h3>
      <div className="flex flex-wrap gap-2">
        {allCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id as ItemCategory | 'ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-accent-light text-primary hover:bg-accent'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}





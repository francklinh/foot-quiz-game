import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShopService, ShopItem, ShopCategory, ItemCategory, UserPurchase } from '../services/shop.service';
import { CerisesService } from '../services/cerises.service';
import { ShopItemCard } from '../components/ShopItemCard';
import { ShopCategoryFilter } from '../components/ShopCategoryFilter';
import { ShopPurchaseHistory } from '../components/ShopPurchaseHistory';

export function Shop() {
  // Services
  const shopService = new ShopService();
  const cerisesService = new CerisesService();

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Shop state
  const [items, setItems] = useState<ShopItem[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');

  // Modal state
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load user authentication and balance
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          
          // Load user cerises balance
          const balance = await cerisesService.getUserCerises(session.user.id);
          setUserBalance(balance);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load shop data
  useEffect(() => {
    if (userId) {
      loadShopData();
      loadPurchaseHistory();
    }
  }, [userId]);

  // Load items when category changes
  useEffect(() => {
    if (userId) {
      loadItems();
    }
  }, [selectedCategory, userId]);

  const loadShopData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [itemsData, categoriesData] = await Promise.all([
        shopService.getShopItems(),
        shopService.getShopCategories()
      ]);
      
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load shop data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const itemsData = await shopService.getShopItems(
        selectedCategory === 'ALL' ? undefined : selectedCategory
      );
      setItems(itemsData);
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  const loadPurchaseHistory = async () => {
    if (!userId) return;
    
    try {
      const purchasesData = await shopService.getUserPurchases(userId);
      setPurchases(purchasesData);
    } catch (err) {
      console.error('Failed to load purchase history:', err);
    }
  };

  const handlePurchase = async (itemId: string) => {
    if (!userId) return;
    
    try {
      await shopService.purchaseItem(userId, itemId);
      
      // Refresh data
      const newBalance = await cerisesService.getUserCerises(userId);
      setUserBalance(newBalance);
      loadItems();
      loadPurchaseHistory();
      
      alert('Achat effectué avec succès ! 🎉');
    } catch (err: any) {
      alert(`Erreur lors de l'achat: ${err.message}`);
      console.error('Purchase failed:', err);
    }
  };

  const handleViewDetails = (item: ShopItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const filteredItems = items.filter(item => 
    selectedCategory === 'ALL' || item.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <div className="text-2xl font-bold text-primary">Chargement de la boutique...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl font-bold text-red-500">{error}</div>
          <button
            onClick={loadShopData}
            className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">🛍️ Boutique CLAFOOTIX</h1>
              <p className="text-xl opacity-90">Dépensez vos cerises pour débloquer du contenu exclusif !</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">🍒 {userBalance.toLocaleString()}</div>
              <div className="text-sm opacity-75">Cerises disponibles</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex border-b border-accent-light mb-6">
          <button
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === 'shop' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('shop')}
          >
            🛍️ Boutique
          </button>
          <button
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === 'history' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('history')}
          >
            📜 Historique
          </button>
        </div>

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div>
            {/* Category Filter */}
            <ShopCategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  userBalance={userBalance}
                  onPurchase={handlePurchase}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-xl text-gray-500">Aucun item trouvé dans cette catégorie</div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <ShopPurchaseHistory
            purchases={purchases}
            loading={false}
            onLoadMore={() => {}}
            hasMore={false}
          />
        )}
      </div>

      {/* Item Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{selectedItem.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-primary">{selectedItem.name}</h3>
                <span className="text-sm text-gray-500">{selectedItem.category}</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{selectedItem.description}</p>
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-bold text-primary">🍒 {selectedItem.price}</div>
              <span className="text-sm bg-accent-light text-primary px-3 py-1 rounded-full">
                {selectedItem.rarity}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  handlePurchase(selectedItem.id);
                  setShowModal(false);
                }}
                disabled={userBalance < selectedItem.price}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  userBalance >= selectedItem.price
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Acheter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { supabase } from '../lib/supabase';
import { CerisesService } from './cerises.service';

// Types and interfaces
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ItemCategory;
  icon: string;
  rarity: ItemRarity;
  is_active: boolean;
  created_at: string;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  item_id: string;
  purchased_at: string;
  item?: ShopItem;
}

export interface ShopCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export type ItemCategory = 'GAMES' | 'THEMES' | 'AVATARS' | 'POWERUPS' | 'DECORATIONS';
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

// Constants
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Error messages
const ERROR_MESSAGES = {
  INVALID_USER_ID: 'Invalid user ID',
  INVALID_ITEM_ID: 'Invalid item ID',
  INSUFFICIENT_CERISES: 'Insufficient cerises to purchase this item',
  ITEM_NOT_FOUND: 'Item not found',
  ITEM_NOT_AVAILABLE: 'Item is not available for purchase',
  PURCHASE_FAILED: 'Failed to purchase item',
  GET_ITEMS_FAILED: 'Failed to get shop items',
  GET_CATEGORIES_FAILED: 'Failed to get shop categories',
  GET_PURCHASES_FAILED: 'Failed to get user purchases',
  GET_ITEM_FAILED: 'Failed to get shop item'
} as const;

export class ShopService {
  private cerisesService: CerisesService;

  constructor() {
    this.cerisesService = new CerisesService();
  }

  /**
   * Get all available shop items
   */
  async getShopItems(category?: ItemCategory, limit: number = DEFAULT_LIMIT): Promise<ShopItem[]> {
    this.validateLimit(limit);
    
    try {
      let query = supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_ITEMS_FAILED);
    }
  }

  /**
   * Get shop item by ID
   */
  async getShopItem(itemId: string): Promise<ShopItem | null> {
    this.validateItemId(itemId);
    
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('id', itemId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_ITEM_FAILED);
    }
  }

  /**
   * Get shop categories
   */
  async getShopCategories(): Promise<ShopCategory[]> {
    try {
      const { data, error } = await supabase
        .from('shop_categories')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_CATEGORIES_FAILED);
    }
  }

  /**
   * Purchase an item
   */
  async purchaseItem(userId: string, itemId: string): Promise<UserPurchase> {
    this.validateUserId(userId);
    this.validateItemId(itemId);

    try {
      // Get item details
      const item = await this.getShopItem(itemId);
      if (!item) {
        throw new Error(ERROR_MESSAGES.ITEM_NOT_FOUND);
      }

      // Check if user has enough cerises
      const userBalance = await this.cerisesService.getUserCerises(userId);
      if (userBalance < item.price) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_CERISES);
      }

      // Check if user already owns this item (for non-consumable items)
      const existingPurchase = await this.getUserPurchase(userId, itemId);
      if (existingPurchase && item.category !== 'POWERUPS') {
        throw new Error('You already own this item');
      }

      // Deduct cerises
      await this.cerisesService.spendCerises(userId, item.price);

      // Record purchase
      const { data, error } = await supabase
        .from('user_purchases')
        .insert({
          user_id: userId,
          item_id: itemId,
          purchased_at: new Date().toISOString()
        })
        .select(`
          *,
          item:shop_items(*)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.PURCHASE_FAILED);
    }
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchases(userId: string, limit: number = DEFAULT_LIMIT): Promise<UserPurchase[]> {
    this.validateUserId(userId);
    this.validateLimit(limit);
    
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          item:shop_items(*)
        `)
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error(ERROR_MESSAGES.GET_PURCHASES_FAILED);
    }
  }

  /**
   * Check if user owns an item
   */
  async hasUserPurchased(userId: string, itemId: string): Promise<boolean> {
    this.validateUserId(userId);
    this.validateItemId(itemId);
    
    try {
      const purchase = await this.getUserPurchase(userId, itemId);
      return purchase !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's purchase for a specific item
   */
  private async getUserPurchase(userId: string, itemId: string): Promise<UserPurchase | null> {
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          item:shop_items(*)
        `)
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate user ID
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_USER_ID);
    }
  }

  /**
   * Validate item ID
   */
  private validateItemId(itemId: string): void {
    if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_ITEM_ID);
    }
  }

  /**
   * Validate limit parameter
   */
  private validateLimit(limit: number): void {
    if (limit < 1 || limit > MAX_LIMIT) {
      throw new Error(`Limit must be between 1 and ${MAX_LIMIT}`);
    }
  }
}

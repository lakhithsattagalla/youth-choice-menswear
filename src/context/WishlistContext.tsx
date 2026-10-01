import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

export interface WishlistItemType {
  id: string;
  product_id: string;
  name: string;
  brand_name: string;
  mrp: number;
  selling_price: number;
  discount_pct: number;
  image_url: string;
  in_stock: boolean;
}

interface WishlistContextType {
  items: WishlistItemType[];
  itemCount: number;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItemType[]>([]);

  const fetchWishlist = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const res = await apiRequest('/wishlist');
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      throw new Error('Please login to manage your wishlist');
    }
    const res = await apiRequest('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId })
    });
    await fetchWishlist();
    return res.inWishlist;
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const removeItem = async (productId: string) => {
    await apiRequest(`/wishlist/${productId}`, {
      method: 'DELETE'
    });
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider value={{ items, itemCount: items.length, toggleWishlist, isInWishlist, removeItem, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItemType {
  id: string;
  variant_id: string;
  product_id: string;
  name: string;
  brand_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  mrp: number;
  total_price: number;
  stock: number;
  image_url: string;
}

export interface CartSummary {
  subtotal: number;
  totalMrp: number;
  discount: number;
  delivery_fee: number;
  grand_total: number;
}

interface CartContextType {
  items: CartItemType[];
  summary: CartSummary;
  itemCount: number;
  isLoading: boolean;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    totalMrp: 0,
    discount: 0,
    delivery_fee: 0,
    grand_total: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setSummary({ subtotal: 0, totalMrp: 0, discount: 0, delivery_fee: 0, grand_total: 0 });
      return;
    }
    try {
      setIsLoading(true);
      const res = await apiRequest('/cart');
      setItems(res.items || []);
      setSummary(res.summary || { subtotal: 0, totalMrp: 0, discount: 0, delivery_fee: 0, grand_total: 0 });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (variantId: string, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add products to your cart');
    }
    await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity })
    });
    await fetchCart();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    await apiRequest(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    await fetchCart();
  };

  const removeItem = async (id: string) => {
    await apiRequest(`/cart/${id}`, {
      method: 'DELETE'
    });
    await fetchCart();
  };

  const clearCart = async () => {
    await apiRequest('/cart', {
      method: 'DELETE'
    });
    await fetchCart();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, summary, itemCount, isLoading, addToCart, updateQuantity, removeItem, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

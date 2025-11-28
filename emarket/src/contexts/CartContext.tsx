'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  promoPrice: number | null;
  quantity: number;
  imageUrl: string | null;
  maxQuantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dcat-emarket-cart';

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const isHydratedRef = useRef(false);

  // Load cart from localStorage on mount (client-side only)
  // This is a valid use case for setState in useEffect - hydrating from external storage
  useEffect(() => {
    if (!isHydratedRef.current) {
      const stored = loadCartFromStorage();
      if (stored.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(stored);
      }
      isHydratedRef.current = true;
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydratedRef.current) {
      saveCartToStorage(items);
    }
  }, [items]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === newItem.id);
      if (existingIndex >= 0) {
        // Update quantity if item exists
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQuantity = Math.min(
          existing.quantity + (newItem.quantity || 1),
          newItem.maxQuantity
        );
        updated[existingIndex] = { ...existing, quantity: newQuantity };
        return updated;
      }
      // Add new item
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.promoPrice ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

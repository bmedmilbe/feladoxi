"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Ad, CustomerProfile } from "@/types";

export interface CartItem {
  ad: Ad;
  quantity: number;
}

export interface SellerCartGroup {
  sellerKey: string;
  seller: CustomerProfile;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (ad: Ad, quantity?: number) => void;
  removeItem: (adId: number) => void;
  updateQuantity: (adId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  sellerGroups: SellerCartGroup[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("stpmarket_cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(parsed);
      } catch {
        window.localStorage.removeItem("stpmarket_cart");
      }
    }
    setHasLoadedCart(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && hasLoadedCart) {
      window.localStorage.setItem("stpmarket_cart", JSON.stringify(items));
    }
  }, [hasLoadedCart, items]);

  const addItem = (ad: Ad, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.ad.id === ad.id);
      if (existing) {
        return current.map((item) =>
          item.ad.id === ad.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { ad, quantity }];
    });
  };

  const removeItem = (adId: number) => {
    setItems((current) => current.filter((item) => item.ad.id !== adId));
  };

  const updateQuantity = (adId: number, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => (item.ad.id === adId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.ad.price || 0);
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const sellerGroups = useMemo<SellerCartGroup[]>(() => {
    const groups = new Map<string, SellerCartGroup>();

    items.forEach((item) => {
      const seller = item.ad.customer;
      const sellerKey = String(seller.id || seller.mobile_number);
      const itemTotal = Number(item.ad.price || 0) * item.quantity;
      const existing = groups.get(sellerKey);

      if (existing) {
        existing.items.push(item);
        existing.totalItems += item.quantity;
        existing.subtotal += itemTotal;
        return;
      }

      groups.set(sellerKey, {
        sellerKey,
        seller,
        items: [item],
        totalItems: item.quantity,
        subtotal: itemTotal,
      });
    });

    return Array.from(groups.values());
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        sellerGroups,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}

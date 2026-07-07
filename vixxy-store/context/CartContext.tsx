"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartItem, Product } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  items: CartItem[];
  selectedItemKeys: string[];
  addItem: (product: Product, size?: string) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  toggleSelectItem: (key: string) => void;
  toggleSelectAll: () => void;
  clear: () => void;
  clearSelected: () => void;
  total: number;
  selectedTotal: number;
  count: number;
  selectedCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function cartItemKey(productId: string, size?: string) {
  return `${productId}::${size ?? "default"}`;
}

function getCartStorageKey(userEmail: string | null) {
  if (!userEmail) return "vixxy_cart_guest";
  return `vixxy_cart_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItemKeys, setSelectedItemKeys] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const storageKey = useMemo(() => getCartStorageKey(user?.email), [user?.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsedItems = JSON.parse(raw);
        setItems(parsedItems);
        // Select all items by default when loading
        setSelectedItemKeys(parsedItems.map((i: CartItem) => cartItemKey(i.product.id, i.size)));
      } else {
        setItems([]);
        setSelectedItemKeys([]);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, hydrated, storageKey]);

  const addItem = useCallback((product: Product, size?: string) => {
    setItems((prev) => {
      const key = cartItemKey(product.id, size);
      const idx = prev.findIndex(
        (i) => cartItemKey(i.product.id, i.size) === key
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      // Auto select new item
      setSelectedItemKeys((prev) => [...prev, key]);
      return [...prev, { product, quantity: 1, size }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartItemKey(i.product.id, i.size) !== key));
    setSelectedItemKeys((prev) => prev.filter((k) => k !== key));
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        cartItemKey(i.product.id, i.size) === key ? { ...i, quantity: qty } : i
      )
    );
  }, []);

  const toggleSelectItem = useCallback((key: string) => {
    setSelectedItemKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItemKeys.length === items.length) {
      setSelectedItemKeys([]);
    } else {
      setSelectedItemKeys(items.map((i) => cartItemKey(i.product.id, i.size)));
    }
  }, [selectedItemKeys.length, items]);

  const clear = useCallback(() => {
    setItems([]);
    setSelectedItemKeys([]);
  }, []);

  const clearSelected = useCallback(() => {
    setItems((prev) => prev.filter((i) => !selectedItemKeys.includes(cartItemKey(i.product.id, i.size))));
    setSelectedItemKeys([]);
  }, [selectedItemKeys]);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [items]
  );

  const selectedTotal = useMemo(
    () => {
      const selectedItems = items.filter((i) => selectedItemKeys.includes(cartItemKey(i.product.id, i.size)));
      return selectedItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    },
    [items, selectedItemKeys]
  );

  const count = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  const selectedCount = useMemo(
    () => {
      const selectedItems = items.filter((i) => selectedItemKeys.includes(cartItemKey(i.product.id, i.size)));
      return selectedItems.reduce((s, i) => s + i.quantity, 0);
    },
    [items, selectedItemKeys]
  );

  const value = useMemo(
    () => ({
      items,
      selectedItemKeys,
      addItem,
      removeItem,
      updateQty,
      toggleSelectItem,
      toggleSelectAll,
      clear,
      clearSelected,
      total,
      selectedTotal,
      count,
      selectedCount,
    }),
    [
      items,
      selectedItemKeys,
      addItem,
      removeItem,
      updateQty,
      toggleSelectItem,
      toggleSelectAll,
      clear,
      clearSelected,
      total,
      selectedTotal,
      count,
      selectedCount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

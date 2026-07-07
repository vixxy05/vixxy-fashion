"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Product } from "@/lib/types";
import { products } from "@/lib/products";
import { useAuth } from "./AuthContext";

interface WishlistContextValue {
  ids: string[];
  items: Product[];
  isFavorite: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function getWishlistStorageKey(userEmail: string | null) {
  if (!userEmail) return "vixxy_wishlist_guest";
  return `vixxy_wishlist_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const storageKey = useMemo(() => getWishlistStorageKey(user?.email), [user?.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setIds(JSON.parse(raw));
      else setIds([]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(ids));
  }, [ids, hydrated, storageKey]);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((product: Product) => {
    setIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const items = useMemo(
    () =>
      ids
        .map((id) => products.find((p) => p.id === id))
        .filter((product): product is Product => Boolean(product)),
    [ids]
  );

  const value = useMemo(
    () => ({
      ids,
      items,
      isFavorite,
      toggle,
      remove,
      count: ids.length,
    }),
    [ids, items, isFavorite, toggle, remove]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

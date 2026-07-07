"use client";

import { useEffect, useState } from "react";
import { subscribeProducts } from "@/lib/productData";
import { Product } from "@/lib/types";
import { products as seedProducts } from "@/lib/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeProducts((nextProducts) => {
      setProducts(nextProducts);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { products, loading };
}

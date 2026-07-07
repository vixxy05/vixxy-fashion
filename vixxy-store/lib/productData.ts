"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "@/lib/firebase";
import { products as seedProducts } from "@/lib/products";
import { Product } from "@/lib/types";

const STORAGE_KEY = "vixxy_products";
const PRODUCTS_EVENT = "vixxy-products-updated";

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    discountPrice: product.discountPrice ?? undefined,
    stockQuantity: Number(product.stockQuantity ?? 0),
    price: Number(product.price ?? 0),
    updatedAt: product.updatedAt || new Date().toISOString(),
    createdAt: product.createdAt || new Date().toISOString(),
  };
}

export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return seedProducts;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw).map(normalizeProduct);
  } catch {
    // Reseed below.
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts));
  return seedProducts;
}

function saveLocalProducts(nextProducts: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts.map(normalizeProduct)));
  window.dispatchEvent(new CustomEvent(PRODUCTS_EVENT));
}

export function subscribeProducts(callback: (products: Product[]) => void) {
  if (hasFirebaseConfig() && db) {
    const productsQuery = query(collection(db, "products"), orderBy("updatedAt", "desc"));
    return onSnapshot(productsQuery, (snapshot) => {
      const nextProducts = snapshot.docs.map((item) => normalizeProduct(item.data() as Product));
      callback(nextProducts.length ? nextProducts : seedProducts);
    });
  }

  callback(getLocalProducts());
  const handler = () => callback(getLocalProducts());
  window.addEventListener(PRODUCTS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(PRODUCTS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export async function saveProduct(product: Product) {
  const nextProduct = normalizeProduct({
    ...product,
    updatedAt: new Date().toISOString(),
    createdAt: product.createdAt || new Date().toISOString(),
  });

  if (hasFirebaseConfig() && db) {
    await setDoc(doc(db, "products", String(nextProduct.id)), nextProduct);
    return nextProduct;
  }

  const currentProducts = getLocalProducts();
  const index = currentProducts.findIndex((item) => item.id === nextProduct.id);
  const nextProducts =
    index >= 0
      ? currentProducts.map((item) => (item.id === nextProduct.id ? nextProduct : item))
      : [nextProduct, ...currentProducts];
  saveLocalProducts(nextProducts);
  return nextProduct;
}

export async function deleteProduct(productId: number) {
  if (hasFirebaseConfig() && db) {
    await deleteDoc(doc(db, "products", String(productId)));
    return;
  }

  saveLocalProducts(getLocalProducts().filter((product) => product.id !== productId));
}

export function createBlankProduct(): Product {
  const now = new Date().toISOString();
  return {
    id: Date.now(),
    name: "New Product",
    slug: `product-${Date.now()}`,
    sku: `SKU-${Date.now().toString().slice(-6)}`,
    price: 0,
    stockQuantity: 0,
    isActive: true,
    isFeatured: false,
    category: "clothing",
    image: "/images/banner.png",
    images: ["/images/banner.png"],
    sizes: ["One Size"],
    createdAt: now,
    updatedAt: now,
  };
}

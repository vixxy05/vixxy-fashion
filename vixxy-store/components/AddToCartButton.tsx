"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  size,
  quantity = 1,
  className = "",
}: {
  product: Product;
  size?: string;
  quantity?: number;
  className?: string;
}) {
  const { addItem } = useCart();
  const { user, redirectToLogin } = useAuth();
  const [added, setAdded] = useState(false);

  const selectedSize = size || "One Size";
  const sizeStock = product.sizeStock || {};
  const isOutOfStock = sizeStock[selectedSize] !== undefined ? Number(sizeStock[selectedSize]) <= 0 : Number(product.stockQuantity || 0) <= 0;

  const handleClick = () => {
    if (!user) {
      redirectToLogin();
      return;
    }
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, size);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.button
      type="button"
      whileTap={isOutOfStock ? {} : { scale: 0.98 }}
      onClick={handleClick}
      disabled={isOutOfStock}
      className={`w-full bg-black px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed ${className}`}
    >
      {isOutOfStock ? "Hết hàng" : added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
    </motion.button>
  );
}

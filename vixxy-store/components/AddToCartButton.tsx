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

  const handleClick = () => {
    if (!user) {
      redirectToLogin();
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem(product, size);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`w-full bg-black px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:opacity-70 ${className}`}
    >
      {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
    </motion.button>
  );
}

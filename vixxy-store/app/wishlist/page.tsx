"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const { items, remove } = useWishlist();

  if (!user) {
    return (
      <div className="mx-auto max-w-site px-4 py-20 text-center md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
          Yêu thích
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Đăng nhập để xem danh sách yêu thích
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600">
          Vui lòng đăng nhập để xem và quản lý danh sách sản phẩm yêu thích của bạn.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="bg-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="border border-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black hover:text-white"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-neutral-200 pb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
          Yêu thích
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Danh sách yêu thích
        </h1>
      </motion.div>

      {items.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product, index) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} index={index} />
              <button
                type="button"
                onClick={() => remove(product.id)}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-black hover:bg-white"
                aria-label="Xóa khỏi yêu thích"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 text-center">
          <p className="text-neutral-600">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block bg-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800"
          >
            Mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  );
}

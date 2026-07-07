"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cartItemKey, useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const {
    items,
    selectedItemKeys,
    removeItem,
    updateQty,
    toggleSelectItem,
    toggleSelectAll,
    clear,
    selectedTotal,
    count,
    selectedCount,
  } = useCart();
  const { user, redirectToLogin } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="mx-auto max-w-site px-4 py-24 text-center md:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold"
        >
          Giỏ hàng
        </motion.h1>
        <p className="mt-4 text-neutral-600">
          Vui lòng đăng nhập để xem giỏ hàng của bạn.
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

  if (count === 0) {
    return (
      <div className="mx-auto max-w-site px-4 py-24 text-center md:px-8">
        <h1 className="font-display text-3xl font-bold">Giỏ hàng</h1>
        <p className="mt-4 text-neutral-600">
          Giỏ hàng của bạn đang trống.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block bg-black px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (selectedCount === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold"
      >
        Giỏ hàng ({count})
      </motion.h1>

      {/* Select All */}
      <div className="mt-6 flex items-center gap-3 pb-4 border-b border-neutral-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedItemKeys.length === items.length && items.length > 0}
            onChange={toggleSelectAll}
            className="w-5 h-5"
          />
          <span className="text-sm">Chọn tất cả</span>
        </label>
        {selectedCount > 0 && (
          <span className="text-sm text-neutral-500">
            Đã chọn {selectedCount} sản phẩm
          </span>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <ul className="space-y-6 lg:col-span-2">
          {items.map((item, i) => {
            const key = cartItemKey(item.product.id, item.size);
            const isSelected = selectedItemKeys.includes(key);

            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-4 border-b border-neutral-200 pb-6 md:gap-6 ${!isSelected ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col items-center justify-start gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectItem(key)}
                    className="w-5 h-5 mt-1"
                  />
                </div>
                <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-neutral-100 md:h-36 md:w-28">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    {item.size && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Size: {item.size}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-semibold">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        type="button"
                        className="px-3 py-1 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={() => updateQty(key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className="min-w-[2rem] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1 hover:bg-neutral-100"
                        onClick={() => updateQty(key, item.quantity + 1)}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="text-xs uppercase tracking-wider text-neutral-500 hover:text-black"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <aside className="h-fit border border-neutral-200 p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Tóm tắt
          </h2>
          <div className="mt-4 flex justify-between">
            <span className="text-sm text-neutral-600">Sản phẩm đã chọn</span>
            <span className="font-medium">{selectedCount}</span>
          </div>
          <div className="mt-2 flex justify-between text-lg">
            <span>Tạm tính</span>
            <span className="font-semibold">{formatPrice(selectedTotal)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Phí vận chuyển tính khi thanh toán
          </p>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={selectedCount === 0}
            className="mt-6 w-full bg-black py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiến hành thanh toán
          </button>
          <button
            type="button"
            onClick={clear}
            className="mt-3 w-full py-2 text-xs uppercase tracking-wider text-neutral-500 hover:text-black"
          >
            Xóa giỏ hàng
          </button>
        </aside>
      </div>
    </div>
  );
}
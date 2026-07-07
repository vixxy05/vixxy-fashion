"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/products";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products } = useProducts();
  const product = products.find((p) => p.id === Number(id));
  const { isFavorite, toggle } = useWishlist();
  const { user, redirectToLogin } = useAuth();
  const [size, setSize] = useState<string | undefined>(
    product?.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.image ?? "");

  useEffect(() => {
    setActiveImage(product?.image ?? "");
    setSize(product?.sizes?.[0]);
    setQuantity(1);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-site px-4 py-24 text-center">
        <p className="text-lg text-neutral-600">Không tìm thấy sản phẩm.</p>
        <Link href="/products" className="mt-4 inline-block font-semibold underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const handleToggleWishlist = () => {
    if (!user) {
      redirectToLogin();
      return;
    }
    toggle(product);
  };

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const gallery = Array.from(new Set([product.image, ...(product.images ?? [])]));
  const selectedImage = activeImage || product.image;
  const favorite = isFavorite(product.id);

  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-[350/530] overflow-hidden bg-neutral-100 rounded-lg">
            <img
              src={selectedImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              style={{
                objectPosition:
                  selectedImage === product.image
                    ? product.imageObjectPosition ?? "center"
                    : "center",
                transform:
                  selectedImage === product.image && product.imageScale
                    ? `scale(${product.imageScale})`
                    : undefined,
              }}
            />
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`relative aspect-square overflow-hidden border-2 rounded-lg bg-neutral-100 transition-all ${
                    selectedImage === image
                      ? "border-black ring-2 ring-black/20"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                  aria-label={`Xem ảnh ${product.name}`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            {product.collection ?? product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold">{formatPrice(product.price)}</p>
          <p className="mt-6 leading-relaxed text-neutral-700">
            {product.description}
          </p>

          <div className="mt-8 grid gap-4 border-y border-neutral-200 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Chất liệu
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {product.material ?? "Chất liệu cao cấp được tuyển chọn cho từng thiết kế."}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Bảo quản
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {product.care ?? "Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp."}
              </p>
            </div>
          </div>

          {product.details && product.details.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider">
                Thông tin chi tiết
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                {product.details.map((detail) => (
                  <li key={detail} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider">
                Kích cỡ
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-[44px] border px-4 py-2 text-sm transition rounded ${
                      size === s
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Số lượng
            </p>
            <div className="mt-3 flex items-center gap-2 border border-neutral-300 rounded w-fit">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg font-bold hover:bg-neutral-100 transition"
                aria-label="Giảm số lượng"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-lg font-bold hover:bg-neutral-100 transition"
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
            <AddToCartButton product={product} size={size} quantity={quantity} />
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`border px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition rounded ${
                favorite
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 text-black hover:border-black"
              }`}
            >
              {favorite ? "Đã yêu thích" : "Yêu thích"}
            </button>
          </div>

          {user && (
            <Link
              href="/cart"
              className="mt-4 block text-center text-xs uppercase tracking-wider underline-offset-4 hover:underline"
            >
              Xem giỏ hàng
            </Link>
          )}
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-neutral-200 pt-16">
          <h2 className="font-display text-2xl font-bold">Có thể bạn thích</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

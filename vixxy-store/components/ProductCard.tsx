"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/products";
import { Product } from "@/lib/types";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const placeholderImage = "https://picsum.photos/350/530?random=" + product.id;
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[350/530] overflow-hidden bg-neutral-100">
          <img
            src={product.image || placeholderImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            style={{
              objectPosition: product.imageObjectPosition ?? "center",
              transform: product.imageScale
                ? `scale(${product.imageScale})`
                : undefined,
            }}
          />
        </div>
        <div className="mt-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide">
              {product.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {product.discountPrice ? (
                <>
                  <span className="text-sm text-red-600 font-medium">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-xs text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-sm text-neutral-600">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
          <span className="text-lg opacity-0 transition group-hover:opacity-100">
            →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

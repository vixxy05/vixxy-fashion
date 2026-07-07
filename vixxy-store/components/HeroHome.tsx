"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroHome() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden md:min-h-[85vh]">
      <img
        src="/images/nentrangchu.png"
        alt="VIXXY D'ORANCE — Bộ sưu tập mới"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-site flex-col justify-center items-end px-6 py-16 md:min-h-[85vh] md:px-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-right"
        >
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-white/90">
            Bộ sưu tập 2026
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
            VIXXY D&apos;ORANCE
          </h1>
          <p className="mt-4 max-w-lg text-sm text-white/85 md:text-base">
            Thời trang nữ cao cấp — tối giản, thanh lịch, dành cho phụ nữ hiện đại.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-end">
            <Link
              href="/products"
              className="bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-neutral-100"
            >
              Mua sắm ngay
            </Link>
            <Link
              href="/products?category=clothing"
              className="border border-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
            >
              Trang phục
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

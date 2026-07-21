"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBanners } from "@/lib/banners";
import { Banner } from "@/lib/types";

export function HeroHome() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const list = getBanners().filter((b) => b.isActive);
    setBanners(list);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <section className="relative min-h-[70vh] w-full overflow-hidden md:min-h-[85vh] bg-neutral-100 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden md:min-h-[85vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full bg-[#181514] flex items-center justify-center"
        >
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className={`absolute inset-0 h-full w-full transition-all duration-700 ${
              currentBanner.imageFit === "contain"
                ? "object-contain bg-[#181514] p-4 md:p-8"
                : "object-cover object-center"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-[70vh] max-w-site flex-col justify-center items-end px-6 py-16 md:min-h-[85vh] md:px-12 md:py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-right max-w-xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-white/90">
              Khám phá bộ sưu tập mới
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white md:text-6xl drop-shadow-sm">
              {currentBanner.title}
            </h1>
            {currentBanner.subtitle && (
              <p className="mt-4 text-sm text-white/85 md:text-base leading-relaxed">
                {currentBanner.subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-4 justify-end">
              <Link
                href={currentBanner.link}
                className="bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-neutral-100 rounded-lg shadow-md"
              >
                Xem chi tiết
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroHome } from "@/components/HeroHome";
import { ProductCard } from "@/components/ProductCard";
import { SectionBanner } from "@/components/SectionBanner";
import { useProducts } from "@/hooks/useProducts";
import { useState, useEffect } from "react";

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10 text-center md:mb-14"
    >
      <h2 className="font-display text-2xl font-bold uppercase tracking-[0.15em] md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm text-neutral-600">{subtitle}</p>
      )}
    </motion.div>
  );
}

// Banner component for dynamic banners
function DynamicBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBanners(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || banners.length === 0) return null;

  return (
    <div className="bg-yellow-50 py-8">
      <div className="mx-auto max-w-site px-4 md:px-8">
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative overflow-hidden rounded-2xl"
            >
              {banner.linkUrl ? (
                <Link href={banner.linkUrl}>
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-auto"
                  />
                </Link>
              ) : (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-auto"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { products } = useProducts();
  const clothing = products.filter((p) => p.category === "clothing" && p.isActive);
  const jewelry = products.filter((p) => p.category === "jewelry" && p.isActive);
  const accessories = products.filter((p) => p.category === "accessories" && p.isActive);

  return (
    <>
      <HeroHome />
      <DynamicBanners />

      <section className="bg-[#ECEAEA] py-16 md:py-24">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <SectionTitle
            title="Trang phục nổi bật"
            subtitle="Haute couture — từng đường cắt tinh xảo"
          />
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {clothing.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/products?category=clothing"
              className="inline-block border border-black px-10 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      </section>

      <SectionBanner
        image="/images/Banner_Pearl.png"
        title="Pearl Collection"
        subtitle="Ngọc trai và vàng hồng — vẻ đẹp vượt thời gian"
        href="/products?category=jewelry"
        minH="min-h-[380px] md:min-h-[480px]"
      />

      <section className="bg-[#f5f2ec] py-16 md:py-24">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <SectionTitle title="Trang sức" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {jewelry.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <SectionBanner
        image="/images/banner-accessories.png"
        title="Accessories"
        subtitle="Phụ kiện cao cấp hoàn thiện phong cách của bạn"
        href="/products?category=accessories"
        align="center"
        minH="min-h-[380px] md:min-h-[480px]"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <SectionTitle title="Phụ kiện" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {accessories.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const filters: { value: string; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "clothing", label: "Trang phục" },
  { value: "jewelry", label: "Trang sức" },
  { value: "accessories", label: "Phụ kiện" },
];

const categoryTitle: Record<string, string> = {
  all: "Sản phẩm",
  clothing: "Trang phục",
  jewelry: "Trang sức",
  accessories: "Phụ kiện",
};

function normalizeCategory(value: string | null) {
  return filters.some((filter) => filter.value === value) ? String(value) : "all";
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initial = normalizeCategory(searchParams.get("category"));
  const searchParam = searchParams.get("search");
  const [category, setCategory] = useState(initial);
  const [query, setQuery] = useState(searchParam || "");
  const [sort, setSort] = useState("featured");
  const { products } = useProducts();

  useEffect(() => {
    setCategory(normalizeCategory(searchParams.get("category")));
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = category === "all"
      ? products
      : products.filter((p) => p.category === category);
    result = result.filter((p) => p.isActive);

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (sort === "price-asc") {
      result = [...result].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sort === "price-desc") {
      result = [...result].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else {
      result = [...result].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [category, query, sort, products]);

  return (
    <div className="mx-auto max-w-site px-4 py-14 md:px-8 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center md:mb-16"
      >
	        <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
	          {query ? `Kết quả: "${query}"` : categoryTitle[category]}
	        </h1>
	        <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 md:text-lg">
	          {query 
	            ? `Đang hiển thị kết quả tìm kiếm cho "${query}"`
	            : category === "all"
	            ? "Khám phá toàn bộ bộ sưu tập thời trang nữ cao cấp"
	            : "Danh sách sản phẩm đã được lọc theo danh mục bạn chọn"}
	        </p>
      </motion.div>

      <div className="mb-8 flex justify-center md:justify-end">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder="Tìm sản phẩm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-black sm:w-72"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-black"
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="featured">Sắp xếp mặc định</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="py-20 text-center text-neutral-500">
          Không tìm thấy sản phẩm.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-site px-4 py-24 text-center text-neutral-500">
          Đang tải...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

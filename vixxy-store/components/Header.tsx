"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/stores/authStore";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/lib/products";

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { count } = useCart();
  const user = useAuthStore((state) => state.user);
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof products>([]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/products") {
      return pathname === "/products" && !searchParams.get("category");
    }
    if (href.startsWith("/products?category=")) {
      const category = href.split("category=")[1];
      return pathname === "/products" && searchParams.get("category") === category;
    }
    return pathname === href;
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/promotions", label: "Ưu đãi" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/products?category=clothing", label: "Trang phục" },
    { href: "/products?category=jewelry", label: "Trang sức" },
    { href: "/products?category=accessories", label: "Phụ kiện" },
    { href: "/about", label: "Thông tin" },
    ...(user ? [{ href: "/orders", label: "Đơn hàng" }] : []),
    ...(user && (user.role?.roleName === "ADMIN" || user.role?.roleName === "SUPER_ADMIN" || user.roleId === 2)
      ? [{ href: "/admin/dashboard", label: "Quản trị" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-2 py-4 md:px-4">
        <Link href="/" className="font-display text-xl font-bold tracking-wide md:text-2xl mr-auto">
          VIXXY D&apos;ORANCE
        </Link>

        <nav className="hidden flex-1 justify-center gap-4 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-semibold uppercase tracking-widest transition hover:text-brand-gold ${
                isActive(item.href) ? "text-brand-gold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="p-1 hover:text-brand-gold transition" 
            aria-label="Tìm kiếm"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 1 0-10.607-10.607 7.5 7.5 0 0 0 10.607 10.607z" />
            </svg>
          </button>
          
          {user ? (
            <Link
              href="/account"
              className="hidden text-xs uppercase tracking-wider hover:text-brand-gold sm:block"
            >
              {user.fullName}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden text-xs uppercase tracking-wider hover:text-brand-gold sm:block"
            >
              Tài khoản
            </Link>
          )}
          
          {/* Wishlist Icon */}
          {user && (
            <Link href="/wishlist" className="relative p-1" aria-label="Yêu thích">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </Link>
          )}
          
          {/* Cart Icon */}
          <Link href="/cart" className="relative p-1" aria-label="Giỏ hàng">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M6 6h15l-1.5 9H8L6 6zM9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black"
              >
                {count}
              </motion.span>
            )}
          </Link>
          
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center border border-white/20 lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Mở menu"
          >
            <span className="sr-only">Menu</span>
            <span className="block h-4 w-4 border-y-2 border-white" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 px-4 py-4 lg:hidden"
        >
          <div className="mx-auto flex max-w-site flex-col gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`py-2 text-sm font-semibold uppercase tracking-widest ${
                  isActive(item.href) ? "text-brand-gold" : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/wishlist"
                  onClick={closeMenu}
                  className={`py-2 text-sm font-semibold uppercase tracking-widest ${
                    isActive("/wishlist") ? "text-brand-gold" : "text-white"
                  }`}
                >
                  Yêu thích
                </Link>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className={`py-2 text-sm font-semibold uppercase tracking-widest ${
                    isActive("/account") ? "text-brand-gold" : "text-white"
                  }`}
                >
                  {user.fullName}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className={`py-2 text-sm font-semibold uppercase tracking-widest ${
                  isActive("/login") ? "text-brand-gold" : "text-white"
                }`}
              >
                Tài khoản
              </Link>
            )}
          </div>
        </motion.nav>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/50 z-60"
            />
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-0 left-0 right-0 bg-black text-white z-70 border-b border-white/10"
            >
              <div className="mx-auto max-w-site px-4 py-8 md:px-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">Tìm kiếm sản phẩm</h2>
                  <button 
                    onClick={() => setSearchOpen(false)} 
                    className="p-1 hover:text-brand-gold transition"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSearchSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm cần tìm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/60 outline-none focus:border-brand-gold"
                    />
                    <button 
                      type="submit"
                      className="bg-white text-black px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-neutral-200 transition"
                    >
                      Tìm
                    </button>
                  </div>
                </form>
                {searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider mb-4 opacity-70">Kết quả tìm kiếm ({searchResults.length})</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex gap-3 items-center p-3 border border-white/10 hover:border-white/30 transition"
                        >
                          <div className="w-16 h-16 bg-white/10 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm opacity-70">{product.price.toLocaleString("vi-VN")}đ</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <p className="text-center py-8 opacity-70">Không tìm thấy sản phẩm nào</p>
                ) : (
                  <p className="text-center py-8 opacity-70">Nhập từ khóa để tìm kiếm</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white dark:bg-neutral-950 lg:grid-cols-2">
      <div className="relative hidden min-h-[400px] lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-brown to-neutral-900" />
        <img
          src="/images/nen_dk-dn.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="relative flex h-full flex-col justify-start pt-48 px-12 text-white text-center items-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl font-bold"
          >
            VIXXY D&apos;ORANCE
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-md text-white/80 text-lg"
          >
            Thời trang nữ cao cấp — trải nghiệm mua sắm premium.
          </motion.p>

        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 md:px-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
            >
              ← Trang chủ
            </Link>
            <ThemeToggle />
          </div>
          <h1 className="mt-8 font-display text-4xl font-bold text-neutral-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          )}
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-8 text-sm text-neutral-600 dark:text-neutral-400">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}

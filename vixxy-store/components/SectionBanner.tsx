"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  image: string;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  href?: string;
  align?: "left" | "center";
  minH?: string;
};

export function SectionBanner({
  image,
  title,
  subtitle,
  href = "#",
  align = "left",
  minH = "min-h-[420px]",
}: Props) {
  return (
    <section className={`relative overflow-hidden ${minH}`}>
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/20" />
      <div
        className={`relative mx-auto flex max-w-site flex-col justify-center px-6 py-16 md:px-12 ${
          align === "center" ? "items-center text-center" : "items-start text-left"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="font-script text-4xl text-brand-gold md:text-5xl">{title}</div>
          {subtitle && (
            <p className="mt-4 max-w-md font-display text-sm text-white md:text-base">
              {subtitle}
            </p>
          )}
          {href && (
            <Link
              href={href}
              className="mt-6 inline-block bg-white px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-neutral-100"
            >
              Khám phá ngay
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

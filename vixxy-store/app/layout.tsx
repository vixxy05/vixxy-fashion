import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Courgette,
  Inter,
  Playfair_Display,
} from "next/font/google";
import dynamic from "next/dynamic";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { env } from "@/lib/env";
import "./globals.css";

const ChatWidget = dynamic(
  () => import("@/components/ChatWidget").then((mod) => mod.ChatWidget),
  { ssr: false }
);

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const courgette = Courgette({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-courgette",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.baseUrl),
  title: {
    default: "VIXXY D'ORANCE — Thời trang nữ cao cấp",
    template: "%s | VIXXY D'ORANCE",
  },
  description:
    "Thời trang nữ hiện đại, phong cách premium — trang phục, trang sức và phụ kiện.",
  keywords: [
    "VIXXY D'ORANCE",
    "thời trang nữ",
    "trang phục",
    "trang sức",
    "phụ kiện",
    "thương mại điện tử",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: env.baseUrl,
    siteName: "VIXXY D'ORANCE",
    title: "VIXXY D'ORANCE — Thời trang nữ cao cấp",
    description:
      "Thời trang nữ hiện đại, phong cách premium — trang phục, trang sức và phụ kiện.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${inter.variable} ${courgette.variable}`}
    >
      <body>
        <Providers>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}

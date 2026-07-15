import { Banner } from "./types";

const BANNERS_KEY = "vixxy_banners";
const BANNERS_EVENT = "vixxy-banners-updated";

const seedBanners: Banner[] = [
  {
    id: "1",
    title: "VIXXY D'ORANCE",
    subtitle: "Thời trang nữ cao cấp — tối giản, thanh lịch, dành cho phụ nữ hiện đại.",
    image: "/images/nentrangchu.png",
    link: "/products",
    isActive: true,
  },
  {
    id: "2",
    title: "Pearl Collection",
    subtitle: "Ngọc trai và vàng hồng — vẻ đẹp tinh khiết vượt thời gian.",
    image: "/images/Banner_Pearl.png",
    link: "/products?category=jewelry",
    isActive: true,
  },
  {
    id: "3",
    title: "Accessories",
    subtitle: "Phụ kiện cao cấp tinh xảo giúp hoàn thiện phong cách thời thượng của bạn.",
    image: "/images/banner-accessories.png",
    link: "/products?category=accessories",
    isActive: true,
  }
];

export function getBanners(): Banner[] {
  if (typeof window === "undefined") return seedBanners;
  try {
    const raw = localStorage.getItem(BANNERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore and reseed
  }
  localStorage.setItem(BANNERS_KEY, JSON.stringify(seedBanners));
  return seedBanners;
}

export function saveBanners(banners: Banner[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
  window.dispatchEvent(new CustomEvent(BANNERS_EVENT));
}

export function addBanner(banner: Banner) {
  const banners = getBanners();
  const index = banners.findIndex((b) => b.id === banner.id);
  if (index >= 0) {
    banners[index] = banner;
  } else {
    banners.push(banner);
  }
  saveBanners(banners);
}

export function deleteBanner(id: string) {
  const banners = getBanners();
  const filtered = banners.filter((b) => b.id !== id);
  saveBanners(filtered);
}

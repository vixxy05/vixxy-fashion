import { Banner } from "./types";

const BANNERS_KEY = "vixxy_banners_v4";
const BANNERS_EVENT = "vixxy-banners-updated";

const seedBanners: Banner[] = [
  {
    id: "1",
    title: "BỘ SƯU TẬP TRANG PHỤC",
    subtitle: "Thời trang nữ cao cấp — tối giản, thanh lịch, dành cho phụ nữ hiện đại.",
    image: "/images/nentrangchu.png",
    link: "/products?category=clothing",
    isActive: true,
    imageFit: "cover",
    imagePosition: "object-center",
  },
  {
    id: "2",
    title: "BỘ SƯU TẬP TRANG SỨC",
    subtitle: "Trang sức ngọc trai & đá quý tinh xảo — tôn vinh vẻ đẹp kiêu sa, sang trọng.",
    image: "/images/Banner_Pearl.png",
    link: "/products?category=jewelry",
    isActive: true,
    imageFit: "cover",
    imagePosition: "object-center",
  },
  {
    id: "3",
    title: "BỘ SƯU TẬP PHỤ KIỆN",
    subtitle: "Túi xách da yến, nón & phụ kiện cao cấp hoàn thiện phong cách thời thượng.",
    image: "/images/banner-accessories.png",
    link: "/products?category=accessories",
    isActive: true,
    imageFit: "cover",
    imagePosition: "object-center",
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

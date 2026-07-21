import { Order } from "./types";
import { getAllOrders } from "./orders";

export interface ProductReview {
  id: string;
  productId: number;
  userId: number;
  userName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  images?: string[];
  createdAt: string;
  isVerifiedBuyer: boolean;
}

const REVIEWS_KEY = "vixxy_reviews_v2";

const seedReviews: ProductReview[] = [
  {
    id: "rev1",
    productId: 1,
    userId: 101,
    userName: "Nguyễn Khánh Linh",
    rating: 5,
    comment: "Sản phẩm hoàn thiện cực kỳ tinh xảo, chất liệu vải cao cấp mặc rất mát và đứng dáng. Sẽ tiếp tục mua ủng hộ Vixxy!",
    images: ["/images/products/dress-1.jpg"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isVerifiedBuyer: true,
  },
  {
    id: "rev2",
    productId: 1,
    userId: 102,
    userName: "Trần Thị Mai",
    rating: 4,
    comment: "Giao hàng siêu nhanh, đóng gói hộp carton đen rất sang xịn mịn. Hơi rộng so với mình một chút nhưng vẫn ok.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isVerifiedBuyer: true,
  },
  {
    id: "rev3",
    productId: 2,
    userId: 103,
    userName: "Lê Thùy Dương",
    rating: 5,
    comment: "Trang sức lấp lánh đẹp lắm, đeo đi tiệc sang chảnh thực sự. Sẽ giới thiệu cho bạn bè!",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isVerifiedBuyer: true,
  },
  {
    id: "rev4",
    productId: 3,
    userId: 104,
    userName: "Phạm Bích Ngọc",
    rating: 5,
    comment: "Chất lượng sản phẩm tuyệt vời, đúng như mô tả. Phụ kiện đi kèm xịn xò lắm nha.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isVerifiedBuyer: true,
  }
];

export function getProductReviews(productId: number): ProductReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) {
      const all: ProductReview[] = JSON.parse(raw);
      return all.filter((r) => r.productId === productId);
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(seedReviews));
  return seedReviews.filter((r) => r.productId === productId);
}

export function hasUserPurchasedProduct(userId: string, productId: number): boolean {
  if (typeof window === "undefined") return false;
  const orders = getAllOrders();
  return orders.some(
    (order) =>
      (String(order.userId) === String(userId) || order.shippingInfo?.email === userId) &&
      order.orderStatus === "delivered" &&
      order.items.some((item) => item.product.id === productId)
  );
}

export function addProductReview(review: Omit<ProductReview, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    const all: ProductReview[] = raw ? JSON.parse(raw) : seedReviews;
    const newRev: ProductReview = {
      ...review,
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(REVIEWS_KEY, JSON.stringify([newRev, ...all]));
  } catch (e) {
    console.error(e);
  }
}

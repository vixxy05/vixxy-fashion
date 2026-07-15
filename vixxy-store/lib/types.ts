export type Category = "clothing" | "jewelry" | "accessories";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional for backward compatibility (display)
  category?: Category;
  image?: string;
  imageObjectPosition?: string;
  imageScale?: number;
  images?: string[];
  details?: string[];
  collection?: string;
  material?: string;
  care?: string;
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface Role {
  id: number;
  roleName: string;
  description?: string;
}

export interface User {
  id: number;
  email: string;
  phone?: string;
  username?: string;
  fullName: string;
  avatar?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  status: "active" | "inactive" | "banned";
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
  roleId: number;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | "paying"
  | "payment_failed"
  | "pending" 
  | "confirmed" 
  | "shipping" 
  | "delivered" 
  | "cancelled"
  | "refund_pending"
  | "refunded"
  | "refund_rejected";

export type PaymentMethod = "cod" | "momo" | "zalopay" | "card" | "sepay";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  trackingCode?: string;
  shippingPartner?: string;
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
  refundReason?: string;
  refundRejectReason?: string;
  voucherCode?: string;
  discountAmount?: number;
}

export interface TrackingStep {
  status: string;
  time: string;
  location: string;
}

export interface Voucher {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxUsage: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  isActive: boolean;
}

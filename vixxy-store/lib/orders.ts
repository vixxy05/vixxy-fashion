import { Order, CartItem, PaymentMethod, OrderStatus, PaymentStatus } from "./types";

// Mock in-memory storage for API routes (server side)
const mockOrders: Order[] = [];
const ORDERS_KEY = "vixxy_orders";

function isClient() {
  return typeof window !== "undefined";
}

function getStorageOrders(): Order[] {
  if (isClient()) {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  return mockOrders;
}

function saveStorageOrders(orders: Order[]) {
  if (isClient()) {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore errors on client
    }
  } else {
    // On server, just update the mock array
    mockOrders.length = 0;
    mockOrders.push(...orders);
  }
}

export function getOrdersByUserId(userId: string): Order[] {
  const orders = getStorageOrders();
  return orders
    .filter((o: Order) => o.userId === userId)
    .sort((a: Order, b: Order) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getOrderById(orderId: string): Order | null {
  const orders = getStorageOrders();
  const ordersArray = Array.isArray(orders) ? orders : [];
  return ordersArray.find((o: Order) => o.id === orderId) || null;
}

function adjustStock(productId: number, diff: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("vixxy_products");
    if (raw) {
      const products = JSON.parse(raw);
      const nextProducts = products.map((p: any) => {
        if (p.id === productId) {
          return { ...p, stockQuantity: Math.max(0, (p.stockQuantity || 0) + diff) };
        }
        return p;
      });
      localStorage.setItem("vixxy_products", JSON.stringify(nextProducts));
      window.dispatchEvent(new CustomEvent("vixxy-products-updated"));
    }
  } catch (e) {
    console.error(e);
  }
}

export function getAllOrders(): Order[] {
  const orders = getStorageOrders();
  return Array.isArray(orders) ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
}

export function createOrder(data: {
  userId: string;
  items: CartItem[];
  shippingInfo: Order["shippingInfo"];
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  voucherCode?: string;
  discountAmount?: number;
}): Order {
  const orderStatus = data.orderStatus || "pending";
  const order: Order = {
    id: `VX${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    userId: data.userId,
    items: data.items,
    shippingInfo: data.shippingInfo,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentStatus || (data.paymentMethod === "cod" ? "pending" : "pending"),
    orderStatus: orderStatus,
    subtotal: data.subtotal,
    shippingFee: data.shippingFee,
    total: data.total,
    voucherCode: data.voucherCode,
    discountAmount: data.discountAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  if (orderStatus === "paying" || orderStatus === "pending" || orderStatus === "confirmed") {
    order.items.forEach((item) => {
      adjustStock(item.product.id, -item.quantity);
    });
  }

  const orders = getStorageOrders();
  const ordersArray = Array.isArray(orders) ? orders : [];
  ordersArray.push(order);
  saveStorageOrders(ordersArray);
  
  return order;
}

export function updateOrder(orderId: string, updates: Partial<Order>): Order | null {
  const orders = getStorageOrders();
  const ordersArray = Array.isArray(orders) ? orders : [];
  const index = ordersArray.findIndex((o: Order) => o.id === orderId);
  if (index === -1) return null;
  
  const oldOrder = ordersArray[index];
  const nextOrder = {
    ...oldOrder,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  const isHoldingStock = (status: string) => ["paying", "pending", "confirmed", "shipping", "delivered"].includes(status);
  const isReleasingStock = (status: string) => ["payment_failed", "cancelled", "refunded"].includes(status);
  
  if (isHoldingStock(oldOrder.orderStatus) && isReleasingStock(nextOrder.orderStatus)) {
    nextOrder.items.forEach((item) => {
      adjustStock(item.product.id, item.quantity);
    });
  } else if (isReleasingStock(oldOrder.orderStatus) && isHoldingStock(nextOrder.orderStatus)) {
    nextOrder.items.forEach((item) => {
      adjustStock(item.product.id, -item.quantity);
    });
  }

  ordersArray[index] = nextOrder;
  saveStorageOrders(ordersArray);
  
  return nextOrder;
}

export function simulateOrderProgress(orderId: string) {
  const order = getOrderById(orderId);
  if (!order) return;
  
  setTimeout(() => {
    updateOrder(orderId, { orderStatus: "confirmed", paymentStatus: order.paymentMethod === "cod" ? "pending" : "paid" });
  }, 2000);
  
  setTimeout(() => {
    updateOrder(orderId, { orderStatus: "shipping", trackingCode: `GHTK${Date.now().toString().slice(-8)}`, shippingPartner: "GHTK" });
  }, 5000);
  
  setTimeout(() => {
    updateOrder(orderId, { orderStatus: "delivered", paymentStatus: order.paymentMethod === "cod" ? "paid" : "paid" });
  }, 10000);
}

export function formatOrderStatusText(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    paying: "Đang xử lý thanh toán",
    payment_failed: "Thanh toán thất bại",
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
    refund_pending: "Yêu cầu hoàn tiền",
    refunded: "Đã hoàn tiền",
    refund_rejected: "Bị từ chối hoàn tiền",
  };
  return statusMap[status];
}

export function formatPaymentMethodText(method: PaymentMethod): string {
  const methodMap: Record<PaymentMethod, string> = {
    cod: "Thanh toán khi nhận hàng",
    momo: "MoMo",
    zalopay: "ZaloPay",
    sepay: "SePay",
    card: "Thẻ tín dụng",
  };
  return methodMap[method];
}

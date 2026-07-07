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

export function createOrder(data: {
  userId: string;
  items: CartItem[];
  shippingInfo: Order["shippingInfo"];
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
}): Order {
  const order: Order = {
    id: `VX${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    userId: data.userId,
    items: data.items,
    shippingInfo: data.shippingInfo,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === "cod" ? "pending" : "pending",
    orderStatus: "pending",
    subtotal: data.subtotal,
    shippingFee: data.shippingFee,
    total: data.total,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
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
  
  ordersArray[index] = {
    ...ordersArray[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveStorageOrders(ordersArray);
  
  return ordersArray[index];
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
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
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

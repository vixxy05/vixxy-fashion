"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { formatOrderStatusText, formatPaymentMethodText, getOrdersByUserId } from "@/lib/orders";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0); // Add refresh state!
  const [authChecked, setAuthChecked] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Give time for auth context to hydrate first!
  useEffect(() => {
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authChecked) return; // Wait for auth context to be ready!
    if (!user) {
      router.push("/login");
      return;
    }
    loadOrders();
  }, [user, refresh, authChecked]); // Depend on refresh too!

  // Refresh when tab becomes visible!
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        setRefresh(r => r + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const loadOrders = () => {
    if (!user) return;
    setLoading(true);
    try {
      const userOrders = getOrdersByUserId(user.email);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!selectedOrderId || !user) return;
    setIsSubmittingRefund(true);
    try {
      const res = await fetch("/api/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrderId, userId: user.id, reason: refundReason }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Yêu cầu hoàn trả đã được gửi!");
        setShowRefundModal(false);
        setRefundReason("");
        setRefresh(r => r + 1);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi gửi yêu cầu hoàn trả");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-site px-4 py-24 text-center">
        <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-neutral-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-3xl font-bold">Đơn hàng của tôi</h1>
          <button 
            onClick={() => setRefresh(r => r + 1)} 
            className="px-4 py-2 border border-neutral-300 rounded text-sm hover:border-black transition"
          >
            🔄 Làm mới
          </button>
        </div>
        <p className="text-neutral-600 mb-10">Xem và quản lý các đơn hàng của bạn</p>

        {orders.length === 0 ? (
          <div className="text-center py-16 border border-neutral-200 rounded-lg">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-neutral-600 mb-8">Bắt đầu mua sắm để xem đơn hàng của bạn ở đây!</p>
            <Link href="/products" className="bg-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-neutral-200 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-200">
                  <div>
                    <p className="font-semibold">Mã đơn hàng: {order.id}</p>
                    <p className="text-sm text-neutral-600">Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm"><span className="text-neutral-600">Trạng thái:</span> <span className="font-medium text-green-600">{formatOrderStatusText(order.orderStatus)}</span></p>
                    <p className="text-sm"><span className="text-neutral-600">Phương thức:</span> {formatPaymentMethodText(order.paymentMethod)}</p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="h-12 w-10 bg-neutral-100 rounded overflow-hidden">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-neutral-500">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-sm text-neutral-600 flex items-center">
                      +{order.items.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="font-bold text-lg">Tổng: {formatPrice(order.total)}</p>
                  <div className="flex gap-2">
                    {order.orderStatus !== "cancelled" && order.orderStatus !== "refunded" && (
                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowRefundModal(true);
                        }}
                        className="border border-red-500 text-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-red-50 transition"
                      >
                        Yêu cầu hoàn trả
                      </button>
                    )}
                    <Link href={`/orders/${order.id}`} className="border border-black px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-4">
              Yêu cầu hoàn trả / Hủy đơn hàng
            </h2>
            <p className="text-center text-neutral-600 mb-6">
              Vui lòng cho chúng tôi biết lý do
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Nhập lý do yêu cầu hoàn trả..."
              className="w-full border border-neutral-300 px-4 py-4 rounded-xl mb-4 text-sm"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 border border-neutral-300 py-4 rounded-xl font-semibold hover:bg-neutral-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRequestRefund}
                disabled={isSubmittingRefund}
                className="flex-1 bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-70"
              >
                {isSubmittingRefund ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

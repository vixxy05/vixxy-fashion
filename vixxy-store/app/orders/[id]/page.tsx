"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { formatOrderStatusText, formatPaymentMethodText, getOrderById, updateOrder } from "@/lib/orders";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadOrder();
  }, [params.id, user, authChecked]);

  useEffect(() => {
    if (!order) return;
    const interval = setInterval(() => {
      const updatedOrder = getOrderById(order.id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const loadOrder = () => {
    try {
      const orderData = getOrderById(params.id as string);
      if (orderData && orderData.userId === user?.email) {
        setOrder(orderData);
      } else {
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;
    const updatedOrder = updateOrder(order.id, { orderStatus: "cancelled" });
    if (updatedOrder) setOrder(updatedOrder);
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
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-2 mb-6">
          <Link href="/orders" className="text-neutral-500 hover:text-black">&larr; Quay lại đơn hàng</Link>
        </div>

        {order ? (
          <>
            <div className="border border-neutral-200 p-6 rounded-lg mb-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Mã đơn hàng: {order.id}</h2>
                  <p className="text-sm text-neutral-600">Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg"><span className="text-neutral-600">Trạng thái:</span> <span className={`font-semibold ${order.orderStatus === "cancelled" ? "text-red-600" : "text-green-600"}`}>{formatOrderStatusText(order.orderStatus)}</span></p>
                  <p className="text-sm"><span className="text-neutral-600">Phương thức:</span> {formatPaymentMethodText(order.paymentMethod)}</p>
                </div>
              </div>

              {order.trackingCode && (
                <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                  <p className="font-semibold mb-1">Mã vận đơn</p>
                  <p className="text-neutral-800">{order.trackingCode} ({order.shippingPartner})</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Thông tin nhận hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p>{order.shippingInfo.name}</p>
                    <p>{order.shippingInfo.phone}</p>
                    <p>{order.shippingInfo.address}, {order.shippingInfo.city}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Thông tin thanh toán</h3>
                  <div className="space-y-1 text-sm">
                    <p>Phương thức: {formatPaymentMethodText(order.paymentMethod)}</p>
                    <p>Trạng thái: {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 pt-4 border-t border-neutral-200">Sản phẩm</h3>
              <div className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center py-2">
                    <div className="h-16 w-12 bg-neutral-100 overflow-hidden rounded">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      {item.size && <p className="text-xs text-neutral-500">Size: {item.size}</p>}
                    </div>
                    <p className="text-sm font-medium">x{item.quantity}</p>
                    <p className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Phí vận chuyển</span>
                  <span>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              {order.orderStatus === "pending" && (
                <div className="mt-6">
                  <button
                    onClick={handleCancelOrder}
                    className="border border-red-500 text-red-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-red-50 transition"
                  >
                    Hủy đơn hàng
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Đơn hàng không tồn tại</h3>
            <Link href="/orders" className="text-black underline">Quay lại đơn hàng</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

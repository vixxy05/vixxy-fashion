"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { formatOrderStatusText, formatPaymentMethodText, getOrderById } from "@/lib/orders";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      router.push("/");
    }
  }, [orderId]);

  const loadOrder = () => {
    try {
      const data = getOrderById(orderId!);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
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
    <div className="mx-auto max-w-site px-4 py-20 md:px-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold">Đặt hàng thành công!</h1>
          <p className="mt-4 text-neutral-600">
            Mã đơn hàng: <span className="font-bold text-black">{orderId}</span>
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Cảm ơn bạn đã tin tưởng VIXXY D'ORANCE. Chúng tôi sẽ liên hệ sớm để xác nhận đơn hàng.
          </p>
        </div>

        {order && (
          <div className="border border-neutral-200 p-6 rounded-lg mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Thông tin đơn hàng</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-neutral-600">Ngày đặt:</span> {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                  <p><span className="text-neutral-600">Trạng thái:</span> <span className="text-green-600 font-medium">{formatOrderStatusText(order.orderStatus)}</span></p>
                  <p><span className="text-neutral-600">Phương thức thanh toán:</span> {formatPaymentMethodText(order.paymentMethod)}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Thông tin nhận hàng</h3>
                <div className="space-y-1 text-sm">
                  <p>{order.shippingInfo.name}</p>
                  <p>{order.shippingInfo.phone}</p>
                  <p>{order.shippingInfo.address}, {order.shippingInfo.city}</p>
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
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/orders"
            className="bg-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 text-center"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/products"
            className="border border-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black hover:text-white text-center"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

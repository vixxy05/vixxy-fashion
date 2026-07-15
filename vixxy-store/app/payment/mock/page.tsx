
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/products";
import { getOrderById, updateOrder } from "@/lib/orders";
import { incrementVoucherUsage } from "@/lib/vouchers";

const API_URL = "/api";

function clearPaidOrderFromCart(orderId: string) {
  const order = getOrderById(orderId);
  const rawUser = localStorage.getItem("vixxy_user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const email = user?.email;
  const storageKey = email
    ? `vixxy_cart_${email.replace(/[^a-zA-Z0-9]/g, "_")}`
    : "vixxy_cart_guest";
  const rawCart = localStorage.getItem(storageKey);

  if (!order || !rawCart) return;

  const paidItemKeys = new Set(
    order.items.map((item) => `${item.product.id}::${item.size ?? "default"}`)
  );
  const cartItems = JSON.parse(rawCart);
  const nextCartItems = Array.isArray(cartItems)
    ? cartItems.filter((item) => !paidItemKeys.has(`${item.product.id}::${item.size ?? "default"}`))
    : [];

  localStorage.setItem(storageKey, JSON.stringify(nextCartItems));
}

export default function PaymentMockPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    const order = orderId ? getOrderById(orderId) : null;
    setOrderTotal(order?.total ?? Number(searchParams.get("amount") ?? 0));
  }, [orderId, searchParams]);

  const handlePaymentSuccess = async () => {
    if (!orderId) return;
    setIsProcessing(true);

    try {
      const order = getOrderById(orderId);
      if (order && order.voucherCode) {
        incrementVoucherUsage(order.voucherCode);
      }
      updateOrder(orderId, { paymentStatus: "paid", orderStatus: "confirmed" });
      clearPaidOrderFromCart(orderId);
      window.location.href = `/payment/success?orderId=${orderId}&amount=${orderTotal}`;
      return;

      const res = await fetch(`${API_URL}/payments/mock-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: parseInt(orderId) }),
      });

      if (res.ok) {
        // Redirect về trang success
        router.push(`/payment/success?orderId=${orderId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="h-24 w-24 rounded-full bg-yellow-50 border-4 border-yellow-100 flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="4" />
            </svg>
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-black">Thanh toán thử nghiệm</h1>
          <p className="text-neutral-600 mt-2">Bạn đang sử dụng hệ thống QR Demo</p>
        </div>

        <div className="border-2 border-neutral-200 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Mã đơn hàng</p>
            <p className="text-2xl font-bold text-black mb-6">#{orderId}</p>

            <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">Số tiền cần thanh toán</p>
            <p className="text-3xl font-bold text-yellow-700">{formatPrice(orderTotal)}</p>
          </div>
        </div>

        <button
          onClick={handlePaymentSuccess}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-5 rounded-2xl font-semibold text-xl hover:from-yellow-700 hover:to-yellow-800 transition disabled:opacity-70 flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <>
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang xử lý...
            </>
          ) : (
            "Thanh toán thành công"
          )}
        </button>

        <button
          onClick={() => {
            if (orderId) {
              updateOrder(orderId, { orderStatus: "payment_failed" });
            }
            window.location.href = `/payment/result?orderId=${orderId}&status=failed`;
          }}
          className="w-full mt-4 border border-neutral-300 py-4 rounded-2xl font-semibold text-lg text-neutral-700 hover:bg-neutral-100 transition"
        >
          Hủy
        </button>
      </motion.div>
    </div>
  );
}


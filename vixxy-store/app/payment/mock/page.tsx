
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/products";
import { env } from "@/lib/env";
import { useCart, cartItemKey } from "@/context/CartContext";
import { useAuthStore } from "@/stores/authStore";

const API_URL = env.apiUrl.replace(/\/api$/, "") + "/api";



export default function PaymentMockPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, selectedItemKeys, clearSelected, removeItem } = useCart();
  const orderId = searchParams.get("orderId");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const selectedItems = items.filter((i) =>
    selectedItemKeys.includes(cartItemKey(i.product.id, i.size))
  );

  useEffect(() => {
    setOrderTotal(Number(searchParams.get("amount") ?? 0));
  }, [orderId, searchParams]);

  const handlePaymentSuccess = async () => {
    if (!orderId) return;
    setIsProcessing(true);

    try {
      // Call backend API to mark payment as successful
      const res = await fetch(`${API_URL}/payments/mock-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) {
        let errorMessage = "Unknown error";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || `Error: ${res.statusText}`;
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || `Error: ${res.statusText}`;
        }
        console.error("Payment API error response:", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("Payment success response:", data);

      // Clear selected items from cart
      selectedItems.forEach((cartItem) => {
        removeItem(cartItemKey(cartItem.product.id, cartItem.size || ""));
      });
      clearSelected();

      // Redirect to success page
      window.location.href = `/payment/success?orderId=${orderId}`;
    } catch (e) {
      console.error(e);
      alert("Lỗi xử lý thanh toán, vui lòng thử lại!");
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
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 flex items-center justify-center mx-auto mb-4 text-5xl">
            📱
          </div>
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
          onClick={() => router.back()}
          className="w-full mt-4 border border-neutral-300 py-4 rounded-2xl font-semibold text-lg text-neutral-700 hover:bg-neutral-100 transition"
        >
          Hủy
        </button>
      </motion.div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/products";
import { updateOrder } from "@/lib/orders";

function generateQRUrl(orderId: string, amount: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=momo://payment?orderId=${orderId}&amount=${amount}`;
}

export default function MoMoPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  
  const [paymentMethod, setPaymentMethod] = useState<"QR" | "CARD" | "APP">("QR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      if (orderId) {
        updateOrder(orderId, {
          paymentStatus: "paid",
          orderStatus: "confirmed"
        });
      }
      
      let timeLeft = 3;
      setCountdown(timeLeft);
      const timer = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          router.push(`/checkout/success?orderId=${orderId}`);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenMoMoApp = () => {
    window.location.href = `momo://payment?orderId=${orderId}&amount=${amount}`;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (!orderId || !amount) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Đơn hàng không hợp lệ</h2>
          <button 
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-black text-white rounded"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff4f9] flex items-center justify-center px-4 py-10">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-[#a5006a] flex items-center justify-center">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-[#a5006a] mb-2">
          MoMo - Thanh toán
        </h1>
        
        <p className="text-center text-neutral-600 mb-6">
          Đơn hàng: <span className="font-semibold">{orderId}</span>
        </p>
        
        <div className="bg-neutral-50 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-neutral-600 mb-1">Số tiền cần thanh toán</p>
          <p className="text-3xl font-bold text-neutral-900">
            {formatPrice(parseInt(amount))}
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setPaymentMethod("QR")}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              paymentMethod === "QR" 
                ? "bg-[#a5006a] text-white" 
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            📱 QR Code
          </button>
          <button
            onClick={() => setPaymentMethod("CARD")}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              paymentMethod === "CARD" 
                ? "bg-[#a5006a] text-white" 
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            💳 Thẻ
          </button>
          <button
            onClick={() => setPaymentMethod("APP")}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              paymentMethod === "APP" 
                ? "bg-[#a5006a] text-white" 
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            📲 App
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <div className="h-12 w-12 border-4 border-[#a5006a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600 font-medium">
                Đang xử lý thanh toán...
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Chuyển hướng sau {countdown}s
              </p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {paymentMethod === "QR" && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-neutral-600">
                    Mở app MoMo và quét mã QR dưới đây:
                  </p>
                  <div className="inline-block p-4 border-2 border-neutral-200 rounded-xl bg-white">
                    <img 
                      src={generateQRUrl(orderId, amount)} 
                      alt="MoMo QR Code"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full py-4 bg-[#a5006a] text-white font-semibold rounded-xl hover:bg-[#8a0055] transition"
                  >
                    ✓ Đã thanh toán (Demo)
                  </button>
                </div>
              )}

              {paymentMethod === "CARD" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Số thẻ
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-[#a5006a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Họ tên chủ thẻ
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      placeholder="NGUYEN VAN A"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-[#a5006a] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Ngày hết hạn
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-[#a5006a] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, "") })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-[#a5006a] focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv}
                    className="w-full py-4 bg-[#a5006a] text-white font-semibold rounded-xl hover:bg-[#8a0055] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Thanh toán ngay
                  </button>
                </div>
              )}

              {paymentMethod === "APP" && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-neutral-600 mb-4">
                    Nhấn nút dưới đây để mở app MoMo và thanh toán:
                  </p>
                  <button
                    onClick={handleOpenMoMoApp}
                    className="w-full py-4 bg-[#a5006a] text-white font-semibold rounded-xl hover:bg-[#8a0055] transition flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📲</span>
                    Mở app MoMo
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full py-4 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition"
                  >
                    ✓ Đã thanh toán (Demo)
                  </button>
                </div>
              )}

              <button 
                onClick={() => router.push("/cart")}
                className="w-full py-3 text-neutral-500 font-medium hover:text-neutral-700 transition mt-2"
              >
                ← Hủy bỏ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

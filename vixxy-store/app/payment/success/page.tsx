
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/products";
import { getOrderById } from "@/lib/orders";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderDate, setOrderDate] = useState("");

  useEffect(() => {
    const order = orderId ? getOrderById(orderId) : null;
    setOrderTotal(order?.total ?? Number(searchParams.get("amount") ?? 0));
    setOrderDate(new Date().toLocaleString("vi-VN"));
  }, [orderId, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-12 max-w-lg w-full shadow-2xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="h-24 w-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-6 shadow-sm"
          >
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </motion.div>
          <h1 className="font-display text-4xl font-bold text-black">Thanh toán thành công</h1>
          <p className="text-neutral-600 mt-3 text-lg">Đơn hàng của bạn đang được chuẩn bị</p>
        </div>

        <div className="border-t-2 border-b-2 border-neutral-200 py-8 mb-10">
          <div className="grid gap-5">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 text-lg">Mã đơn hàng</span>
              <span className="font-bold text-xl text-black">#{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 text-lg">Số tiền đã thanh toán</span>
              <span className="font-bold text-xl text-green-700">{formatPrice(orderTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 text-lg">Ngày thanh toán</span>
              <span className="font-semibold text-black">{orderDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 text-lg">Trạng thái</span>
              <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
                Đang chuẩn bị hàng
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full block text-center bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-5 rounded-2xl font-semibold text-xl hover:from-yellow-700 hover:to-yellow-800 transition"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/orders"
            className="w-full block text-center border-2 border-neutral-300 py-5 rounded-2xl font-semibold text-lg text-neutral-700 hover:bg-neutral-100 transition"
          >
            Xem đơn hàng
          </Link>
        </div>
      </motion.div>
    </div>
  );
}


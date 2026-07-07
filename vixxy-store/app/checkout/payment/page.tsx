
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { API_BASE, SOCKET_URL } from "@/lib/env";

const API_URL = SOCKET_URL;

export default function CheckoutPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");

  useEffect(() => {
    if (orderId) {
      fetch(`${API_URL}/api/payment/qr/${orderId}`)
        .then((res) => res.json())
        .then((data) => setQrCodeUrl(data.qrCodeUrl));
    }

    const socket = io(API_URL);
    socket.on("payment-success", (data) => {
      if (data.orderId == orderId) {
        router.push(`/payment/result?orderId=${orderId}&status=success`);
      }
    });
    socket.on("payment-failed", (data) => {
      if (data.orderId == orderId) {
        router.push(`/payment/result?orderId=${orderId}&status=failed`);
      }
    });
    socket.on("payment-cancelled", (data) => {
      if (data.orderId == orderId) {
        router.push(`/payment/result?orderId=${orderId}&status=cancelled`);
      }
    });

    const interval = setInterval(() => {
      fetch(`${API_URL}/api/payment/status/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setPaymentStatus(data.paymentStatus);
          if (data.paymentStatus === "SUCCESS") {
            router.push(`/payment/result?orderId=${orderId}&status=success`);
          } else if (data.paymentStatus === "FAILED") {
            router.push(`/payment/result?orderId=${orderId}&status=failed`);
          } else if (data.paymentStatus === "CANCELLED") {
            router.push(`/payment/result?orderId=${orderId}&status=cancelled`);
          }
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Thanh toán đơn hàng</h1>
        
        {qrCodeUrl && (
          <div className="flex justify-center mb-8">
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Mã đơn hàng: <span className="font-semibold">{orderId}</span>
          </p>
          <p className="text-gray-600 mb-4">
            Trạng thái: <span className={`font-semibold ${paymentStatus === "PENDING" ? "text-yellow-600" : "text-gray-800"}`}>
              {paymentStatus}
            </span>
          </p>
          <p className="text-gray-500 text-sm">Quét mã QR để thanh toán</p>
        </div>
      </div>
    </div>
  );
}

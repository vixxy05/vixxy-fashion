
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");

  const getStatusContent = () => {
    switch (status) {
      case "success":
        return {
          title: "Thanh toán thành công",
          icon: "✅",
          color: "text-green-600",
          bgColor: "bg-green-50",
          message: "Đơn hàng của bạn đang được xử lý"
        };
      case "failed":
        return {
          title: "Thanh toán thất bại",
          icon: "❌",
          color: "text-red-600",
          bgColor: "bg-red-50",
          message: "Vui lòng thử lại"
        };
      case "cancelled":
        return {
          title: "Đã hủy thanh toán",
          icon: "⚠️",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          message: "Đơn hàng đã bị hủy"
        };
      default:
        return {
          title: "Trạng thái không xác định",
          icon: "ℹ️",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          message: ""
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: content.bgColor }}>
          {content.icon}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${content.color}`}>
          {content.title}
        </h1>
        
        <p className="text-gray-600 mb-2">
          Mã đơn hàng: <span className="font-semibold">{orderId}</span>
        </p>
        <p className="text-gray-500 mb-8">
          {content.message}
        </p>

        <div className="space-x-4">
          <button
            onClick={() => router.push("/orders")}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // Modal dialog states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReasonInput, setRefundReasonInput] = useState("");
  const [refundError, setRefundError] = useState("");

  const [showRetryPaymentModal, setShowRetryPaymentModal] = useState(false);

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

  const handleCancelOrderSubmit = () => {
    if (!cancelReasonInput.trim()) {
      setCancelError("Vui lòng nhập lý do hủy đơn!");
      return;
    }
    if (!order) return;
    const updatedOrder = updateOrder(order.id, { 
      orderStatus: "cancelled",
      cancelReason: cancelReasonInput 
    });
    if (updatedOrder) setOrder(updatedOrder);
    setShowCancelModal(false);
    setCancelReasonInput("");
    setCancelError("");
  };

  const handleRefundOrderSubmit = () => {
    if (!refundReasonInput.trim()) {
      setRefundError("Vui lòng nhập lý do hoàn tiền!");
      return;
    }
    if (!order) return;
    const updatedOrder = updateOrder(order.id, { 
      orderStatus: "refund_pending",
      cancelReason: refundReasonInput 
    });
    if (updatedOrder) setOrder(updatedOrder);
    setShowRefundModal(false);
    setRefundReasonInput("");
    setRefundError("");
  };

  const handleConfirmDelivered = () => {
    if (!order) return;
    if (confirm("Xác nhận đã giao/nhận hàng thành công cho đơn hàng này?")) {
      const updatedOrder = updateOrder(order.id, { 
        orderStatus: "delivered",
        paymentStatus: "paid"
      });
      if (updatedOrder) setOrder(updatedOrder);
    }
  };

  const handleSimulatePaymentSuccess = () => {
    if (!order) return;
    const updatedOrder = updateOrder(order.id, { 
      orderStatus: "confirmed",
      paymentStatus: "paid"
    });
    if (updatedOrder) setOrder(updatedOrder);
    setShowRetryPaymentModal(false);
    alert("✅ Thanh toán thành công! Đơn hàng của bạn đã được chuyển sang trạng thái Đã xác nhận.");
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
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Giảm giá ({order.voucherCode})</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              {order.orderStatus === "refund_pending" && (
                <div className="mt-6 bg-purple-50 text-purple-900 border border-purple-200 p-4 rounded-xl text-sm animate-pulse">
                  <p className="font-bold flex items-center gap-2">⏳ Yêu cầu hoàn tiền đang chờ Admin xử lý</p>
                  <p className="mt-1 text-xs text-purple-700">Lý do yêu cầu: {order.cancelReason || "Yêu cầu từ phía khách hàng"}</p>
                </div>
              )}

              {order.orderStatus === "refunded" && (
                <div className="mt-6 bg-green-50 text-green-900 border border-green-200 p-4 rounded-xl text-sm">
                  <p className="font-bold flex items-center gap-2">✅ Đã hoàn tiền thành công</p>
                  <p className="mt-1 text-xs text-green-700">Yêu cầu hoàn tiền của bạn đã được Admin phê duyệt thành công. Tiền đã được cập nhật hoàn về phương thức thanh toán.</p>
                </div>
              )}

              {order.orderStatus === "refund_rejected" && (
                <div className="mt-6 bg-red-50 text-red-900 border border-red-200 p-4 rounded-xl text-sm">
                  <p className="font-bold flex items-center gap-2 text-red-700">❌ Hoàn tiền thất bại (Yêu cầu bị từ chối)</p>
                  <p className="mt-1 text-xs text-red-800">Lý do từ chối từ Admin: <strong>{order.refundRejectReason || "Không đủ điều kiện hoàn tiền"}</strong></p>
                </div>
              )}

              {order.cancelReason && order.orderStatus !== "refund_pending" && order.orderStatus !== "refunded" && order.orderStatus !== "refund_rejected" && (
                <div className="mt-6 bg-neutral-50 p-4 rounded-lg text-sm border border-neutral-200">
                  <p className="font-semibold text-neutral-700">Lý do hủy/hoàn tiền:</p>
                  <p className="mt-1 text-neutral-600">{order.cancelReason}</p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-4">
                {(order.orderStatus === "payment_failed" || order.orderStatus === "paying" || order.paymentStatus === "pending") && order.orderStatus !== "cancelled" && (
                  <button
                    onClick={() => setShowRetryPaymentModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] hover:bg-indigo-700 transition rounded-lg shadow-lg flex items-center gap-2 animate-bounce"
                  >
                    💳 Thanh toán lại (Quét mã QR)
                  </button>
                )}

                {(order.orderStatus === "pending" || order.orderStatus === "confirmed") && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="border border-red-500 text-red-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-red-50 transition rounded-lg"
                  >
                    Hủy đơn hàng
                  </button>
                )}

                {order.orderStatus === "shipping" && (
                  <button
                    onClick={handleConfirmDelivered}
                    className="bg-green-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] hover:bg-green-700 transition rounded-lg shadow-md flex items-center gap-2"
                  >
                    ✅ Đã nhận được hàng (Xác nhận đã giao)
                  </button>
                )}

                {order.orderStatus === "delivered" && (
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="bg-black text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-neutral-800 transition rounded-lg"
                  >
                    Yêu cầu hủy đơn/Hoàn tiền
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Đơn hàng không tồn tại</h3>
            <Link href="/orders" className="text-black underline">Quay lại đơn hàng</Link>
          </div>
        )}
      </motion.div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Hủy đơn hàng</h3>
            <p className="text-sm text-neutral-600 mb-4">Vui lòng nhập lý do hủy đơn hàng này:</p>
            <textarea
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="Nhập lý do hủy..."
              className="w-full border border-neutral-300 rounded-lg p-3 text-sm min-h-24 outline-none focus:border-black mb-1"
            />
            {cancelError && <p className="text-xs text-red-600 mb-4">{cancelError}</p>}
            <div className="flex justify-end gap-3 text-sm mt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="border border-neutral-300 px-4 py-2 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleCancelOrderSubmit}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Xác nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Yêu cầu hoàn tiền</h3>
            <p className="text-sm text-neutral-600 mb-4">Vui lòng nhập lý do yêu cầu hoàn tiền cho đơn hàng:</p>
            <textarea
              value={refundReasonInput}
              onChange={(e) => setRefundReasonInput(e.target.value)}
              placeholder="Nhập lý do hoàn tiền..."
              className="w-full border border-neutral-300 rounded-lg p-3 text-sm min-h-24 outline-none focus:border-black mb-1"
            />
            {refundError && <p className="text-xs text-red-600 mb-4">{refundError}</p>}
            <div className="flex justify-end gap-3 text-sm mt-3">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="border border-neutral-300 px-4 py-2 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleRefundOrderSubmit}
                className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-neutral-800"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retry Payment Modal */}
      {showRetryPaymentModal && order && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mb-3">
              💳
            </div>
            <h3 className="text-xl font-bold text-black">Thanh toán lại Đơn hàng #{order.id}</h3>
            <p className="text-xs text-neutral-500 mt-1">Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để hoàn tất</p>

            <div className="my-5 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col items-center w-full">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(`PAYMENT FOR ORDER ${order.id} AMOUNT ${order.total} VND`)}`}
                alt="QR Code Payment"
                className="w-56 h-56 rounded-xl shadow-md border bg-white p-2"
              />
              <div className="mt-4 w-full text-xs space-y-1.5 text-left bg-white p-3 rounded-xl border border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Số tiền:</span>
                  <span className="font-bold text-indigo-600">{order.total.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ngân hàng / Ví:</span>
                  <span className="font-semibold">{order.paymentMethod.toUpperCase()} (SePay / QR)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Số tài khoản:</span>
                  <span className="font-mono font-bold">0900000000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Chủ tài khoản:</span>
                  <span className="font-semibold uppercase">VIXXY D'ORANCE SHOP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nội dung CK:</span>
                  <span className="font-mono font-bold text-red-600">PAY {order.id}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                className="w-full bg-green-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2"
              >
                ⚡ Tôi đã chuyển khoản xong (Xác nhận ngay)
              </button>
              <button
                type="button"
                onClick={() => setShowRetryPaymentModal(false)}
                className="w-full border border-neutral-300 text-neutral-600 py-2.5 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition"
              >
                Đóng / Thanh toán sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

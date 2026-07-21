
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cartItemKey, useCart } from "@/context/CartContext";
import { useAuthStore } from "@/stores/authStore";
import { formatPrice } from "@/lib/products";
import { createOrder, simulateOrderProgress, updateOrder } from "@/lib/orders";
import { validateVoucher, incrementVoucherUsage } from "@/lib/vouchers";

const API_URL = "/api";

export default function CheckoutPage() {
  const {
    items,
    selectedItemKeys,
    selectedTotal,
    clearSelected,
    removeItem,
  } = useCart();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<string>("QR_DEMO");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingFee, setShippingFee] = useState(30000);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Voucher states
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");

  const selectedItems = items.filter((i) =>
    selectedItemKeys.includes(cartItemKey(i.product.id, i.size))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedTotal >= 2000000) setShippingFee(0);
  }, [selectedTotal]);

  useEffect(() => {
    if (mounted && !loading && user && selectedItems.length === 0) {
      router.push("/cart");
    }
  }, [mounted, loading, user, selectedItems.length, router]);

  const handleApplyVoucher = () => {
    setVoucherError("");
    if (!voucherCodeInput.trim()) {
      setVoucherError("Vui lòng nhập mã giảm giá!");
      return;
    }
    const result = validateVoucher(voucherCodeInput, selectedTotal, selectedItems);
    if (!result.valid) {
      setVoucherError(result.message || "Mã không hợp lệ!");
      setAppliedVoucher(null);
      setDiscountAmount(0);
    } else {
      setAppliedVoucher(result.voucher);
      setDiscountAmount(result.discountAmount || 0);
      setVoucherCodeInput("");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherError("");
  };

  const finalTotal = Math.max(0, selectedTotal - discountAmount + shippingFee);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Polling kiểm tra trạng thái Payment
  if (!user) {
    return (
      <div className="mx-auto max-w-site px-4 py-24 text-center md:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold"
        >
          Thanh toán
        </motion.h1>
        <p className="mt-4 text-neutral-600">
          Vui lòng đăng nhập để tiến hành thanh toán.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="bg-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="border border-black px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black hover:text-white"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return null;
  }

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.currentTarget);
    const fullName = `${formData.get("firstName")} ${formData.get("lastName")}`;
    const shippingAddress = formData.get("address") as string;

    console.log("Checkout Request called with paymentMethod:", paymentMethod);
    console.log("Checkout Request user:", user);
    console.log("Checkout Request finalTotal:", finalTotal);

    try {
      const order = createOrder({
        userId: user.email,
        items: selectedItems,
        shippingInfo: {
          name: fullName,
          phone: String(formData.get("phone") ?? ""),
          email: String(formData.get("email") ?? ""),
          address: shippingAddress,
          city: String(formData.get("city") ?? ""),
        },
        paymentMethod: paymentMethod === "QR_DEMO" ? "sepay" : "cod",
        subtotal: selectedTotal,
        shippingFee,
        total: finalTotal,
        orderStatus: paymentMethod === "QR_DEMO" ? "paying" : "pending",
        voucherCode: appliedVoucher?.code,
        discountAmount: discountAmount,
      });

      if (paymentMethod === "QR_DEMO") {
        const paymentTarget = `${window.location.origin}/payment/mock?orderId=${order.id}&amount=${finalTotal}`;
        setCurrentOrderId(order.id);
        setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentTarget)}`);
        setPaymentUrl(paymentTarget);
        setShowQrModal(true);
        return;
      }

      // COD path:
      if (appliedVoucher) {
        incrementVoucherUsage(appliedVoucher.code);
      }
      simulateOrderProgress(order.id);
      selectedItems.forEach((cartItem) => {
        removeItem(cartItemKey(cartItem.product.id, cartItem.size || ""));
      });
      clearSelected();
      router.push(`/checkout/success?orderId=${order.id}`);
      return;

      if (paymentMethod === "QR_DEMO") {
        // Bước 1: Tạo Order
        const payload = {
          userId: user?.id || 1,
          paymentMethod: "QR_DEMO",
          shippingAddress,
          totalAmount: finalTotal,
        };
        console.log("Checkout Request payload:", payload);

        console.log("Calling API:", `${API_URL}/orders`);
        const res = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        console.log("Checkout API response status:", res.status);
        if (!res.ok) {
          let errorMessage = "Unknown error";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || `Error: ${res.statusText}`;
          } catch {
            const errorText = await res.text();
            errorMessage = errorText || `Error: ${res.statusText}`;
          }
          console.error("Checkout API error response:", errorMessage);
          throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log("Checkout API full response:", data);

        if (!data.success) throw new Error(data.message);

        const orderId = data.data.orderId;
        setCurrentOrderId(orderId);

        // Bước 2: Tạo QR Payment
        console.log("Calling create QR API:", `${API_URL}/payments/create-qr`);
        const qrRes = await fetch(`${API_URL}/payments/create-qr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        console.log("QR API response status:", qrRes.status);

        if (!qrRes.ok) {
          let qrErrorMessage = "Unknown QR error";
          try {
            const qrErrorData = await qrRes.json();
            qrErrorMessage = qrErrorData.message || `QR Error: ${qrRes.statusText}`;
          } catch {
            const qrErrorText = await qrRes.text();
            qrErrorMessage = qrErrorText || `QR Error: ${qrRes.statusText}`;
          }
          console.error("QR API error response:", qrErrorMessage);
          throw new Error(qrErrorMessage);
        }

        const qrDataResult = await qrRes.json();
        console.log("QR API full response:", qrDataResult);
        setQrCode(qrDataResult.data.qrCode);
        setPaymentUrl(qrDataResult.data.paymentUrl);
        setShowQrModal(true);
        return;
      }

      // Thực hiện cho các phương thức khác ở đây
      router.push(`/checkout/success?orderId=mock-${Date.now()}`);

    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Lỗi tạo đơn hàng, vui lòng thử lại!";
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // QR Modal
  if (showQrModal && qrCode) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="font-display text-2xl font-bold text-center mb-2">
            Thanh toán QR Demo
          </h2>
          <p className="text-center text-neutral-600 mb-2">
            Mã đơn hàng: <span className="font-semibold">#{currentOrderId}</span>
          </p>
          <p className="text-center text-xl font-bold text-black mb-6">
            Tổng tiền: {formatPrice(finalTotal)}
          </p>

          <div className="flex justify-center mb-6">
            <img
              src={qrCode}
              alt="QR Code"
              style={{ width: "300px", height: "300px" }}
            />
          </div>

          <button
            onClick={() => router.push(paymentUrl || "")}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-4 rounded-xl font-semibold text-lg mb-3 hover:from-yellow-700 hover:to-yellow-800 transition"
          >
            Mở trang thanh toán
          </button>

          <button
            onClick={() => {
              setShowQrModal(false);
              setQrCode(null);
              if (currentOrderId) {
                updateOrder(currentOrderId, { orderStatus: "payment_failed" });
              }
              setCurrentOrderId(null);
            }}
            className="w-full border border-neutral-300 py-4 rounded-xl font-semibold hover:bg-neutral-100 transition"
          >
            Hủy
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <div className="flex items-center gap-3 text-sm text-neutral-500">
        <Link href="/cart" className="hover:text-black">Giỏ hàng</Link>
        <span>/</span>
        <span className="text-black">Thanh toán</span>
      </div>

      <h1 className="mt-6 font-display text-3xl font-bold">Online Transaction</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-neutral-200 p-6 rounded-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-6">Thông tin nhận hàng</h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="firstName"
                  required
                  defaultValue={user?.fullName?.split(' ')[0]}
                  placeholder="Họ"
                  className="w-full border border-neutral-300 px-4 py-4 text-sm outline-none focus:border-black rounded-xl"
                />
                <input
                  name="lastName"
                  required
                  defaultValue={user?.fullName?.split(' ').slice(1).join(' ')}
                  placeholder="Tên"
                  className="w-full border border-neutral-300 px-4 py-4 text-sm outline-none focus:border-black rounded-xl"
                />
              </div>
              <input
                name="email"
                required
                type="email"
                defaultValue={user?.email}
                placeholder="Email"
                className="w-full border border-neutral-300 px-4 py-4 text-sm outline-none focus:border-black rounded-xl"
              />
              <input
                name="phone"
                required
                placeholder="Số điện thoại"
                className="w-full border border-neutral-300 px-4 py-4 text-sm outline-none focus:border-black rounded-xl"
              />
              <input
                name="address"
                required
                placeholder="Địa chỉ chi tiết"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-4 text-sm outline-none focus:border-black rounded-xl"
              />
              <input
                name="city"
                required
                placeholder="Thành phố"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-4 text-sm outline-none focus:border-black rounded-xl"
              />

              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>
                <div className="space-y-4">
                  {[
                    {
                      id: "QR_DEMO",
                      label: "Thanh toán QR Demo",
                      icon: (
                        <svg className="h-7 w-7 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <rect x="5" y="2" width="14" height="20" rx="3" />
                          <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="3" />
                        </svg>
                      ),
                    },
                    {
                      id: "COD",
                      label: "Thanh toán khi nhận hàng",
                      icon: (
                        <svg className="h-7 w-7 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="12" cy="12" r="2" />
                          <path d="M6 12h.01M18 12h.01" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ),
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between border-2 p-5 rounded-2xl cursor-pointer transition ${
                        paymentMethod === method.id
                          ? "border-yellow-600 bg-yellow-50"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-neutral-100 flex items-center justify-center">
                          {method.icon}
                        </div>
                        <span className="text-lg font-medium">{method.label}</span>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="h-6 w-6 accent-yellow-600"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-8 w-full bg-black py-5 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-2xl"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý đơn hàng...
                  </>
                ) : (
                  `Thanh toán ${formatPrice(finalTotal)}`
                )}
              </button>
            </form>
          </div>
        </div>

        <aside className="h-fit border border-neutral-200 p-6 lg:sticky lg:top-24 rounded-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-6">Tóm tắt đơn hàng</h2>
          <div className="mt-6 space-y-4">
            {selectedItems.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100 rounded-xl">
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-neutral-800 text-white text-xs flex items-center justify-center">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.product.name}</p>
                    {item.size && <p className="text-xs text-neutral-500">Size: {item.size}</p>}
                  </div>
                  <p className="text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Voucher Input */}
          <div className="mt-6 border-t border-neutral-200 pt-4">
            <p className="text-sm font-semibold mb-2">Mã giảm giá (Voucher)</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã..."
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
                className="flex-1 border border-neutral-300 px-3 py-2 text-sm rounded-lg outline-none focus:border-black uppercase"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800"
              >
                Áp dụng
              </button>
            </div>
            {voucherError && <p className="text-xs text-red-600 mt-1">{voucherError}</p>}
            {appliedVoucher && (
              <div className="flex items-center justify-between bg-green-50 text-green-800 px-3 py-2 rounded-lg mt-2 text-xs">
                <span>Đã áp dụng mã: <strong className="font-semibold">{appliedVoucher.code}</strong> (-{formatPrice(discountAmount)})</span>
                <button type="button" onClick={handleRemoveVoucher} className="underline text-red-600 font-semibold ml-2">Xóa</button>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-neutral-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatPrice(selectedTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển</span>
              <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
            </div>
            {shippingFee === 0 && (
              <p className="text-xs text-green-600">Bạn được miễn phí vận chuyển!</p>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-700 font-medium">
                <span>Giảm giá</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-3">
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-bold text-xl">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Thanh toán an toàn với SSL 256-bit
          </div>
        </aside>
      </div>
    </div>
  );
}


"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProducts } from "@/hooks/useProducts";
import { createBlankProduct, deleteProduct, saveProduct } from "@/lib/productData";
import { formatPrice } from "@/lib/products";
import { Category, Product, Order, OrderStatus, Voucher, Banner } from "@/lib/types";
import { getAllOrders, updateOrder, formatOrderStatusText } from "@/lib/orders";
import { getVouchers, createVoucher, toggleVoucherStatus } from "@/lib/vouchers";
import { getBanners, addBanner, deleteBanner } from "@/lib/banners";

const categories: Category[] = ["clothing", "jewelry", "accessories"];

function ProductForm({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Product>(product);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(product);
  }, [product]);

  const updateDraft = (patch: Partial<Product>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    await saveProduct({
      ...draft,
      slug: draft.slug || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      images: draft.image ? [draft.image] : draft.images,
      sizes: typeof draft.sizes === "string" ? String(draft.sizes).split(",").map((item) => item.trim()) : draft.sizes,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm md:grid-cols-2">
      <h3 className="font-display text-lg font-bold md:col-span-2">Thông tin sản phẩm</h3>
      <label className="grid gap-1 text-sm font-medium">
        Tên sản phẩm
        <input
          value={draft.name}
          onChange={(event) => updateDraft({ name: event.target.value })}
          className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
          required
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        SKU
        <input
          value={draft.sku}
          onChange={(event) => updateDraft({ sku: event.target.value })}
          className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
          required
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Danh mục
        <select
          value={draft.category}
          onChange={(event) => updateDraft({ category: event.target.value as Category })}
          className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Giá (VNĐ)
        <input
          type="number"
          value={draft.price}
          onChange={(event) => updateDraft({ price: Number(event.target.value) })}
          className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
          min={0}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Giá giảm (VNĐ)
        <input
          type="number"
          value={draft.discountPrice ?? ""}
          onChange={(event) =>
            updateDraft({ discountPrice: event.target.value ? Number(event.target.value) : undefined })
          }
          className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
          min={0}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Tồn kho
        <input
          type="number"
          value={draft.stockQuantity}
          onChange={(event) => updateDraft({ stockQuantity: Number(event.target.value) })}
          className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
          min={0}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium md:col-span-2">
        Ảnh chính (URL)
        <input
          value={draft.image ?? ""}
          onChange={(event) => updateDraft({ image: event.target.value })}
          className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
          placeholder="/images/banner.png"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium md:col-span-2">
        Mô tả
        <textarea
          value={draft.description ?? ""}
          onChange={(event) => updateDraft({ description: event.target.value })}
          className="min-h-24 border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
        />
      </label>
      <div className="flex flex-wrap gap-4 text-sm md:col-span-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) => updateDraft({ isActive: event.target.checked })}
            className="accent-black h-4 w-4"
          />
          Đang bán
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.isFeatured}
            onChange={(event) => updateDraft({ isFeatured: event.target.checked })}
            className="accent-black h-4 w-4"
          />
          Nổi bật
        </label>
      </div>
      <div className="flex gap-3 md:col-span-2 mt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 rounded-lg disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
        <button type="button" onClick={onSaved} className="border border-neutral-300 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-50">
          Đóng
        </button>
      </div>
    </form>
  );
}

function AdminDashboardContent() {
  const { products, loading: productsLoading } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Tab states: products, orders, vouchers, banners
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "vouchers" | "banners">("products");
  
  // Orders states
  const [orders, setOrders] = useState<Order[]>([]);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  
  // Vouchers states
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: 10,
    minOrderValue: 0,
    maxUsage: 100,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  // Banners states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
  });

  useEffect(() => {
    setOrders(getAllOrders());
    setVouchers(getVouchers());
    setBanners(getBanners());
  }, []);

  const refreshData = () => {
    setOrders(getAllOrders());
    setVouchers(getVouchers());
    setBanners(getBanners());
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    let updates: Partial<Order> = { orderStatus: nextStatus };
    if (nextStatus === "delivered") {
      updates.paymentStatus = "paid";
    }
    updateOrder(orderId, updates);
    refreshData();
  };

  const handleApproveRefund = (orderId: string) => {
    updateOrder(orderId, {
      orderStatus: "refunded",
      paymentStatus: "refunded",
    });
    refreshData();
  };

  const handleRejectRefundSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!rejectModalOrder || !rejectReasonInput.trim()) return;
    updateOrder(rejectModalOrder.id, {
      orderStatus: "delivered", // revert to delivered
      refundRejectReason: rejectReasonInput,
    });
    setRejectModalOrder(null);
    setRejectReasonInput("");
    refreshData();
  };

  const handleCreateVoucher = (e: FormEvent) => {
    e.preventDefault();
    if (!newVoucher.code.trim()) return;
    
    createVoucher({
      code: newVoucher.code.trim().toUpperCase(),
      discountType: newVoucher.discountType,
      discountValue: Number(newVoucher.discountValue),
      minOrderValue: Number(newVoucher.minOrderValue),
      maxUsage: Number(newVoucher.maxUsage),
      usedCount: 0,
      startDate: new Date(newVoucher.startDate).toISOString(),
      endDate: new Date(newVoucher.endDate).toISOString(),
      isActive: true,
    });
    
    setNewVoucher({
      code: "",
      discountType: "percent",
      discountValue: 10,
      minOrderValue: 0,
      maxUsage: 100,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    refreshData();
  };

  const handleToggleVoucher = (code: string) => {
    toggleVoucherStatus(code);
    refreshData();
  };

  const handleCreateBanner = (e: FormEvent) => {
    e.preventDefault();
    if (!newBanner.title.trim() || !newBanner.image.trim()) return;
    
    addBanner({
      id: Date.now().toString(),
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      image: newBanner.image,
      link: newBanner.link || "/products",
      isActive: true,
    });
    
    setNewBanner({
      title: "",
      subtitle: "",
      image: "",
      link: "",
    });
    refreshData();
  };

  const handleDeleteBanner = (id: string) => {
    deleteBanner(id);
    refreshData();
  };

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive).length;
    const stock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
    const completedOrders = orders.filter((o) => o.orderStatus === "delivered" || o.orderStatus === "refunded");
    const revenue = completedOrders.reduce((sum, o) => sum + (o.orderStatus === "refunded" ? 0 : o.total), 0);
    return { activeProducts, stock, revenue };
  }, [products, orders]);

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "paying":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "payment_failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "shipping":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "refund_pending":
        return "bg-purple-100 text-purple-800 border-purple-200 animate-pulse";
      case "refunded":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "refund_rejected":
        return "bg-neutral-200 text-neutral-800 border-neutral-300";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="mx-auto max-w-site px-4 py-10 md:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Control Center</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Quản trị cửa hàng, xem doanh thu thực tế, xử lý hoàn tiền, mã giảm giá và banner marketing.
          </p>
        </div>
        {activeTab === "products" && (
          <button
            onClick={() => setEditingProduct(createBlankProduct())}
            className="bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-neutral-800 rounded-lg transition"
          >
            Thêm sản phẩm
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 font-semibold">Sản phẩm đang bán</p>
          <p className="mt-2 text-2xl font-bold">{stats.activeProducts}</p>
        </div>
        <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 font-semibold">Tổng tồn kho</p>
          <p className="mt-2 text-2xl font-bold">{stats.stock} sản phẩm</p>
        </div>
        <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 font-semibold">Doanh thu (Đã giao)</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{formatPrice(stats.revenue)}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mt-8 flex gap-2 border-b border-neutral-200 pb-px overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-4 px-4 font-semibold border-b-2 transition ${
            activeTab === "products" ? "border-black text-black" : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-4 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "orders" ? "border-black text-black" : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Đơn hàng
          {orders.some((o) => o.orderStatus === "refund_pending") && (
            <span className="h-2 w-2 rounded-full bg-red-600 inline-block animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`pb-4 px-4 font-semibold border-b-2 transition ${
            activeTab === "vouchers" ? "border-black text-black" : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Mã giảm giá (Vouchers)
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`pb-4 px-4 font-semibold border-b-2 transition ${
            activeTab === "banners" ? "border-black text-black" : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          Banners Quảng cáo
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === "products" && (
        <div className="mt-6">
          {editingProduct && (
            <div className="mb-8">
              <ProductForm key={editingProduct.id} product={editingProduct} onSaved={() => setEditingProduct(null)} />
            </div>
          )}

          <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-neutral-50 text-left">
                <tr>
                  <th className="p-4 font-semibold text-neutral-600">Sản phẩm</th>
                  <th className="p-4 font-semibold text-neutral-600">Danh mục</th>
                  <th className="p-4 font-semibold text-neutral-600">Giá</th>
                  <th className="p-4 font-semibold text-neutral-600">Tồn kho</th>
                  <th className="p-4 font-semibold text-neutral-600">Trạng thái</th>
                  <th className="p-4 font-semibold text-neutral-600 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr>
                    <td className="p-8 text-center text-neutral-500" colSpan={6}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-neutral-200 hover:bg-neutral-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="h-14 w-10 object-cover rounded" />
                          <div>
                            <p className="font-medium text-black">{product.name}</p>
                            <p className="text-xs text-neutral-500">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-700 capitalize">{product.category}</td>
                      <td className="p-4 text-black font-semibold">{formatPrice(product.discountPrice || product.price)}</td>
                      <td className="p-4 text-neutral-700">{product.stockQuantity}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                          {product.isActive ? "Đang bán" : "Ẩn"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => setEditingProduct(product)} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider underline text-black hover:text-neutral-600">
                          Sửa
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider underline text-red-600 hover:text-red-800">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders & Refunds */}
      {activeTab === "orders" && (
        <div className="mt-6">
          <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead className="bg-neutral-50 text-left">
                <tr>
                  <th className="p-4 font-semibold text-neutral-600">Mã đơn</th>
                  <th className="p-4 font-semibold text-neutral-600">Khách hàng</th>
                  <th className="p-4 font-semibold text-neutral-600">Ngày đặt</th>
                  <th className="p-4 font-semibold text-neutral-600">Tổng tiền</th>
                  <th className="p-4 font-semibold text-neutral-600">Trạng thái</th>
                  <th className="p-4 font-semibold text-neutral-600 text-right">Hành động quản trị</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td className="p-8 text-center text-neutral-500" colSpan={6}>
                      Chưa có đơn hàng nào được đặt.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-neutral-200 hover:bg-neutral-50/50">
                      <td className="p-4 font-semibold text-black">#{order.id}</td>
                      <td className="p-4">
                        <p className="font-medium text-black">{order.shippingInfo.name}</p>
                        <p className="text-xs text-neutral-500">{order.shippingInfo.phone}</p>
                      </td>
                      <td className="p-4 text-neutral-500">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-4 font-bold text-black">
                        {formatPrice(order.total)}
                        {order.discountAmount && order.discountAmount > 0 ? (
                          <span className="block text-[10px] text-green-700 font-normal">
                            Đã giảm: -{formatPrice(order.discountAmount)} ({order.voucherCode})
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.orderStatus)}`}>
                          {formatOrderStatusText(order.orderStatus)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* Yêu cầu hoàn tiền cần duyệt */}
                          {order.orderStatus === "refund_pending" && (
                            <>
                              <button
                                onClick={() => handleApproveRefund(order.id)}
                                className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 shadow-sm"
                              >
                                Duyệt Hoàn Tiền
                              </button>
                              <button
                                onClick={() => setRejectModalOrder(order)}
                                className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 shadow-sm"
                              >
                                Từ Chối
                              </button>
                            </>
                          )}

                          {/* Thay đổi trạng thái thông thường (để thuận tiện kiểm thử) */}
                          {order.orderStatus !== "refund_pending" && order.orderStatus !== "refunded" && order.orderStatus !== "cancelled" && order.orderStatus !== "payment_failed" && (
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="border border-neutral-300 text-xs px-2.5 py-1.5 rounded-lg bg-white font-medium outline-none focus:border-black"
                            >
                              <option value="paying">Đang thanh toán</option>
                              <option value="pending">Chờ xác nhận</option>
                              <option value="confirmed">Đã xác nhận</option>
                              <option value="shipping">Đang vận chuyển</option>
                              <option value="delivered">Đã giao hàng</option>
                              <option value="cancelled">Hủy đơn</option>
                            </select>
                          )}

                          {order.orderStatus === "refund_pending" && order.cancelReason && (
                            <div className="w-full text-left text-xs text-neutral-500 mt-2 bg-purple-50 border border-purple-100 p-2 rounded-lg">
                              <strong>Lý do yêu cầu:</strong> {order.cancelReason}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Vouchers */}
      {activeTab === "vouchers" && (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Create form */}
          <form onSubmit={handleCreateVoucher} className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm h-fit space-y-4">
            <h3 className="font-display text-base font-bold">Tạo Voucher Mới</h3>
            <label className="grid gap-1 text-xs font-semibold">
              Mã Voucher
              <input
                type="text"
                placeholder="Ví dụ: VIXXY20"
                value={newVoucher.code}
                onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                className="border border-neutral-300 px-3 py-2 rounded-lg outline-none uppercase focus:border-black"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold">
                Loại giảm giá
                <select
                  value={newVoucher.discountType}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value as "percent" | "fixed" })}
                  className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                >
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền (VNĐ)</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                Giá trị giảm
                <input
                  type="number"
                  value={newVoucher.discountValue}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discountValue: Number(e.target.value) })}
                  className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                  min={1}
                  required
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-semibold">
              Đơn hàng tối thiểu (VNĐ)
              <input
                type="number"
                value={newVoucher.minOrderValue}
                onChange={(e) => setNewVoucher({ ...newVoucher, minOrderValue: Number(e.target.value) })}
                className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                min={0}
                required
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              Số lượt dùng tối đa
              <input
                type="number"
                value={newVoucher.maxUsage}
                onChange={(e) => setNewVoucher({ ...newVoucher, maxUsage: Number(e.target.value) })}
                className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                min={1}
                required
              />
            </label>
            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition">
              Tạo mã giảm giá
            </button>
          </form>

          {/* Vouchers list */}
          <div className="md:col-span-2 overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-neutral-50 text-left">
                <tr>
                  <th className="p-4 font-semibold text-neutral-600">Mã</th>
                  <th className="p-4 font-semibold text-neutral-600">Giảm</th>
                  <th className="p-4 font-semibold text-neutral-600">Đơn tối thiểu</th>
                  <th className="p-4 font-semibold text-neutral-600">Lượt dùng (Đã dùng/Tối đa)</th>
                  <th className="p-4 font-semibold text-neutral-600 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.code} className="border-t border-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-4 font-semibold text-black uppercase">{v.code}</td>
                    <td className="p-4">
                      {v.discountType === "percent" ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                    </td>
                    <td className="p-4">{formatPrice(v.minOrderValue)}</td>
                    <td className="p-4 font-medium">
                      {v.usedCount} / {v.maxUsage}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleVoucher(v.code)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold tracking-wider transition ${
                          v.isActive
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {v.isActive ? "Hoạt động (Khóa)" : "Khóa (Mở)"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Banners */}
      {activeTab === "banners" && (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Create form */}
          <form onSubmit={handleCreateBanner} className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm h-fit space-y-4">
            <h3 className="font-display text-base font-bold">Thêm Banner Quảng Cáo</h3>
            <label className="grid gap-1 text-xs font-semibold">
              Tiêu đề chính
              <input
                type="text"
                placeholder="Ví dụ: Pearl Collection"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                required
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              Phụ đề (Mô tả ngắn)
              <input
                type="text"
                placeholder="Ví dụ: Trang sức ngọc trai cao cấp..."
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              Ảnh Banner (URL hoặc đường dẫn cục bộ)
              <input
                type="text"
                placeholder="Ví dụ: /images/Banner_Pearl.png"
                value={newBanner.image}
                onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                required
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              Đường dẫn liên kết (URL / Route)
              <input
                type="text"
                placeholder="Ví dụ: /products?category=jewelry"
                value={newBanner.link}
                onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
              />
            </label>
            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition">
              Thêm banner
            </button>
          </form>

          {/* Banners list */}
          <div className="md:col-span-2 space-y-4">
            {banners.map((b) => (
              <div key={b.id} className="flex flex-col sm:flex-row gap-4 border border-neutral-200 p-4 rounded-2xl bg-white shadow-sm items-center">
                <img src={b.image} alt={b.title} className="h-24 w-36 object-cover rounded-xl bg-neutral-100" />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-black text-base">{b.title}</h4>
                  {b.subtitle && <p className="text-xs text-neutral-500 mt-1">{b.subtitle}</p>}
                  <p className="text-[10px] text-neutral-400 mt-2">Liên kết: <span className="font-mono">{b.link}</span></p>
                </div>
                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Refund Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRejectRefundSubmit} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Từ chối hoàn tiền</h3>
            <p className="text-sm text-neutral-600 mb-4">Vui lòng cung cấp lý do từ chối hoàn tiền cho đơn hàng <strong>#{rejectModalOrder.id}</strong>:</p>
            <textarea
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full border border-neutral-300 rounded-lg p-3 text-sm min-h-24 outline-none focus:border-black mb-4"
              required
            />
            <div className="flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="border border-neutral-300 px-4 py-2 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-neutral-800"
              >
                Xác nhận Từ chối
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

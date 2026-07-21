"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProducts } from "@/hooks/useProducts";
import { createBlankProduct, deleteProduct, saveProduct } from "@/lib/productData";
import { formatPrice } from "@/lib/products";
import { Category, Product, Order, OrderStatus, Voucher, Banner } from "@/lib/types";
import { getAllOrders, updateOrder, formatOrderStatusText } from "@/lib/orders";
import { getVouchers, createVoucher, toggleVoucherStatus } from "@/lib/vouchers";
import { getBanners, addBanner, deleteBanner } from "@/lib/banners";
import { subscribeChatUpdates, sendMessage, LiveChatMessage } from "@/lib/chat";

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
      <div className="grid gap-2 border border-neutral-200 p-4 rounded-xl md:col-span-2 bg-neutral-50/50">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Tồn kho theo kích cỡ (Size Stock)</p>
        <div className="flex flex-wrap gap-4 mt-2">
          {["S", "M", "L", "XL", "One Size"].map((s) => {
            const hasSize = draft.sizes?.includes(s) ?? false;
            const sizeStock = draft.sizeStock || {};
            const stockVal = sizeStock[s] !== undefined ? Number(sizeStock[s]) : 0;
            
            return (
              <div key={s} className="flex items-center gap-2 border border-neutral-200 bg-white p-2 rounded-lg min-w-[120px]">
                <input
                  type="checkbox"
                  checked={hasSize}
                  onChange={(e) => {
                    const nextSizes = e.target.checked
                      ? [...(draft.sizes || []), s]
                      : (draft.sizes || []).filter((x) => x !== s);
                    
                    const nextSizeStock = { ...sizeStock };
                    if (e.target.checked && nextSizeStock[s] === undefined) {
                      nextSizeStock[s] = 10;
                    } else if (!e.target.checked) {
                      delete nextSizeStock[s];
                    }

                    const nextTotalStock = Object.values(nextSizeStock).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
                    
                    updateDraft({
                      sizes: nextSizes,
                      sizeStock: nextSizeStock,
                      stockQuantity: nextTotalStock
                    });
                  }}
                  className="accent-black h-4 w-4"
                />
                <span className="text-xs font-bold w-6">{s}</span>
                {hasSize && (
                  <input
                    type="number"
                    min={0}
                    value={stockVal}
                    onChange={(e) => {
                      const nextSizeStock = { ...sizeStock, [s]: Math.max(0, Number(e.target.value)) };
                      const nextTotalStock = Object.values(nextSizeStock).reduce((sum: number, val: any) => sum + Number(val || 0), 0);
                      
                      updateDraft({
                        sizeStock: nextSizeStock,
                        stockQuantity: nextTotalStock
                      });
                    }}
                    className="w-16 border border-neutral-300 rounded px-1.5 py-0.5 text-center text-xs outline-none focus:border-black"
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-neutral-400 mt-1">Tổng tồn kho tự động tính toán: <strong>{draft.stockQuantity}</strong> sản phẩm.</p>
      </div>
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

function Icon({ name }: { name: string }) {
  switch (name) {
    case "dashboard":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1"></rect>
          <rect x="14" y="3" width="7" height="5" rx="1"></rect>
          <rect x="14" y="12" width="7" height="9" rx="1"></rect>
          <rect x="3" y="16" width="7" height="5" rx="1"></rect>
        </svg>
      );
    case "users":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      );
    case "orders":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      );
    case "products":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      );
    case "vouchers":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
        </svg>
      );
    case "banners":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      );
    case "chat":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      );
    case "reports":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      );
    case "settings":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      );
    case "store":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      );
    default:
      return null;
  }
}

function AdminDashboardContent() {
  const { products, loading: productsLoading } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Tab states: dashboard, users, orders, products, vouchers, banners, reports, chat, settings
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "orders" | "products" | "vouchers" | "banners" | "reports" | "chat" | "settings">("dashboard");
  
  // Chat CSKH states
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("user@vixxy.com");
  
  // Orders states
  const [orders, setOrders] = useState<Order[]>([]);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "refund_pending">("all");
  
  // Users states
  const [usersList, setUsersList] = useState<any[]>([]);

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
    applicableCategory: "all" as "all" | Category,
  });

  // Banners states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
  });

  // Settings states
  const [shopSettings, setShopSettings] = useState({
    shopName: "Vixxy D'Orance",
    hotline: "0900.000.000",
    address: "123 Đường Hai Bà Trưng, Quận 1, TP. HCM",
    email: "support@vixxy.com",
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setOrders(getAllOrders());
    setVouchers(getVouchers());
    setBanners(getBanners());
    
    // Load users list
    try {
      const rawUsers = localStorage.getItem("vixxy_demo_users");
      if (rawUsers) {
        setUsersList(JSON.parse(rawUsers));
      }
    } catch (e) {
      console.error("Failed to parse vixxy_demo_users", e);
    }
    
    // Load settings
    try {
      const rawSettings = localStorage.getItem("vixxy_settings");
      if (rawSettings) {
        setShopSettings(JSON.parse(rawSettings));
      }
    } catch (e) {
      console.error("Failed to parse vixxy_settings", e);
    }
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
      orderStatus: "refund_rejected",
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
      applicableCategory: newVoucher.applicableCategory,
    });
    
    setNewVoucher({
      code: "",
      discountType: "percent",
      discountValue: 10,
      minOrderValue: 0,
      maxUsage: 100,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      applicableCategory: "all",
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

  const handleToggleUserStatus = (userId: number) => {
    if (userId === 2) {
      alert("Không thể khóa tài khoản Admin chính!");
      return;
    }
    const nextUsers = usersList.map((u) => {
      if (u.id === userId) {
        return { ...u, status: u.status === "blocked" ? "active" : "blocked" };
      }
      return u;
    });
    setUsersList(nextUsers);
    localStorage.setItem("vixxy_demo_users", JSON.stringify(nextUsers));
    refreshData();
  };

  useEffect(() => {
    return subscribeChatUpdates((all) => setChatMessages(all));
  }, []);

  const uniqueUserEmails = useMemo(() => {
    const set = new Set<string>();
    (chatMessages || []).forEach((m) => {
      if (m && m.userEmail) set.add(m.userEmail);
    });
    return Array.from(set);
  }, [chatMessages]);

  useEffect(() => {
    if (uniqueUserEmails.length > 0 && !uniqueUserEmails.includes(selectedUserEmail)) {
      setSelectedUserEmail(uniqueUserEmails[0]);
    }
  }, [uniqueUserEmails, selectedUserEmail]);

  const handleSendAdminReply = (e: FormEvent) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedUserEmail) return;

    // userEmail = email của khách để tin nhắn định tuyến đúng về hội thoại đó.
    sendMessage({
      userEmail: selectedUserEmail,
      userName: selectedUserEmail.split("@")[0] || "Khách hàng",
      sender: "admin",
      text: adminChatInput,
    });
    setAdminChatInput("");
  };

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("vixxy_settings", JSON.stringify(shopSettings));
    alert("Đã lưu cấu hình hệ thống thành công!");
  };

  const handleResetDatabase = () => {
    if (
      confirm(
        "BẠN CÓ CHẮC CHẮN MUỐN KHÔI PHỤC DỮ LIỆU GỐC?\nToàn bộ sản phẩm, đơn hàng, người dùng và voucher sẽ được hoàn tác về dữ liệu mẫu (Seed Data) ban đầu."
      )
    ) {
      localStorage.removeItem("vixxy_products");
      localStorage.removeItem("vixxy_orders");
      localStorage.removeItem("vixxy_vouchers");
      localStorage.removeItem("vixxy_banners");
      localStorage.removeItem("vixxy_demo_users");
      localStorage.removeItem("vixxy_settings");
      window.location.reload();
    }
  };

  const stats = useMemo(() => {
    const activeProducts = Array.isArray(products) ? products.filter((product) => product?.isActive).length : 0;
    const stock = Array.isArray(products) ? products.reduce((sum, product) => sum + (product?.stockQuantity || 0), 0) : 0;
    const completedOrders = Array.isArray(orders) ? orders.filter((o) => o && (o.orderStatus === "delivered" || o.orderStatus === "refunded")) : [];
    const revenue = completedOrders.reduce((sum, o) => sum + (o?.orderStatus === "refunded" ? 0 : (o?.total || 0)), 0);
    const totalUsers = Array.isArray(usersList) ? usersList.length : 0;
    const activeVouchers = Array.isArray(vouchers) ? vouchers.filter(v => v && v.isActive).length : 0;
    return { activeProducts, stock, revenue, totalUsers, activeVouchers };
  }, [products, orders, usersList, vouchers]);

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "paying":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "payment_failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "shipping":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
      case "refund_pending":
        return "bg-purple-50 text-purple-700 border-purple-200 animate-pulse";
      case "refunded":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "refund_rejected":
        return "bg-neutral-200 text-neutral-800 border-neutral-300";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const filteredOrders = useMemo(() => {
    if (orderFilter === "refund_pending") {
      return orders.filter((o) => o.orderStatus === "refund_pending");
    }
    return orders;
  }, [orders, orderFilter]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "users", label: "Người dùng", icon: "users" },
    { id: "orders", label: "Đơn hàng", icon: "orders" },
    { id: "chat", label: "Trò chuyện CSKH", icon: "chat" },
    { id: "products", label: "Sản phẩm", icon: "products" },
    { id: "vouchers", label: "Mã giảm giá", icon: "vouchers" },
    { id: "banners", label: "Banners", icon: "banners" },
    { id: "reports", label: "Báo cáo", icon: "reports" },
    { id: "settings", label: "Cài đặt", icon: "settings" },
  ] as const;

  return (
    <div className="flex h-screen bg-neutral-100 font-sans text-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 text-neutral-400 flex flex-col justify-between flex-shrink-0 border-r border-neutral-800">
        <div>
          <div className="p-6 border-b border-neutral-800 flex flex-col gap-1">
            <h1 className="font-display text-lg font-bold text-white tracking-widest uppercase">Vixxy Control</h1>
            <p className="text-[10px] uppercase tracking-wider text-neutral-600">Quản trị viên hệ thống</p>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setEditingProduct(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                      : "hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.id === "orders" && orders.some((o) => o.orderStatus === "refund_pending") && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-800">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all"
          >
            <Icon name="store" />
            <span>Về cửa hàng</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold capitalize">{activeTab === "vouchers" ? "Mã giảm giá (Vouchers)" : activeTab}</h2>
            <p className="text-xs text-neutral-500 mt-1">Cửa hàng: <span className="font-semibold text-black">{shopSettings.shopName}</span> | Hotline: {shopSettings.hotline}</p>
          </div>
          {activeTab === "products" && !editingProduct && (
            <button
              onClick={() => setEditingProduct(createBlankProduct())}
              className="bg-black text-white text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-800 transition"
            >
              + Thêm sản phẩm
            </button>
          )}
        </header>

        {/* Tab 0: Dashboard (Tổng quan) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Doanh thu đã giao</p>
                <p className="text-xl font-bold mt-2 text-indigo-600">{formatPrice(stats.revenue)}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sản phẩm đang bán</p>
                <p className="text-xl font-bold mt-2 text-black">{stats.activeProducts}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Tổng tồn kho</p>
                <p className="text-xl font-bold mt-2 text-black">{stats.stock} chiếc</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Khách hàng</p>
                <p className="text-xl font-bold mt-2 text-black">{stats.totalUsers}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Vouchers hoạt động</p>
                <p className="text-xl font-bold mt-2 text-black">{stats.activeVouchers}</p>
              </div>
            </div>

            {/* Quick sections */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Orders */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-neutral-500">Đơn hàng mới nhận</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex justify-between items-center text-xs pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-bold text-black">#{o.id}</p>
                        <p className="text-neutral-500 mt-0.5">{o.shippingInfo?.name || "Khách hàng"} | {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "Chưa rõ"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-black">{formatPrice(o.total)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border mt-1 ${getOrderStatusColor(o.orderStatus)}`}>
                          {formatOrderStatusText(o.orderStatus)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-neutral-400 text-center py-6 text-xs">Chưa có đơn hàng nào.</p>}
                </div>
              </div>

              {/* Popular Products */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-neutral-500">Sản phẩm tồn kho thấp</h3>
                <div className="space-y-4">
                  {products
                    .slice()
                    .sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0))
                    .slice(0, 5)
                    .map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-xs pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-8 h-10 object-cover rounded" />
                          <div>
                            <p className="font-semibold text-black truncate w-40">{p.name}</p>
                            <p className="text-neutral-400 mt-0.5">{p.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${p.stockQuantity <= 3 ? "text-red-600 font-extrabold" : "text-neutral-700"}`}>
                            Còn: {p.stockQuantity}c
                          </p>
                          <p className="text-neutral-400 mt-0.5">{formatPrice(p.discountPrice || p.price)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Users (Người dùng) */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden animate-fadeIn">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Điện thoại</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} className="border-b border-neutral-200 hover:bg-neutral-50/50">
                    <td className="p-4 text-neutral-500 font-mono text-xs">{u.id}</td>
                    <td className="p-4 font-semibold text-black">{u.fullName || u.username}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4 text-neutral-600">{u.phone || "Chưa có"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.roleId === 2 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role?.roleName || "CUSTOMER"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${u.status === "blocked" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                        {u.status === "blocked" ? "Đã khóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.id !== 2 ? (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold tracking-wider transition ${
                            u.status === "blocked"
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {u.status === "blocked" ? "Mở khóa" : "Khóa tài khoản"}
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Mặc định</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Orders (Đơn hàng) */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrderFilter("all")}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${
                  orderFilter === "all" ? "bg-black text-white border-black" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                Tất cả đơn hàng ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter("refund_pending")}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition flex items-center gap-2 ${
                  orderFilter === "refund_pending" ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/10" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                Yêu cầu hoàn tiền ({orders.filter(o => o.orderStatus === "refund_pending").length})
                {orders.some((o) => o.orderStatus === "refund_pending") && (
                  <span className="h-2 w-2 rounded-full bg-white inline-block animate-ping"></span>
                )}
              </button>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full min-w-[960px] border-collapse text-sm">
                <thead className="bg-neutral-50 text-left border-b border-neutral-200">
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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td className="p-8 text-center text-neutral-500" colSpan={6}>
                        Không tìm thấy đơn hàng nào tương thích.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-200 hover:bg-neutral-50/50">
                        <td className="p-4 font-semibold text-black">#{order.id}</td>
                        <td className="p-4">
                          <p className="font-medium text-black">{order.shippingInfo?.name || "Khách hàng"}</p>
                          <p className="text-xs text-neutral-500">{order.shippingInfo?.phone || "Chưa có"}</p>
                        </td>
                        <td className="p-4 text-neutral-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "Chưa rõ"}
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

                            {/* Thay đổi trạng thái thông thường (Áp dụng các quy tắc nghiêm ngặt) */}
                            {order.orderStatus !== "refund_pending" && (
                              <>
                                {order.orderStatus === "shipping" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 shadow-sm transition"
                                  >
                                    ✅ Đã giao hàng
                                  </button>
                                )}

                                {["delivered", "cancelled", "refunded", "payment_failed", "refund_rejected"].includes(order.orderStatus) ? (
                                  <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider italic p-1.5">
                                    Đã hoàn thành
                                  </span>
                                ) : (
                                  <select
                                    value={order.orderStatus}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                    className="border border-neutral-300 text-xs px-2.5 py-1.5 rounded-lg bg-white font-medium outline-none focus:border-black cursor-pointer"
                                  >
                                    {order.orderStatus === "paying" && (
                                      <>
                                        <option value="paying">Đang thanh toán (Giữ kho)</option>
                                        <option value="cancelled">Hủy giao dịch</option>
                                      </>
                                    )}
                                    {order.orderStatus === "pending" && (
                                      <>
                                        <option value="pending">Chờ xác nhận</option>
                                        <option value="confirmed">Xác nhận đơn</option>
                                        <option value="cancelled">Hủy đơn hàng</option>
                                      </>
                                    )}
                                    {order.orderStatus === "confirmed" && (
                                      <>
                                        <option value="confirmed">Đã xác nhận</option>
                                        <option value="shipping">Giao hàng (Đang ship)</option>
                                        <option value="cancelled">Hủy đơn hàng</option>
                                      </>
                                    )}
                                    {order.orderStatus === "shipping" && (
                                      <>
                                        <option value="shipping">Đang vận chuyển</option>
                                        <option value="delivered">Đã giao hàng thành công</option>
                                        <option value="cancelled">Giao hàng thất bại (Hủy)</option>
                                      </>
                                    )}
                                  </select>
                                )}
                              </>
                            )}

                            {order.refundReason && (order.orderStatus === "refund_pending" || order.orderStatus === "refunded" || order.orderStatus === "delivered") && (
                              <div className="w-full text-left text-xs text-neutral-500 mt-2 bg-purple-50 border border-purple-100 p-2.5 rounded-lg flex flex-col gap-0.5">
                                <div><strong>Lý do yêu cầu:</strong> {order.refundReason}</div>
                                {order.refundRejectReason && <div className="text-red-600"><strong>Lý do từ chối:</strong> {order.refundRejectReason}</div>}
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

        {/* Tab 3: Products (Sản phẩm) */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fadeIn">
            {editingProduct && (
              <div className="mb-6">
                <ProductForm key={editingProduct.id} product={editingProduct} onSaved={() => setEditingProduct(null)} />
              </div>
            )}

            <div className="overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead className="bg-neutral-50 text-left border-b border-neutral-200">
                  <tr>
                    <th className="p-4 font-semibold text-neutral-600">Sản phẩm</th>
                    <th className="p-4 font-semibold text-neutral-600">Danh mục</th>
                    <th className="p-4 font-semibold text-neutral-600">Giá</th>
                    <th className="p-4 font-semibold text-neutral-600">Tồn kho theo Size</th>
                    <th className="p-4 font-semibold text-neutral-600">Trạng thái</th>
                    <th className="p-4 font-semibold text-neutral-600 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {productsLoading ? (
                    <tr>
                      <td className="p-8 text-center text-neutral-500" colSpan={6}>
                        Đang tải dữ liệu sản phẩm...
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="border-b border-neutral-200 hover:bg-neutral-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="h-14 w-10 object-cover rounded bg-neutral-100" />
                            <div>
                              <p className="font-semibold text-black">{product.name}</p>
                              <p className="text-xs text-neutral-500">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-700 capitalize">{product.category}</td>
                        <td className="p-4 text-black font-bold">{formatPrice(product.discountPrice || product.price)}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-neutral-800">Tổng: {product.stockQuantity}</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {product.sizes?.map((sz) => {
                                const sizeStock = product.sizeStock || {};
                                const count = sizeStock[sz] !== undefined ? sizeStock[sz] : 0;
                                return (
                                  <span key={sz} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600 border border-neutral-200">
                                    {sz}: <strong className="font-mono text-black">{count}</strong>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </td>
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

        {/* Tab 4: Vouchers (Mã giảm giá) */}
        {activeTab === "vouchers" && (
          <div className="grid gap-6 md:grid-cols-3 animate-fadeIn">
            {/* Create voucher form */}
            <form onSubmit={handleCreateVoucher} className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm h-fit space-y-4">
              <h3 className="font-display text-base font-bold text-black border-b pb-2 mb-3">Tạo Mã Giảm Giá Mới</h3>
              <label className="grid gap-1 text-xs font-semibold">
                Mã Code (Chữ in hoa)
                <input
                  type="text"
                  placeholder="Ví dụ: WINTER20"
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                  className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black uppercase"
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-semibold">
                  Loại giảm
                  <select
                    value={newVoucher.discountType}
                    onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value as "percent" | "fixed" })}
                    className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Cố định (VNĐ)</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold">
                  Giá trị giảm
                  <input
                    type="number"
                    value={newVoucher.discountValue}
                    onChange={(e) => setNewVoucher({ ...newVoucher, discountValue: Math.max(0, Number(e.target.value)) })}
                    className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                    min={1}
                    required
                  />
                </label>
              </div>

              {/* Danh mục áp dụng */}
              <label className="grid gap-1 text-xs font-semibold">
                Danh mục áp dụng
                <select
                  value={newVoucher.applicableCategory}
                  onChange={(e) => setNewVoucher({ ...newVoucher, applicableCategory: e.target.value as any })}
                  className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                >
                  <option value="all">Tất cả sản phẩm</option>
                  <option value="clothing">Chỉ Trang Phục (Clothing)</option>
                  <option value="jewelry">Chỉ Trang Sức (Jewelry)</option>
                  <option value="accessories">Chỉ Phụ Kiện (Accessories)</option>
                </select>
              </label>

              <label className="grid gap-1 text-xs font-semibold">
                Đơn hàng tối thiểu (VNĐ)
                <input
                  type="number"
                  value={newVoucher.minOrderValue}
                  onChange={(e) => setNewVoucher({ ...newVoucher, minOrderValue: Math.max(0, Number(e.target.value)) })}
                  className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                  min={0}
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                Số lượt sử dụng tối đa
                <input
                  type="number"
                  value={newVoucher.maxUsage}
                  onChange={(e) => setNewVoucher({ ...newVoucher, maxUsage: Math.max(1, Number(e.target.value)) })}
                  className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                  min={1}
                  required
                />
              </label>
              <button type="submit" className="w-full bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition">
                Tạo mã giảm giá
              </button>
            </form>

            {/* Vouchers list */}
            <div className="md:col-span-2 overflow-x-auto border border-neutral-200 rounded-2xl bg-white shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-neutral-50 text-left border-b border-neutral-200">
                  <tr>
                    <th className="p-4 font-semibold text-neutral-600">Mã</th>
                    <th className="p-4 font-semibold text-neutral-600">Mức Giảm</th>
                    <th className="p-4 font-semibold text-neutral-600">Áp dụng cho</th>
                    <th className="p-4 font-semibold text-neutral-600 font-normal">Điều kiện đơn</th>
                    <th className="p-4 font-semibold text-neutral-600 text-center font-normal">Lượt dùng</th>
                    <th className="p-4 font-semibold text-neutral-600 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr key={v.code} className="border-b border-neutral-200 hover:bg-neutral-50/50">
                      <td className="p-4 font-semibold text-black uppercase">{v.code}</td>
                      <td className="p-4">
                        {v.discountType === "percent" ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${!v.applicableCategory || v.applicableCategory === "all" ? "bg-neutral-100 text-neutral-700" : "bg-orange-100 text-orange-700"}`}>
                          {v.applicableCategory === "clothing" ? "Trang phục" : v.applicableCategory === "jewelry" ? "Trang sức" : v.applicableCategory === "accessories" ? "Phụ kiện" : "Tất cả"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-neutral-500">Đơn từ: {formatPrice(v.minOrderValue)}</td>
                      <td className="p-4 font-medium text-center">
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
                          {v.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Banners (Banners) */}
        {activeTab === "banners" && (
          <div className="grid gap-6 md:grid-cols-3 animate-fadeIn">
            {/* Create form */}
            <form onSubmit={handleCreateBanner} className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-sm h-fit space-y-4">
              <h3 className="font-display text-base font-bold text-black border-b pb-2 mb-3">Thêm Banner Slideshow</h3>
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
                Đường dẫn ảnh (URL)
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
                Đường dẫn liên kết (Link)
                <input
                  type="text"
                  placeholder="Ví dụ: /products?category=jewelry"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                  className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-black"
                />
              </label>
              <button type="submit" className="w-full bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition">
                Thêm banner
              </button>
            </form>

            {/* Banners list */}
            <div className="md:col-span-2 space-y-4">
              {banners.map((b) => (
                <div key={b.id} className="flex flex-col sm:flex-row gap-4 border border-neutral-200 p-4 rounded-2xl bg-white shadow-sm items-center">
                  <img src={b.image} alt={b.title} className="h-24 w-36 object-cover rounded-xl bg-neutral-100 border" />
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-black text-base">{b.title}</h4>
                    {b.subtitle && <p className="text-xs text-neutral-500 mt-1">{b.subtitle}</p>}
                    <p className="text-[10px] text-neutral-400 mt-2">Đường dẫn: <span className="font-mono">{b.link}</span></p>
                  </div>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              {banners.length === 0 && <p className="text-neutral-400 text-center py-8 bg-white border rounded-2xl">Chưa có banner quảng cáo nào.</p>}
            </div>
          </div>
        )}

        {/* Tab Chat CSKH & AI */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn">
            {/* Conversations List */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col shadow-sm">
              <h3 className="font-bold text-sm text-black mb-3 border-b pb-2 flex items-center justify-between">
                <span>💬 Danh sách Khách hàng ({uniqueUserEmails.length})</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Trực tuyến</span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {uniqueUserEmails.map((email) => {
                  const userMsgs = chatMessages.filter((m) => m.userEmail === email);
                  const lastMsg = userMsgs[userMsgs.length - 1];
                  const isSelected = selectedUserEmail === email;

                  return (
                    <button
                      key={email}
                      onClick={() => setSelectedUserEmail(email)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-500 shadow-xs"
                          : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-black">{lastMsg?.userName || email}</span>
                        <span className="text-[10px] text-neutral-400">
                          {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">{lastMsg?.text || "Chưa có tin nhắn"}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Transcript & Admin Reply Box */}
            <div className="md:col-span-2 bg-white border border-neutral-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-neutral-200 bg-neutral-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Hội thoại trực tiếp: {selectedUserEmail}</h3>
                  <p className="text-[10px] text-neutral-400">Admin có thể theo dõi và trả lời tin nhắn trực tiếp cho khách hàng</p>
                </div>
                <span className="text-xs bg-indigo-600 px-3 py-1 rounded-full font-bold">Quyền CSKH Admin</span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 text-xs">
                {chatMessages
                  .filter((m) => m.userEmail === selectedUserEmail)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] font-semibold text-neutral-500 mb-0.5">
                        {msg.sender === "admin"
                          ? "👑 Bạn (CSKH Admin)"
                          : msg.sender === "bot"
                          ? "🤖 Trợ lý ảo VIXXY"
                          : `👤 ${msg.userName}`}
                      </span>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.sender === "admin"
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                            : msg.sender === "bot"
                            ? "bg-white text-neutral-800 rounded-tl-none border shadow-xs"
                            : "bg-neutral-900 text-white rounded-tl-none shadow-sm"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className="text-[9px] opacity-70 mt-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendAdminReply} className="p-3 border-t border-neutral-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={adminChatInput}
                  onChange={(e) => setAdminChatInput(e.target.value)}
                  placeholder={`Nhập câu trả lời trực tiếp cho ${selectedUserEmail}...`}
                  className="flex-1 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={!adminChatInput.trim()}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Gửi Phản Hồi
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 6: Reports (Báo cáo) */}
        {activeTab === "reports" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category Revenue Contribution (HTML/CSS Progress bar chart) */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold text-base text-black mb-4">Doanh thu theo danh mục (Revenue by Category)</h3>
                <div className="space-y-6 mt-4">
                  {categories.map((cat) => {
                    const catOrders = orders.filter((o) => o.orderStatus === "delivered");
                    const catRevenue = catOrders.reduce((sum, o) => {
                      const catTotal = (o?.items || [])
                        .filter((item) => item?.product?.category === cat)
                        .reduce((s, i) => s + ((i?.product?.discountPrice || i?.product?.price || 0) * (i?.quantity || 0)), 0);
                      return sum + catTotal;
                    }, 0);
                    
                    const totalRevenue = stats.revenue || 1;
                    const percent = Math.min(100, Math.round((catRevenue / totalRevenue) * 100));
                    
                    let catColor = "bg-indigo-600";
                    let catLabel = "Trang phục (Clothing)";
                    if (cat === "jewelry") {
                      catColor = "bg-amber-500";
                      catLabel = "Trang sức (Jewelry)";
                    } else if (cat === "accessories") {
                      catColor = "bg-emerald-500";
                      catLabel = "Phụ kiện (Accessories)";
                    }

                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-neutral-700">
                          <span>{catLabel}</span>
                          <span className="font-bold">{formatPrice(catRevenue)} ({percent}%)</span>
                        </div>
                        <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                          <div className={`h-full ${catColor} rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly revenue bar chart */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold text-base text-black mb-4">Doanh số 3 tháng gần nhất (Monthly revenue)</h3>
                
                {/* SVG styled column charts */}
                <div className="flex items-end justify-around h-48 pt-6 border-b border-neutral-200 font-mono text-[10px] text-neutral-500">
                  <div className="flex flex-col items-center gap-2 w-12">
                    <div className="text-[9px] font-bold text-indigo-600">12.5M</div>
                    <div className="bg-neutral-200 w-8 rounded-t-lg transition-all" style={{ height: "40px" }}></div>
                    <span>Tháng 5</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-12">
                    <div className="text-[9px] font-bold text-indigo-600">32.8M</div>
                    <div className="bg-neutral-300 w-8 rounded-t-lg transition-all" style={{ height: "80px" }}></div>
                    <span>Tháng 6</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-12">
                    {/* Sum current delivered order total */}
                    <div className="text-[9px] font-bold text-indigo-600">
                      {Math.round(stats.revenue / 1000000)}M
                    </div>
                    <div className="bg-indigo-600 w-8 rounded-t-lg transition-all" style={{ height: `${Math.min(120, Math.max(15, Math.round(stats.revenue / 500000)))}px` }}></div>
                    <span className="font-bold text-indigo-600">Tháng 7</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 mt-4 text-center">Biểu đồ thể hiện mức tăng trưởng doanh số thực tế của tháng hiện tại (Tháng 7).</p>
              </div>
            </div>

            {/* Order status distribution */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-base text-black mb-4">Tỷ lệ trạng thái đơn hàng (Order status distribution)</h3>
              
              {/* Stacked percentages progress bar */}
              <div className="h-4 w-full bg-neutral-100 rounded-full flex overflow-hidden mt-6">
                {["pending", "confirmed", "shipping", "delivered", "cancelled"].map((status) => {
                  const count = orders.filter((o) => o.orderStatus === status).length;
                  const total = orders.length || 1;
                  const percent = Math.round((count / total) * 100);
                  if (count === 0) return null;

                  let color = "bg-blue-500";
                  if (status === "confirmed") color = "bg-indigo-500";
                  else if (status === "shipping") color = "bg-orange-500";
                  else if (status === "delivered") color = "bg-green-500";
                  else if (status === "cancelled") color = "bg-neutral-400";

                  return (
                    <div
                      key={status}
                      className={`${color} h-full transition-all`}
                      style={{ width: `${percent}%` }}
                      title={`${status}: ${count} đơn (${percent}%)`}
                    ></div>
                  );
                })}
              </div>

              {/* Legend grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-blue-500 rounded-full block"></span>
                  <span>Chờ xác nhận ({orders.filter(o => o.orderStatus === "pending").length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-indigo-500 rounded-full block"></span>
                  <span>Đã xác nhận ({orders.filter(o => o.orderStatus === "confirmed").length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-orange-500 rounded-full block"></span>
                  <span>Đang giao ({orders.filter(o => o.orderStatus === "shipping").length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-green-500 rounded-full block"></span>
                  <span>Đã giao ({orders.filter(o => o.orderStatus === "delivered").length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-neutral-400 rounded-full block"></span>
                  <span>Đã hủy ({orders.filter(o => o.orderStatus === "cancelled").length})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Settings (Cài đặt) */}
        {activeTab === "settings" && (
          <div className="grid gap-6 md:grid-cols-3 animate-fadeIn">
            {/* System Profile configuration */}
            <form onSubmit={handleSaveSettings} className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm space-y-4 h-fit md:col-span-2">
              <h3 className="font-display text-base font-bold text-black border-b pb-2 mb-3">Cấu hình thông tin cửa hàng</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1 text-xs font-semibold">
                  Tên cửa hàng
                  <input
                    type="text"
                    value={shopSettings.shopName}
                    onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                    className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-indigo-600 bg-neutral-50"
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold">
                  Hotline liên hệ
                  <input
                    type="text"
                    value={shopSettings.hotline}
                    onChange={(e) => setShopSettings({ ...shopSettings, hotline: e.target.value })}
                    className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-indigo-600 bg-neutral-50"
                    required
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1 text-xs font-semibold">
                  Địa chỉ email hỗ trợ
                  <input
                    type="email"
                    value={shopSettings.email}
                    onChange={(e) => setShopSettings({ ...shopSettings, email: e.target.value })}
                    className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-indigo-600 bg-neutral-50"
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold">
                  Địa chỉ shop (Trụ sở chính)
                  <input
                    type="text"
                    value={shopSettings.address}
                    onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                    className="border border-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-indigo-600 bg-neutral-50"
                    required
                  />
                </label>
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 shadow-sm transition">
                Lưu cấu hình
              </button>
            </form>

            {/* Utility panel (Reset) */}
            <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm h-fit space-y-4">
              <h3 className="font-display text-base font-bold text-red-600 border-b pb-2 mb-3">Khôi phục dữ liệu ban đầu</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Nếu quá trình kiểm thử dữ liệu (Sản phẩm, Đơn hàng, Voucher) bị lộn xộn, bạn có thể thiết lập lại cơ sở dữ liệu ảo về trạng thái mặc định.
              </p>
              <button
                type="button"
                onClick={handleResetDatabase}
                className="w-full bg-red-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-sm transition"
              >
                Reset Database ảo
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Reject Refund Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
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

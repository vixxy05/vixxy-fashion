"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { useAuthStore } from "@/stores/authStore";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/products";
import { useState, useEffect } from "react";

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const { count, total, items } = useCart();
  const { count: wishlistCount, items: wishlistItems } = useWishlist();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    birthday: user?.birthday ? new Date(user.birthday).toISOString().split("T")[0] : "",
    gender: user?.gender || "",
    address: user?.address || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        birthday: user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : "",
        gender: user.gender || "",
        address: user.address || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-site px-4 py-20 text-center md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
          Tài khoản
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Đăng nhập để xem hồ sơ của bạn
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600">
          Khu vực này hiển thị thông tin tài khoản, giỏ hàng hiện tại và danh
          sách sản phẩm yêu thích.
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          avatar: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        ...formData,
        birthday: formData.birthday ? new Date(formData.birthday) : undefined,
      });
      setIsEditing(false);
      alert("Cập nhật hồ sơ thành công!");
    } catch (error) {
      alert("Lỗi cập nhật hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 border-b border-neutral-200 pb-10 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Tài khoản
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            {user.fullName}
          </h1>
          <p className="mt-2 text-neutral-600">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="border border-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-black hover:text-white"
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  fullName: user?.fullName || "",
                  phone: user?.phone || "",
                  birthday: user?.birthday ? new Date(user.birthday).toISOString().split("T")[0] : "",
                  gender: user?.gender || "",
                  address: user?.address || "",
                  avatar: user?.avatar || "",
                });
              }}
              className="border border-gray-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 hover:bg-gray-100"
            >
              Hủy
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="border border-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-black hover:text-white"
          >
            Đăng xuất
          </button>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="border border-neutral-200 p-6">
          <h2 className="font-display text-xl font-bold">Hồ sơ cá nhân</h2>
          <div className="mt-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={formData.avatar || "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=simple%20user%20avatar%20icon&image_size=square"}
                  alt="Avatar"
                  className="h-32 w-32 rounded-full object-cover border border-neutral-200"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-neutral-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full border border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full border border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) =>
                      setFormData({ ...formData, birthday: e.target.value })
                    }
                    className="w-full border border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as any })
                    }
                    className="w-full border border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-neutral-800 disabled:bg-neutral-400"
                >
                  {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Họ và tên
                  </p>
                  <p className="mt-1">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Email
                  </p>
                  <p className="mt-1">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Số điện thoại
                  </p>
                  <p className="mt-1">{user.phone || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Ngày sinh
                  </p>
                  <p className="mt-1">
                    {user.birthday
                      ? new Date(user.birthday).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Giới tính
                  </p>
                  <p className="mt-1">
                    {user.gender === "male"
                      ? "Nam"
                      : user.gender === "female"
                      ? "Nữ"
                      : user.gender === "other"
                      ? "Khác"
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Địa chỉ
                  </p>
                  <p className="mt-1">{user.address || "Chưa cập nhật"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-neutral-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Trạng thái
            </p>
            <p className="mt-3 text-2xl font-semibold">Thành viên</p>
          </div>
          <Link href="/cart" className="block border border-neutral-200 p-6 hover:border-black">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Giỏ hàng
            </p>
            <p className="mt-3 text-2xl font-semibold">{count} sản phẩm</p>
            <p className="mt-1 text-sm text-neutral-600">{formatPrice(total)}</p>
          </Link>
          <div className="border border-neutral-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Yêu thích
            </p>
            <p className="mt-3 text-2xl font-semibold">{wishlistCount} sản phẩm</p>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Giỏ hàng hiện tại</h2>
          <Link href="/cart" className="text-xs uppercase tracking-wider underline">
            Xem giỏ hàng
          </Link>
        </div>
        {items.length > 0 ? (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {items.slice(0, 4).map((item) => (
              <li
                key={`${item.product.id}-${item.size ?? "default"}`}
                className="flex gap-4 border border-neutral-200 p-4"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-24 w-20 shrink-0 object-cover"
                />
                <div>
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-neutral-600">
                    Số lượng: {item.quantity}
                    {item.size ? ` - Size: ${item.size}` : ""}
                  </p>
                  <p className="mt-1 text-sm">{formatPrice(item.product.price)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-neutral-600">Giỏ hàng của bạn đang trống.</p>
        )}
      </section>

      <section className="mt-14 border-t border-neutral-200 pt-12">
        <h2 className="font-display text-2xl font-bold">Danh sách yêu thích</h2>
        {wishlistItems.length > 0 ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistItems.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-neutral-600">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
          </p>
        )}
      </section>
    </div>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProducts } from "@/hooks/useProducts";
import { createBlankProduct, deleteProduct, saveProduct } from "@/lib/productData";
import { formatPrice } from "@/lib/products";
import { Category, Product } from "@/lib/types";

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
    <form onSubmit={handleSubmit} className="grid gap-4 border border-neutral-200 p-4 md:grid-cols-2">
      <label className="grid gap-1 text-sm">
        Tên sản phẩm
        <input
          value={draft.name}
          onChange={(event) => updateDraft({ name: event.target.value })}
          className="border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        SKU
        <input
          value={draft.sku}
          onChange={(event) => updateDraft({ sku: event.target.value })}
          className="border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        Danh mục
        <select
          value={draft.category}
          onChange={(event) => updateDraft({ category: event.target.value as Category })}
          className="border border-neutral-300 px-3 py-2"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Giá
        <input
          type="number"
          value={draft.price}
          onChange={(event) => updateDraft({ price: Number(event.target.value) })}
          className="border border-neutral-300 px-3 py-2"
          min={0}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Giá giảm
        <input
          type="number"
          value={draft.discountPrice ?? ""}
          onChange={(event) =>
            updateDraft({ discountPrice: event.target.value ? Number(event.target.value) : undefined })
          }
          className="border border-neutral-300 px-3 py-2"
          min={0}
        />
      </label>
      <label className="grid gap-1 text-sm">
        Tồn kho
        <input
          type="number"
          value={draft.stockQuantity}
          onChange={(event) => updateDraft({ stockQuantity: Number(event.target.value) })}
          className="border border-neutral-300 px-3 py-2"
          min={0}
        />
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        Ảnh
        <input
          value={draft.image ?? ""}
          onChange={(event) => updateDraft({ image: event.target.value })}
          className="border border-neutral-300 px-3 py-2"
          placeholder="/images/banner.png"
        />
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">
        Mô tả
        <textarea
          value={draft.description ?? ""}
          onChange={(event) => updateDraft({ description: event.target.value })}
          className="min-h-24 border border-neutral-300 px-3 py-2"
        />
      </label>
      <div className="flex flex-wrap gap-4 text-sm md:col-span-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) => updateDraft({ isActive: event.target.checked })}
          />
          Đang bán
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.isFeatured}
            onChange={(event) => updateDraft({ isFeatured: event.target.checked })}
          />
          Nổi bật
        </label>
      </div>
      <div className="flex gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
        <button type="button" onClick={onSaved} className="border border-neutral-300 px-5 py-2 text-sm">
          Đóng
        </button>
      </div>
    </form>
  );
}

function AdminDashboardContent() {
  const { products, loading } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive).length;
    const stock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
    const stockValue = products.reduce((sum, product) => sum + product.stockQuantity * product.price, 0);
    return { activeProducts, stock, stockValue };
  }, [products]);

  return (
    <div className="mx-auto max-w-site px-4 py-10 md:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Quản lý sản phẩm, giá, tồn kho và trạng thái hiển thị realtime.
          </p>
        </div>
        <button
          onClick={() => setEditingProduct(createBlankProduct())}
          className="bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Sản phẩm đang bán</p>
          <p className="mt-2 text-2xl font-bold">{stats.activeProducts}</p>
        </div>
        <div className="border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Tổng tồn kho</p>
          <p className="mt-2 text-2xl font-bold">{stats.stock}</p>
        </div>
        <div className="border border-neutral-200 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Giá trị tồn kho</p>
          <p className="mt-2 text-2xl font-bold">{formatPrice(stats.stockValue)}</p>
        </div>
      </div>

      {editingProduct && (
        <div className="mt-6">
          <ProductForm product={editingProduct} onSaved={() => setEditingProduct(null)} />
        </div>
      )}

      <div className="mt-8 overflow-x-auto border border-neutral-200">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Danh mục</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Tồn kho</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={6}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t border-neutral-200">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="h-14 w-10 object-cover" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{formatPrice(product.discountPrice || product.price)}</td>
                  <td className="p-3">{product.stockQuantity}</td>
                  <td className="p-3">
                    <span className={product.isActive ? "text-green-700" : "text-red-600"}>
                      {product.isActive ? "Đang bán" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditingProduct(product)} className="px-3 py-2 underline">
                      Sửa
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="px-3 py-2 text-red-600 underline">
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
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

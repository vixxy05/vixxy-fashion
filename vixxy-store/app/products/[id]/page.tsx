"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/products";
import { getProductReviews, hasUserPurchasedProduct, addProductReview, ProductReview } from "@/lib/reviews";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products } = useProducts();
  const product = products.find((p) => p.id === Number(id));
  const { isFavorite, toggle } = useWishlist();
  const { user, redirectToLogin } = useAuth();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  
  // Reviews states
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image ?? "");
      const sizes = product.sizes || ["One Size"];
      const sizeStock = product.sizeStock || {};
      const inStock = sizes.find((s: string) => {
        const stock = sizeStock[s] !== undefined ? Number(sizeStock[s]) : Math.max(0, Math.floor(Number(product.stockQuantity || 0) / sizes.length));
        return stock > 0;
      });
      setSize(inStock || sizes[0]);
      setQuantity(1);
    }
  }, [product?.id]);

  useEffect(() => {
    if (product) {
      setReviews(getProductReviews(product.id));
      if (user) {
        const isBuyer = hasUserPurchasedProduct(String(user.id), product.id) || hasUserPurchasedProduct(user.email, product.id);
        setCanReview(isBuyer);
      } else {
        setCanReview(false);
      }
    }
  }, [product?.id, user?.id]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setReviewImages((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setReviewImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  if (!product) {
    return (
      <div className="mx-auto max-w-site px-4 py-24 text-center">
        <p className="text-lg text-neutral-600">Không tìm thấy sản phẩm.</p>
        <Link href="/products" className="mt-4 inline-block font-semibold underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const handleAddReviewSubmit = (e: any) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmittingReview(true);
    const isBuyer = user ? (hasUserPurchasedProduct(String(user.id), product.id) || hasUserPurchasedProduct(user.email, product.id)) : false;
    addProductReview({
      productId: product.id,
      userId: user ? Number(user.id) : Date.now(),
      userName: user ? (user.fullName || user.username || "Khách hàng Vixxy") : "Khách hàng",
      rating: ratingInput,
      comment: commentInput.trim(),
      images: reviewImages.length > 0 ? reviewImages : undefined,
      isVerifiedBuyer: isBuyer,
    });
    setCommentInput("");
    setRatingInput(5);
    setReviewImages([]);
    setImageUrlInput("");
    setShowWriteForm(false);
    setReviews(getProductReviews(product.id));
    setSubmittingReview(false);
    alert("Cảm ơn bạn đã viết đánh giá cho sản phẩm!");
  };

  const handleToggleWishlist = () => {
    if (!user) {
      redirectToLogin();
      return;
    }
    toggle(product);
  };

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const gallery = Array.from(new Set([product.image, ...(product.images ?? [])]));
  const selectedImage = activeImage || product.image || "";
  const favorite = isFavorite(product.id);

  return (
    <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-[350/530] overflow-hidden bg-neutral-100 rounded-lg">
            <img
              src={selectedImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              style={{
                objectPosition:
                  selectedImage === product.image
                    ? product.imageObjectPosition ?? "center"
                    : "center",
                transform:
                  selectedImage === product.image && product.imageScale
                    ? `scale(${product.imageScale})`
                    : undefined,
              }}
            />
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image || "")}
                  className={`relative aspect-square overflow-hidden border-2 rounded-lg bg-neutral-100 transition-all ${
                    selectedImage === image
                      ? "border-black ring-2 ring-black/20"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                  aria-label={`Xem ảnh ${product.name}`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            {product.collection ?? product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold">{formatPrice(product.price)}</p>
          <p className="mt-6 leading-relaxed text-neutral-700">
            {product.description}
          </p>

          <div className="mt-8 grid gap-4 border-y border-neutral-200 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Chất liệu
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {product.material ?? "Chất liệu cao cấp được tuyển chọn cho từng thiết kế."}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Bảo quản
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {product.care ?? "Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp."}
              </p>
            </div>
          </div>

          {product.details && product.details.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider">
                Thông tin chi tiết
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                {product.details.map((detail) => (
                  <li key={detail} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider">
                Kích cỡ
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const sizeStock = product.sizeStock || {};
                  const stock = sizeStock[s] !== undefined ? Number(sizeStock[s]) : Math.max(0, Math.floor(Number(product.stockQuantity || 0) / product.sizes!.length));
                  const isOutOfStock = stock <= 0;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSize(s)}
                      className={`min-w-[56px] border px-4 py-2.5 text-sm transition rounded flex flex-col items-center justify-center ${
                        size === s
                          ? "border-black bg-black text-white"
                          : isOutOfStock
                          ? "border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed line-through"
                          : "border-neutral-300 hover:border-black"
                      }`}
                    >
                      <span className="font-semibold">{s}</span>
                      <span className={`text-[10px] ${size === s ? 'text-white/85' : 'text-neutral-500'} font-mono mt-0.5`}>
                        {isOutOfStock ? "Hết" : `${stock}c`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Số lượng
            </p>
            <div className="mt-3 flex items-center gap-2 border border-neutral-300 rounded w-fit">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg font-bold hover:bg-neutral-100 transition"
                aria-label="Giảm số lượng"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-lg font-bold hover:bg-neutral-100 transition"
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
            <AddToCartButton product={product} size={size} quantity={quantity} />
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`border px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition rounded ${
                favorite
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 text-black hover:border-black"
              }`}
            >
              {favorite ? "Đã yêu thích" : "Yêu thích"}
            </button>
          </div>

          {user && (
            <Link
              href="/cart"
              className="mt-4 block text-center text-xs uppercase tracking-wider underline-offset-4 hover:underline"
            >
              Xem giỏ hàng
            </Link>
          )}
        </motion.div>
      </div>

      {/* Product Reviews Section */}
      <section className="mt-20 border-t border-neutral-200 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          {/* Review stats and Write form */}
          <div>
            <h2 className="font-display text-2xl font-bold">Đánh giá sản phẩm</h2>
            
            <div className="flex items-center gap-4 mt-4">
              <span className="text-5xl font-bold tracking-tight text-black">{avgRating > 0 ? avgRating : "5.0"}</span>
              <div>
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Dựa trên {reviews.length} nhận xét thực tế</p>
              </div>
            </div>

            {/* Write Review Toggle Button */}
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <button
                type="button"
                onClick={() => setShowWriteForm(!showWriteForm)}
                className="w-full bg-black text-white text-xs py-3 font-bold uppercase tracking-wider hover:bg-neutral-800 transition rounded-lg shadow-sm"
              >
                {showWriteForm ? "Đóng form đánh giá" : "✍️ Viết đánh giá của bạn (Kèm ảnh)"}
              </button>

              {showWriteForm && (
                <form onSubmit={handleAddReviewSubmit} className="space-y-4 mt-6 bg-neutral-50 p-5 rounded-2xl border border-neutral-200 animate-fadeIn">
                  <h3 className="font-bold text-sm text-black">Viết nhận xét sản phẩm</h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-600">Chọn số sao:</span>
                    <div className="flex gap-1 text-neutral-300">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRatingInput(s)}
                          className={`focus:outline-none transition-all ${s <= ratingInput ? "text-amber-500 scale-110" : "hover:text-amber-400"}`}
                        >
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="grid gap-1 text-xs font-semibold">
                    Nội dung nhận xét
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Hãy chia sẻ cảm nhận thực tế của bạn về chất liệu, kiểu dáng, hình ảnh..."
                      className="w-full border border-neutral-300 rounded-lg p-3 text-xs min-h-24 outline-none focus:border-black bg-white"
                      required
                    />
                  </label>

                  {/* Add Images section */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-neutral-700 block">Thêm ảnh đính kèm (Tải ảnh từ máy hoặc dán URL):</span>
                    
                    <div className="flex flex-wrap gap-2">
                      <label className="border border-dashed border-neutral-400 bg-white hover:bg-neutral-100 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1">
                        📷 Chọn ảnh từ máy
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Hoặc dán URL ảnh (vd: /images/products/dress-1.jpg)..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="bg-neutral-800 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-black"
                      >
                        + Thêm URL
                      </button>
                    </div>

                    {reviewImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-neutral-200">
                        {reviewImages.map((img, idx) => (
                          <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-neutral-300 bg-white">
                            <img src={img} alt="review image" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-indigo-600 text-white text-xs py-3 font-bold uppercase tracking-wider hover:bg-indigo-700 transition rounded-lg shadow-sm"
                  >
                    {submittingReview ? "Đang gửi..." : "Gửi đánh giá ngay"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-10 text-center">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="border-b border-neutral-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-sm text-black flex items-center gap-2">
                        {rev.userName}
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-normal">
                            ✓ Đã mua hàng
                          </span>
                        )}
                      </p>
                      
                      <div className="flex text-amber-500 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-current" : "text-neutral-200 fill-current"}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 mt-3 leading-relaxed">{rev.comment}</p>

                  {/* Render review images if available */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {rev.images.map((imgUrl, imgIdx) => (
                        <img
                          key={imgIdx}
                          src={imgUrl}
                          alt="review photo"
                          onClick={() => setPreviewImageModal(imgUrl)}
                          className="w-16 h-16 object-cover rounded-lg border border-neutral-200 cursor-pointer hover:opacity-80 transition"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Review Images */}
      {previewImageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreviewImageModal(null)}>
          <div className="relative max-w-2xl w-full">
            <img src={previewImageModal} alt="Preview review photo" className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-neutral-800 hover:bg-neutral-900 px-3 py-1 rounded-full"
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-20 border-t border-neutral-200 pt-16">
          <h2 className="font-display text-2xl font-bold">Có thể bạn thích</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { reviewsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import { Review, ReviewStats, User } from "@/lib/types";

interface ProductReviewsProps {
  productId: number;
}

type ReviewWithUser = Review & { user?: User };

interface ReviewPermissions {
  canReview: boolean;
  hasPurchased: boolean;
  hasReviewed: boolean;
}

type FilterValue = "all" | "newest" | "oldest" | "5" | "4" | "3" | "hasImages";

const DEFAULT_STATS: ReviewStats = {
  averageRating: 0,
  totalReviews: 0,
  ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const DEFAULT_PERMISSIONS: ReviewPermissions = {
  canReview: false,
  hasPurchased: false,
  hasReviewed: false,
};

function StarRating({
  rating,
  max = 5,
  size = "md",
}: {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={`flex gap-0.5 ${sizeClasses[size]}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewItem({ 
  review, 
  isOwner = false, 
  onEdit, 
  onDelete 
}: { 
  review: ReviewWithUser; 
  isOwner?: boolean;
  onEdit?: (review: ReviewWithUser) => void;
  onDelete?: (review: ReviewWithUser) => void;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="border-b border-neutral-200 pb-6 last:border-0">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
          {review.user?.avatar ? (
            <img src={review.user.avatar} alt={review.user.fullName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-neutral-600 font-semibold">
              {review.user?.fullName?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-neutral-900">{review.user?.fullName || "Người dùng"}</h4>
              {review.city && (
                <span className="text-xs text-neutral-500">{review.city}</span>
              )}
              {review.hasPurchased && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Đã mua hàng</span>
              )}
              <span className="text-xs text-neutral-500">{formatDate(review.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              {isOwner && (
                <div className="flex gap-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(review)}
                      className="text-xs text-neutral-500 hover:text-neutral-700"
                    >
                      Sửa
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(review)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {review.title && (
            <h5 className="mt-2 font-medium text-neutral-900">{review.title}</h5>
          )}
          {review.comment && (
            <p className="mt-2 text-sm text-neutral-700 leading-relaxed">{review.comment}</p>
          )}
          {(review.size || review.color) && (
            <div className="mt-2 flex gap-3 flex-wrap">
              {review.size && (
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                  Size: {review.size}
                </span>
              )}
              {review.color && (
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                  Màu: {review.color}
                </span>
              )}
            </div>
          )}
          {review.images && review.images.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {review.images.map((img, idx) => (
                <div key={idx} className="h-20 w-20 rounded-lg overflow-hidden border border-neutral-200">
                  <img src={img} alt={`Đánh giá ${idx + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              onClick={async () => {
                try {
                  await reviewsAPI.like(review.id);
                } catch (error) {
                  console.error(error);
                }
              }}
              className="text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
            >
              👍
              {review.likesCount ?? 0}
            </button>
            {review.helpfulCount != null && review.helpfulCount > 0 && (
              <span className="text-xs text-neutral-500">Hữu ích: {review.helpfulCount}</span>
            )}
          </div>
          {review.reply && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h6 className="font-semibold text-sm text-neutral-900 mb-1">Phản hồi từ Vixxy Fashion</h6>
              <p className="text-sm text-neutral-700">{review.reply}</p>
              {review.repliedAt && (
                <span className="text-xs text-neutral-500 mt-2 block">
                  {formatDate(review.repliedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getQueryOptions = (filter: FilterValue) => {
  if (filter === "oldest") {
    return { sortBy: "createdAt", sortOrder: "ASC" as const };
  }

  if (filter === "5" || filter === "4" || filter === "3") {
    return { sortBy: "createdAt", sortOrder: "DESC" as const, rating: Number(filter) };
  }

  if (filter === "hasImages") {
    return { sortBy: "createdAt", sortOrder: "DESC" as const, hasImages: true };
  }

  return { sortBy: "createdAt", sortOrder: "DESC" as const };
};

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, redirectToLogin } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [stats, setStats] = useState<ReviewStats>(DEFAULT_STATS);
  const [permissions, setPermissions] = useState<ReviewPermissions>(DEFAULT_PERMISSIONS);
  const [userReview, setUserReview] = useState<ReviewWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalReviews, setModalReviews] = useState<ReviewWithUser[]>([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalFilter, setModalFilter] = useState<FilterValue>("all");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formSize, setFormSize] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formCity, setFormCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithUser | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const previewReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getByProduct(productId, {
        page: 1,
        limit: 10,
        userId: user?.id,
      });
      setReviews(response.data || []);
      setStats(response.stats || DEFAULT_STATS);
      setPermissions(response.permissions || DEFAULT_PERMISSIONS);
      setUserReview(response.userReview || null);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, user?.id]);

  const fetchModalReviews = useCallback(async (page = 1, filter: FilterValue = "all") => {
    try {
      const response = await reviewsAPI.getByProduct(productId, {
        page,
        limit: 10,
        ...getQueryOptions(filter),
        userId: user?.id,
      });
      setModalReviews(response.data || []);
      setModalPage(response.pagination?.page || page);
      setModalTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch modal reviews:", error);
    }
  }, [productId, user?.id]);

  const handleImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imageResults = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Không thể đọc ảnh"));
            reader.readAsDataURL(file);
          })
      )
    );

    setFormImages((current) => [...current, ...imageResults].slice(0, 5));
    event.target.value = "";
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditReview = (review: ReviewWithUser) => {
    setIsEditing(true);
    setEditingReview(review);
    setFormRating(review.rating);
    setFormTitle(review.title || "");
    setFormComment(review.comment || "");
    setFormImages(review.images || []);
    setFormSize(review.size || "");
    setFormColor(review.color || "");
    setFormCity(review.city || "");
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (review: ReviewWithUser) => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await reviewsAPI.delete(review.id);
      showToast("Xóa đánh giá thành công!", "success");
      await fetchReviews();
      if (showModal) {
        await fetchModalReviews(modalPage, modalFilter);
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
      showToast(error instanceof Error ? error.message : "Không thể xóa đánh giá", "error");
    }
  };

  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      const reviewData = {
        productId,
        userId: user.id,
        rating: formRating,
        title: formTitle || undefined,
        comment: formComment || undefined,
        images: formImages.length > 0 ? formImages : undefined,
        size: formSize || undefined,
        color: formColor || undefined,
        city: formCity || undefined,
      };

      if (isEditing && editingReview) {
        await reviewsAPI.update(editingReview.id, reviewData);
        showToast("Cập nhật đánh giá thành công!", "success");
      } else {
        await reviewsAPI.create(reviewData);
        showToast("Gửi đánh giá thành công!", "success");
      }

      setFormRating(5);
      setFormTitle("");
      setFormComment("");
      setFormImages([]);
      setFormSize("");
      setFormColor("");
      setFormCity("");
      setShowReviewForm(false);
      setIsEditing(false);
      setEditingReview(null);
      await fetchReviews();
      if (showModal) {
        await fetchModalReviews(1, modalFilter);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      showToast(error instanceof Error ? error.message : "Không thể gửi đánh giá", "error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();

    const handleRefresh = () => {
      void fetchReviews();
      if (showModal) {
        void fetchModalReviews(modalPage, modalFilter);
      }
    };

    const handleReviewCreated = (review: ReviewWithUser) => {
      if (review.productId === productId) {
        handleRefresh();
      }
    };

    const handleReviewUpdated = (review: ReviewWithUser) => {
      if (review.productId === productId) {
        handleRefresh();
      }
    };

    const handleReviewDeleted = (payload: { id: number; productId: number }) => {
      if (payload.productId === productId) {
        handleRefresh();
      }
    };

    socket.on("review:created", handleReviewCreated);
    socket.on("review:updated", handleReviewUpdated);
    socket.on("review:deleted", handleReviewDeleted);

    return () => {
      socket.off("review:created", handleReviewCreated);
      socket.off("review:updated", handleReviewUpdated);
      socket.off("review:deleted", handleReviewDeleted);
    };
  }, [fetchModalReviews, fetchReviews, modalFilter, modalPage, productId, showModal]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (showModal) {
      void fetchModalReviews(modalPage, modalFilter);
    }
  }, [fetchModalReviews, modalFilter, modalPage, showModal]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-bold">Đánh giá sản phẩm</h2>
        {stats.totalReviews > 0 && (
          <button
            onClick={() => {
              setModalPage(1);
              setShowModal(true);
            }}
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            Xem tất cả đánh giá
          </button>
        )}
      </div>

      {stats.totalReviews > 0 && (
        <div className="grid gap-8 md:grid-cols-2 mb-10">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-neutral-900">{stats.averageRating.toFixed(1)}/5</div>
              <StarRating rating={Math.round(stats.averageRating)} size="md" />
              <div className="text-sm text-neutral-500 mt-1">{stats.totalReviews} đánh giá</div>
            </div>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingCounts[rating] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-6 text-sm text-neutral-600">{rating}★</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-sm text-neutral-500 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-neutral-500">Đang tải đánh giá...</p>
        </div>
      ) : previewReviews.length > 0 ? (
        <div className="space-y-6">
          {previewReviews.map((review) => (
            <ReviewItem 
              key={review.id} 
              review={review} 
              isOwner={user?.id === review.userId}
              onEdit={user?.id === review.userId ? handleEditReview : undefined}
              onDelete={user?.id === review.userId ? handleDeleteReview : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-neutral-500">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        </div>
      )}

      {user ? (
        userReview ? (
          <div className="mt-10 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
            <h3 className="font-semibold mb-2">Đánh giá của bạn</h3>
            <ReviewItem 
              review={userReview} 
              isOwner={true}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          </div>
        ) : permissions.canReview ? (
          <div className="mt-10 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
            {!showReviewForm ? (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition"
              >
                Viết đánh giá
              </button>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{isEditing ? "Sửa đánh giá" : "Viết đánh giá"}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setIsEditing(false);
                      setEditingReview(null);
                    }}
                    className="text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    Đóng
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Đánh giá</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormRating(rating)}
                        className={`text-2xl transition hover:scale-110 ${
                          rating <= formRating ? "text-yellow-400" : "text-neutral-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Tiêu đề cho đánh giá của bạn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Nội dung đánh giá</label>
                  <textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Size</label>
                    <input
                      type="text"
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="VD: S, M, L"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Màu sắc</label>
                    <input
                      type="text"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="VD: Đen, Trắng, Xanh dương"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Thành phố</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="VD: Hà Nội, TP. Hồ Chí Minh"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Ảnh đánh giá</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="block w-full text-sm text-neutral-600"
                  />
                  {formImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formImages.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
                          <img src={image} alt={`Ảnh đánh giá ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                            className="absolute right-1 top-1 rounded-full bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Đang gửi..." : isEditing ? "Cập nhật" : "Gửi đánh giá"}
                </button>
              </form>
            )}
          </div>
        ) : permissions.hasPurchased ? null : (
          <div className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-neutral-600">Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này.</p>
          </div>
        )
      ) : (
        <div className="mt-10 p-6 bg-neutral-50 rounded-lg border border-neutral-200 text-center">
          <p className="text-neutral-600 mb-4">Đăng nhập để để lại đánh giá</p>
          <button
            onClick={redirectToLogin}
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition"
          >
            Đăng nhập
          </button>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 16, scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tất cả đánh giá</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-semibold hover:bg-neutral-200 transition"
                >
                  Đóng
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "newest", label: "Mới nhất" },
                    { value: "oldest", label: "Cũ nhất" },
                    { value: "5", label: "5 sao" },
                    { value: "4", label: "4 sao" },
                    { value: "3", label: "3 sao" },
                    { value: "hasImages", label: "Có ảnh" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setModalFilter(item.value as FilterValue);
                        setModalPage(1);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        modalFilter === item.value
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                        {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {modalReviews.length > 0 ? (
                  modalReviews.map((review) => (
                    <ReviewItem 
                      key={review.id} 
                      review={review} 
                      isOwner={user?.id === review.userId}
                      onEdit={user?.id === review.userId ? handleEditReview : undefined}
                      onDelete={user?.id === review.userId ? handleDeleteReview : undefined}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-neutral-500">Không có đánh giá phù hợp với bộ lọc hiện tại.</p>
                )}
              </div>

              {modalTotalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-4">
                  <button
                    onClick={() => setModalPage((current) => Math.max(1, current - 1))}
                    disabled={modalPage === 1}
                    className="px-4 py-2 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50 transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <p className="text-sm text-neutral-500">
                    Trang {modalPage}/{modalTotalPages}
                  </p>
                  <button
                    onClick={() => setModalPage((current) => Math.min(modalTotalPages, current + 1))}
                    disabled={modalPage === modalTotalPages}
                    className="px-4 py-2 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50 transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-[100] px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

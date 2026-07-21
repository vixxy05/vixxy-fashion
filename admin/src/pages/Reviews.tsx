import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, EyeOff, Search, Star, Trash2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { API_BASE, SOCKET_URL } from '../config/env';

type ReviewStatus = 'pending' | 'approved' | 'hidden';

interface ReviewRecord {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment?: string;
  images?: string[];
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  product?: {
    id: number;
    name: string;
    sku?: string;
  };
}

const TOKEN_KEY = 'admin_access_token';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE}/reviews/admin/all`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách đánh giá');
      }

      setReviews(data.data || []);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const refresh = () => {
      void fetchReviews();
    };

    socket.on('review:created', refresh);
    socket.on('review:updated', refresh);
    socket.on('review:deleted', refresh);

    return () => {
      socket.off('review:created', refresh);
      socket.off('review:updated', refresh);
      socket.off('review:deleted', refresh);
      socket.disconnect();
    };
  }, [fetchReviews]);

  const updateStatus = async (reviewId: number, status: ReviewStatus) => {
    try {
      setBusyId(reviewId);
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE}/reviews/admin/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật trạng thái đánh giá');
      }

      setReviews((current) =>
        current.map((review) => (review.id === reviewId ? data.data : review))
      );
    } catch (error) {
      console.error('Update review status error:', error);
    } finally {
      setBusyId(null);
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      setBusyId(reviewId);
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa đánh giá');
      }

      setReviews((current) => current.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error('Delete review error:', error);
    } finally {
      setBusyId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchStatus = statusFilter === 'all' || review.status === statusFilter;
      const haystack = [
        review.user?.fullName,
        review.product?.name,
        review.comment,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchStatus && (!keyword || haystack.includes(keyword));
    });
  }, [reviews, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      approved: reviews.filter((review) => review.status === 'approved').length,
      hidden: reviews.filter((review) => review.status === 'hidden').length,
      pending: reviews.filter((review) => review.status === 'pending').length,
    };
  }, [reviews]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));

  const getStatusClassName = (status: ReviewStatus) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'hidden') return 'bg-gray-100 text-gray-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Duyệt, ẩn hoặc xóa đánh giá sản phẩm từ khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo khách hàng, sản phẩm..."
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | ReviewStatus)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-white"
          >
            <option value="all">Tất cả</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tổng đánh giá</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Đã duyệt</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Chờ duyệt</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Đã ẩn</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.hidden}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Đánh giá</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Nội dung</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Đang tải đánh giá...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Không có đánh giá phù hợp.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="border-b border-gray-100 align-top dark:border-gray-700">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-white">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={review.user.fullName} className="h-full w-full object-cover" />
                          ) : (
                            review.user?.fullName?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{review.user?.fullName || `User #${review.userId}`}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {review.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium text-gray-900 dark:text-white">{review.product?.name || `Product #${review.productId}`}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{review.product?.sku || `ID: ${review.productId}`}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <p className="line-clamp-3">{review.comment || 'Không có nội dung.'}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.images.slice(0, 3).map((image, index) => (
                            <img key={`${review.id}-${index}`} src={image} alt={`Review ${review.id} image ${index + 1}`} className="h-12 w-12 rounded-md object-cover" />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClassName(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={busyId === review.id || review.status === 'approved'}
                          onClick={() => void updateStatus(review.id, 'approved')}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-900/20"
                          title="Duyệt"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === review.id || review.status === 'hidden'}
                          onClick={() => void updateStatus(review.id, 'hidden')}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-yellow-50 hover:text-yellow-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-yellow-900/20"
                          title="Ẩn"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === review.id}
                          onClick={() => void deleteReview(review.id)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;

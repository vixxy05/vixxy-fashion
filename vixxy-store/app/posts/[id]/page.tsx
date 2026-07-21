
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { postsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PostDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [stats, setStats] = useState<any>({ likes: 0, comments: 0, shares: 0, views: 0 });
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);

  const fetchData = async () => {
    try {
      const [postData, statsData, commentsData] = await Promise.all([
        postsAPI.getById(params.id as string),
        postsAPI.getStats(params.id as string),
        postsAPI.getComments(params.id as string),
      ]);
      setPost(postData as any);
      setStats(statsData as any);
      setComments((commentsData as any[]) || []);
    } catch (error) {
      console.error('Failed to fetch post data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Increment view count
    postsAPI.incrementView(params.id as string, user?.id);
  }, [params.id, user?.id]);

  const handleLike = async () => {
    if (!user) return;
    try {
      if (liked) {
        await postsAPI.unlike(params.id as string, user.id);
        setStats((prev: any) => ({ ...prev, likes: prev.likes - 1 }));
      } else {
        await postsAPI.like(params.id as string, user.id);
        setStats((prev: any) => ({ ...prev, likes: prev.likes + 1 }));
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to like/unlike:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    try {
      await postsAPI.addComment(params.id as string, user.id, commentText);
      setCommentText('');
      fetchData();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleShare = async (platform: string) => {
    try {
      await postsAPI.share(params.id as string, user?.id, platform);
      setStats((prev: any) => ({ ...prev, shares: prev.shares + 1 }));
      
      const url = window.location.href;
      if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        alert('Đã sao chép liên kết!');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          {post.coverImage && (
            <div className="aspect-video rounded-lg overflow-hidden mb-8">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 mb-8">
            <span>
              {post.author?.fullName || 'Admin'}
            </span>
            <span>•</span>
            <span>
              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="prose prose-lg max-w-none mb-8">
            <p>{post.content}</p>
          </div>
          {post.product && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Sản phẩm liên quan</h3>
              <Link 
                href={`/products/${post.product.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                {post.product.image && (
                  <img 
                    src={post.product.image} 
                    alt={post.product.name} 
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-semibold">{post.product.name}</h4>
                  <p className="text-blue-600 font-medium">Xem sản phẩm →</p>
                </div>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-6 border-t border-b border-gray-200 py-4 mb-8">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors`}
            >
              <span className="text-2xl">{liked ? '❤️' : '🤍'}</span>
              <span>{stats.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-2xl">💬</span>
              <span>{stats.comments}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-2xl">👁️</span>
              <span>{stats.views}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-gray-600 mr-2">Chia sẻ:</span>
              <button onClick={() => handleShare('copy')} className="text-gray-600 hover:text-blue-500">📋</button>
              <button onClick={() => handleShare('facebook')} className="text-gray-600 hover:text-blue-600">📘</button>
              <button onClick={() => handleShare('twitter')} className="text-gray-600 hover:text-blue-400">🐦</button>
            </div>
          </div>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-6">Bình luận</h3>
            {user && (
              <form onSubmit={handleComment} className="mb-8">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Gửi bình luận
                  </button>
                </div>
              </form>
            )}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold">{comment.user?.fullName || 'User'}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuthStore } from "@/stores/authStore";
import { getDashboardPath } from "@/lib/routes";
import { motion } from "framer-motion";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const redirectAfterLogin = useAuthStore((state) => state.redirectAfterLogin);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State để quản lý hiện/ẩn mật khẩu

  // Handle redirect param
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      sessionStorage.setItem('vixxy_intended_path', redirect);
    }
  }, [searchParams]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      const intendedPath = sessionStorage.getItem('vixxy_intended_path');
      if (intendedPath) {
        sessionStorage.removeItem('vixxy_intended_path');
        window.location.href = intendedPath;
      } else if (user.role?.roleName) {
        window.location.href = getDashboardPath(user.role.roleName as any);
      }
    }
  }, [user, loading]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("login_email") ?? "");
    const password = String(fd.get("login_password") ?? "");
    const ok = await login(email, password);
    setIsSubmitting(false);
    if (!ok) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }
    redirectAfterLogin();
  };

  // If loading, don't render anything yet
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is already logged in, don't render login form
  if (user) {
    return null;
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục."
      footer={
        <div className="text-center">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-black dark:text-white underline hover:opacity-80 transition-opacity">
            Đăng ký ngay
          </Link>
        </div>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">👤 Tài khoản khách hàng</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Tên:</span> Vixxy Nguyễn
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Email:</span> user@vixxy.com
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Mật khẩu:</span> user123
          </p>
        </div>

        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">🔑 Tài khoản Admin</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Tên:</span> Quản trị viên
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Email:</span> admin@vixxy.com
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">Mật khẩu:</span> admin123
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6" data-form-type="other">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
          >
            Email
          </label>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
            <input
              id="email"
              name="login_email"
              type="email"
              required
              autoComplete="off"
              data-form-type="other"
              placeholder="Nhập email của bạn"
              className="w-full rounded-xl border border-neutral-200 bg-white px-12 py-4 text-sm text-neutral-900 outline-none transition-all focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-800"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
            >
              Mật khẩu
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            <input
              id="password"
              name="login_password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              data-form-type="other"
              placeholder="Nhập mật khẩu"
              className="w-full rounded-xl border border-neutral-200 bg-white pl-12 pr-12 py-4 text-sm text-neutral-900 outline-none transition-all focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12S3.336 17 12 17s10.066-5 10.066-5A10.477 10.477 0 0020.02 8.223m-3.899 3.899a3 3 0 01-4.242 4.242M12 8.25l3.75 3.75"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.964 7.17.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.17z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-neutral-300 bg-white transition-all checked:border-neutral-900 checked:bg-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:checked:border-white dark:checked:bg-white"
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 dark:text-neutral-950"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm text-neutral-600 dark:text-neutral-400 select-none">Nhớ đăng nhập</span>
          </label>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-neutral-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </div>
          ) : (
            "Đăng nhập"
          )}
        </motion.button>
      </form>
    </AuthLayout>
  );
}

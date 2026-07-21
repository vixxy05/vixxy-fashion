'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePathname } from 'next/navigation';
import { getDashboardPath, type UserRole } from '@/lib/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const redirectToLogin = useAuthStore((state) => state.redirectToLogin);
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      redirectToLogin(pathname);
    }
  }, [user, loading, pathname, redirectToLogin]);

  useEffect(() => {
    if (!loading && user && allowedRoles) {
      const userRole = (user.role?.roleName || (user.roleId === 2 ? 'ADMIN' : 'CUSTOMER')) as UserRole;
      if (!allowedRoles.includes(userRole)) {
        const dashboardPath = getDashboardPath(userRole);
        window.location.href = dashboardPath;
      }
    }
  }, [user, loading, allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        <div className="text-sm font-semibold tracking-wider uppercase">Đang xác thực quyền...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}


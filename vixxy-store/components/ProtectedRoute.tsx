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
      const userRole = user.role?.roleName as UserRole;
      if (!allowedRoles.includes(userRole)) {
        // Redirect to user's dashboard
        const dashboardPath = getDashboardPath(userRole);
        window.location.href = dashboardPath;
      }
    }
  }, [user, loading, allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}


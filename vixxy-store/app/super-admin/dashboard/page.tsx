'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

export default function SuperAdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <div className="mx-auto max-w-site px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="mt-4 text-neutral-600">Welcome to your super admin dashboard!</p>
      </div>
    </ProtectedRoute>
  );
}

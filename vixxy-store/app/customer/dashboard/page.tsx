'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <div className="mx-auto max-w-site px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Customer Dashboard</h1>
        <p className="mt-4 text-neutral-600">Welcome to your customer dashboard!</p>
      </div>
    </ProtectedRoute>
  );
}

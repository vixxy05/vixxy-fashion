export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'CUSTOMER':
      return '/'; // Redirect customer to homepage instead of dashboard
    case 'ADMIN':
      return '/admin/dashboard';
    case 'STAFF':
      return '/staff/dashboard';
    case 'SUPER_ADMIN':
      return '/super-admin/dashboard';
    default:
      return '/';
  }
}

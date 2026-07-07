export type UserRole = 'CUSTOMER' | 'ADMIN';

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'CUSTOMER':
      return '/'; // Redirect customer to homepage instead of dashboard
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

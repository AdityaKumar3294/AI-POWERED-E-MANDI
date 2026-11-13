import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import type { UserRole } from '@/types';

interface RequireRoleProps {
  role: UserRole;
  children?: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { isAuthenticated, isRestoring, user } = useAuthStore();
  const location = useLocation();

  if (isRestoring) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (user.role !== role && user.role !== 'admin') {
    // Redirect wrong-role users to their own home dashboard
    if (user.role === 'farmer') {
      return <Navigate to="/farmer/dashboard" replace />;
    } else if (user.role === 'buyer') {
      return <Navigate to="/buyer/marketplace" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}


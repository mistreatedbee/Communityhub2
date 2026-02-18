import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import type { UserRole } from '../../types';

export function RequireTenantRole({
  children,
  roles,
  allowPending = false
}: {
  children: React.ReactNode;
  roles: UserRole[];
  allowPending?: boolean;
}) {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const location = useLocation();
  const { loading, platformRole } = useAuth();
  const { membership, loading: tenantLoading } = useTenant();

  if (loading || tenantLoading) return null;
  if (platformRole === 'SUPER_ADMIN') return <>{children}</>;

  const tenantRole = membership?.role ?? null;
  const tenantRoleLegacy: Record<string, UserRole> = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MODERATOR: 'supervisor',
    MEMBER: 'member'
  };

  const roleInList = tenantRole != null && roles.includes(tenantRoleLegacy[tenantRole] as UserRole);
  const isPending = membership?.status === 'PENDING';
  const isActive = membership?.status === 'ACTIVE';

  // PENDING members: redirect to pending page when this route does not allow PENDING (e.g. member app)
  if (!allowPending && isPending && roleInList && tenantSlug) {
    return <Navigate to={`/c/${tenantSlug}/pending`} replace />;
  }

  const statusAllowed = isActive || (allowPending && isPending);
  if (!tenantRole || !statusAllowed || !roleInList) {
    // Check if this is a member route (app) or admin route
    const isMemberRoute = location.pathname.includes('/app');
    
    if (tenantSlug && isMemberRoute) {
      // Member routes: redirect to join page
      return <Navigate to={`/c/${tenantSlug}/join`} replace />;
    } else if (tenantSlug) {
      // Admin routes: redirect to login
      return <Navigate to={{ pathname: '/login', state: { from: `/c/${tenantSlug}/admin` } }} replace />;
    } else {
      // Fallback: redirect to login
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

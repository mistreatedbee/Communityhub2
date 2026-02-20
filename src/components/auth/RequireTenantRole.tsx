import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import type { UserRole } from '../../types';
import { normalizeMembershipRole, normalizeMembershipStatus } from '../../utils/membershipRouting';
import { Spinner } from '../ui/Spinner';

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

  if (loading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (platformRole === 'SUPER_ADMIN') return <>{children}</>;

  const tenantRole = membership?.role ? normalizeMembershipRole(membership.role) : null;
  const tenantStatus = membership?.status ? normalizeMembershipStatus(membership.status) : null;
  const tenantRoleLegacy: Record<string, UserRole> = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MODERATOR: 'supervisor',
    MEMBER: 'member'
  };

  const roleInList = tenantRole != null && roles.includes(tenantRoleLegacy[tenantRole] as UserRole);
  const isPending = tenantStatus === 'PENDING';
  const isActive = tenantStatus === 'ACTIVE';

  // PENDING members: redirect to pending page when this route does not allow PENDING (e.g. member app)
  if (!allowPending && isPending && roleInList && tenantSlug) {
    if (import.meta.env.DEV) {
      console.debug('[RequireTenantRole] redirecting pending member', { tenantSlug, target: `/c/${tenantSlug}/pending` });
    }
    return <Navigate to={`/c/${tenantSlug}/pending`} replace />;
  }

  const statusAllowed = isActive || (allowPending && isPending);
  if (!tenantRole || !statusAllowed || !roleInList) {
    const isMemberRoute = location.pathname.includes('/app');

    if (tenantSlug && tenantRole && (tenantStatus === 'ACTIVE' || tenantStatus === 'PENDING')) {
      if (tenantStatus === 'PENDING') {
        if (import.meta.env.DEV) {
          console.debug('[RequireTenantRole] redirecting pending access', { tenantSlug, target: `/c/${tenantSlug}/pending` });
        }
        return <Navigate to={`/c/${tenantSlug}/pending`} replace />;
      }
      if (tenantRole === 'OWNER' || tenantRole === 'ADMIN' || tenantRole === 'MODERATOR') {
        if (import.meta.env.DEV) {
          console.debug('[RequireTenantRole] redirecting admin-capable user', { tenantSlug, target: `/c/${tenantSlug}/admin` });
        }
        return <Navigate to={`/c/${tenantSlug}/admin`} replace />;
      }
      if (import.meta.env.DEV) {
        console.debug('[RequireTenantRole] redirecting member user', { tenantSlug, target: `/c/${tenantSlug}/app` });
      }
      return <Navigate to={`/c/${tenantSlug}/app`} replace />;
    }

    if (tenantSlug && isMemberRoute) {
      if (import.meta.env.DEV) {
        console.debug('[RequireTenantRole] unauthenticated member route redirect', { tenantSlug, target: `/c/${tenantSlug}/join` });
      }
      return <Navigate to={`/c/${tenantSlug}/join`} replace />;
    }
    if (tenantSlug) {
      if (import.meta.env.DEV) {
        console.debug('[RequireTenantRole] redirecting to login for admin route', { tenantSlug, target: '/login' });
      }
      return <Navigate to={{ pathname: '/login', state: { from: `/c/${tenantSlug}/admin` } }} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

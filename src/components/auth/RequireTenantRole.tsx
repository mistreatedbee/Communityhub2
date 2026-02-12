import React from 'react';
import { Navigate } from 'react-router-dom';
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

  const statusAllowed = membership?.status === 'ACTIVE' || (allowPending && membership?.status === 'PENDING');
  if (!tenantRole || !statusAllowed || !roles.includes(tenantRoleLegacy[tenantRole] as UserRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

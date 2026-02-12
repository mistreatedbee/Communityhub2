import React from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export function RequireRole({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { role, loading, organizationId } = useAuth();

  if (loading) return null;
  if (!role || !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'super_admin' && !organizationId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

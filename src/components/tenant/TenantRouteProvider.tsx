import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { TenantProvider } from '../../contexts/TenantContext';

export function TenantRouteProvider() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  if (!tenantSlug) {
    return <Navigate to="/communities" replace />;
  }
  return (
    <TenantProvider tenantSlug={tenantSlug}>
      <Outlet />
    </TenantProvider>
  );
}

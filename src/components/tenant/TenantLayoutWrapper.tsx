import React from 'react';
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout';
import { useTenant } from '../../contexts/TenantContext';
import { Spinner } from '../ui/Spinner';

export function TenantLayoutWrapper({ variant }: { variant: 'tenant-admin' | 'tenant-member' }) {
  const { tenant, membership, loading } = useTenant();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (variant === 'tenant-member' && membership?.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Pending approval</h1>
          <p className="text-sm text-gray-600">
            Your registration for {tenant?.name || 'this community'} is waiting for admin approval.
          </p>
        </div>
      </div>
    );
  }
  return (
    <AuthenticatedLayout
      variant={variant}
      tenantSlug={tenant?.slug}
      tenantName={tenant?.name}
      tenantId={tenant?.id}
    />
  );
}

import React from 'react';
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout';
import { useTenant } from '../../contexts/TenantContext';
import { Spinner } from '../ui/Spinner';

export function TenantLayoutWrapper({ variant }: { variant: 'tenant-admin' | 'tenant-member' }) {
  const { tenant, loading, enabledSections, settings } = useTenant();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <AuthenticatedLayout
      variant={variant}
      tenantSlug={tenant?.slug}
      tenantName={tenant?.name}
      tenantId={tenant?.id}
      enabledSections={enabledSections}
      membersCanShareInviteLinks={settings?.members_can_share_invite_links ?? false}
    />
  );
}

import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';

type DashboardStats = {
  members: number;
  announcements: number;
  posts: number;
  groups: number;
  events: number;
  programs: number;
  resources: number;
};

export function TenantAdminAnalyticsPage() {
  const { tenant } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setStats(await tenantFeaturesGet<DashboardStats>(tenant.id, '/dashboard'));
    };
    void load();
  }, [tenant?.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <pre className="text-sm text-gray-700 overflow-x-auto">{JSON.stringify(stats || {}, null, 2)}</pre>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Building2, DollarSign } from 'lucide-react';
import { StatsCard } from '../../components/widgets/StatsCard';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { apiClient } from '../../lib/apiClient';

type Overview = { users: number; tenants: number; activeLicenses: number };
type License = { status: string };

export function SystemAnalyticsPage() {
  const [overview, setOverview] = useState<Overview>({ users: 0, tenants: 0, activeLicenses: 0 });
  const [licenses, setLicenses] = useState<License[]>([]);

  useEffect(() => {
    const load = async () => {
      const [ov, l] = await Promise.all([
        apiClient<Overview>('/api/admin/overview'),
        apiClient<License[]>('/api/licenses')
      ]);
      setOverview(ov);
      setLicenses(l);
    };
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-500">Platform metrics snapshot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Revenue" value="N/A" icon={DollarSign} color="green" />
        <StatsCard label="Active Licenses" value={String(overview.activeLicenses)} icon={TrendingUp} color="blue" />
        <StatsCard label="Tenants" value={String(overview.tenants)} icon={Building2} color="purple" />
        <StatsCard label="Users" value={String(overview.users)} icon={Users} color="orange" />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900">License Status Breakdown</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Total licenses: {licenses.length}</p>
        </CardContent>
      </Card>
    </div>
  );
}

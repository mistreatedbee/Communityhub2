import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, CreditCard, Activity } from 'lucide-react';
import { StatsCard } from '../../components/widgets/StatsCard';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { apiClient } from '../../lib/apiClient';

type Overview = {
  users: number;
  tenants: number;
  activeLicenses: number;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    createdAt: string;
    tenantId: string | null;
  }>;
};

export function SuperAdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient<Overview>('/api/admin/overview');
        setOverview(data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-500">Super admin dashboard.</p>
        </div>
        <Link to="/super-admin/tenants">
          <Button>Manage Tenants</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Users" value={String(overview?.users || 0)} icon={Users} color="blue" />
        <StatsCard label="Tenants" value={String(overview?.tenants || 0)} icon={Building2} color="purple" />
        <StatsCard label="Active Licenses" value={String(overview?.activeLicenses || 0)} icon={CreditCard} color="green" />
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <Link to="/super-admin/audit-logs">
            <Button variant="ghost" size="sm" leftIcon={<Activity className="w-4 h-4" />}>
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!overview?.recentAuditLogs?.length ? (
            <p className="text-sm text-gray-500">No audit logs yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {overview.recentAuditLogs.map((item) => (
                <li key={item.id} className="text-gray-700">
                  <span className="font-medium">{item.action}</span> � {new Date(item.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

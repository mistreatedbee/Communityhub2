import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { Loader2, Users, Megaphone, FileText, Calendar, FolderOpen, BookOpen, Layers } from 'lucide-react';

type DashboardStats = {
  members: number;
  announcements: number;
  posts: number;
  groups: number;
  events: number;
  programs: number;
  resources: number;
};

const metricConfig: { key: keyof DashboardStats; label: string; icon: React.ElementType }[] = [
  { key: 'members', label: 'Members', icon: Users },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'groups', label: 'Groups', icon: Users },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'programs', label: 'Programs', icon: BookOpen },
  { key: 'resources', label: 'Files', icon: FolderOpen }
];

export function TenantAdminAnalyticsPage() {
  const { tenant } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await tenantFeaturesGet<DashboardStats>(tenant.id, '/dashboard');
        setStats(data ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load analytics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenant?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const data = stats || ({} as DashboardStats);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="text-sm text-gray-600">Tenant-scoped metrics for your community.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metricConfig.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Number(data[key]) ?? 0}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

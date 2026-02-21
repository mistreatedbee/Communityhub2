import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import {
  Users,
  Megaphone,
  FileText,
  Calendar,
  FolderOpen,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

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
  { key: 'resources', label: 'Files', icon: FolderOpen },
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

  return (
    <>
      {/* Animated background – subtle for admin area */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="space-y-6 relative">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Tenant‑scoped metrics for your community.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Metrics grid */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {metricConfig.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Number(stats[key]) ?? 0}
                    </p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

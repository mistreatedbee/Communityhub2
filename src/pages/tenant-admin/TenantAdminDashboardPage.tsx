import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Megaphone,
  FileText,
  Calendar,
  FolderOpen,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type DashboardStats = {
  members: number;
  pendingRegistrations: number;
  announcements: number;
  posts: number;
  events: number;
  resources: number;
  latestPosts: Array<{ _id: string; title: string; publishedAt?: string }>;
  upcomingEvents: Array<{ _id: string; title: string; startsAt: string }>;
  recentSignups: Array<{
    id: string;
    joinedAt: string;
    status: string;
    user: { fullName?: string; email?: string } | null;
  }>;
};

export function TenantAdminDashboardPage() {
  const { tenant } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      try {
        const data = await tenantFeaturesGet<DashboardStats>(tenant.id, '/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenant?.id]);

  const metricConfig = [
    { key: 'members', label: 'Total members', icon: Users, value: stats?.members || 0 },
    { key: 'pending', label: 'Pending registrations', icon: UserPlus, value: stats?.pendingRegistrations || 0 },
    { key: 'announcements', label: 'Announcements', icon: Megaphone, value: stats?.announcements || 0 },
    { key: 'posts', label: 'Posts', icon: FileText, value: stats?.posts || 0 },
    { key: 'events', label: 'Upcoming events', icon: Calendar, value: stats?.events || 0 },
    { key: 'resources', label: 'Files', icon: FolderOpen, value: stats?.resources || 0 },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Animated background */}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview for <span className="font-medium">{tenant?.name}</span>.
            </p>
          </div>
          {tenant?.slug && (
            <Link to={`/c/${tenant.slug}`}>
              <Button variant="outline" className="gap-2">
                View Member Landing Page
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics grid */}
        {!loading && stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metricConfig.map(({ key, label, icon: Icon, value }) => (
                <div
                  key={key}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{value}</p>
                      <p className="text-sm text-gray-500">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Latest posts */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Latest posts</h2>
                {stats.latestPosts?.length ? (
                  <ul className="space-y-3">
                    {stats.latestPosts.map((post) => (
                      <li key={post._id} className="text-sm">
                        <p className="font-medium text-gray-900">{post.title}</p>
                        {post.publishedAt && (
                          <p className="text-xs text-gray-400">{formatDate(post.publishedAt)}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No posts yet.</p>
                )}
              </div>

              {/* Upcoming events */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Upcoming events</h2>
                {stats.upcomingEvents?.length ? (
                  <ul className="space-y-3">
                    {stats.upcomingEvents.map((event) => (
                      <li key={event._id} className="text-sm">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(event.startsAt)}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No upcoming events.</p>
                )}
              </div>

              {/* Recent signups */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent signups</h2>
                {stats.recentSignups?.length ? (
                  <ul className="space-y-3">
                    {stats.recentSignups.map((signup) => (
                      <li key={signup.id} className="text-sm">
                        <div className="flex items-start gap-2">
                          {getStatusIcon(signup.status)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {signup.user?.fullName || signup.user?.email || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {signup.status} • {formatDate(signup.joinedAt)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No recent signups.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

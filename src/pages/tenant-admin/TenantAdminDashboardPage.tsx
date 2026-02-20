import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  recentSignups: Array<{ id: string; joinedAt: string; status: string; user: { fullName?: string; email?: string } | null }>;
};

export function TenantAdminDashboardPage() {
  const { tenant } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      const data = await tenantFeaturesGet<DashboardStats>(tenant.id, '/dashboard');
      setStats(data);
    };
    void load();
  }, [tenant?.id]);

  if (!tenant) return <p className="text-sm text-gray-500">Tenant not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-500">Overview for {tenant.name}.</p>
        {tenant.slug ? (
          <div className="mt-3">
            <Link to={`/c/${tenant.slug}/app`}>
              <Button variant="outline">View Member Landing Page</Button>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ['Total members', stats?.members || 0],
          ['Pending registrations', stats?.pendingRegistrations || 0],
          ['Announcements', stats?.announcements || 0],
          ['Posts', stats?.posts || 0],
          ['Upcoming events', stats?.events || 0],
          ['Resources', stats?.resources || 0]
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="text-sm text-gray-500">{String(label)}</CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{Number(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-sm text-gray-500">Latest posts</CardHeader>
          <CardContent className="space-y-2">
            {(stats?.latestPosts || []).map((post) => (
              <p key={post._id} className="text-sm text-gray-700">{post.title}</p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-gray-500">Upcoming events</CardHeader>
          <CardContent className="space-y-2">
            {(stats?.upcomingEvents || []).map((event) => (
              <p key={event._id} className="text-sm text-gray-700">
                {event.title} - {new Date(event.startsAt).toLocaleString()}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-gray-500">Recent signups</CardHeader>
          <CardContent className="space-y-2">
            {(stats?.recentSignups || []).map((signup) => (
              <p key={signup.id} className="text-sm text-gray-700">
                {signup.user?.fullName || signup.user?.email || 'Unknown'} - {signup.status}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Megaphone, Search } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { SafeImage } from '../../components/ui/SafeImage';
import { TenantMemberFeedPage } from '../tenant-member/TenantMemberFeedPage';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  location?: string;
  logoUrl?: string;
};

type PublicPreview = {
  tenant: TenantRow;
  upcomingEvents: Array<{
    _id: string;
    title: string;
    startsAt: string;
    location?: string;
    isOnline?: boolean;
    meetingLink?: string;
  }>;
  recentAnnouncements: Array<{
    _id: string;
    title: string;
    content: string;
    isPinned?: boolean;
  }>;
};

export function TenantPublicPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { user } = useAuth();
  const { membership, enabledSections } = useTenant();
  const [preview, setPreview] = useState<PublicPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tenantSlug) return;
      try {
        const data = await apiClient<PublicPreview>(`/api/tenants/${tenantSlug}/public-preview`);
        setPreview(data);
      } catch {
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenantSlug]);

  const hasFullCommunityAccess = useMemo(() => {
    if (!membership) return false;
    if (membership.status !== 'ACTIVE') return false;
    return ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER'].includes(membership.role);
  }, [membership]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!preview?.tenant) {
    return (
      <div className="py-20">
        <EmptyState icon={Search} title="Community not found" description="This community might be inactive or unavailable." />
      </div>
    );
  }

  const tenant = preview.tenant;

  if (hasFullCommunityAccess) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold overflow-hidden shrink-0">
              {tenant.logoUrl ? (
                <SafeImage src={tenant.logoUrl} alt={tenant.name} fallbackSrc="/logo.png" className="w-full h-full object-cover" />
              ) : tenant.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">{tenant.name}</h1>
              <p className="text-sm text-gray-500">Community Home</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {enabledSections?.includes('events') && (
              <Link to={`/c/${tenant.slug}/events`} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Events</Link>
            )}
            {enabledSections?.includes('groups') && (
              <Link to={`/c/${tenant.slug}/groups`} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Groups</Link>
            )}
            {enabledSections?.includes('resources') && (
              <Link to={`/c/${tenant.slug}/resources`} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Resources</Link>
            )}
            {enabledSections?.includes('programs') && (
              <Link to={`/c/${tenant.slug}/programs`} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Programs</Link>
            )}
            {enabledSections?.includes('announcements') && (
              <Link to={`/c/${tenant.slug}/announcements`} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Announcements</Link>
            )}
            <Link to={`/c/${tenant.slug}/profile`} className="px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90">Profile</Link>
          </div>
        </div>

        <TenantMemberFeedPage />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold overflow-hidden">
            {tenant.logoUrl ? (
              <SafeImage src={tenant.logoUrl} alt={tenant.name} fallbackSrc="/logo.png" className="w-full h-full object-cover" />
            ) : tenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-sm text-gray-500">{tenant.category ?? 'Community'} | {tenant.location ?? 'Global'}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          {tenant.description?.trim() || 'Public community profile. Join to participate and access the full community landing page.'}
        </p>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <Link
              to={`/c/${tenant.slug}/join`}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
            >
              Join community
            </Link>
          ) : (
            <>
              <Link
                to={`/c/${tenant.slug}/join`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
              >
                Join community
              </Link>
              <Link
                to="/login"
                state={{ from: `/c/${tenant.slug}` }}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Log in
              </Link>
            </>
          )}
          <Link to="/communities" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Back to directory
          </Link>
        </div>
      </div>

      {preview.upcomingEvents.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming events
          </h2>
          <ul className="space-y-3">
            {preview.upcomingEvents.map((e) => (
              <li key={e._id} className="flex justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{e.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(e.startsAt).toLocaleString()}
                    {e.location ? ` | ${e.location}` : ''}
                    {e.isOnline && e.meetingLink ? ' | Online' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {preview.recentAnnouncements.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Recent announcements
          </h2>
          <ul className="space-y-3">
            {preview.recentAnnouncements.map((a) => (
              <li key={a._id} className="py-2 border-b border-gray-100 last:border-0">
                <p className="font-medium text-gray-900">{a.title}</p>
                {a.isPinned && <span className="text-xs text-amber-700">Pinned</span>}
                <p className="text-sm text-gray-600 mt-0.5">{a.content}{a.content.length >= 200 ? '...' : ''}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

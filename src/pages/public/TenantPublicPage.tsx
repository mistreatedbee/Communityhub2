import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Megaphone, Search } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TenantMemberFeedPage } from '../tenant-member/TenantMemberFeedPage';
import { MemberPageContainer, CommunityHero, Section, SectionTitle } from '../../components/member';
import { Button } from '../../components/ui/Button';

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
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  enabledSections?: string[];
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

function tenantFromContext(tenant: { id: string; name: string; slug: string; description?: string | null; category?: string | null; location?: string | null; logo_url?: string | null } | null): TenantRow | null {
  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    description: tenant.description ?? undefined,
    category: tenant.category ?? undefined,
    location: tenant.location ?? undefined,
    logoUrl: tenant.logo_url ?? undefined
  };
}

export function TenantPublicPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { user } = useAuth();
  const { tenant: contextTenant, membership, loading: tenantLoading } = useTenant();
  const { updateTheme } = useTheme();
  const [preview, setPreview] = useState<PublicPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tenantSlug) return;
      try {
        const data = await apiClient<PublicPreview>(`/api/tenants/${tenantSlug}/public-preview`);
        setPreview(data);
      } catch {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    };
    void load();
  }, [tenantSlug]);

  useEffect(() => {
    if (!preview?.tenant) return;
    const theme = preview.theme;
    const logo = theme?.logoUrl || preview.tenant.logoUrl;
    updateTheme({
      ...(theme?.primaryColor && { primaryColor: theme.primaryColor }),
      ...(theme?.secondaryColor && { secondaryColor: theme.secondaryColor }),
      ...(logo && { logo })
    });
  }, [preview, updateTheme]);

  const hasFullCommunityAccess = useMemo(() => {
    if (!membership) return false;
    if (membership.status !== 'ACTIVE') return false;
    return ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER'].includes(membership.role);
  }, [membership]);

  const tenant = tenantFromContext(contextTenant) ?? preview?.tenant ?? null;
  const loading = tenantLoading || (previewLoading && !tenant);

  if (loading && !tenant) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="py-20">
        <EmptyState icon={Search} title="Community not found" description="This community might be inactive or unavailable." />
      </div>
    );
  }

  if (hasFullCommunityAccess) {
    return (
      <MemberPageContainer>
        <TenantMemberFeedPage />
      </MemberPageContainer>
    );
  }

  const description =
    tenant.description?.trim() ||
    'Public community profile. Join to participate and access the full community landing page.';

  return (
    <MemberPageContainer>
      <CommunityHero
        communityName={tenant.name}
        logoUrl={tenant.logoUrl}
        headline={tenant.name}
        subheadline={`${tenant.category ?? 'Community'}${tenant.location ? ` · ${tenant.location}` : ''}`}
        description={description}
        primaryColor="var(--color-primary)"
      />
      <div className="flex flex-wrap gap-3 mb-10">
        {user ? (
          <Link to={`/c/${tenant.slug}/join`}>
            <Button>Join community</Button>
          </Link>
        ) : (
          <>
            <Link to={`/c/${tenant.slug}/join`}>
              <Button>Join community</Button>
            </Link>
            <Link to="/login" state={{ from: `/c/${tenant.slug}` }}>
              <Button variant="outline">Log in</Button>
            </Link>
          </>
        )}
        <Link to="/communities">
          <Button variant="outline">Back to directory</Button>
        </Link>
      </div>

      {preview && preview.upcomingEvents.length > 0 && (
        <Section>
          <SectionTitle
            title="Upcoming events"
          />
          <ul className="space-y-3 rounded-xl bg-gray-50/80 px-5 py-4 sm:px-6 sm:py-5">
            {preview.upcomingEvents.map((e) => (
              <li key={e._id} className="py-2 border-b border-gray-100 last:border-0 last:pb-0">
                <p className="font-medium text-gray-900">{e.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(e.startsAt).toLocaleString()}
                  {e.location ? ` · ${e.location}` : ''}
                  {e.isOnline && e.meetingLink ? ' · Online' : ''}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {preview && preview.recentAnnouncements.length > 0 && (
        <Section>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-gray-500" />
            Recent announcements
          </h2>
          <ul className="space-y-4">
            {preview.recentAnnouncements.map((a) => (
              <li key={a._id} className="rounded-xl bg-gray-50/80 px-5 py-4 sm:px-6 sm:py-5">
                <p className="font-medium text-gray-900">{a.title}</p>
                {a.isPinned && (
                  <span className="text-xs font-medium text-amber-700 ml-2">Pinned</span>
                )}
                <p className="text-sm text-gray-600 mt-0.5">
                  {a.content.length >= 200 ? `${a.content.slice(0, 200)}...` : a.content}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </MemberPageContainer>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';
import { CommunityHero, Section, SectionTitle, ContentCard } from '../../components/member';

type Announcement = { _id: string; title: string; content: string; createdAt: string; isPinned: boolean };
type PostRow = { _id: string; title: string; content: string; publishedAt: string };
type EventRow = { _id: string; title: string; startsAt: string; location?: string; meetingLink?: string; isOnline?: boolean; thumbnailUrl?: string };
type ProgramRow = { _id: string; title: string; description?: string };
type GroupRow = { _id: string; name: string; description?: string };
type ResourceRow = { _id: string; title: string; description?: string; url?: string; thumbnailUrl?: string };

type ProgramsPayload = {
  programs: ProgramRow[];
};

type HomeSettings = {
  theme?: { primaryColor?: string; secondaryColor?: string; logoUrl?: string };
  sections?: {
    sectionOrder?: string[];
    hero?: {
      enabled?: boolean;
      headline?: string;
      subheadline?: string;
      ctaLabel?: string;
      ctaLink?: string;
      heroImageUrl?: string;
      heroLogoUrl?: string;
      overlayColor?: string;
    };
    vision?: { enabled?: boolean; title?: string; content?: string };
    gallery?: { enabled?: boolean; images?: Array<{ url: string; caption?: string; order: number }> };
    events?: { enabled?: boolean; title?: string; showCount?: number };
    programs?: { enabled?: boolean; title?: string; showCount?: number };
    groups?: { enabled?: boolean; title?: string; showCount?: number; featuredGroupIds?: string[] };
    announcements?: { enabled?: boolean; title?: string };
    calendar?: { enabled?: boolean; title?: string };
  };
};

const DEFAULT_ORDER = ['hero', 'vision', 'announcements', 'events', 'programs', 'groups', 'gallery', 'calendar'];

export function TenantMemberFeedPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      const [home, announcementRows, postRows, eventRows, programRows, groupRows, resourceRows] = await Promise.all([
        tenantFeaturesGet<HomeSettings>(tenant.id, '/home-settings').catch(() => null),
        tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements').catch(() => []),
        tenantFeaturesGet<PostRow[]>(tenant.id, '/posts').catch(() => []),
        tenantFeaturesGet<EventRow[]>(tenant.id, '/events').catch(() => []),
        tenantFeaturesGet<ProgramsPayload>(tenant.id, '/programs').catch(() => ({ programs: [] })),
        tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups').catch(() => []),
        tenantFeaturesGet<ResourceRow[]>(tenant.id, '/resources').catch(() => [])
      ]);
      setSettings(home);
      setAnnouncements(announcementRows || []);
      setPosts(postRows || []);
      setEvents(eventRows || []);
      setPrograms((programRows as ProgramsPayload)?.programs || []);
      setGroups(groupRows || []);
      setResources(resourceRows || []);
    };
    void load();
  }, [tenant?.id]);

  const sections = settings?.sections || {};
  const order = sections.sectionOrder && sections.sectionOrder.length ? sections.sectionOrder : DEFAULT_ORDER;
  const primaryColor = settings?.theme?.primaryColor || 'var(--color-primary)';

  const featuredGroups = useMemo(() => {
    const featuredIds = new Set(sections.groups?.featuredGroupIds || []);
    const base = groups;
    const picked = featuredIds.size ? base.filter((g) => featuredIds.has(g._id)) : base;
    return picked.slice(0, sections.groups?.showCount || 3);
  }, [groups, sections.groups]);

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .slice(0, sections.events?.showCount || 3),
    [events, sections.events]
  );

  const featuredPrograms = useMemo(() => programs.slice(0, sections.programs?.showCount || 3), [programs, sections.programs]);
  const pinnedAnnouncements = useMemo(
    () =>
      [...announcements]
        .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
        .slice(0, 4),
    [announcements]
  );

  const galleryImages = [...(sections.gallery?.images || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  const ctaLink = sections.hero?.ctaLink || 'events';
  const internalCtaPath = ctaLink.startsWith('/') ? ctaLink : `/c/${tenantSlug}/${ctaLink}`.replace(/\/+/g, '/');
  const isExternalCta = /^https?:\/\//i.test(ctaLink);

  return (
    <div className="space-y-0">
      {order.map((sectionKey) => {
        if (sectionKey === 'hero' && sections.hero?.enabled !== false) {
          return (
            <CommunityHero
              key="hero"
              communityName={tenant?.name || 'Community'}
              logoUrl={sections.hero?.heroLogoUrl || tenant?.logo_url}
              headline={sections.hero?.headline}
              subheadline={sections.hero?.subheadline}
              ctaLabel={sections.hero?.ctaLabel || 'Explore'}
              ctaHref={isExternalCta ? undefined : internalCtaPath}
              ctaExternal={isExternalCta}
              primaryColor={primaryColor}
              backgroundImageUrl={sections.hero?.heroImageUrl}
              overlayColor={sections.hero?.overlayColor || 'rgba(15,23,42,0.4)'}
            />
          );
        }

        if (sectionKey === 'vision' && sections.vision?.enabled !== false) {
          return (
            <Section key="vision">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl mb-4">
                {sections.vision?.title || 'Vision, Strategy, and Objectives'}
              </h2>
              <div className="rounded-xl bg-gray-50/80 px-5 py-4 sm:px-6 sm:py-5 text-gray-700 leading-relaxed whitespace-pre-line">
                {sections.vision?.content || ''}
              </div>
            </Section>
          );
        }

        if (sectionKey === 'announcements' && sections.announcements?.enabled !== false) {
          return (
            <Section key="announcements">
              <SectionTitle
                title={sections.announcements?.title || "What's new"}
                viewAllHref={`/c/${tenantSlug}/announcements`}
                viewAllLabel="View all"
              />
              {pinnedAnnouncements.length === 0 && posts.length === 0 ? (
                <p className="text-gray-500">No announcements yet.</p>
              ) : null}
              <div className="space-y-4">
                {pinnedAnnouncements.map((item) => (
                  <ContentCard key={item._id} accentLeft={item.isPinned}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{item.title}</span>
                      {item.isPinned && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">Pinned</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                  </ContentCard>
                ))}
                {posts.slice(0, 2).map((item) => (
                  <ContentCard key={item._id}>
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{item.content}</p>
                  </ContentCard>
                ))}
              </div>
            </Section>
          );
        }

        if (sectionKey === 'events' && sections.events?.enabled !== false) {
          return (
            <Section key="events">
              <SectionTitle
                title={sections.events?.title || 'Upcoming events'}
                viewAllHref={`/c/${tenantSlug}/events`}
                viewAllLabel="View all events"
              />
              {upcomingEvents.length === 0 ? <p className="text-gray-500">No upcoming events.</p> : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((item) => (
                  <Link
                    key={item._id}
                    to={`/c/${tenantSlug}/events`}
                    className="group rounded-xl bg-gray-50/80 overflow-hidden transition-all duration-200 hover:bg-gray-100/90 block text-left"
                  >
                    {item.thumbnailUrl ? (
                      <SafeImage
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fallbackSrc="/image-fallback.svg"
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Event</div>
                    )}
                    <div className="p-4">
                      <p className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{new Date(item.startsAt).toLocaleString()}</p>
                      {item.location ? <p className="text-xs text-gray-500 mt-0.5">{item.location}</p> : null}
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          );
        }

        if (sectionKey === 'programs' && sections.programs?.enabled !== false) {
          return (
            <Section key="programs">
              <SectionTitle
                title={sections.programs?.title || 'Featured programs'}
                viewAllHref={`/c/${tenantSlug}/programs`}
                viewAllLabel="View all programs"
              />
              {featuredPrograms.length === 0 ? <p className="text-gray-500">No programs available yet.</p> : null}
              <div className="space-y-4">
                {featuredPrograms.map((item) => (
                  <ContentCard key={item._id}>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{item.description || ''}</p>
                  </ContentCard>
                ))}
              </div>
            </Section>
          );
        }

        if (sectionKey === 'groups' && sections.groups?.enabled !== false) {
          return (
            <Section key="groups">
              <SectionTitle
                title={sections.groups?.title || 'Groups'}
                viewAllHref={`/c/${tenantSlug}/groups`}
                viewAllLabel="View all groups"
              />
              {featuredGroups.length === 0 ? <p className="text-gray-500">No groups available.</p> : null}
              <div className="space-y-4">
                {featuredGroups.map((item) => (
                  <ContentCard key={item._id}>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{item.description || ''}</p>
                  </ContentCard>
                ))}
              </div>
            </Section>
          );
        }

        if (sectionKey === 'gallery' && sections.gallery?.enabled) {
          return (
            <Section key="gallery">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl mb-4">Gallery</h2>
              {galleryImages.length === 0 ? <p className="text-gray-500">No gallery images yet.</p> : null}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryImages.map((item, idx) => (
                  <div key={`${item.url}-${idx}`} className="rounded-xl overflow-hidden bg-gray-50">
                    <SafeImage
                      src={item.url}
                      alt={item.caption || `gallery-${idx + 1}`}
                      fallbackSrc="/image-fallback.svg"
                      className="w-full h-36 object-cover"
                    />
                    {item.caption ? <p className="p-2 text-xs text-gray-500">{item.caption}</p> : null}
                  </div>
                ))}
              </div>
            </Section>
          );
        }

        if (sectionKey === 'calendar' && sections.calendar?.enabled) {
          return (
            <Section key="calendar">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl mb-4">
                {sections.calendar?.title || 'Calendar'}
              </h2>
              <ul className="space-y-2 rounded-xl bg-gray-50/80 px-5 py-4 sm:px-6 sm:py-5">
                {upcomingEvents.slice(0, 6).map((item) => (
                  <li key={item._id} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-gray-500 shrink-0">{new Date(item.startsAt).toLocaleDateString()}</span>
                    <span>{item.title}</span>
                  </li>
                ))}
                {upcomingEvents.length === 0 ? <li className="text-sm text-gray-500">No upcoming schedule.</li> : null}
              </ul>
            </Section>
          );
        }
        return null;
      })}

      <Section>
        <SectionTitle
          title="Featured resources"
          viewAllHref={`/c/${tenantSlug}/resources`}
          viewAllLabel="View all"
        />
        {resources.length === 0 ? <p className="text-gray-500">No resources yet.</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {resources.slice(0, 4).map((item) => (
            <ContentCard key={item._id}>
              <div className="flex gap-3">
                {item.thumbnailUrl ? (
                  <SafeImage
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fallbackSrc="/image-fallback.svg"
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 truncate">{item.description || ''}</p>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium mt-1 inline-block transition-colors hover:opacity-90"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Open
                    </a>
                  ) : null}
                </div>
              </div>
            </ContentCard>
          ))}
        </div>
      </Section>
    </div>
  );
}

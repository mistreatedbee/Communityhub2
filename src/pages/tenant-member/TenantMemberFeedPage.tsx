import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';

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
    <div className="space-y-8">
      {order.map((sectionKey) => {
        if (sectionKey === 'hero' && sections.hero?.enabled !== false) {
          const bg = sections.hero?.heroImageUrl;
          return (
            <section
              key="hero"
              className="rounded-2xl border border-gray-200 overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: bg ? `url(${bg})` : undefined }}
            >
              <div className="p-8 md:p-12" style={{ background: sections.hero?.overlayColor || 'rgba(15,23,42,0.35)' }}>
                {sections.hero?.heroLogoUrl ? (
                  <SafeImage src={sections.hero.heroLogoUrl} alt={tenant?.name || 'Community'} fallbackSrc="/logo.png" className="h-12 w-auto mb-4" />
                ) : null}
                <h1 className="text-3xl md:text-4xl font-bold text-white">{sections.hero?.headline || `Welcome to ${tenant?.name}`}</h1>
                <p className="text-white/90 mt-2 max-w-2xl">{sections.hero?.subheadline || 'Discover everything happening in your community.'}</p>
                <div className="mt-5">
                  {isExternalCta ? (
                    <a href={ctaLink} target="_blank" rel="noreferrer">
                      <Button style={{ backgroundColor: primaryColor, borderColor: primaryColor }} className="text-white">
                        {sections.hero?.ctaLabel || 'Explore'}
                      </Button>
                    </a>
                  ) : (
                    <Link to={internalCtaPath}>
                      <Button style={{ backgroundColor: primaryColor, borderColor: primaryColor }} className="text-white">
                        {sections.hero?.ctaLabel || 'Explore'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          );
        }

        if (sectionKey === 'vision' && sections.vision?.enabled !== false) {
          return (
            <section key="vision" className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{sections.vision?.title || 'Vision, Strategy, and Objectives'}</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line">{sections.vision?.content || ''}</div>
            </section>
          );
        }

        if (sectionKey === 'announcements' && sections.announcements?.enabled !== false) {
          return (
            <section key="announcements" className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">{sections.announcements?.title || 'Pinned Updates'}</h2>
                <Link to={`/c/${tenantSlug}/announcements`} className="text-sm" style={{ color: primaryColor }}>View all</Link>
              </div>
              {pinnedAnnouncements.length === 0 ? <p className="text-sm text-gray-500">No announcements yet.</p> : null}
              {pinnedAnnouncements.map((item) => (
                <div key={item._id} className="border border-gray-100 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.content}</p>
                </div>
              ))}
              {posts.slice(0, 2).map((item) => (
                <div key={item._id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.content}</p>
                </div>
              ))}
            </section>
          );
        }

        if (sectionKey === 'events' && sections.events?.enabled !== false) {
          return (
            <section key="events" className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">{sections.events?.title || 'Upcoming Events'}</h2>
                <Link to={`/c/${tenantSlug}/events`} className="text-sm" style={{ color: primaryColor }}>View all events</Link>
              </div>
              {upcomingEvents.length === 0 ? <p className="text-sm text-gray-500">No upcoming events.</p> : null}
              {upcomingEvents.map((item) => (
                <div key={item._id} className="border border-gray-100 rounded-lg p-3 flex gap-3">
                  {item.thumbnailUrl ? (
                    <SafeImage src={item.thumbnailUrl} alt={item.title} fallbackSrc="/image-fallback.svg" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  ) : null}
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{new Date(item.startsAt).toLocaleString()}</p>
                    {item.location ? <p className="text-xs text-gray-500">{item.location}</p> : null}
                  </div>
                </div>
              ))}
            </section>
          );
        }

        if (sectionKey === 'programs' && sections.programs?.enabled !== false) {
          return (
            <section key="programs" className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">{sections.programs?.title || 'Featured Programs'}</h2>
                <Link to={`/c/${tenantSlug}/programs`} className="text-sm" style={{ color: primaryColor }}>View all programs</Link>
              </div>
              {featuredPrograms.length === 0 ? <p className="text-sm text-gray-500">No programs available yet.</p> : null}
              {featuredPrograms.map((item) => (
                <div key={item._id} className="border border-gray-100 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description || ''}</p>
                </div>
              ))}
            </section>
          );
        }

        if (sectionKey === 'groups' && sections.groups?.enabled !== false) {
          return (
            <section key="groups" className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">{sections.groups?.title || 'Groups'}</h2>
                <Link to={`/c/${tenantSlug}/groups`} className="text-sm" style={{ color: primaryColor }}>View all groups</Link>
              </div>
              {featuredGroups.length === 0 ? <p className="text-sm text-gray-500">No groups available.</p> : null}
              {featuredGroups.map((item) => (
                <div key={item._id} className="border border-gray-100 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description || ''}</p>
                </div>
              ))}
            </section>
          );
        }

        if (sectionKey === 'gallery' && sections.gallery?.enabled) {
          return (
            <section key="gallery" className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">Gallery</h2>
              {galleryImages.length === 0 ? <p className="text-sm text-gray-500">No gallery images yet.</p> : null}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryImages.map((item, idx) => (
                  <div key={`${item.url}-${idx}`} className="space-y-1">
                    <SafeImage src={item.url} alt={item.caption || `gallery-${idx + 1}`} fallbackSrc="/image-fallback.svg" className="w-full h-28 object-cover rounded-lg" />
                    {item.caption ? <p className="text-xs text-gray-500">{item.caption}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sectionKey === 'calendar' && sections.calendar?.enabled) {
          return (
            <section key="calendar" className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">{sections.calendar?.title || 'Calendar'}</h2>
              <ul className="space-y-2">
                {upcomingEvents.slice(0, 6).map((item) => (
                  <li key={item._id} className="text-sm text-gray-700">
                    {new Date(item.startsAt).toLocaleDateString()} - {item.title}
                  </li>
                ))}
                {upcomingEvents.length === 0 ? <li className="text-sm text-gray-500">No upcoming schedule.</li> : null}
              </ul>
            </section>
          );
        }
        return null;
      })}

      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Resource Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resources.slice(0, 4).map((item) => (
            <div key={item._id} className="border border-gray-100 rounded-lg p-3 flex gap-3">
              {item.thumbnailUrl ? (
                <SafeImage src={item.thumbnailUrl} alt={item.title} fallbackSrc="/image-fallback.svg" className="w-12 h-12 object-cover rounded shrink-0" />
              ) : null}
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description || ''}</p>
                {item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="text-xs" style={{ color: primaryColor }}>Open</a> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Video,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';
import { CommunityHero, Section, SectionTitle, ContentCard } from '../../components/member';

type Announcement = { _id: string; title: string; content: string; createdAt: string; isPinned: boolean };
type PostRow = { _id: string; title: string; content: string; publishedAt: string };
type EventRow = {
  _id: string;
  title: string;
  startsAt: string;
  location?: string;
  meetingLink?: string;
  isOnline?: boolean;
  thumbnailUrl?: string;
};
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      try {
        const [home, announcementRows, postRows, eventRows, programRows, groupRows, resourceRows] = await Promise.all([
          tenantFeaturesGet<HomeSettings>(tenant.id, '/home-settings').catch(() => null),
          tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements').catch(() => []),
          tenantFeaturesGet<PostRow[]>(tenant.id, '/posts').catch(() => []),
          tenantFeaturesGet<EventRow[]>(tenant.id, '/events').catch(() => []),
          tenantFeaturesGet<ProgramsPayload>(tenant.id, '/programs').catch(() => ({ programs: [] })),
          tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups').catch(() => []),
          tenantFeaturesGet<ResourceRow[]>(tenant.id, '/resources').catch(() => []),
        ]);
        setSettings(home);
        setAnnouncements(announcementRows || []);
        setPosts(postRows || []);
        setEvents(eventRows || []);
        setPrograms((programRows as ProgramsPayload)?.programs || []);
        setGroups(groupRows || []);
        setResources(resourceRows || []);
      } catch (error) {
        console.error('Failed to load member feed', error);
      } finally {
        setLoading(false);
      }
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

  // Loading skeleton
  if (loading) {
    return (
      <>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
          <div className="h-96 bg-gray-200/50 rounded-3xl"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Animated background – same as admin pages */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 relative">
        {/* Dynamic sections */}
        {order.map((sectionKey) => {
          if (sectionKey === 'hero' && sections.hero?.enabled !== false) {
            return (
              <CommunityHero
                key="hero"
                communityName={tenant?.name || 'Community'}
                logoUrl={sections.hero?.heroLogoUrl || tenant?.logo_url || '/logo.png'}
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
                <SectionTitle
                  title={sections.vision?.title || 'Vision, Strategy, and Objectives'}
                />
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 p-6 text-gray-700 leading-relaxed whitespace-pre-line shadow-sm">
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
                  <p className="text-gray-500 text-center py-8 bg-white/30 rounded-xl">No announcements yet.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {pinnedAnnouncements.map((item) => (
                      <div
                        key={item._id}
                        className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          {item.isPinned && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Pinned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                      </div>
                    ))}
                    {posts.slice(0, 2).map((item) => (
                      <div
                        key={item._id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-5"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-white/30 rounded-xl">No upcoming events.</p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((item) => (
                      <Link
                        key={item._id}
                        to={`/c/${tenantSlug}/events`}
                        className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 overflow-hidden hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-200"
                      >
                        {item.thumbnailUrl ? (
                          <SafeImage
                            src={item.thumbnailUrl}
                            alt={item.title}
                            fallbackSrc="/image-fallback.svg"
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                            <Calendar className="w-8 h-8" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(item.startsAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            {item.isOnline ? (
                              <>
                                <Video className="w-3.5 h-3.5" />
                                <span>Online</span>
                              </>
                            ) : item.location ? (
                              <>
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{item.location}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
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
                {featuredPrograms.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-white/30 rounded-xl">No programs available yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredPrograms.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-5"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description || ''}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                {featuredGroups.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-white/30 rounded-xl">No groups available.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredGroups.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-5"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description || ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            );
          }

          if (sectionKey === 'gallery' && sections.gallery?.enabled) {
            return (
              <Section key="gallery">
                <SectionTitle title="Gallery" />
                {galleryImages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-white/30 rounded-xl">No gallery images yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galleryImages.map((item, idx) => (
                      <div
                        key={`${item.url}-${idx}`}
                        className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 overflow-hidden hover:shadow-lg transition-all duration-200"
                      >
                        <SafeImage
                          src={item.url}
                          alt={item.caption || `gallery-${idx + 1}`}
                          fallbackSrc="/image-fallback.svg"
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.caption && (
                          <p className="p-2 text-xs text-gray-500 truncate">{item.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            );
          }

          if (sectionKey === 'calendar' && sections.calendar?.enabled) {
            return (
              <Section key="calendar">
                <SectionTitle title={sections.calendar?.title || 'Calendar'} />
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 p-6">
                  {upcomingEvents.slice(0, 6).length === 0 ? (
                    <p className="text-gray-500 text-center">No upcoming schedule.</p>
                  ) : (
                    <ul className="space-y-3">
                      {upcomingEvents.slice(0, 6).map((item) => (
                        <li key={item._id} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500 shrink-0 w-24">
                            {new Date(item.startsAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-gray-900 font-medium">{item.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>
            );
          }
          return null;
        })}

        {/* Featured resources (always shown, not in section order) */}
        <Section>
          <SectionTitle
            title="Featured resources"
            viewAllHref={`/c/${tenantSlug}/resources`}
            viewAllLabel="View all"
          />
          {resources.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-white/30 rounded-xl">No resources yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {resources.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-4"
                >
                  <div className="flex gap-3">
                    {item.thumbnailUrl ? (
                      <SafeImage
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fallbackSrc="/image-fallback.svg"
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description || ''}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium mt-2 hover:underline"
                          style={{ color: primaryColor }}
                        >
                          Open
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}

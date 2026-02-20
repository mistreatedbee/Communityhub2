import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';
import { MemberPageContainer, PageHeader } from '../../components/member';
import { MapPin, Video } from 'lucide-react';

type EventRow = {
  _id: string;
  title: string;
  description: string;
  startsAt: string;
  location?: string;
  isOnline?: boolean;
  meetingLink?: string;
  thumbnailUrl?: string;
};

function formatDateBadge(iso: string) {
  const d = new Date(iso);
  return {
    day: d.getDate(),
    month: d.toLocaleString('default', { month: 'short' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  };
}

export function TenantMemberEventsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<EventRow[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setItems(await tenantFeaturesGet<EventRow[]>(tenant.id, '/events'));
    };
    void load();
  }, [tenant?.id]);

  const rsvp = async (id: string, status: 'GOING' | 'INTERESTED' | 'NOT_GOING') => {
    if (!tenant?.id) return;
    await tenantFeaturesPost(tenant.id, `/events/${id}/rsvp`, { status });
  };

  return (
    <MemberPageContainer>
      <PageHeader
        title="Events"
        subtitle="Upcoming events and how to join."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 && (
          <p className="text-gray-500 sm:col-span-2 lg:col-span-3">No events scheduled.</p>
        )}
        {items.map((e) => {
          const { day, month, time } = formatDateBadge(e.startsAt);
          return (
            <article
              key={e._id}
              className="rounded-xl overflow-hidden bg-gray-50/80 transition-all duration-200 hover:bg-gray-100/90 flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-gray-200 shrink-0">
                {e.thumbnailUrl ? (
                  <SafeImage
                    src={e.thumbnailUrl}
                    alt={e.title}
                    fallbackSrc="/image-fallback.svg"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    Event
                  </div>
                )}
                <div
                  className="absolute top-3 left-3 rounded-lg px-2.5 py-1.5 bg-white/95 text-center shadow-sm"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <span className="block text-lg font-bold leading-none">{day}</span>
                  <span className="block text-xs font-medium uppercase">{month}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="font-semibold text-gray-900 text-lg">{e.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{time}</p>
                {e.location && (
                  <p className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                    {e.location}
                  </p>
                )}
                {e.isOnline && e.meetingLink && (
                  <a
                    href={e.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium mt-1 transition-colors hover:opacity-90"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <Video className="w-4 h-4 shrink-0" />
                    Join online
                  </a>
                )}
                {e.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">{e.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
                  <Button size="sm" onClick={() => void rsvp(e._id, 'GOING')}>
                    Going
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void rsvp(e._id, 'INTERESTED')}>
                    Interested
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </MemberPageContainer>
  );
}

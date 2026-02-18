import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type EventRow = {
  _id: string;
  title: string;
  description: string;
  startsAt: string;
  location?: string;
  isOnline?: boolean;
  meetingLink?: string;
};

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Events</h1>
      {items.map((e) => (
        <div key={e._id} className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-900">{e.title}</p>
          <p className="text-sm text-gray-600">{e.description}</p>
          <p className="text-xs text-gray-500 mb-1">{new Date(e.startsAt).toLocaleString()}</p>
          {e.location && <p className="text-xs text-gray-500 mb-1">{e.location}</p>}
          {e.isOnline && e.meetingLink && (
            <a href={e.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-[var(--color-primary)] hover:underline block mb-2">
              Join online meeting
            </a>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void rsvp(e._id, 'GOING')}>Going</Button>
            <Button size="sm" variant="outline" onClick={() => void rsvp(e._id, 'INTERESTED')}>Interested</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

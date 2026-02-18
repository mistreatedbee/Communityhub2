import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';

type Announcement = { _id: string; title: string; content: string; createdAt: string; isPinned: boolean };

export function TenantMemberAnnouncementsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      const rows = await tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements');
      setItems(rows.sort((a, b) => Number(b.isPinned) - Number(a.isPinned)));
    };
    void load();
  }, [tenant?.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      {items.map((a) => (
        <div key={a._id} className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-900">{a.title}</p>
          {a.isPinned ? <p className="text-xs text-amber-700">Pinned</p> : null}
          <p className="text-sm text-gray-600">{a.content}</p>
        </div>
      ))}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { MemberPageContainer, PageHeader, ContentCard } from '../../components/member';

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
    <MemberPageContainer>
      <PageHeader
        title="Announcements"
        subtitle="Latest updates and news from your community."
      />
      <div className="space-y-6">
        {items.length === 0 && (
          <p className="text-gray-500">No announcements yet.</p>
        )}
        {items.map((a) => (
          <ContentCard key={a._id} accentLeft={a.isPinned}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">{a.title}</h2>
              {a.isPinned && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Pinned
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {new Date(a.createdAt).toLocaleDateString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {a.content}
            </div>
          </ContentCard>
        ))}
      </div>
    </MemberPageContainer>
  );
}

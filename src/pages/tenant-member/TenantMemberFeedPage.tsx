import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';

type PostRow = { _id: string; title: string; content: string; publishedAt: string };
type Announcement = { _id: string; title: string; content: string; createdAt: string; isPinned: boolean };

export function TenantMemberFeedPage() {
  const { tenant } = useTenant();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      const [postRows, announcementRows] = await Promise.all([
        tenantFeaturesGet<PostRow[]>(tenant.id, '/posts'),
        tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements')
      ]);
      setPosts(postRows);
      setAnnouncements(
        [...announcementRows]
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
          .slice(0, 3)
      );
    };
    void load();
  }, [tenant?.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Member Feed</h1>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Pinned Updates</h2>
        {announcements.map((a) => (
          <div key={a._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-semibold text-gray-900">{a.title}</p>
            {a.isPinned ? <p className="text-xs text-amber-700">Pinned</p> : null}
            <p className="text-sm text-gray-600">{a.content}</p>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
        {posts.map((p) => (
          <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-semibold text-gray-900">{p.title}</p>
            <p className="text-sm text-gray-600">{p.content}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

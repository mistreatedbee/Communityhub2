import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type Announcement = {
  _id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'MEMBERS' | 'LEADERS';
  isPinned: boolean;
  createdAt: string;
};

export function TenantAdminAnnouncementsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    const rows = await tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements');
    setItems(rows);
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !title.trim() || !content.trim()) return;
    await tenantFeaturesPost(tenant.id, '/announcements', { title, content, visibility: 'MEMBERS', isPinned });
    setTitle('');
    setContent('');
    setIsPinned(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesDelete(tenant.id, `/announcements/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
          Pin this announcement
        </label>
        <Button onClick={() => void create()}>Create announcement</Button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{item.title}</p>
                {item.isPinned ? <p className="text-xs text-amber-700">Pinned</p> : null}
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
              <Button variant="ghost" className="text-red-600" onClick={() => void remove(item._id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

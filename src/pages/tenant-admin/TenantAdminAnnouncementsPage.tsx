import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Announcement = {
  _id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'MEMBERS' | 'LEADERS';
  isPinned: boolean;
  attachmentUrls?: string[];
  createdAt: string;
};

export function TenantAdminAnnouncementsPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachmentUrlsText, setAttachmentUrlsText] = useState('');
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVisibility, setEditVisibility] = useState<Announcement['visibility']>('MEMBERS');
  const [editPinned, setEditPinned] = useState(false);
  const [editAttachmentUrlsText, setEditAttachmentUrlsText] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    const rows = await tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements');
    setItems(rows);
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const parseUrls = (text: string) =>
    text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const create = async () => {
    if (!tenant?.id || !title.trim() || !content.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/announcements', {
        title,
        content,
        visibility: 'MEMBERS',
        isPinned,
        attachmentUrls: parseUrls(attachmentUrlsText)
      });
      addToast('Announcement created', 'success');
      setTitle('');
      setContent('');
      setIsPinned(false);
      setAttachmentUrlsText('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create announcement', 'error');
    }
  };

  const openEdit = (item: Announcement) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditVisibility(item.visibility);
    setEditPinned(item.isPinned);
    setEditAttachmentUrlsText((item.attachmentUrls || []).join('\n'));
  };

  const saveEdit = async () => {
    if (!tenant?.id || !editItem) return;
    setEditSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/announcements/${editItem._id}`, {
        title: editTitle,
        content: editContent,
        visibility: editVisibility,
        isPinned: editPinned,
        attachmentUrls: parseUrls(editAttachmentUrlsText)
      });
      addToast('Announcement updated', 'success');
      setEditItem(null);
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update announcement', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesDelete(tenant.id, `/announcements/${id}`);
      addToast('Announcement deleted', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete announcement', 'error');
    }
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachment URLs (one per line, optional)</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            rows={2}
            placeholder="https://..."
            value={attachmentUrlsText}
            onChange={(e) => setAttachmentUrlsText(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
          Pin this announcement
        </label>
        <Button onClick={() => void create()}>Create announcement</Button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item._id}
            role="button"
            tabIndex={0}
            onClick={() => openEdit(item)}
            onKeyDown={(e) => e.key === 'Enter' && openEdit(item)}
            className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[var(--color-primary)] hover:shadow-sm transition-colors"
          >
            <div className="flex justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{item.title}</p>
                {item.isPinned ? <p className="text-xs text-amber-700">Pinned</p> : null}
                <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                {(item.attachmentUrls?.length ?? 0) > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{item.attachmentUrls!.length} attachment(s)</p>
                )}
              </div>
              <Button variant="ghost" className="text-red-600 shrink-0" onClick={(e) => { e.stopPropagation(); void remove(item._id); }}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit announcement"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={() => void saveEdit()} isLoading={editSaving}>Save</Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-3">
            <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={4} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <select className="w-full rounded-lg border border-gray-300 p-2" value={editVisibility} onChange={(e) => setEditVisibility(e.target.value as Announcement['visibility'])}>
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS">Members</option>
                <option value="LEADERS">Leaders</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment URLs (one per line)</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                rows={2}
                value={editAttachmentUrlsText}
                onChange={(e) => setEditAttachmentUrlsText(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={editPinned} onChange={(e) => setEditPinned(e.target.checked)} />
              Pin this announcement
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost, tenantFeaturesPut } from '../../lib/tenantFeatures';

type PostRow = {
  _id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'MEMBERS' | 'LEADERS';
  publishedAt: string;
  mediaUrls?: string[];
};

export function TenantAdminContentPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<PostRow[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrlsText, setMediaUrlsText] = useState('');
  const [editItem, setEditItem] = useState<PostRow | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVisibility, setEditVisibility] = useState<PostRow['visibility']>('MEMBERS');
  const [editMediaUrlsText, setEditMediaUrlsText] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    const rows = await tenantFeaturesGet<PostRow[]>(tenant.id, '/posts');
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
      await tenantFeaturesPost(tenant.id, '/posts', {
        title,
        content,
        visibility: 'MEMBERS',
        isPublished: true,
        mediaUrls: parseUrls(mediaUrlsText)
      });
      addToast('Post published', 'success');
      setTitle('');
      setContent('');
      setMediaUrlsText('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create post', 'error');
    }
  };

  const openEdit = (item: PostRow) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditVisibility(item.visibility);
    setEditMediaUrlsText((item.mediaUrls || []).join('\n'));
  };

  const saveEdit = async () => {
    if (!tenant?.id || !editItem) return;
    setEditSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/posts/${editItem._id}`, {
        title: editTitle,
        content: editContent,
        visibility: editVisibility,
        isPublished: true,
        mediaUrls: parseUrls(editMediaUrlsText)
      });
      addToast('Post updated', 'success');
      setEditItem(null);
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update post', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesDelete(tenant.id, `/posts/${id}`);
      addToast('Post deleted', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete post', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Content</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Post</label>
          <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Media URLs (one per line, optional)</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            rows={2}
            placeholder="https://..."
            value={mediaUrlsText}
            onChange={(e) => setMediaUrlsText(e.target.value)}
          />
        </div>
        <Button onClick={() => void create()}>Publish post</Button>
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
                <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                {(item.mediaUrls?.length ?? 0) > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{item.mediaUrls!.length} media</p>
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
        title="Edit post"
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
              <select className="w-full rounded-lg border border-gray-300 p-2" value={editVisibility} onChange={(e) => setEditVisibility(e.target.value as PostRow['visibility'])}>
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS">Members</option>
                <option value="LEADERS">Leaders</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Media URLs (one per line)</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                rows={2}
                value={editMediaUrlsText}
                onChange={(e) => setEditMediaUrlsText(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

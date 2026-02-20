import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { uploadTenantAnnouncementAttachment, getTenantFileUrl } from '../../lib/tenantUpload';
import { getToken } from '../../lib/apiClient';

type AttachmentMeta = {
  fileId: string;
  fileName: string;
  mimeType?: string;
  size?: number;
};

type Announcement = {
  _id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'MEMBERS' | 'LEADERS';
  isPinned: boolean;
  attachments?: AttachmentMeta[];
  createdAt: string;
};

export function TenantAdminAnnouncementsPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [uploadingAttach, setUploadingAttach] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVisibility, setEditVisibility] = useState<Announcement['visibility']>('MEMBERS');
  const [editPinned, setEditPinned] = useState(false);
  const [editAttachments, setEditAttachments] = useState<AttachmentMeta[]>([]);
  const [editUploadingAttach, setEditUploadingAttach] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    const rows = await tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements');
    setItems(rows);
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const handleAttachmentFiles = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = e.target.files;
    if (!files?.length || !tenant?.id) return;
    const setList = isEdit ? setEditAttachments : setAttachments;
    const setUploading = isEdit ? setEditUploadingAttach : setUploadingAttach;
    setUploading(true);
    try {
      const list = isEdit ? editAttachments : attachments;
      const next: AttachmentMeta[] = [...list];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadTenantAnnouncementAttachment(tenant.id, file);
        next.push({
          fileId: res.fileId,
          fileName: res.fileName,
          mimeType: res.mimeType,
          size: res.size
        });
      }
      setList(next);
      addToast('Attachment(s) uploaded.', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (fileId: string, isEdit: boolean) => {
    if (isEdit) {
      setEditAttachments((prev) => prev.filter((a) => a.fileId !== fileId));
    } else {
      setAttachments((prev) => prev.filter((a) => a.fileId !== fileId));
    }
  };

  const create = async () => {
    if (!tenant?.id || !title.trim() || !content.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/announcements', {
        title,
        content,
        visibility: 'MEMBERS',
        isPinned,
        attachments
      });
      addToast('Announcement created', 'success');
      setTitle('');
      setContent('');
      setIsPinned(false);
      setAttachments([]);
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
    setEditAttachments(item.attachments || []);
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
        attachments: editAttachments
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

  const downloadAttachment = async (fileId: string, fileName: string) => {
    if (!tenant?.id) return;
    const token = getToken();
    try {
      const url = getTenantFileUrl(tenant.id, fileId);
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = fileName || 'download';
      a.click();
      URL.revokeObjectURL(u);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Download failed', 'error');
    }
  };

  const renderAttachmentList = (list: AttachmentMeta[], isEdit: boolean) => (
    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
      {list.map((a) => (
        <li key={a.fileId} className="flex items-center gap-2">
          <button
            type="button"
            className="text-[var(--color-primary)] hover:underline"
            onClick={() => void downloadAttachment(a.fileId, a.fileName)}
          >
            {a.fileName}
          </button>
          <button
            type="button"
            className="text-red-600 text-xs"
            onClick={() => removeAttachment(a.fileId, isEdit)}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (optional)</label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
            className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium"
            onChange={(e) => handleAttachmentFiles(e, false)}
            disabled={uploadingAttach}
          />
          {uploadingAttach && <p className="text-sm text-gray-500 mt-1">Uploading…</p>}
          {attachments.length > 0 && renderAttachmentList(attachments, false)}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
          Pin this announcement
        </label>
        <Button onClick={() => void create()} disabled={uploadingAttach}>Create announcement</Button>
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
                {(item.attachments?.length ?? 0) > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{item.attachments!.length} attachment(s)</p>
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
            <Button onClick={() => void saveEdit()} isLoading={editSaving} disabled={editUploadingAttach}>Save</Button>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0"
                onChange={(e) => handleAttachmentFiles(e, true)}
                disabled={editUploadingAttach}
              />
              {editUploadingAttach && <p className="text-sm text-gray-500 mt-1">Uploading…</p>}
              {editAttachments.length > 0 && renderAttachmentList(editAttachments, true)}
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

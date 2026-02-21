import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  Pin,
  Globe,
  Users,
  Shield,
  Paperclip,
  Trash2,
  Edit,
  Download,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import {
  tenantFeaturesDelete,
  tenantFeaturesGet,
  tenantFeaturesPost,
  tenantFeaturesPut,
} from '../../lib/tenantFeatures';
import { uploadTenantAnnouncementAttachment, getTenantFileUrl } from '../../lib/tenantUpload';
import { validateResourceFile } from '../../lib/uploadValidation';
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

const visibilityIcons = {
  PUBLIC: <Globe className="w-3.5 h-3.5" />,
  MEMBERS: <Users className="w-3.5 h-3.5" />,
  LEADERS: <Shield className="w-3.5 h-3.5" />,
};

const visibilityLabels = {
  PUBLIC: 'Public',
  MEMBERS: 'Members',
  LEADERS: 'Leaders',
};

export function TenantAdminAnnouncementsPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [filteredItems, setFilteredItems] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Create form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [uploadingAttach, setUploadingAttach] = useState(false);

  // Edit state
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
    setLoading(true);
    try {
      const rows = await tenantFeaturesGet<Announcement[]>(tenant.id, '/announcements');
      setItems(rows);
      setFilteredItems(rows);
    } catch (error) {
      addToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter announcements based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.content.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleAttachmentFiles = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const files = e.target.files;
    if (!files?.length || !tenant?.id) return;
    const setList = isEdit ? setEditAttachments : setAttachments;
    const setUploading = isEdit ? setEditUploadingAttach : setUploadingAttach;
    for (let i = 0; i < files.length; i++) {
      const validation = validateResourceFile(files[i]);
      if (!validation.valid) {
        addToast(`${files[i].name}: ${validation.error}`, 'error');
        e.target.value = '';
        return;
      }
    }
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
          size: res.size,
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
        attachments,
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
        attachments: editAttachments,
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
    <div className="space-y-2 mt-2">
      {list.map((a) => (
        <div key={a.fileId} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
            <button
              type="button"
              className="text-[var(--color-primary)] hover:underline truncate"
              onClick={() => void downloadAttachment(a.fileId, a.fileName)}
            >
              {a.fileName}
            </button>
          </div>
          <button
            type="button"
            className="text-red-600 hover:text-red-700 p-1"
            onClick={() => removeAttachment(a.fileId, isEdit)}
            aria-label="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  const clearSearch = () => setSearchTerm('');

  return (
    <>
      {/* Animated background – subtle for admin area */}
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

      <div className="space-y-6 relative">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Announcements</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 w-full sm:w-64"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Create form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
            New announcement
          </h2>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments (optional)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 transition"
              onChange={(e) => handleAttachmentFiles(e, false)}
              disabled={uploadingAttach}
            />
            {uploadingAttach && (
              <p className="text-sm text-gray-500 mt-2">Uploading...</p>
            )}
            {attachments.length > 0 && renderAttachmentList(attachments, false)}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
            />
            <Pin className="w-4 h-4" />
            Pin this announcement
          </label>
          <Button
            onClick={() => void create()}
            disabled={uploadingAttach || !title.trim() || !content.trim()}
            className="w-full sm:w-auto"
          >
            Create announcement
          </Button>
        </div>

        {/* Announcement count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'announcement' : 'announcements'} found
        </p>

        {/* Announcement list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No announcements found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Create your first announcement to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          item.visibility === 'PUBLIC'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : item.visibility === 'MEMBERS'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-purple-100 text-purple-800 border-purple-200'
                        }`}
                      >
                        {visibilityIcons[item.visibility]}
                        {visibilityLabels[item.visibility]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap line-clamp-3">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {(item.attachments?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" />
                          {item.attachments!.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(item)}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void remove(item._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          title="Edit announcement"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setEditItem(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => void saveEdit()}
                isLoading={editSaving}
                disabled={editUploadingAttach}
              >
                Save changes
              </Button>
            </>
          }
        >
          {editItem && (
            <div className="space-y-4">
              <Input
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Announcement title"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your announcement..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as Announcement['visibility'])}
                >
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
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 transition"
                  onChange={(e) => handleAttachmentFiles(e, true)}
                  disabled={editUploadingAttach}
                />
                {editUploadingAttach && (
                  <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                )}
                {editAttachments.length > 0 && renderAttachmentList(editAttachments, true)}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPinned}
                  onChange={(e) => setEditPinned(e.target.checked)}
                  className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                <Pin className="w-4 h-4" />
                Pin this announcement
              </label>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}

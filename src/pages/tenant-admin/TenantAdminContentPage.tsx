import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  Plus,
  Globe,
  Users,
  Shield,
  Image as ImageIcon,
  Trash2,
  Edit,
  Eye,
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

type PostRow = {
  _id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'MEMBERS' | 'LEADERS';
  publishedAt: string;
  mediaUrls?: string[];
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

const visibilityColors = {
  PUBLIC: 'bg-green-100 text-green-800 border-green-200',
  MEMBERS: 'bg-blue-100 text-blue-800 border-blue-200',
  LEADERS: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function TenantAdminContentPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<PostRow[]>([]);
  const [filteredItems, setFilteredItems] = useState<PostRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Create form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrlsText, setMediaUrlsText] = useState('');

  // Edit state
  const [editItem, setEditItem] = useState<PostRow | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVisibility, setEditVisibility] = useState<PostRow['visibility']>('MEMBERS');
  const [editMediaUrlsText, setEditMediaUrlsText] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const rows = await tenantFeaturesGet<PostRow[]>(tenant.id, '/posts');
      setItems(rows);
      setFilteredItems(rows);
    } catch (error) {
      addToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter posts based on search term
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
        mediaUrls: parseUrls(mediaUrlsText),
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
        mediaUrls: parseUrls(editMediaUrlsText),
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Content</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts..."
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

        {/* Create post form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
            Create new post
          </h2>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media URLs (one per line, optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              rows={2}
              placeholder="https://example.com/image.jpg"
              value={mediaUrlsText}
              onChange={(e) => setMediaUrlsText(e.target.value)}
            />
          </div>
          <Button
            onClick={() => void create()}
            disabled={!title.trim() || !content.trim()}
            className="w-full sm:w-auto"
          >
            Publish post
          </Button>
        </div>

        {/* Posts count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'post' : 'posts'} found
        </p>

        {/* Posts list */}
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
            <p className="text-gray-500 mb-2">No posts found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Create your first post to get started</p>
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
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${visibilityColors[item.visibility]}`}
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
                        {new Date(item.publishedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {(item.mediaUrls?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {item.mediaUrls!.length}
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
          title="Edit post"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setEditItem(null)}>
                Cancel
              </Button>
              <Button onClick={() => void saveEdit()} isLoading={editSaving}>
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
                placeholder="Post title"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your post content..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as PostRow['visibility'])}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS">Members</option>
                  <option value="LEADERS">Leaders</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media URLs (one per line, optional)
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                  rows={2}
                  placeholder="https://example.com/image.jpg"
                  value={editMediaUrlsText}
                  onChange={(e) => setEditMediaUrlsText(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Search,
  X,
  Plus,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import {
  tenantFeaturesDelete,
  tenantFeaturesGet,
  tenantFeaturesPost,
} from '../../lib/tenantFeatures';
import { uploadTenantResource, getTenantFileUrl } from '../../lib/tenantUpload';
import { validateResourceFile, validateImageFile } from '../../lib/uploadValidation';
import { SafeImage } from '../../components/ui/SafeImage';
import { TenantFileImage } from '../../components/ui/TenantFileImage';
import { getToken } from '../../lib/apiClient';

type Resource = {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  thumbnailFileId?: string;
  type: string;
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
};

export function TenantAdminResourcesPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { addToast } = useToast();
  const [items, setItems] = useState<Resource[]>([]);
  const [filteredItems, setFilteredItems] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Create form state (file-only; no URL/link type)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const rows = await tenantFeaturesGet<Resource[]>(tenant.id, '/resources');
      setItems(rows);
      setFilteredItems(rows);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter resources based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    if (!file) setSelectedThumbnail(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedThumbnail(e.target.files?.[0] || null);
  };

  const create = async () => {
    if (!tenant?.id || !title.trim()) return;
    if (!selectedFile) {
      addToast('Choose a file to upload.', 'error');
      return;
    }
    const validation = validateResourceFile(selectedFile);
    if (!validation.valid) {
      addToast(validation.error, 'error');
      return;
    }
    if (selectedThumbnail) {
      const thumbValidation = validateImageFile(selectedThumbnail);
      if (!thumbValidation.valid) {
        addToast(`Thumbnail: ${thumbValidation.error}`, 'error');
        return;
      }
    }
    setUploading(true);
    try {
      const result = await uploadTenantResource(tenant.id, selectedFile, selectedThumbnail || undefined);
      await tenantFeaturesPost(tenant.id, '/resources', {
        title,
        description,
        type: 'file',
        fileId: result.fileId,
        fileName: result.fileName,
        mimeType: result.mimeType,
        size: result.size,
        thumbnailFileId: result.thumbnailFileId || undefined,
      });
      addToast('Resource created successfully.', 'success');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setSelectedThumbnail(null);
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create resource', 'error');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesDelete(tenant.id, `/resources/${id}`);
      addToast('Resource deleted.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete resource', 'error');
    }
  };

  const handleDownload = async (item: Resource) => {
    if (!tenant?.id || !item.fileId) return;
    const token = getToken();
    try {
      const url = getTenantFileUrl(tenant.id, item.fileId);
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = item.fileName || 'download';
      a.click();
      URL.revokeObjectURL(u);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Download failed', 'error');
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resources</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search resources..."
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

        {/* Create resource form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
            Add new resource
          </h2>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title"
            required
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <p className="text-xs text-gray-500 mb-2">Upload from device (PDF, Word, Excel, TXT, CSV, or images; max 10 MB)</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 transition"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {selectedFile.name}
                {selectedFile.size != null && (
                  <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                )}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
              onChange={handleThumbnailChange}
              disabled={uploading || !selectedFile}
            />
            {selectedThumbnail && (
              <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                {selectedThumbnail.name}
              </p>
            )}
          </div>
          <Button
            onClick={() => void create()}
            disabled={uploading || !selectedFile || !title.trim()}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Uploading...' : 'Add resource'}
          </Button>
        </div>

        {/* Resources count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'resource' : 'resources'} found
        </p>

        {/* Resources list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No resources found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Add your first resource to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/c/${tenantSlug}/admin/resources/${item._id}`}
                    className="shrink-0"
                  >
                    {item.thumbnailFileId && tenant?.id ? (
                      <TenantFileImage
                        tenantId={tenant.id}
                        fileId={item.thumbnailFileId}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        fallbackSrc="/image-fallback.svg"
                      />
                    ) : item.thumbnailUrl ? (
                      <SafeImage
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fallbackSrc="/image-fallback.svg"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        {item.type === 'file' ? (
                          <FileText className="w-8 h-8" />
                        ) : (
                          <Globe className="w-8 h-8" />
                        )}
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/c/${tenantSlug}/admin/resources/${item._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-[var(--color-primary)] transition"
                      >
                        {item.title}
                      </Link>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {item.type === 'file' ? 'File' : 'Link'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {item.type === 'file' && item.fileId ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] p-0 h-auto"
                          onClick={() => void handleDownload(item)}
                          leftIcon={<Download className="w-4 h-4" />}
                        >
                          Download
                        </Button>
                      ) : item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon className="w-4 h-4" />
                          Open link
                        </a>
                      ) : null}
                      {item.size && (
                        <span className="text-xs text-gray-400">
                          {(item.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void remove(item._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

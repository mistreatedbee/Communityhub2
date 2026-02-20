import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';
import { uploadTenantResource, getTenantFileUrl } from '../../lib/tenantUpload';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [resourceType, setResourceType] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    try {
      setItems(await tenantFeaturesGet<Resource[]>(tenant.id, '/resources'));
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load resources', 'error');
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

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
    if (resourceType === 'file' && !selectedFile) {
      addToast('Choose a file or switch to Link and enter a URL.', 'error');
      return;
    }
    if (resourceType === 'link' && !linkUrl.trim()) {
      addToast('Enter a link URL.', 'error');
      return;
    }
    setUploading(true);
    try {
      if (resourceType === 'file' && selectedFile) {
        const result = await uploadTenantResource(tenant.id, selectedFile, selectedThumbnail || undefined);
        await tenantFeaturesPost(tenant.id, '/resources', {
          title,
          description,
          type: 'file',
          fileId: result.fileId,
          fileName: result.fileName,
          mimeType: result.mimeType,
          size: result.size,
          thumbnailFileId: result.thumbnailFileId || undefined
        });
      } else {
        await tenantFeaturesPost(tenant.id, '/resources', {
          title,
          description,
          type: 'link',
          url: linkUrl.trim()
        });
      }
      addToast('Resource created successfully.', 'success');
      setTitle('');
      setDescription('');
      setLinkUrl('');
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
        headers: token ? { Authorization: `Bearer ${token}` } : {}
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="resourceType"
                checked={resourceType === 'file'}
                onChange={() => setResourceType('file')}
              />
              Upload file
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="resourceType"
                checked={resourceType === 'link'}
                onChange={() => setResourceType('link')}
              />
              Link
            </label>
          </div>
        </div>
        {resourceType === 'file' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {selectedFile && <p className="mt-1 text-sm text-gray-600">Selected: {selectedFile.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail image (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium"
                onChange={handleThumbnailChange}
                disabled={uploading || !selectedFile}
              />
              {selectedThumbnail && <p className="mt-1 text-sm text-gray-600">Selected: {selectedThumbnail.name}</p>}
            </div>
          </>
        ) : (
          <Input
            label="Link URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
          />
        )}
        <Button onClick={() => void create()} disabled={uploading}>
          Add resource
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between gap-3 items-center"
          >
            <Link
              to={`/c/${tenantSlug}/admin/resources/${item._id}`}
              className="flex-1 min-w-0 hover:opacity-90 flex gap-3"
            >
              {item.thumbnailFileId && tenant?.id ? (
                <TenantFileImage
                  tenantId={tenant.id}
                  fileId={item.thumbnailFileId}
                  alt={item.title}
                  className="w-12 h-12 rounded object-cover shrink-0"
                  fallbackSrc="/image-fallback.svg"
                />
              ) : item.thumbnailUrl ? (
                <SafeImage
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fallbackSrc="/image-fallback.svg"
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
              ) : null}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.type === 'file' && item.fileId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-[var(--color-primary)] p-0 h-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      void handleDownload(item);
                    }}
                  >
                    Download
                  </Button>
                ) : item.url ? (
                  <a
                    className="text-sm text-[var(--color-primary)]"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open link
                  </a>
                ) : null}
              </div>
            </Link>
            <Button variant="ghost" className="text-red-600 shrink-0" onClick={() => void remove(item._id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

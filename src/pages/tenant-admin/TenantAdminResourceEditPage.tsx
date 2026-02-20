import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { uploadTenantResource, getTenantFileUrl } from '../../lib/tenantUpload';
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
  moduleId?: string;
  programId?: string;
};

export function TenantAdminResourceEditPage() {
  const { tenant } = useTenant();
  const { tenantSlug, resourceId } = useParams<{ tenantSlug: string; resourceId: string }>();
  const { addToast } = useToast();
  const [resource, setResource] = useState<Resource | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [type, setType] = useState<'file' | 'link'>('link');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacementFile, setReplacementFile] = useState<{
    fileId: string;
    fileName: string;
    mimeType: string;
    size: number;
    thumbnailFileId?: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);

  const load = useCallback(async () => {
    if (!tenant?.id || !resourceId) return;
    try {
      const data = await tenantFeaturesGet<Resource>(tenant.id, `/resources/${resourceId}`);
      setResource(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setLinkUrl(data.url || '');
      setThumbnailUrl(data.thumbnailUrl || '');
      setType((data.type === 'file' ? 'file' : 'link') as 'file' | 'link');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load resource', 'error');
    }
  }, [tenant?.id, resourceId, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
    if (!e.target.files?.[0]) setSelectedThumbnail(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedThumbnail(e.target.files?.[0] || null);
  };

  const uploadReplacement = async () => {
    if (!tenant?.id || !selectedFile) return;
    setUploading(true);
    try {
      const result = await uploadTenantResource(tenant.id, selectedFile, selectedThumbnail || undefined);
      setReplacementFile({
        fileId: result.fileId,
        fileName: result.fileName,
        mimeType: result.mimeType,
        size: result.size,
        thumbnailFileId: result.thumbnailFileId
      });
      addToast('New file uploaded. Click Save to update.', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!tenant?.id || !resourceId) return;
    setSaving(true);
    try {
      const payload: any = { title, description, type };
      if (type === 'link') {
        payload.url = linkUrl;
        payload.thumbnailUrl = thumbnailUrl || '';
      } else {
        if (replacementFile) {
          payload.fileId = replacementFile.fileId;
          payload.fileName = replacementFile.fileName;
          payload.mimeType = replacementFile.mimeType;
          payload.size = replacementFile.size;
          payload.thumbnailFileId = replacementFile.thumbnailFileId;
        }
      }
      await tenantFeaturesPut(tenant.id, `/resources/${resourceId}`, payload);
      addToast('File updated successfully.', 'success');
      setReplacementFile(null);
      setSelectedFile(null);
      setSelectedThumbnail(null);
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update resource', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!tenant?.id || !resource?.fileId) return;
    const token = getToken();
    try {
      const url = getTenantFileUrl(tenant.id, resource.fileId);
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = resource.fileName || 'download';
      a.click();
      URL.revokeObjectURL(u);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Download failed', 'error');
    }
  };

  if (!resource) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading resource...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/c/${tenantSlug}/admin/resources`}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to Files
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Edit resource</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            className="w-full rounded-lg border border-gray-300 p-2"
            value={type}
            onChange={(e) => setType(e.target.value as 'file' | 'link')}
          >
            <option value="link">Link</option>
            <option value="file">File</option>
          </select>
        </div>
        {type === 'link' ? (
          <>
            <Input
              label="Link URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
            />
            <Input
              label="Thumbnail image URL (optional)"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
            />
          </>
        ) : (
          <>
            {resource.fileId && !replacementFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Current file: {resource.fileName || 'File'}</span>
                <Button type="button" variant="ghost" className="text-sm" onClick={() => void handleDownload()}>
                  Download
                </Button>
              </div>
            )}
            {replacementFile && (
              <p className="text-sm text-gray-600">New file to save: {replacementFile.fileName}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload new file (optional)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {selectedFile && (
                <>
                  <p className="mt-1 text-sm text-gray-600">Selected: {selectedFile.name}</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mt-1">Thumbnail (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0"
                      onChange={handleThumbnailChange}
                      disabled={uploading}
                    />
                  </div>
                  <Button type="button" variant="secondary" className="mt-2" onClick={() => void uploadReplacement()} disabled={uploading}>
                    Upload new file
                  </Button>
                </>
              )}
            </div>
          </>
        )}
        <Button onClick={() => void save()} disabled={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

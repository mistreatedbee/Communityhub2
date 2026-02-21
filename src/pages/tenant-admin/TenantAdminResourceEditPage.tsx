import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Download,
  Upload,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { uploadTenantResource, getTenantFileUrl } from '../../lib/tenantUpload';
import { getToken } from '../../lib/apiClient';
import { SafeImage } from '../../components/ui/SafeImage';
import { TenantFileImage } from '../../components/ui/TenantFileImage';

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
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
        thumbnailFileId: result.thumbnailFileId,
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
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  const clearReplacement = () => {
    setReplacementFile(null);
    setSelectedFile(null);
    setSelectedThumbnail(null);
  };

  // Determine if current resource is an image for preview
  const isImage = resource?.mimeType?.startsWith('image/');

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
        {/* Back navigation */}
        <div className="flex items-center gap-2">
          <Link
            to={`/c/${tenantSlug}/admin/resources`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit resource</h1>

        {loading ? (
          // Loading skeleton
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-6">
            {/* Basic info section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                Basic information
              </h2>
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resource title"
                required
              />
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description (optional)"
              />
            </div>

            {/* Type selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resourceType"
                    checked={type === 'link'}
                    onChange={() => setType('link')}
                    className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                  />
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  Link
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resourceType"
                    checked={type === 'file'}
                    onChange={() => setType('file')}
                    className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                  />
                  <FileText className="w-4 h-4 text-gray-500" />
                  File
                </label>
              </div>
            </div>

            {/* Link fields */}
            {type === 'link' && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  Link details
                </h2>
                <Input
                  label="Link URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/document"
                  leftIcon={<LinkIcon className="w-4 h-4 text-gray-400" />}
                />
                <Input
                  label="Thumbnail image URL (optional)"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  leftIcon={<ImageIcon className="w-4 h-4 text-gray-400" />}
                />
              </div>
            )}

            {/* File fields */}
            {type === 'file' && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                  File details
                </h2>

                {/* Current file */}
                {resource?.fileId && !replacementFile && (
                  <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current file</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isImage && tenant?.id && resource.fileId ? (
                          <TenantFileImage
                            tenantId={tenant.id}
                            fileId={resource.fileId}
                            alt={resource.fileName || 'File'}
                            className="w-12 h-12 rounded object-cover"
                            fallbackSrc="/image-fallback.svg"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resource.fileName}</p>
                          {resource.size && (
                            <p className="text-xs text-gray-500">{(resource.size / 1024).toFixed(1)} KB</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDownload()}
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replacement file preview */}
                {replacementFile && (
                  <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">New file to save</p>
                        <p className="text-sm text-blue-700 mt-1">{replacementFile.fileName}</p>
                      </div>
                      <button
                        onClick={clearReplacement}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        aria-label="Cancel replacement"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload new file */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload new file (optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 transition"
                    onChange={handleFileChange}
                    disabled={uploading || !!replacementFile}
                  />
                  {selectedFile && !replacementFile && (
                    <div className="space-y-3 mt-2">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {selectedFile.name}
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thumbnail image (optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
                          onChange={handleThumbnailChange}
                          disabled={uploading}
                        />
                        {selectedThumbnail && (
                          <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {selectedThumbnail.name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void uploadReplacement()}
                        disabled={uploading}
                        leftIcon={<Upload className="w-4 h-4" />}
                      >
                        {uploading ? 'Uploading...' : 'Upload new file'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => void save()}
                disabled={saving || uploading}
                leftIcon={<Save className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

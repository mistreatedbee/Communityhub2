import { getToken } from './apiClient';
import { getApiBaseUrl } from './apiClient';

export type UploadPurpose = 'resource' | 'event-thumbnail' | 'announcement-attachment';

/** Upload logo via POST /api/upload/logo; returns fileId for tenant profile / theme. */
export async function uploadLogo(file: File): Promise<{ fileId: string }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const base = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${base}/api/upload/logo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || err?.error?.message || 'Logo upload failed');
  }
  const data = await res.json();
  const fileId = data?.data?.fileId ?? data?.fileId ?? '';
  if (!fileId) throw new Error('No file ID returned');
  return { fileId };
}

/** Build the public URL for a logo fileId (for display or sending as logoUrl where API expects URL). */
export function getLogoUrl(fileId: string): string {
  if (!fileId) return '';
  const base = getApiBaseUrl();
  return `${base}/api/upload/logo/${fileId}`;
}

export type ResourceUploadResult = {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  thumbnailFileId?: string;
};

export type FileUploadResult = {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export async function uploadTenantResource(
  tenantId: string,
  file: File,
  thumbnail?: File
): Promise<ResourceUploadResult> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const base = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);
  if (thumbnail) formData.append('thumbnail', thumbnail);
  const res = await fetch(`${base}/api/tenants/${tenantId}/upload/resource`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Upload failed');
  }
  const json = await res.json();
  const data = json?.data ?? json;
  return {
    fileId: data.fileId,
    fileName: data.fileName ?? file.name,
    mimeType: data.mimeType ?? file.type,
    size: data.size ?? file.size,
    thumbnailFileId: data.thumbnailFileId
  };
}

export async function uploadTenantEventThumbnail(tenantId: string, file: File): Promise<FileUploadResult> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const base = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${base}/api/tenants/${tenantId}/upload/event-thumbnail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Upload failed');
  }
  const json = await res.json();
  const data = json?.data ?? json;
  return {
    fileId: data.fileId,
    fileName: data.fileName ?? file.name,
    mimeType: data.mimeType ?? file.type,
    size: data.size ?? file.size
  };
}

export async function uploadTenantAnnouncementAttachment(
  tenantId: string,
  file: File
): Promise<FileUploadResult> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const base = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${base}/api/tenants/${tenantId}/upload/announcement-attachment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Upload failed');
  }
  const json = await res.json();
  const data = json?.data ?? json;
  return {
    fileId: data.fileId,
    fileName: data.fileName ?? file.name,
    mimeType: data.mimeType ?? file.type,
    size: data.size ?? file.size
  };
}

export async function uploadTenantPostMedia(tenantId: string, file: File): Promise<FileUploadResult> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const base = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${base}/api/tenants/${tenantId}/upload/post-media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Upload failed');
  }
  const json = await res.json();
  const data = json?.data ?? json;
  return {
    fileId: data.fileId,
    fileName: data.fileName ?? file.name,
    mimeType: data.mimeType ?? file.type,
    size: data.size ?? file.size
  };
}

export function getTenantFileUrl(tenantId: string, fileId: string): string {
  const base = getApiBaseUrl();
  return `${base}/api/tenants/${tenantId}/files/${fileId}`;
}

export function getTenantFileDownloadUrl(tenantId: string, fileId: string): string {
  const url = getTenantFileUrl(tenantId, fileId);
  const token = getToken();
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

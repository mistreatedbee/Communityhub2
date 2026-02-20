import React, { useEffect, useState } from 'react';
import { getToken } from '../../lib/apiClient';
import { getTenantFileUrl } from '../../lib/tenantUpload';

type TenantFileImageProps = {
  tenantId: string;
  fileId: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
};

export function TenantFileImage({ tenantId, fileId, alt, className, fallbackSrc }: TenantFileImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!tenantId || !fileId) {
      setSrc(fallbackSrc || null);
      setFailed(false);
      return;
    }
    setFailed(false);
    let cancelled = false;
    let blobUrl: string | null = null;
    const token = getToken();
    const url = getTenantFileUrl(tenantId, fileId);
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.blob();
      })
      .then((blob) => {
        if (!cancelled) {
          blobUrl = URL.createObjectURL(blob);
          setSrc(blobUrl);
        } else if (blobUrl) URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [tenantId, fileId]);

  useEffect(() => {
    return () => {
      if (src && src.startsWith('blob:')) URL.revokeObjectURL(src);
    };
  }, [src]);

  if (failed || !src) {
    return fallbackSrc ? <img src={fallbackSrc} alt={alt} className={className} /> : null;
  }
  return <img src={src} alt={alt} className={className} />;
}

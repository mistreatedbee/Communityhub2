export const DEFAULT_BRAND_LOGO = '/logo.png';
export const DEFAULT_IMAGE_FALLBACK = '/image-fallback.svg';

export function normalizeImageUrl(value?: string | null): string | undefined {
  const raw = String(value || '').trim();
  if (!raw) return undefined;

  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  if (raw.startsWith('//')) {
    if (typeof window === 'undefined') return `https:${raw}`;
    return `${window.location.protocol}${raw}`;
  }
  if (raw.startsWith('/')) return raw;

  return `/${raw.replace(/^\.?\//, '')}`;
}

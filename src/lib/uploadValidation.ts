/**
 * Shared validation for admin file uploads (device-only).
 * Images: jpeg, png, webp, gif. Documents: pdf, doc, docx, xls, xlsx, txt, csv.
 */

export const DEFAULT_MAX_IMAGE_SIZE_MB = 5;
export const DEFAULT_MAX_DOCUMENT_SIZE_MB = 10;
const BYTES_PER_MB = 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
];
const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];

export type ValidationResult = { valid: true } | { valid: false; error: string };

export function validateImageFile(
  file: File,
  maxSizeMB: number = DEFAULT_MAX_IMAGE_SIZE_MB
): ValidationResult {
  const maxBytes = maxSizeMB * BYTES_PER_MB;
  if (file.size > maxBytes) {
    return { valid: false, error: `Image must be under ${maxSizeMB} MB.` };
  }
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const extOk = ALLOWED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
  const typeOk = ALLOWED_IMAGE_TYPES.includes(type);
  if (!typeOk && !extOk) {
    return {
      valid: false,
      error: 'Image must be JPEG, PNG, WebP, or GIF.',
    };
  }
  return { valid: true };
}

export function validateDocumentFile(
  file: File,
  maxSizeMB: number = DEFAULT_MAX_DOCUMENT_SIZE_MB
): ValidationResult {
  const maxBytes = maxSizeMB * BYTES_PER_MB;
  if (file.size > maxBytes) {
    return { valid: false, error: `File must be under ${maxSizeMB} MB.` };
  }
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const extOk = ALLOWED_DOCUMENT_EXTENSIONS.some((ext) => name.endsWith(ext));
  const typeOk = ALLOWED_DOCUMENT_TYPES.includes(type);
  if (!typeOk && !extOk) {
    return {
      valid: false,
      error: 'File must be PDF, Word, Excel, TXT, or CSV.',
    };
  }
  return { valid: true };
}

/** Validate file that can be either image or document (e.g. resource upload). */
export function validateResourceFile(
  file: File,
  options?: { maxImageMB?: number; maxDocumentMB?: number }
): ValidationResult {
  const type = (file.type || '').toLowerCase();
  const isImage = type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name || '');
  if (isImage) {
    return validateImageFile(file, options?.maxImageMB ?? DEFAULT_MAX_IMAGE_SIZE_MB);
  }
  return validateDocumentFile(file, options?.maxDocumentMB ?? DEFAULT_MAX_DOCUMENT_SIZE_MB);
}

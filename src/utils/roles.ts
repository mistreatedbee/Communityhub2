export type PlatformRole = 'user' | 'super_admin';

export function normalizePlatformRole(value: unknown): PlatformRole {
  if (typeof value !== 'string') return 'user';
  return value.trim().toLowerCase() === 'super_admin' ? 'super_admin' : 'user';
}

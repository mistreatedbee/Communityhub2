const TENANT_BOOTSTRAP_PREFIX = 'communityhub:pending-tenant-bootstrap:';
const TENANT_JOIN_PREFIX = 'communityhub:pending-tenant-join:';
const INTENT_TTL_MS = 24 * 60 * 60 * 1000;

type PendingTenantBootstrap = {
  tenantName: string;
  tenantSlug: string;
  planId: string | null;
  createdAt: number;
};

type PendingTenantJoin = {
  tenantId: string;
  tenantSlug: string;
  name: string;
  formData: Record<string, string>;
  approvalRequired: boolean;
  createdAt: number;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isExpired(createdAt: number) {
  return Date.now() - createdAt > INTENT_TTL_MS;
}

function getItem<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
}

function removeItem(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export function setPendingTenantBootstrap(email: string, data: Omit<PendingTenantBootstrap, 'createdAt'>) {
  const key = `${TENANT_BOOTSTRAP_PREFIX}${normalizeEmail(email)}`;
  setItem(key, { ...data, createdAt: Date.now() });
}

export function getPendingTenantBootstrap(email: string): PendingTenantBootstrap | null {
  const key = `${TENANT_BOOTSTRAP_PREFIX}${normalizeEmail(email)}`;
  const value = getItem<PendingTenantBootstrap>(key);
  if (!value) return null;
  if (isExpired(value.createdAt)) {
    removeItem(key);
    return null;
  }
  return value;
}

export function clearPendingTenantBootstrap(email: string) {
  const key = `${TENANT_BOOTSTRAP_PREFIX}${normalizeEmail(email)}`;
  removeItem(key);
}

export function setPendingTenantJoin(email: string, data: Omit<PendingTenantJoin, 'createdAt'>) {
  const key = `${TENANT_JOIN_PREFIX}${normalizeEmail(email)}`;
  setItem(key, { ...data, createdAt: Date.now() });
}

export function getPendingTenantJoin(email: string): PendingTenantJoin | null {
  const key = `${TENANT_JOIN_PREFIX}${normalizeEmail(email)}`;
  const value = getItem<PendingTenantJoin>(key);
  if (!value) return null;
  if (isExpired(value.createdAt)) {
    removeItem(key);
    return null;
  }
  return value;
}

export function clearPendingTenantJoin(email: string) {
  const key = `${TENANT_JOIN_PREFIX}${normalizeEmail(email)}`;
  removeItem(key);
}

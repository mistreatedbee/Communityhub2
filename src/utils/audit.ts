import { apiClient } from '../lib/apiClient';

export async function logAudit(action: string, tenantId: string | null, metadata: Record<string, unknown> = {}) {
  try {
    const params = new URLSearchParams({ page: '1', pageSize: '1', action });
    if (tenantId) params.set('tenantId', tenantId);
    await apiClient(`/api/audit?${params.toString()}`);
  } catch {
    // Audit write endpoint is server-owned; frontend reads only.
    void metadata;
  }
}

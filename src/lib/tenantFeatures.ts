import { apiClient } from './apiClient';

function base(tenantId: string) {
  return `/api/tenants/${tenantId}/features`;
}

export function tenantFeaturesGet<T>(tenantId: string, path: string) {
  return apiClient<T>(`${base(tenantId)}${path}`);
}

export function tenantFeaturesPost<T>(tenantId: string, path: string, body: unknown) {
  return apiClient<T>(`${base(tenantId)}${path}`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export function tenantFeaturesPut<T>(tenantId: string, path: string, body: unknown) {
  return apiClient<T>(`${base(tenantId)}${path}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

export function tenantFeaturesDelete(tenantId: string, path: string) {
  return apiClient<void>(`${base(tenantId)}${path}`, {
    method: 'DELETE'
  });
}


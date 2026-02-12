const TOKEN_KEY = 'communityhub_jwt';
const REFRESH_TOKEN_KEY = 'communityhub_refresh_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (!token) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

export function getApiBaseUrl() {
  return String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
}

export async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== '/api/auth/refresh') {
    const refreshToken = getRefreshToken();
    if (refreshToken && token) {
      const refreshResponse = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token, refreshToken })
      });

      if (refreshResponse.ok) {
        const refreshJson = await refreshResponse.json();
        const nextToken = refreshJson?.data?.token;
        const nextRefreshToken = refreshJson?.data?.refreshToken;
        if (nextToken) setToken(nextToken);
        if (nextRefreshToken) setRefreshToken(nextRefreshToken);
        return apiClient<T>(path, init);
      }
    }
  }

  if (!response.ok) {
    const message =
      json?.error?.message || json?.error || json?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

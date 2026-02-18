import { apiClient, getRefreshToken, getToken, setRefreshToken, setToken } from './apiClient';

export type ApiSessionUser = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  globalRole: 'SUPER_ADMIN' | 'USER';
};

export type ApiMembership = {
  id: string;
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
};

export type ApiSessionPayload = {
  user: ApiSessionUser;
  memberships: ApiMembership[];
};

export async function loginWithPassword(email: string, password: string): Promise<ApiSessionPayload> {
  const res = await apiClient<{
    token: string;
    refreshToken?: string;
    user: ApiSessionUser;
    memberships: ApiMembership[];
  }>(
    '/api/auth/login',
    {
    method: 'POST',
    body: JSON.stringify({ email, password })
    },
  );
  setToken(res.token);
  setRefreshToken(res.refreshToken || null);
  return { user: res.user, memberships: res.memberships || [] };
}

export async function registerWithPassword(input: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}): Promise<ApiSessionPayload> {
  const res = await apiClient<{ token: string; refreshToken?: string; user: ApiSessionUser }>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(input)
    }
  );
  setToken(res.token);
  setRefreshToken(res.refreshToken || null);
  return { user: res.user, memberships: [] };
}

export async function fetchSession(): Promise<ApiSessionPayload> {
  return apiClient<ApiSessionPayload>('/api/auth/me', { method: 'GET' });
}

export async function logout(): Promise<void> {
  try {
    if (getToken()) {
      await apiClient('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: getRefreshToken() })
      });
    }
  } finally {
    setToken(null);
    setRefreshToken(null);
  }
}

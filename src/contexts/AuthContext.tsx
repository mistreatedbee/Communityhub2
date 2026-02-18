import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearImpersonation } from '../utils/impersonation';
import { fetchSession, logout, type ApiMembership, type ApiSessionUser } from '../lib/apiAuth';

type Membership = {
  id: string;
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
};

type Session = {
  hasSession: boolean;
};

type AuthContextType = {
  user: ApiSessionUser | null;
  session: Session | null;
  loading: boolean;
  role: Membership['role'] | null;
  organizationId: string | null;
  platformRole: 'USER' | 'SUPER_ADMIN';
  memberships: Membership[];
  profileName: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePriority: Record<Membership['role'], number> = {
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4
};

function pickHighestRole(memberships: Membership[], platformRole: 'USER' | 'SUPER_ADMIN') {
  if (platformRole === 'SUPER_ADMIN') return 'OWNER';
  if (!memberships.length) return null;

  return memberships
    .filter((m) => m.status === 'ACTIVE')
    .map((m) => m.role)
    .sort((a, b) => rolePriority[b] - rolePriority[a])[0] ?? null;
}

function normalizeMemberships(items: ApiMembership[] | undefined): Membership[] {
  return (items || []).map((m) => ({
    id: m.id,
    tenantId: m.tenantId,
    role: m.role,
    status: m.status
  }));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ApiSessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Membership['role'] | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [platformRole, setPlatformRole] = useState<'USER' | 'SUPER_ADMIN'>('USER');
  const [memberships, setMemberships] = useState<Membership[]>([]);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await fetchSession();
      const normalizedPlatformRole = data.user.globalRole || 'USER';
      const normalizedMemberships = normalizeMemberships(data.memberships);
      const activeMembership = normalizedMemberships.find((m) => m.status === 'ACTIVE') ?? null;

      setSession({ hasSession: true });
      setUser(data.user);
      setPlatformRole(normalizedPlatformRole);
      setMemberships(normalizedMemberships);
      setRole(pickHighestRole(normalizedMemberships, normalizedPlatformRole));
      setOrganizationId(activeMembership?.tenantId ?? null);
      setProfileName(data.user.fullName ?? null);
    } catch {
      setSession(null);
      setUser(null);
      setRole(null);
      setOrganizationId(null);
      setProfileName(null);
      setPlatformRole('USER');
      setMemberships([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refreshProfile();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      role,
      organizationId,
      platformRole,
      memberships,
      profileName,
      signOut: async () => {
        clearImpersonation();
        await logout();
        setSession(null);
        setUser(null);
        setRole(null);
        setOrganizationId(null);
        setProfileName(null);
        setPlatformRole('USER');
        setMemberships([]);
      },
      refreshProfile
    }),
    [loading, memberships, organizationId, platformRole, profileName, refreshProfile, role, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

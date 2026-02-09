import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';
import { clearImpersonation } from '../utils/impersonation';

type Membership = {
  organization_id: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  platform_role: 'user' | 'super_admin';
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole | null;
  organizationId: string | null;
  platformRole: 'user' | 'super_admin';
  memberships: Membership[];
  profileName: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePriority: Record<UserRole, number> = {
  public: 0,
  member: 1,
  employee: 2,
  supervisor: 3,
  admin: 4,
  owner: 5,
  super_admin: 6
};

function pickHighestRole(memberships: Membership[], platformRole: 'user' | 'super_admin'): UserRole | null {
  if (platformRole === 'super_admin') return 'super_admin';
  if (!memberships.length) return null;

  return memberships
    .filter((m) => m.status === 'active')
    .map((m) => m.role)
    .sort((a, b) => rolePriority[b] - rolePriority[a])[0] ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [platformRole, setPlatformRole] = useState<'user' | 'super_admin'>('user');
  const [memberships, setMemberships] = useState<Membership[]>([]);

  useEffect(() => {
    let mounted = true;

    const refreshUserContext = async (nextUser: User | null) => {
      if (!mounted) return;

      if (!nextUser) {
        setRole(null);
        setOrganizationId(null);
        setProfileName(null);
        setPlatformRole('user');
        setMemberships([]);
        return;
      }

      const [{ data: profileData }, { data: membershipsData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name, platform_role')
          .eq('user_id', nextUser.id)
          .maybeSingle<ProfileRow>(),
        supabase
          .from('organization_memberships')
          .select('organization_id, role, status')
          .eq('user_id', nextUser.id)
          .returns<Membership[]>()
      ]);

      if (!mounted) return;

      const memberships = membershipsData ?? [];
      const activeMembership = memberships.find((m) => m.status === 'active') ?? null;

      setRole(pickHighestRole(memberships, profileData?.platform_role ?? 'user'));
      setOrganizationId(activeMembership?.organization_id ?? null);
      setProfileName(profileData?.full_name ?? null);
      setPlatformRole(profileData?.platform_role ?? 'user');
      setMemberships(memberships);
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      try {
        await refreshUserContext(data.session?.user ?? null);
      } catch (error) {
        console.error('Failed to refresh auth context', error);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      try {
        await refreshUserContext(nextSession?.user ?? null);
      } catch (error) {
        console.error('Failed to refresh auth context', error);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

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
        await supabase.auth.signOut();
      }
    }),
    [loading, organizationId, platformRole, memberships, profileName, role, session, user]
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

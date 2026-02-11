import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { getImpersonation } from '../utils/impersonation';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  contact_email: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  category: string | null;
  location: string | null;
  is_public: boolean;
  status: 'active' | 'pending' | 'suspended';
};

type TenantSettings = {
  public_signup: boolean;
  approval_required: boolean;
  registration_fields_enabled: boolean;
};

type Membership = {
  organization_id: string;
  role: 'owner' | 'admin' | 'supervisor' | 'employee' | 'member';
  status: 'active' | 'inactive' | 'pending';
};

type TenantLicense = {
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  starts_at: string;
  ends_at: string | null;
  limits_snapshot: Record<string, unknown>;
  license: {
    id: string;
    name: string;
    code: string;
    max_members: number;
    max_admins: number;
    max_storage_mb: number;
    max_posts: number;
    max_resources: number;
    feature_flags: Record<string, boolean>;
  };
};

type TenantContextType = {
  tenant: Tenant | null;
  settings: TenantSettings | null;
  license: TenantLicense | null;
  membership: Membership | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ tenantSlug, children }: { tenantSlug: string; children: React.ReactNode }) {
  const { user, platformRole } = useAuth();
  const { updateTheme } = useTheme();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [license, setLicense] = useState<TenantLicense | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantContext = async () => {
    setLoading(true);
    setError(null);

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug, contact_email, logo_url, category, location, is_public, status, primary_color, secondary_color')
      .eq('slug', tenantSlug)
      .maybeSingle<Tenant>();

    if (orgError || !orgData) {
      if (orgError) {
        console.error('[TenantContext] Org fetch failed', orgError.code, orgError.message, { tenantSlug });
      }
      setTenant(null);
      setLoading(false);
      setError(orgError?.message ?? 'Tenant not found');
      return;
    }

    setTenant(orgData);
    updateTheme({
      id: orgData.id,
      name: orgData.name,
      description: orgData.description ?? undefined,
      contactEmail: orgData.contact_email ?? undefined,
      logo: orgData.logo_url ?? undefined,
      primaryColor: orgData.primary_color ?? undefined,
      secondaryColor: orgData.secondary_color ?? undefined
    });

    const [{ data: settingsData }, { data: licenseData }] = await Promise.all([
      supabase
        .from('tenant_settings')
        .select('public_signup, approval_required, registration_fields_enabled')
        .eq('organization_id', orgData.id)
        .maybeSingle<TenantSettings>(),
      supabase
        .from('organization_licenses')
        .select(
          'status, starts_at, ends_at, limits_snapshot, license_plan:license_plans(id, name, code, max_members, max_admins, max_storage_mb, max_posts, max_resources, feature_flags)'
        )
        .eq('organization_id', orgData.id)
        .maybeSingle<TenantLicense>()
    ]);

    setSettings(settingsData ?? { public_signup: true, approval_required: false, registration_fields_enabled: true });
    const licenseMapped = licenseData
      ? { ...licenseData, license: (licenseData as { license_plan?: TenantLicense['license'] }).license_plan ?? licenseData.license }
      : null;
    setLicense(licenseMapped ?? null);

    if (platformRole === 'super_admin') {
      const impersonation = getImpersonation();
      if (impersonation?.userId && (!impersonation.tenantId || impersonation.tenantId === orgData.id)) {
        const { data: impersonatedMembership } = await supabase
          .from('organization_memberships')
          .select('organization_id, role, status')
          .eq('organization_id', orgData.id)
          .eq('user_id', impersonation.userId)
          .maybeSingle<Membership>();
        setMembership(impersonatedMembership ?? {
          organization_id: orgData.id,
          role: 'owner',
          status: 'active'
        });
      } else {
        setMembership({
          organization_id: orgData.id,
          role: 'owner',
          status: 'active'
        });
      }
    } else if (user) {
      const { data: membershipData } = await supabase
        .from('organization_memberships')
        .select('organization_id, role, status')
        .eq('organization_id', orgData.id)
        .eq('user_id', user.id)
        .maybeSingle<Membership>();
      setMembership(membershipData ?? null);
    } else {
      setMembership(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    void fetchTenantContext();
  }, [tenantSlug, user?.id, platformRole]);

  const value = useMemo(
    () => ({
      tenant,
      settings,
      license,
      membership,
      loading,
      error,
      refresh: fetchTenantContext
    }),
    [tenant, settings, license, membership, loading, error]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

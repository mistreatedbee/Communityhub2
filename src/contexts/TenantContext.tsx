import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { getImpersonation } from '../utils/impersonation';
import { apiClient } from '../lib/apiClient';

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
  status: 'ACTIVE' | 'SUSPENDED';
};

type TenantSettings = {
  public_signup: boolean;
  approval_required: boolean;
  registration_fields_enabled: boolean;
};

type Membership = {
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
};

type TenantLicense = {
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CLAIMED';
  expiresAt: string | null;
  limitsSnapshot: Record<string, unknown>;
  plan: {
    id: string;
    name: string;
    maxMembers: number;
    maxAdmins: number;
    featureFlags: Record<string, boolean>;
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

    try {
      const data = await apiClient<{
        tenant: {
          id: string;
          name: string;
          slug: string;
          logoUrl?: string;
          category?: string;
          location?: string;
          status: 'ACTIVE' | 'SUSPENDED';
        };
        settings: {
          publicSignup: boolean;
          approvalRequired: boolean;
          registrationFieldsEnabled: boolean;
        };
        license: TenantLicense | null;
        membership: Membership | null;
      }>(`/api/tenants/${tenantSlug}/context`);

      const mappedTenant: Tenant = {
        id: data.tenant.id,
        name: data.tenant.name,
        slug: data.tenant.slug,
        contact_email: null,
        logo_url: data.tenant.logoUrl || null,
        primary_color: null,
        secondary_color: null,
        category: data.tenant.category || null,
        location: data.tenant.location || null,
        is_public: true,
        status: data.tenant.status
      };

      setTenant(mappedTenant);
      updateTheme({
        id: mappedTenant.id,
        name: mappedTenant.name,
        description: mappedTenant.description ?? undefined,
        contactEmail: mappedTenant.contact_email ?? undefined,
        logo: mappedTenant.logo_url ?? undefined,
        primaryColor: mappedTenant.primary_color ?? undefined,
        secondaryColor: mappedTenant.secondary_color ?? undefined
      });

      setSettings({
        public_signup: data.settings.publicSignup,
        approval_required: data.settings.approvalRequired,
        registration_fields_enabled: data.settings.registrationFieldsEnabled
      });
      setLicense(data.license);

      if (platformRole === 'SUPER_ADMIN') {
        const impersonation = getImpersonation();
        if (impersonation?.userId) {
          setMembership(data.membership);
        } else {
          setMembership({
            tenantId: mappedTenant.id,
            role: 'OWNER',
            status: 'ACTIVE'
          });
        }
      } else if (user) {
        setMembership(data.membership ?? null);
      } else {
        setMembership(null);
      }
    } catch (e) {
      setTenant(null);
      setError(e instanceof Error ? e.message : 'Tenant not found');
    } finally {
      setLoading(false);
    }
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

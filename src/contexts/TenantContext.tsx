import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { getImpersonation } from '../utils/impersonation';
import { apiClient, getApiBaseUrl } from '../lib/apiClient';
import { DEFAULT_BRAND_LOGO, normalizeImageUrl } from '../utils/image';

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
  members_can_share_invite_links: boolean;
  enabled_sections: string[];
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
  enabledSections: string[];
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
  const [enabledSections, setEnabledSections] = useState<string[]>([]);
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
          description?: string;
          logoUrl?: string;
          logoFileId?: string;
          category?: string;
          location?: string;
          status: 'ACTIVE' | 'SUSPENDED';
        };
        settings: {
          publicSignup: boolean;
          approvalRequired: boolean;
          registrationFieldsEnabled: boolean;
          membersCanShareInviteLinks?: boolean;
          enabledSections?: string[];
        };
        theme?: { primaryColor?: string; secondaryColor?: string; logoUrl?: string };
        license: TenantLicense | null;
        membership: Membership | null;
      }>(`/api/tenants/${tenantSlug}/context`);

      const logoUrl =
        data.theme?.logoUrl?.trim() ||
        data.tenant.logoUrl?.trim() ||
        (data.tenant.logoFileId
          ? `${getApiBaseUrl()}/api/upload/logo/${data.tenant.logoFileId}`
          : null);
      const mappedTenant: Tenant = {
        id: data.tenant.id,
        name: data.tenant.name,
        slug: data.tenant.slug,
        description: data.tenant.description ?? undefined,
        contact_email: null,
        logo_url: logoUrl || null,
        primary_color: data.theme?.primaryColor?.trim() || null,
        secondary_color: data.theme?.secondaryColor?.trim() || null,
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
        logo: normalizeImageUrl(mappedTenant.logo_url) || DEFAULT_BRAND_LOGO,
        primaryColor: mappedTenant.primary_color ?? undefined,
        secondaryColor: mappedTenant.secondary_color ?? undefined
      });

      const sections =
        Array.isArray(data.settings.enabledSections) && data.settings.enabledSections.length > 0
          ? data.settings.enabledSections
          : ['announcements', 'resources', 'groups', 'events', 'programs'];
      setSettings({
        public_signup: data.settings.publicSignup,
        approval_required: data.settings.approvalRequired,
        registration_fields_enabled: data.settings.registrationFieldsEnabled,
        members_can_share_invite_links: data.settings.membersCanShareInviteLinks ?? false,
        enabled_sections: sections
      });
      setEnabledSections(sections);
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
      enabledSections,
      license,
      membership,
      loading,
      error,
      refresh: fetchTenantContext
    }),
    [tenant, settings, enabledSections, license, membership, loading, error]
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getLicenseToken, getLicenseKey, clearLicenseSession } from '../../utils/licenseToken';
import { RequireAuth } from '../../components/auth/RequireAuth';
import { RequireLicenseToken } from '../../components/auth/RequireLicenseToken';
import { Spinner } from '../../components/ui/Spinner';

type ClaimResult = { success: boolean; slug?: string; error?: string };

function SetupCommunityForm() {
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { organization } = useTheme();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = normalizeSlug(tenantSlug);
    const name = tenantName.trim();
    if (!name || !slug) {
      addToast('Community name and slug are required.', 'error');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      addToast('Slug must use only lowercase letters, numbers, and hyphens.', 'error');
      return;
    }

    const licenseKey = getLicenseKey();
    if (!licenseKey) {
      addToast('License session expired. Please enter your license key again.', 'error');
      navigate('/enter-license', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('claim_license_and_create_tenant', {
        p_license_key: licenseKey,
        p_tenant_name: name,
        p_tenant_slug: slug,
        p_logo_url: logoUrl.trim() || null,
        p_category: category.trim() || null,
        p_location: location.trim() || null
      }).returns<ClaimResult>();

      if (error) {
        addToast(error.message ?? 'Failed to create community.', 'error');
        setLoading(false);
        return;
      }

      const result = data as ClaimResult | null;
      if (!result?.success) {
        addToast(result?.error ?? 'Failed to create community.', 'error');
        setLoading(false);
        return;
      }

      clearLicenseSession();
      addToast('Community created. Welcome to your admin dashboard.', 'success');
      navigate(`/c/${result.slug}/admin`, { replace: true });
    } catch (err) {
      console.error('Claim license error', err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Set up your community</h2>
        <p className="mt-2 text-sm text-gray-600">
          Give your community a name and a URL slug. You can add a logo and details later.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0 ring-1 ring-gray-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Community name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Acme Community"
              />
              <Input
                label="URL slug"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(normalizeSlug(e.target.value))}
                placeholder="acme-community"
              />
              <Input
                label="Logo URL (optional)"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Education"
              />
              <Input
                label="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco"
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Create community
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SetupCommunityPage() {
  const { user, loading: authLoading, memberships } = useAuth();
  const navigate = useNavigate();
  const hasToken = !!getLicenseToken();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!hasToken) {
      navigate('/enter-license', { replace: true });
      return;
    }
    const ownerOrAdminMembership = memberships.find(
      (m) => m.status === 'active' && (m.role === 'owner' || m.role === 'admin')
    );
    if (ownerOrAdminMembership) {
      supabase
        .from('organizations')
        .select('slug')
        .eq('id', ownerOrAdminMembership.organization_id)
        .maybeSingle<{ slug: string }>()
        .then(({ data }) => {
          if (data?.slug) {
            navigate(`/c/${data.slug}/admin`, { replace: true });
          } else {
            navigate('/communities', { replace: true });
          }
        });
    }
  }, [authLoading, user, hasToken, memberships, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <RequireAuth>
      <RequireLicenseToken>
        <SetupCommunityForm />
      </RequireLicenseToken>
    </RequireAuth>
  );
}

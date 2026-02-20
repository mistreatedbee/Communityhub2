import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { getLicenseToken, getLicenseKey, clearLicenseSession } from '../../utils/licenseToken';
import { RequireAuth } from '../../components/auth/RequireAuth';
import { RequireLicenseToken } from '../../components/auth/RequireLicenseToken';
import { Spinner } from '../../components/ui/Spinner';
import { apiClient, getToken, getApiBaseUrl } from '../../lib/apiClient';

type ClaimResult = { tenant: { slug: string }; redirectSlug: string };

const SECTION_OPTIONS: { key: string; label: string }[] = [
  { key: 'announcements', label: 'Announcements' },
  { key: 'resources', label: 'Resources' },
  { key: 'groups', label: 'Groups' },
  { key: 'events', label: 'Events' },
  { key: 'programs', label: 'Programs' }
];

const DEFAULT_SECTIONS = SECTION_OPTIONS.map((s) => s.key);

function SetupCommunityForm() {
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFileId, setLogoFileId] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [enabledSections, setEnabledSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const toggleSection = (key: string) => {
    setEnabledSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getToken();
    if (!token) {
      addToast('Please sign in to upload a logo.', 'error');
      return;
    }
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/upload/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Upload failed');
      }
      const data = await res.json();
      const fileId = data?.data?.fileId ?? data?.fileId ?? '';
      setLogoFileId(fileId);
      if (fileId) addToast('Logo uploaded.', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Logo upload failed.', 'error');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

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
      const result = await apiClient<ClaimResult>('/api/onboarding/claim', {
        method: 'POST',
        body: JSON.stringify({
          licenseKey,
          tenant: {
            name,
            slug,
            description: description.trim() || '',
            logoUrl: logoUrl.trim() || '',
            logoFileId: logoFileId.trim() || '',
            primaryColor: primaryColor.trim() || '',
            secondaryColor: secondaryColor.trim() || '',
            enabledSections: enabledSections.length > 0 ? enabledSections : DEFAULT_SECTIONS,
            category: category.trim() || '',
            location: location.trim() || ''
          }
        })
      });

      clearLicenseSession();
      addToast('Community created. Welcome to your admin dashboard.', 'success');
      navigate(`/c/${result.redirectSlug}/admin`, { replace: true });
    } catch (err) {
      console.error('Claim license error', err);
      addToast(err instanceof Error ? err.message : 'Something went wrong. Please try again.', 'error');
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
                label="Short description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief tagline for your community"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <div className="space-y-2">
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Logo URL (optional)"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleLogoFile}
                      disabled={uploadingLogo}
                      className="block w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {uploadingLogo && <span className="text-sm text-gray-500">Uploading…</span>}
                    {logoFileId && <span className="text-sm text-green-600">Uploaded</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sections to enable</label>
                <p className="text-xs text-gray-500 mb-2">Choose which areas appear in your community nav.</p>
                <div className="flex flex-wrap gap-4">
                  {SECTION_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabledSections.includes(key)}
                        onChange={() => toggleSection(key)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
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
      (m) => m.status === 'ACTIVE' && (m.role === 'OWNER' || m.role === 'ADMIN')
    );
    if (ownerOrAdminMembership) {
      navigate('/communities', { replace: true });
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

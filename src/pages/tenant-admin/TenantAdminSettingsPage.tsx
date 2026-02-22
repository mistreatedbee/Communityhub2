import React, { useEffect, useRef, useState } from 'react';
import {
  Save,
  Palette,
  Users,
  Settings,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/apiClient';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { uploadLogo } from '../../lib/tenantUpload';
import { validateImageFile } from '../../lib/uploadValidation';

const SECTION_OPTIONS = [
  { key: 'announcements', label: 'Announcements' },
  { key: 'resources', label: 'Files' },
  { key: 'groups', label: 'Groups' },
  { key: 'events', label: 'Events' },
  { key: 'programs', label: 'Programs' },
];

type Settings = {
  publicSignup: boolean;
  approvalRequired: boolean;
  registrationFieldsEnabled: boolean;
  membersCanShareInviteLinks?: boolean;
  enabledSections?: string[];
};

type HomeSettings = {
  theme?: { primaryColor?: string; secondaryColor?: string; logoUrl?: string };
  sections?: unknown;
};

type TenantProfile = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  logoFileId?: string;
  category?: string;
  location?: string;
};

export function TenantAdminSettingsPage() {
  const { tenant, refresh } = useTenant();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [theme, setTheme] = useState<{ primaryColor: string; secondaryColor: string }>({
    primaryColor: '',
    secondaryColor: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      try {
        const [profileData, settingsData, homeData] = await Promise.all([
          apiClient<TenantProfile>(`/api/tenants/id/${tenant.id}`),
          tenantFeaturesGet<Settings>(tenant.id, '/settings'),
          tenantFeaturesGet<HomeSettings>(tenant.id, '/home-settings').catch(() => null),
        ]);
        setProfile(profileData);
        setSettings(settingsData);
        if (homeData?.theme) {
          setTheme({
            primaryColor: homeData.theme.primaryColor ?? '',
            secondaryColor: homeData.theme.secondaryColor ?? '',
          });
        }
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenant?.id, addToast]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreviewUrl(null);
      return;
    }
    const result = validateImageFile(file);
    if (!result.valid) {
      addToast(result.error, 'error');
      e.target.value = '';
      return;
    }
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(null);
    setLogoRemoved(true);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const saveProfile = async () => {
    if (!tenant?.id || !profile) return;
    setProfileSaving(true);
    try {
      let logoFileId: string | undefined;
      if (logoFile) {
        const result = await uploadLogo(logoFile);
        logoFileId = result.fileId;
      } else if (logoRemoved) {
        logoFileId = '';
      } else {
        logoFileId = profile.logoFileId ?? '';
      }
      await apiClient(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          description: profile.description ?? '',
          logoFileId,
          category: profile.category ?? '',
          location: profile.location ?? '',
        }),
      });
      addToast('Community profile updated successfully.', 'success');
      setLogoFile(null);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
      setLogoRemoved(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
      await refresh();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update community profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!tenant?.id || !settings) return;
    setSettingsSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, '/settings', settings);
      addToast('Registration settings saved successfully.', 'success');
      await refresh();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to save settings', 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const saveTheme = async () => {
    if (!tenant?.id) return;
    setThemeSaving(true);
    try {
      const current = await tenantFeaturesGet<HomeSettings>(tenant.id, '/home-settings');
      await tenantFeaturesPut(tenant.id, '/home-settings', {
        ...current,
        theme: {
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          logoUrl: current?.theme?.logoUrl ?? '',
        },
      });
      addToast('Brand colors saved successfully.', 'success');
      await refresh();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to save brand colors', 'error');
    } finally {
      setThemeSaving(false);
    }
  };

  const toggleSection = (key: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const sections = prev.enabledSections ?? SECTION_OPTIONS.map((s) => s.key);
      const next = sections.includes(key)
        ? sections.filter((s) => s !== key)
        : [...sections, key];
      return { ...prev, enabledSections: next };
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="space-y-6 relative animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!settings || !profile) {
    return (
      <>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">Settings not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="space-y-8 relative">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Community Profile & Settings
        </h1>

        {/* Community Profile */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-primary)]" />
            Community profile
          </h2>
          <p className="text-sm text-gray-500">
            Name, description, and logo appear on your public community page.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Community name"
              value={profile.name}
              onChange={(e) => setProfile((p) => (p ? { ...p, name: e.target.value } : p))}
              placeholder="My Community"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Community logo</label>
              <p className="text-xs text-gray-500 mb-2">Upload from your device (JPEG, PNG, WebP, or GIF, max 5 MB)</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleLogoChange}
              />
              <div className="flex flex-wrap items-center gap-3">
                {(logoPreviewUrl || (tenant?.logo_url && !logoRemoved)) && (
                  <div className="relative inline-block">
                    <img
                      src={logoPreviewUrl ?? tenant?.logo_url ?? ''}
                      alt="Logo preview"
                      className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                      aria-label="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreviewUrl || (tenant?.logo_url && !logoRemoved) ? 'Replace' : 'Choose file'}
                </Button>
              </div>
            </div>
            <Input
              label="Description"
              value={profile.description ?? ''}
              onChange={(e) => setProfile((p) => (p ? { ...p, description: e.target.value } : p))}
              placeholder="Short description for your community"
              className="md:col-span-2"
            />
            <Input
              label="Category (optional)"
              value={profile.category ?? ''}
              onChange={(e) => setProfile((p) => (p ? { ...p, category: e.target.value } : p))}
              placeholder="e.g., Technology, Wellness"
            />
            <Input
              label="Location (optional)"
              value={profile.location ?? ''}
              onChange={(e) => setProfile((p) => (p ? { ...p, location: e.target.value } : p))}
              placeholder="e.g., New York, NY"
            />
          </div>
          <Button
            onClick={() => void saveProfile()}
            isLoading={profileSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Save community profile
          </Button>
        </div>

        {/* Registration Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--color-primary)]" />
            Registration settings
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.publicSignup}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, publicSignup: e.target.checked } : prev))
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span className="text-sm text-gray-700">Allow directory/public signup</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.approvalRequired}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, approvalRequired: e.target.checked } : prev
                  )
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span className="text-sm text-gray-700">Require admin approval for new members</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registrationFieldsEnabled}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, registrationFieldsEnabled: e.target.checked } : prev
                  )
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span className="text-sm text-gray-700">Enable custom registration fields</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.membersCanShareInviteLinks ?? false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, membersCanShareInviteLinks: e.target.checked } : prev
                  )
                }
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
              />
              <span className="text-sm text-gray-700">Allow members to share community</span>
            </label>
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium text-gray-700 mb-3">Sections to show in navigation</p>
            <div className="flex flex-wrap gap-4">
              {SECTION_OPTIONS.map(({ key, label }) => {
                const isChecked = (settings.enabledSections ?? SECTION_OPTIONS.map((s) => s.key)).includes(key);
                return (
                  <label key={key} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSection(key)}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <Button
            onClick={() => void saveSettings()}
            isLoading={settingsSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Save registration settings
          </Button>
        </div>

        {/* Brand Colors */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--color-primary)]" />
            Brand colors
          </h2>
          <p className="text-sm text-gray-500">
            Primary and secondary colors used across the community (headers, buttons, links).
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            {/* Primary color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary color</label>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={theme.primaryColor || '#6366f1'}
                    onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-300 shadow-sm"
                    style={{ backgroundColor: theme.primaryColor || '#6366f1' }}
                  />
                </div>
                <Input
                  value={theme.primaryColor}
                  onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
            {/* Secondary color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary color</label>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={theme.secondaryColor || '#8b5cf6'}
                    onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-300 shadow-sm"
                    style={{ backgroundColor: theme.secondaryColor || '#8b5cf6' }}
                  />
                </div>
                <Input
                  value={theme.secondaryColor}
                  onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))}
                  placeholder="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => void saveTheme()}
            isLoading={themeSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Save brand colors
          </Button>
        </div>
      </div>
    </>
  );
}

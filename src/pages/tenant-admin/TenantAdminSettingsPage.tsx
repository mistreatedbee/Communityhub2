import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/apiClient';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

const SECTION_OPTIONS = [
  { key: 'announcements', label: 'Announcements' },
  { key: 'resources', label: 'Files' },
  { key: 'groups', label: 'Groups' },
  { key: 'events', label: 'Events' },
  { key: 'programs', label: 'Programs' }
];

type Settings = {
  publicSignup: boolean;
  approvalRequired: boolean;
  registrationFieldsEnabled: boolean;
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
  category?: string;
  location?: string;
};

export function TenantAdminSettingsPage() {
  const { tenant, refresh } = useTenant();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [theme, setTheme] = useState<{ primaryColor: string; secondaryColor: string }>({ primaryColor: '', secondaryColor: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      try {
        const [profileData, settingsData, homeData] = await Promise.all([
          apiClient<TenantProfile>(`/api/tenants/id/${tenant.id}`),
          tenantFeaturesGet<Settings>(tenant.id, '/settings'),
          tenantFeaturesGet<HomeSettings>(tenant.id, '/home-settings').catch(() => null)
        ]);
        setProfile(profileData);
        setSettings(settingsData);
        if (homeData?.theme) {
          setTheme({
            primaryColor: homeData.theme.primaryColor ?? '',
            secondaryColor: homeData.theme.secondaryColor ?? ''
          });
        }
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Failed to load settings', 'error');
      }
    };
    void load();
  }, [tenant?.id, addToast]);

  const saveProfile = async () => {
    if (!tenant?.id || !profile) return;
    setProfileSaving(true);
    try {
      await apiClient(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          description: profile.description ?? '',
          logoUrl: profile.logoUrl ?? '',
          category: profile.category ?? '',
          location: profile.location ?? ''
        })
      });
      addToast('Community profile updated successfully.', 'success');
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
          logoUrl: current?.theme?.logoUrl ?? ''
        }
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
      const next = sections.includes(key) ? sections.filter((s) => s !== key) : [...sections, key];
      return { ...prev, enabledSections: next };
    });
  };

  if (!settings || !profile) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Community Profile &amp; Settings</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Community profile</h2>
        <p className="text-sm text-gray-500">Name, description, and logo appear on your public community page.</p>
        <Input
          label="Community name"
          value={profile.name}
          onChange={(e) => setProfile((p) => (p ? { ...p, name: e.target.value } : p))}
        />
        <Input
          label="Description"
          value={profile.description ?? ''}
          onChange={(e) => setProfile((p) => (p ? { ...p, description: e.target.value } : p))}
          placeholder="Short description for your community"
        />
        <Input
          label="Logo URL"
          value={profile.logoUrl ?? ''}
          onChange={(e) => setProfile((p) => (p ? { ...p, logoUrl: e.target.value } : p))}
          placeholder="https://..."
        />
        <Input
          label="Category (optional)"
          value={profile.category ?? ''}
          onChange={(e) => setProfile((p) => (p ? { ...p, category: e.target.value } : p))}
        />
        <Input
          label="Location (optional)"
          value={profile.location ?? ''}
          onChange={(e) => setProfile((p) => (p ? { ...p, location: e.target.value } : p))}
        />
        <Button onClick={() => void saveProfile()} isLoading={profileSaving}>
          Save community profile
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Registration settings</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.publicSignup}
            onChange={(e) => setSettings((prev) => (prev ? { ...prev, publicSignup: e.target.checked } : prev))}
          />
          <span className="text-sm text-gray-700">Allow directory/public signup</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.approvalRequired}
            onChange={(e) => setSettings((prev) => (prev ? { ...prev, approvalRequired: e.target.checked } : prev))}
          />
          <span className="text-sm text-gray-700">Require admin approval for new members</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.registrationFieldsEnabled}
            onChange={(e) =>
              setSettings((prev) => (prev ? { ...prev, registrationFieldsEnabled: e.target.checked } : prev))
            }
          />
          <span className="text-sm text-gray-700">Enable custom registration fields</span>
        </label>
        <div className="pt-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Sections to show in nav</p>
          <div className="flex flex-wrap gap-4">
            {SECTION_OPTIONS.map(({ key, label }) => (
              <label key={key} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings.enabledSections ?? SECTION_OPTIONS.map((s) => s.key)).includes(key)}
                  onChange={() => toggleSection(key)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <Button onClick={() => void saveSettings()} isLoading={settingsSaving}>
          Save registration settings
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Brand colors</h2>
        <p className="text-sm text-gray-500">Primary and secondary colors used across the community.</p>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.primaryColor || '#6366f1'}
                onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={theme.primaryColor}
                onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                placeholder="#6366f1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.secondaryColor || '#8b5cf6'}
                onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))}
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={theme.secondaryColor}
                onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))}
                placeholder="#8b5cf6"
              />
            </div>
          </div>
        </div>
        <Button onClick={() => void saveTheme()} isLoading={themeSaving}>
          Save brand colors
        </Button>
      </div>
    </div>
  );
}

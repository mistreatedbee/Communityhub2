import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/apiClient';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Settings = {
  publicSignup: boolean;
  approvalRequired: boolean;
  registrationFieldsEnabled: boolean;
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
  const [profileSaving, setProfileSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      try {
        const [profileData, settingsData] = await Promise.all([
          apiClient<TenantProfile>(`/api/tenants/id/${tenant.id}`),
          tenantFeaturesGet<Settings>(tenant.id, '/settings')
        ]);
        setProfile(profileData);
        setSettings(settingsData);
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
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to save settings', 'error');
    } finally {
      setSettingsSaving(false);
    }
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
        <Button onClick={() => void saveSettings()} isLoading={settingsSaving}>
          Save registration settings
        </Button>
      </div>
    </div>
  );
}

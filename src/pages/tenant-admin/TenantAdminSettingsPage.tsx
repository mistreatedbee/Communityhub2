import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Settings = {
  publicSignup: boolean;
  approvalRequired: boolean;
  registrationFieldsEnabled: boolean;
};

export function TenantAdminSettingsPage() {
  const { tenant } = useTenant();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      const data = await tenantFeaturesGet<Settings>(tenant.id, '/settings');
      setSettings(data);
    };
    void load();
  }, [tenant?.id]);

  const save = async () => {
    if (!tenant?.id || !settings) return;
    setSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, '/settings', settings);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <p className="text-sm text-gray-500">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Community Settings</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
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
        <Button onClick={() => void save()} isLoading={saving}>Save settings</Button>
      </div>
    </div>
  );
}

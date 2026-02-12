import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Settings = {
  _id: string;
  publicSignup: boolean;
  approvalRequired: boolean;
  registrationFieldsEnabled: boolean;
};

export function TenantAdminOnboardingPage() {
  const { tenant } = useTenant();
  const [settings, setSettings] = useState<Settings | null>(null);

  const load = async () => {
    if (!tenant?.id) return;
    setSettings(await tenantFeaturesGet<Settings>(tenant.id, '/settings'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const save = async () => {
    if (!tenant?.id || !settings) return;
    setSettings(await tenantFeaturesPut<Settings>(tenant.id, '/settings', settings));
  };

  if (!settings) return <p className="text-sm text-gray-500">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Onboarding Settings</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={settings.publicSignup} onChange={(e) => setSettings({ ...settings, publicSignup: e.target.checked })} />
          Public signup enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={settings.approvalRequired} onChange={(e) => setSettings({ ...settings, approvalRequired: e.target.checked })} />
          Approval required
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={settings.registrationFieldsEnabled} onChange={(e) => setSettings({ ...settings, registrationFieldsEnabled: e.target.checked })} />
          Registration fields enabled
        </label>
        <Button onClick={() => void save()}>Save settings</Button>
      </div>
    </div>
  );
}

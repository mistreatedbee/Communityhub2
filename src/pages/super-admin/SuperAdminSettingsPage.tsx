import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

type SettingsState = {
  platformName: string;
  supportEmail: string;
  termsUrl: string;
  privacyUrl: string;
};

const STORAGE_KEY = 'communityhub:platform_settings';

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('missing');
    return JSON.parse(raw) as SettingsState;
  } catch {
    return {
      platformName: 'CommunityHub',
      supportEmail: 'ashleymashigo013@gmail.com',
      termsUrl: '',
      privacyUrl: ''
    };
  }
}

export function SuperAdminSettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(loadSettings());

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    addToast('Settings saved locally.', 'success');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500">Global display settings.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <Input label="Platform name" value={settings.platformName} onChange={(e) => setSettings({ ...settings, platformName: e.target.value })} />
        <Input label="Support email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
        <Input label="Terms URL" value={settings.termsUrl} onChange={(e) => setSettings({ ...settings, termsUrl: e.target.value })} />
        <Input label="Privacy URL" value={settings.privacyUrl} onChange={(e) => setSettings({ ...settings, privacyUrl: e.target.value })} />
        <Button onClick={save}>Save settings</Button>
      </div>
    </div>
  );
}

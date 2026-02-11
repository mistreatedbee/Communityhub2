import React, { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';

type SettingsRow = {
  id: string;
  platform_name: string;
  support_email: string | null;
  terms_url: string | null;
  privacy_url: string | null;
};

function isValidUrl(s: string): boolean {
  if (!s.trim()) return true;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export function SuperAdminSettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('id, platform_name, support_email, terms_url, privacy_url')
      .limit(1)
      .maybeSingle<SettingsRow>();
    setLoading(false);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setSettings(data ?? null);
  }, []);

  const createDefault = useCallback(async () => {
    setCreating(true);
    setCreateError(null);
    const { data, error } = await supabase
      .from('platform_settings')
      .insert({ platform_name: 'CommunityHub' })
      .select('id, platform_name, support_email, terms_url, privacy_url')
      .maybeSingle<SettingsRow>();
    setCreating(false);
    if (error) {
      setCreateError(error.message);
      return;
    }
    setSettings(data ?? null);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!settings) return;
    const name = settings.platform_name?.trim() ?? '';
    if (!name) {
      addToast('Platform name is required.', 'error');
      return;
    }
    if (settings.terms_url && !isValidUrl(settings.terms_url)) {
      addToast('Terms URL must be a valid URL.', 'error');
      return;
    }
    if (settings.privacy_url && !isValidUrl(settings.privacy_url)) {
      addToast('Privacy URL must be a valid URL.', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('platform_settings').upsert(settings);
    setSaving(false);
    if (error) {
      addToast(error.message ? `Unable to save: ${error.message}` : 'Unable to save settings.', 'error');
      return;
    }
    addToast('Settings saved.', 'success');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Spinner />
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl space-y-4">
        <p className="text-red-600">{loadError}</p>
        <Button onClick={() => void load()}>Retry</Button>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-2xl space-y-4">
        {creating ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <Spinner />
            <p className="text-gray-500">Initializing settings...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600">No settings row found. Create the default settings.</p>
            {createError && <p className="text-red-600">{createError}</p>}
            <Button onClick={() => void createDefault()}>Create default settings</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500">Configure global settings and policies.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <Input
          label="Platform name"
          value={settings.platform_name}
          onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
        />
        <Input
          label="Support email"
          type="email"
          value={settings.support_email ?? ''}
          onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
        />
        <Input
          label="Terms URL"
          value={settings.terms_url ?? ''}
          onChange={(e) => setSettings({ ...settings, terms_url: e.target.value })}
        />
        <Input
          label="Privacy URL"
          value={settings.privacy_url ?? ''}
          onChange={(e) => setSettings({ ...settings, privacy_url: e.target.value })}
        />
        <Button onClick={() => void handleSave()} isLoading={saving}>
          Save settings
        </Button>
      </div>
    </div>
  );
}

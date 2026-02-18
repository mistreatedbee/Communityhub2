import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Resource = {
  _id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  moduleId?: string;
  programId?: string;
};

export function TenantAdminResourceEditPage() {
  const { tenant } = useTenant();
  const { tenantSlug, resourceId } = useParams<{ tenantSlug: string; resourceId: string }>();
  const { addToast } = useToast();
  const [resource, setResource] = useState<Resource | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('link');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!tenant?.id || !resourceId) return;
    try {
      const data = await tenantFeaturesGet<Resource>(tenant.id, `/resources/${resourceId}`);
      setResource(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setUrl(data.url || '');
      setType(data.type || 'link');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load resource', 'error');
    }
  }, [tenant?.id, resourceId, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!tenant?.id || !resourceId) return;
    setSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/resources/${resourceId}`, {
        title,
        description,
        url,
        type
      });
      addToast('Resource updated successfully.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update resource', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!resource) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading resource...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/c/${tenantSlug}/admin/resources`}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to Resources
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Edit resource</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select className="w-full rounded-lg border border-gray-300 p-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="link">Link</option>
          <option value="file">File</option>
        </select>
        <Button onClick={() => void save()} isLoading={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

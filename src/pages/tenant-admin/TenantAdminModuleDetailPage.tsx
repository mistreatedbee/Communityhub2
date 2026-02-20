import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import {
  tenantFeaturesGet,
  tenantFeaturesPost,
  tenantFeaturesPut,
  tenantFeaturesDelete
} from '../../lib/tenantFeatures';

type Module = { _id: string; programId: string; title: string; description?: string };
type Resource = { _id: string; title: string; description?: string; url?: string };
type ModuleDetailPayload = { module: Module; resources: Resource[] };

export function TenantAdminModuleDetailPage() {
  const { tenant } = useTenant();
  const { tenantSlug, programId, moduleId } = useParams<{ tenantSlug: string; programId: string; moduleId: string }>();
  const { addToast } = useToast();
  const [data, setData] = useState<ModuleDetailPayload | null>(null);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [addResourceId, setAddResourceId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!tenant?.id || !programId || !moduleId) return;
    try {
      const [detail, resourcesList] = await Promise.all([
        tenantFeaturesGet<ModuleDetailPayload>(tenant.id, `/programs/${programId}/modules/${moduleId}`),
        tenantFeaturesGet<Resource[]>(tenant.id, '/resources')
      ]);
      setData(detail);
      setAllResources(resourcesList);
      setEditTitle(detail.module.title);
      setEditDescription(detail.module.description || '');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load section', 'error');
    }
  }, [tenant?.id, programId, moduleId, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveModule = async () => {
    if (!tenant?.id || !programId || !moduleId) return;
    setSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/programs/${programId}/modules/${moduleId}`, {
        title: editTitle,
        description: editDescription
      });
      addToast('Section updated successfully.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addResource = async () => {
    if (!tenant?.id || !programId || !moduleId || !addResourceId) return;
    try {
      await tenantFeaturesPost(tenant.id, `/programs/${programId}/modules/${moduleId}/resources`, {
        resourceId: addResourceId
      });
      addToast('File added to section.', 'success');
      setAddResourceId('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to add file', 'error');
    }
  };

  const removeResource = async (resourceId: string) => {
    if (!tenant?.id || !programId || !moduleId) return;
    try {
      await tenantFeaturesDelete(
        tenant.id,
        `/programs/${programId}/modules/${moduleId}/resources/${resourceId}`
      );
      addToast('File removed from section.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to remove resource', 'error');
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading section...</p>
      </div>
    );
  }

  const resourceIdsInModule = data.resources.map((r) => r._id);
  const availableResources = allResources.filter((r) => !resourceIdsInModule.includes(r._id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/c/${tenantSlug}/admin/programs/${programId}`}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to Program
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Section: {data.module.title}</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Edit section</h2>
        <Input label="Name" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <Input
          label="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
        />
        <Button onClick={() => void saveModule()} isLoading={saving}>
          Save changes
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Files in this section</h2>
        {data.resources.length > 0 ? (
          <ul className="space-y-2">
            {data.resources.map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-2">
                <Link
                  to={`/c/${tenantSlug}/admin/resources/${r._id}`}
                  className="text-[var(--color-primary)] hover:underline font-medium"
                >
                  {r.title}
                </Link>
                <Button variant="ghost" size="sm" onClick={() => void removeResource(r._id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No files in this section yet.</p>
        )}
        {availableResources.length > 0 && (
          <div className="flex gap-2 items-end pt-2">
            <select
              className="flex-1 rounded-lg border border-gray-300 p-2"
              value={addResourceId}
              onChange={(e) => setAddResourceId(e.target.value)}
            >
              <option value="">Select resource</option>
              {availableResources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title}
                </option>
              ))}
            </select>
            <Button onClick={() => void addResource()} disabled={!addResourceId}>
              Add file to section
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

type Program = { _id: string; title: string; description: string; status?: string };
type Module = { _id: string; programId: string; title: string; description?: string };
type Assignment = { _id: string; programId: string; groupId: string };
type GroupRow = { _id: string; name: string; description?: string };

type ProgramDetailPayload = { program: Program; modules: Module[]; assignments: Assignment[] };

export function TenantAdminProgramDetailPage() {
  const { tenant } = useTenant();
  const { tenantSlug, programId } = useParams<{ tenantSlug: string; programId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState<ProgramDetailPayload | null>(null);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [assignGroupId, setAssignGroupId] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!tenant?.id || !programId) return;
    try {
      const [detail, groupsData] = await Promise.all([
        tenantFeaturesGet<ProgramDetailPayload>(tenant.id, `/programs/${programId}`),
        tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups')
      ]);
      setData(detail);
      setGroups(groupsData);
      setEditTitle(detail.program.title);
      setEditDescription(detail.program.description || '');
      setEditStatus((detail.program as Program).status || 'ACTIVE');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load program', 'error');
    }
  }, [tenant?.id, programId, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveProgram = async () => {
    if (!tenant?.id || !programId) return;
    setSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/programs/${programId}`, {
        title: editTitle,
        description: editDescription,
        status: editStatus
      });
      addToast('Program updated successfully.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update program', 'error');
    } finally {
      setSaving(false);
    }
  };

  const assignGroup = async () => {
    if (!tenant?.id || !programId || !assignGroupId) return;
    try {
      await tenantFeaturesPost(tenant.id, '/programs/assign', { programId, groupId: assignGroupId });
      addToast('Program assigned to group.', 'success');
      setAssignGroupId('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to assign program', 'error');
    }
  };

  const unassignGroup = async (groupId: string) => {
    if (!tenant?.id || !programId) return;
    try {
      await tenantFeaturesDelete(tenant.id, '/programs/assign', { body: { programId, groupId } });
      addToast('Program unassigned from group.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to unassign', 'error');
    }
  };

  const createModule = async () => {
    if (!tenant?.id || !programId || !moduleTitle.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/programs/modules', {
        programId,
        title: moduleTitle,
        order: (data?.modules?.length ?? 0)
      });
      addToast('Module created successfully.', 'success');
      setModuleTitle('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create module', 'error');
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading program...</p>
      </div>
    );
  }

  const assignedGroupIds = data.assignments.map((a) => a.groupId);
  const assignedGroups = groups.filter((g) => assignedGroupIds.includes(g._id));
  const availableGroups = groups.filter((g) => !assignedGroupIds.includes(g._id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/c/${tenantSlug}/admin/programs`}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to Programs
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Program: {data.program.title}</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Edit program</h2>
        <Input label="Name" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <Input
          label="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
        />
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          className="w-full rounded-lg border border-gray-300 p-2"
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value)}
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
        </select>
        <Button onClick={() => void saveProgram()} isLoading={saving}>
          Save changes
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Assigned groups</h2>
        {assignedGroups.length > 0 && (
          <ul className="space-y-2">
            {assignedGroups.map((g) => (
              <li key={g._id} className="flex items-center justify-between gap-2">
                <Link
                  to={`/c/${tenantSlug}/admin/groups/${g._id}`}
                  className="text-[var(--color-primary)] hover:underline font-medium"
                >
                  {g.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={() => void unassignGroup(g._id)}>
                  Unassign
                </Button>
              </li>
            ))}
          </ul>
        )}
        {availableGroups.length > 0 && (
          <div className="flex gap-2 items-end">
            <select
              className="flex-1 rounded-lg border border-gray-300 p-2"
              value={assignGroupId}
              onChange={(e) => setAssignGroupId(e.target.value)}
            >
              <option value="">Select group</option>
              {availableGroups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
            <Button onClick={() => void assignGroup()} disabled={!assignGroupId}>
              Assign program to group
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Modules</h2>
        {data.modules.length > 0 && (
          <ul className="space-y-2">
            {data.modules.map((m) => (
              <li key={m._id}>
                <Link
                  to={`/c/${tenantSlug}/admin/programs/${programId}/modules/${m._id}`}
                  className="text-[var(--color-primary)] hover:underline font-medium"
                >
                  {m.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 items-end">
          <Input
            label="New module title"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Module name"
            className="flex-1"
          />
          <Button onClick={() => void createModule()} disabled={!moduleTitle.trim()}>
            Add module
          </Button>
        </div>
      </div>
    </div>
  );
}

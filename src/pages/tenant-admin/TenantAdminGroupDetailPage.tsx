import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import {
  tenantFeaturesDelete,
  tenantFeaturesGet,
  tenantFeaturesPost,
  tenantFeaturesPut
} from '../../lib/tenantFeatures';

type Group = { _id: string; name: string; description: string; isPrivate?: boolean };
type Program = { _id: string; title: string; description?: string };
type GroupDetailPayload = { group: Group; assignments: { programId: string }[]; programs: Program[] };
type GroupMember = {
  _id: string;
  userId: { _id: string; email: string; fullName: string } | null;
  role: string;
  createdAt: string;
};
type GroupResource = { _id: string; title: string; description?: string };

export function TenantAdminGroupDetailPage() {
  const { tenant } = useTenant();
  const { tenantSlug, groupId } = useParams<{ tenantSlug: string; groupId: string }>();
  const { addToast } = useToast();
  const [data, setData] = useState<GroupDetailPayload | null>(null);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [groupResources, setGroupResources] = useState<GroupResource[]>([]);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [assignProgramId, setAssignProgramId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!tenant?.id || !groupId) return;
    try {
      const [detail, programsPayload, membersList, resourcesList] = await Promise.all([
        tenantFeaturesGet<GroupDetailPayload>(tenant.id, `/groups/${groupId}`),
        tenantFeaturesGet<{ programs: Program[] }>(tenant.id, '/programs'),
        tenantFeaturesGet<GroupMember[]>(tenant.id, `/groups/${groupId}/members`).catch(() => []),
        tenantFeaturesGet<GroupResource[]>(tenant.id, `/groups/${groupId}/resources`).catch(() => [])
      ]);
      setData(detail);
      setAllPrograms(programsPayload?.programs ?? []);
      setMembers(Array.isArray(membersList) ? membersList : []);
      setGroupResources(Array.isArray(resourcesList) ? resourcesList : []);
      setEditName(detail.group.name);
      setEditDescription(detail.group.description || '');
      setEditIsPrivate(!!detail.group.isPrivate);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load group', 'error');
    }
  }, [tenant?.id, groupId, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveGroup = async () => {
    if (!tenant?.id || !groupId) return;
    setSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/groups/${groupId}`, {
        name: editName,
        description: editDescription,
        isPrivate: editIsPrivate
      });
      addToast('Group updated successfully.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update group', 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!tenant?.id || !groupId) return;
    try {
      await tenantFeaturesDelete(tenant.id, `/groups/${groupId}/members/${userId}`);
      addToast('Member removed from group', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to remove member', 'error');
    }
  };

  const assignProgram = async () => {
    if (!tenant?.id || !groupId || !assignProgramId) return;
    try {
      await tenantFeaturesPost(tenant.id, '/programs/assign', { programId: assignProgramId, groupId });
      addToast('Program assigned to group.', 'success');
      setAssignProgramId('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to assign program', 'error');
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">Loading group...</p>
      </div>
    );
  }

  const assignedProgramIds = data.assignments?.map((a) => a.programId) ?? [];
  const assignedPrograms = data.programs ?? [];
  const availablePrograms = allPrograms.filter((p) => !assignedProgramIds.includes(p._id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/c/${tenantSlug}/admin/groups`}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to Groups
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Group: {data.group.name}</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Edit group</h2>
        <Input label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
        <Input
          label="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Who can see this group?</p>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="privacy"
              checked={!editIsPrivate}
              onChange={() => setEditIsPrivate(false)}
            />
            Everyone in the community (public)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="privacy"
              checked={editIsPrivate}
              onChange={() => setEditIsPrivate(true)}
            />
            Only members of this group (members-only)
          </label>
        </div>
        <Button onClick={() => void saveGroup()} isLoading={saving}>
          Save changes
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Group members</h2>
        {members.length > 0 ? (
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m._id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-900">
                  {m.userId?.fullName || m.userId?.email || 'Unknown'} {m.role === 'LEADER' ? '(Leader)' : ''}
                </span>
                {m.userId && (
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => void removeMember(m.userId!._id)}>
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No members yet. Members join from the member app.</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Files in this group</h2>
        {groupResources.length > 0 ? (
          <ul className="space-y-2">
            {groupResources.map((r) => (
              <li key={r._id}>
                <Link
                  to={`/c/${tenantSlug}/admin/resources/${r._id}`}
                  className="text-[var(--color-primary)] hover:underline font-medium"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No files in this group yet.</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Assigned programs</h2>
        {assignedPrograms.length > 0 ? (
          <ul className="space-y-2">
            {assignedPrograms.map((p) => (
              <li key={p._id}>
                <Link
                  to={`/c/${tenantSlug}/admin/programs/${p._id}`}
                  className="text-[var(--color-primary)] hover:underline font-medium"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No programs assigned yet.</p>
        )}
        {availablePrograms.length > 0 && (
          <div className="flex gap-2 items-end pt-2">
            <select
              className="flex-1 rounded-lg border border-gray-300 p-2"
              value={assignProgramId}
              onChange={(e) => setAssignProgramId(e.target.value)}
            >
              <option value="">Select program</option>
              {availablePrograms.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            <Button onClick={() => void assignProgram()} disabled={!assignProgramId}>
              Assign program
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

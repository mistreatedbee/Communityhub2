import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Users,
  FileText,
  BookOpen,
  Globe,
  Lock,
  ChevronRight,
  UserMinus,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import {
  tenantFeaturesDelete,
  tenantFeaturesGet,
  tenantFeaturesPost,
  tenantFeaturesPut,
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
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const [detail, programsPayload, membersList, resourcesList] = await Promise.all([
        tenantFeaturesGet<GroupDetailPayload>(tenant.id, `/groups/${groupId}`),
        tenantFeaturesGet<{ programs: Program[] }>(tenant.id, '/programs'),
        tenantFeaturesGet<GroupMember[]>(tenant.id, `/groups/${groupId}/members`).catch(() => []),
        tenantFeaturesGet<GroupResource[]>(tenant.id, `/groups/${groupId}/resources`).catch(() => []),
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
    } finally {
      setLoading(false);
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
        isPrivate: editIsPrivate,
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

  // Loading skeleton
  if (loading) {
    return (
      <>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="space-y-6 relative animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">Group not found.</p>
        </div>
      </>
    );
  }

  const assignedProgramIds = data.assignments?.map((a) => a.programId) ?? [];
  const assignedPrograms = data.programs ?? [];
  const availablePrograms = allPrograms.filter((p) => !assignedProgramIds.includes(p._id));

  return (
    <>
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="space-y-6 relative">
        {/* Back navigation */}
        <div className="flex items-center gap-2">
          <Link
            to={`/c/${tenantSlug}/admin/groups`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Groups
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Group: {data.group.name}
        </h1>

        {/* Edit group section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Save className="w-5 h-5 text-[var(--color-primary)]" />
            Edit group
          </h2>
          <Input
            label="Group name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g., Marketing Team"
            required
          />
          <Input
            label="Description (optional)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="What is this group about?"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50/50 transition">
                <input
                  type="radio"
                  name="privacy"
                  checked={!editIsPrivate}
                  onChange={() => setEditIsPrivate(false)}
                  className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Public</p>
                  <p className="text-xs text-gray-500">Anyone in the community can see and join</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50/50 transition">
                <input
                  type="radio"
                  name="privacy"
                  checked={editIsPrivate}
                  onChange={() => setEditIsPrivate(true)}
                  className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                />
                <Lock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Private</p>
                  <p className="text-xs text-gray-500">Only members of the group can see it</p>
                </div>
              </label>
            </div>
          </div>
          <Button
            onClick={() => void saveGroup()}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Save changes
          </Button>
        </div>

        {/* Group members section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-primary)]" />
            Group members
          </h2>
          {members.length > 0 ? (
            <ul className="space-y-2">
              {members.map((m) => (
                <li
                  key={m._id}
                  className="flex items-center justify-between gap-2 py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {m.userId?.fullName || m.userId?.email || 'Unknown'}
                    </p>
                    {m.role === 'LEADER' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        Leader
                      </span>
                    )}
                  </div>
                  {m.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void removeMember(m.userId!._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      leftIcon={<UserMinus className="w-4 h-4" />}
                    >
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

        {/* Files in this group section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            Files in this group
          </h2>
          {groupResources.length > 0 ? (
            <ul className="space-y-2">
              {groupResources.map((r) => (
                <li key={r._id}>
                  <Link
                    to={`/c/${tenantSlug}/admin/resources/${r._id}`}
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium"
                  >
                    {r.title}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No files in this group yet.</p>
          )}
        </div>

        {/* Assigned programs section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
            Assigned programs
          </h2>
          {assignedPrograms.length > 0 ? (
            <ul className="space-y-2">
              {assignedPrograms.map((p) => (
                <li key={p._id}>
                  <Link
                    to={`/c/${tenantSlug}/admin/programs/${p._id}`}
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium"
                  >
                    {p.title}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No programs assigned yet.</p>
          )}
          {availablePrograms.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <select
                className="flex-1 rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                value={assignProgramId}
                onChange={(e) => setAssignProgramId(e.target.value)}
              >
                <option value="">Select a program to assign</option>
                {availablePrograms.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => void assignProgram()}
                disabled={!assignProgramId}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Assign program
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

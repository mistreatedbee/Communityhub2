import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Users,
  Layers,
  Plus,
  Trash2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import {
  tenantFeaturesGet,
  tenantFeaturesPost,
  tenantFeaturesPut,
  tenantFeaturesDelete,
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
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const [detail, groupsData] = await Promise.all([
        tenantFeaturesGet<ProgramDetailPayload>(tenant.id, `/programs/${programId}`),
        tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups'),
      ]);
      setData(detail);
      setGroups(groupsData);
      setEditTitle(detail.program.title);
      setEditDescription(detail.program.description || '');
      setEditStatus((detail.program as Program).status || 'ACTIVE');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load program', 'error');
    } finally {
      setLoading(false);
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
        status: editStatus,
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
        order: data?.modules?.length ?? 0,
      });
      addToast('Section created successfully.', 'success');
      setModuleTitle('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create section', 'error');
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
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
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
          <p className="text-sm text-gray-500">Program not found.</p>
        </div>
      </>
    );
  }

  const assignedGroupIds = data.assignments.map((a) => a.groupId);
  const assignedGroups = groups.filter((g) => assignedGroupIds.includes(g._id));
  const availableGroups = groups.filter((g) => !assignedGroupIds.includes(g._id));

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
            to={`/c/${tenantSlug}/admin/programs`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Programs
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Program: {data.program.title}
        </h1>

        {/* Edit program section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Save className="w-5 h-5 text-[var(--color-primary)]" />
            Edit program
          </h2>
          <Input
            label="Program title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Program title"
            required
          />
          <Input
            label="Description (optional)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Brief description"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
          <Button
            onClick={() => void saveProgram()}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Save changes
          </Button>
        </div>

        {/* Assigned groups section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-primary)]" />
            Assigned groups
          </h2>
          {assignedGroups.length > 0 ? (
            <ul className="space-y-2">
              {assignedGroups.map((g) => (
                <li key={g._id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                  <Link
                    to={`/c/${tenantSlug}/admin/groups/${g._id}`}
                    className="text-[var(--color-primary)] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    {g.name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void unassignGroup(g._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Unassign
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No groups assigned yet.</p>
          )}
          {availableGroups.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <select
                className="flex-1 rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                value={assignGroupId}
                onChange={(e) => setAssignGroupId(e.target.value)}
              >
                <option value="">Select a group to assign</option>
                {availableGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => void assignGroup()}
                disabled={!assignGroupId}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Assign program
              </Button>
            </div>
          )}
        </div>

        {/* Sections (modules) section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--color-primary)]" />
            Sections
          </h2>
          {data.modules.length > 0 ? (
            <ul className="space-y-2">
              {data.modules.map((m) => (
                <li key={m._id} className="py-1">
                  <Link
                    to={`/c/${tenantSlug}/admin/programs/${programId}/modules/${m._id}`}
                    className="text-[var(--color-primary)] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    {m.title}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No sections yet. Add one below.</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Input
              label="New section title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="e.g., Introduction"
              className="flex-1"
            />
            <Button
              onClick={() => void createModule()}
              disabled={!moduleTitle.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="self-end"
            >
              Add section
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

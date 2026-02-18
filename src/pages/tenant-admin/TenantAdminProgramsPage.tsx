import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type ProgramRow = { _id: string; title: string; description: string; status?: string };
type GroupRow = { _id: string; name: string };

type ProgramsPayload = {
  programs: ProgramRow[];
  modules: Array<{ _id: string; programId: string; title: string }>;
  assignments: Array<{ _id: string; programId: string; groupId: string }>;
};

export function TenantAdminProgramsPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState<ProgramsPayload>({ programs: [], modules: [], assignments: [] });
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [programId, setProgramId] = useState('');
  const [groupId, setGroupId] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    try {
      const [programsData, groupsData] = await Promise.all([
        tenantFeaturesGet<ProgramsPayload>(tenant.id, '/programs'),
        tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups')
      ]);
      setData(programsData);
      setGroups(groupsData);
      if (!programId && programsData.programs[0]) setProgramId(programsData.programs[0]._id);
      if (!groupId && groupsData[0]) setGroupId(groupsData[0]._id);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load programs', 'error');
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const createProgram = async () => {
    if (!tenant?.id || !title.trim()) return;
    try {
      const created = await tenantFeaturesPost<{ _id: string }>(tenant.id, '/programs', { title, description });
      addToast('Program created successfully.', 'success');
      setTitle('');
      setDescription('');
      await load();
      if (created?._id && tenantSlug) {
        navigate(`/c/${tenantSlug}/admin/programs/${created._id}`);
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create program', 'error');
    }
  };

  const createModule = async () => {
    if (!tenant?.id || !programId || !moduleTitle.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/programs/modules', { programId, title: moduleTitle, order: 0 });
      addToast('Module created successfully.', 'success');
      setModuleTitle('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create module', 'error');
    }
  };

  const assign = async () => {
    if (!tenant?.id || !programId || !groupId) return;
    try {
      await tenantFeaturesPost(tenant.id, '/programs/assign', { programId, groupId });
      addToast('Program assigned to group.', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to assign program', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Program title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button onClick={() => void createProgram()}>Create program</Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">Program</label>
        <select className="w-full rounded-lg border border-gray-300 p-2" value={programId} onChange={(e) => setProgramId(e.target.value)}>
          <option value="">Select program</option>
          {data.programs.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
        <Input label="Module title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
        <Button onClick={() => void createModule()}>Add module</Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">Assign to group</label>
        <select className="w-full rounded-lg border border-gray-300 p-2" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Select group</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <Button onClick={() => void assign()}>Assign program</Button>
      </div>
      <div className="space-y-3">
        {data.programs.map((p) => {
          const moduleCount = data.modules.filter((m) => m.programId === p._id).length;
          const assignedGroupCount = data.assignments.filter((a) => a.programId === p._id).length;
          return (
            <Link
              key={p._id}
              to={`/c/${tenantSlug}/admin/programs/${p._id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[var(--color-primary)] hover:shadow-sm transition-colors"
            >
              <p className="font-semibold text-gray-900">{p.title}</p>
              <p className="text-sm text-gray-600">{p.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {p.status || 'ACTIVE'} · {moduleCount} module(s) · {assignedGroupCount} group(s)
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

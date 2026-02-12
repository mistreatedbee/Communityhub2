import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type ProgramRow = { _id: string; title: string; description: string };
type GroupRow = { _id: string; name: string };

type ProgramsPayload = {
  programs: ProgramRow[];
  modules: Array<{ _id: string; programId: string; title: string }>;
  assignments: Array<{ _id: string; programId: string; groupId: string }>;
};

export function TenantAdminProgramsPage() {
  const { tenant } = useTenant();
  const [data, setData] = useState<ProgramsPayload>({ programs: [], modules: [], assignments: [] });
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [programId, setProgramId] = useState('');
  const [groupId, setGroupId] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    const [programsData, groupsData] = await Promise.all([
      tenantFeaturesGet<ProgramsPayload>(tenant.id, '/programs'),
      tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups')
    ]);
    setData(programsData);
    setGroups(groupsData);
    if (!programId && programsData.programs[0]) setProgramId(programsData.programs[0]._id);
    if (!groupId && groupsData[0]) setGroupId(groupsData[0]._id);
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const createProgram = async () => {
    if (!tenant?.id || !title.trim()) return;
    await tenantFeaturesPost(tenant.id, '/programs', { title, description });
    setTitle('');
    setDescription('');
    await load();
  };

  const createModule = async () => {
    if (!tenant?.id || !programId || !moduleTitle.trim()) return;
    await tenantFeaturesPost(tenant.id, '/programs/modules', { programId, title: moduleTitle, order: 0 });
    setModuleTitle('');
    await load();
  };

  const assign = async () => {
    if (!tenant?.id || !programId || !groupId) return;
    await tenantFeaturesPost(tenant.id, '/programs/assign', { programId, groupId });
    await load();
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
          {data.programs.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        <Input label="Module title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
        <Button onClick={() => void createModule()}>Add module</Button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">Assign to group</label>
        <select className="w-full rounded-lg border border-gray-300 p-2" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Select group</option>
          {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
        <Button onClick={() => void assign()}>Assign program</Button>
      </div>
      <div className="space-y-3">
        {data.programs.map((p) => (
          <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-semibold text-gray-900">{p.title}</p>
            <p className="text-sm text-gray-600">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

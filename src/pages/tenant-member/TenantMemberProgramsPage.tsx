import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type Program = { _id: string; title: string; description: string };

type ProgramsPayload = {
  programs: Program[];
  modules: Array<{ _id: string; programId: string; title: string }>;
  assignments: Array<{ _id: string; programId: string; groupId: string }>;
};

export function TenantMemberProgramsPage() {
  const { tenant } = useTenant();
  const [data, setData] = useState<ProgramsPayload>({ programs: [], modules: [], assignments: [] });

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setData(await tenantFeaturesGet<ProgramsPayload>(tenant.id, '/programs'));
    };
    void load();
  }, [tenant?.id]);

  const enroll = async (programId: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesPost(tenant.id, `/programs/${programId}/enroll`, { progressPct: 0 });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
      {data.programs.map((p) => (
        <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">{p.title}</p>
            <p className="text-sm text-gray-600">{p.description}</p>
          </div>
          <Button size="sm" onClick={() => void enroll(p._id)}>Enroll</Button>
        </div>
      ))}
    </div>
  );
}

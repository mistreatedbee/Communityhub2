import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';
import { MemberPageContainer, PageHeader, ContentCard } from '../../components/member';
import { BookOpen } from 'lucide-react';

type Program = { _id: string; title: string; description?: string };

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
    <MemberPageContainer>
      <PageHeader
        title="Programs"
        subtitle="Enroll in programs and track your progress."
      />
      <div className="space-y-4">
        {data.programs.length === 0 && (
          <p className="text-gray-500">No programs available yet.</p>
        )}
        {data.programs.map((p) => (
          <ContentCard key={p._id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">{p.title}</h2>
                {p.description && (
                  <p className="text-sm text-gray-600 mt-0.5 max-w-2xl">{p.description}</p>
                )}
              </div>
            </div>
            <Button size="sm" onClick={() => void enroll(p._id)} className="shrink-0">
              Enroll
            </Button>
          </ContentCard>
        ))}
      </div>
    </MemberPageContainer>
  );
}

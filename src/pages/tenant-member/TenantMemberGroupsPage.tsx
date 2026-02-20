import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';
import { MemberPageContainer, PageHeader, ContentCard } from '../../components/member';
import { Users } from 'lucide-react';

type GroupRow = { _id: string; name: string; description?: string };

export function TenantMemberGroupsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<GroupRow[]>([]);

  const load = async () => {
    if (!tenant?.id) return;
    setItems(await tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const join = async (groupId: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesPost(tenant.id, `/groups/${groupId}/join`, {});
  };

  const leave = async (groupId: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesDelete(tenant.id, `/groups/${groupId}/leave`);
  };

  return (
    <MemberPageContainer>
      <PageHeader
        title="Groups"
        subtitle="Find and join groups within your community."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 && (
          <p className="text-gray-500 sm:col-span-2 lg:col-span-3">No groups available yet.</p>
        )}
        {items.map((group) => (
          <ContentCard key={group._id} className="flex flex-col">
            <div className="flex gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900 text-lg">{group.name}</h2>
                {group.description && (
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{group.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" onClick={() => void join(group._id)}>
                    Join
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void leave(group._id)}>
                    Leave
                  </Button>
                </div>
              </div>
            </div>
          </ContentCard>
        ))}
      </div>
    </MemberPageContainer>
  );
}

import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type GroupRow = { _id: string; name: string; description: string };

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
      {items.map((group) => (
        <div key={group._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">{group.name}</p>
            <p className="text-sm text-gray-600">{group.description}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void join(group._id)}>Join</Button>
            <Button size="sm" variant="outline" onClick={() => void leave(group._id)}>Leave</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

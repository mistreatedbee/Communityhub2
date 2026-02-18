import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type GroupRow = { _id: string; name: string; description: string; isPrivate: boolean };

export function TenantAdminGroupsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<GroupRow[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    setItems(await tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !name.trim()) return;
    await tenantFeaturesPost(tenant.id, '/groups', { name, description, isPrivate: false });
    setName('');
    setDescription('');
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button onClick={() => void create()}>Create group</Button>
      </div>
      <div className="space-y-3">
        {items.map((g) => (
          <div key={g._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-semibold text-gray-900">{g.name}</p>
            <p className="text-sm text-gray-600">{g.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

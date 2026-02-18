import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type GroupRow = { _id: string; name: string; description: string; isPrivate: boolean };

export function TenantAdminGroupsPage() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { addToast } = useToast();
  const [items, setItems] = useState<GroupRow[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    try {
      setItems(await tenantFeaturesGet<GroupRow[]>(tenant.id, '/groups'));
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load groups', 'error');
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !name.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/groups', { name, description, isPrivate: false });
      addToast('Group created successfully.', 'success');
      setName('');
      setDescription('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create group', 'error');
    }
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
          <Link
            key={g._id}
            to={`/c/${tenantSlug}/admin/groups/${g._id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[var(--color-primary)] hover:shadow-sm transition-colors"
          >
            <p className="font-semibold text-gray-900">{g.name}</p>
            <p className="text-sm text-gray-600">{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

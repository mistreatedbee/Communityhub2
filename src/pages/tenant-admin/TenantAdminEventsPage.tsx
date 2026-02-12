import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesDelete, tenantFeaturesGet, tenantFeaturesPost } from '../../lib/tenantFeatures';

type EventRow = { _id: string; title: string; description: string; startsAt: string; location: string };

export function TenantAdminEventsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<EventRow[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [location, setLocation] = useState('');

  const load = async () => {
    if (!tenant?.id) return;
    setItems(await tenantFeaturesGet<EventRow[]>(tenant.id, '/events'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !title.trim() || !startsAt) return;
    await tenantFeaturesPost(tenant.id, '/events', { title, description, startsAt, location, isOnline: false });
    setTitle('');
    setDescription('');
    setStartsAt('');
    setLocation('');
    await load();
  };

  const remove = async (id: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesDelete(tenant.id, `/events/${id}`);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Events</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="Starts At" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Button onClick={() => void create()}>Create event</Button>
      </div>
      <div className="space-y-3">
        {items.map((e) => (
          <div key={e._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{e.title}</p>
                <p className="text-sm text-gray-600">{e.description}</p>
                <p className="text-xs text-gray-500">{new Date(e.startsAt).toLocaleString()}</p>
              </div>
              <Button variant="ghost" className="text-red-600" onClick={() => void remove(e._id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

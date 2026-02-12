import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Notification = {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export function TenantMemberNotificationsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<Notification[]>([]);

  const load = async () => {
    if (!tenant?.id) return;
    setItems(await tenantFeaturesGet<Notification[]>(tenant.id, '/notifications'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const markRead = async (id: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesPut(tenant.id, `/notifications/${id}/read`, {});
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      {items.map((n) => (
        <div key={n._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">{n.title}</p>
            <p className="text-sm text-gray-600">{n.body}</p>
            <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
          {!n.readAt ? <Button size="sm" variant="outline" onClick={() => void markRead(n._id)}>Mark read</Button> : null}
        </div>
      ))}
    </div>
  );
}

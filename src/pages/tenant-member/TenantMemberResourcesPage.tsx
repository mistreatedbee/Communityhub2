import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';

type Resource = { _id: string; title: string; description: string; url: string };

export function TenantMemberResourcesPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<Resource[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      setItems(await tenantFeaturesGet<Resource[]>(tenant.id, '/resources'));
    };
    void load();
  }, [tenant?.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
      {items.map((item) => (
        <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-900">{item.title}</p>
          <p className="text-sm text-gray-600">{item.description}</p>
          {item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-[var(--color-primary)]">Open</a> : null}
        </div>
      ))}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';

type Resource = { _id: string; title: string; description: string; url: string; thumbnailUrl?: string };

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
      <h1 className="text-2xl font-bold text-gray-900">Files</h1>
      {items.map((item) => (
        <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3">
          {item.thumbnailUrl ? (
            <SafeImage src={item.thumbnailUrl} alt={item.title} fallbackSrc="/image-fallback.svg" className="w-14 h-14 rounded-lg object-cover shrink-0" />
          ) : null}
          <div>
            <p className="font-semibold text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-600">{item.description}</p>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-[var(--color-primary)] hover:underline">
                Open resource
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

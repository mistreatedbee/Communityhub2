import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { apiClient } from '../../lib/apiClient';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  location?: string;
  logoUrl?: string;
};

export function TenantPublicPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [tenant, setTenant] = useState<TenantRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tenantSlug) return;
      try {
        const data = await apiClient<TenantRow>(`/api/tenants/${tenantSlug}`);
        setTenant(data);
      } catch {
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="py-20">
        <EmptyState icon={Search} title="Community not found" description="This community might be inactive or unavailable." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold overflow-hidden">
            {tenant.logoUrl ? <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" /> : tenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-sm text-gray-500">{tenant.category ?? 'Community'} | {tenant.location ?? 'Global'}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          {tenant.description?.trim() || 'Public community profile. Join to participate and access member experiences.'}
        </p>
        <div className="flex gap-3">
          <Link to={`/c/${tenant.slug}/join`} className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium">
            Join community
          </Link>
          <Link to="/communities" className="inline-flex items-center justify-center px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700">
            Back to directory
          </Link>
        </div>
      </div>
    </div>
  );
}

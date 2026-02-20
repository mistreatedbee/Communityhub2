import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/apiClient';
import { SafeImage } from '../../components/ui/SafeImage';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  location?: string;
  logoUrl?: string;
};

export function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await apiClient<TenantRow[]>('/api/tenants/public');
      setTenants(data || []);
      setLoading(false);
    };
    void load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(tenants.map((t) => (t.category || '').trim()).filter(Boolean));
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [tenants]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tenants.filter((tenant) => {
      const matchesText =
        !term ||
        [tenant.name, tenant.category, tenant.location, tenant.description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term));
      const matchesCategory = categoryFilter === 'all' || (tenant.category || '').toLowerCase() === categoryFilter.toLowerCase();
      return matchesText && matchesCategory;
    });
  }, [searchTerm, tenants, categoryFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <p className="text-gray-500">Find and join communities that match your goals.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name, category, location..."
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No communities found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tenant) => (
            <div key={tenant.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <Link to={`/c/${tenant.slug}`} className="block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold overflow-hidden">
                    {tenant.logoUrl ? (
                      <SafeImage src={tenant.logoUrl} alt={tenant.name} fallbackSrc="/logo.png" className="w-full h-full object-cover" />
                    ) : tenant.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{tenant.name}</h2>
                    <p className="text-xs text-gray-500">{tenant.category ?? 'Community'}</p>
                  </div>
                </div>
              </Link>
              <div className="text-xs text-gray-500 mb-4">{tenant.location ?? 'Global'}</div>
              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                {tenant.description?.trim() || 'Join this community to connect with members and activities.'}
              </p>
              <div className="flex gap-2">
                <Link to={`/c/${tenant.slug}`} className="flex-1">
                  <Button variant="outline" className="w-full">View</Button>
                </Link>
                <Link to={`/c/${tenant.slug}/join`} className="flex-1">
                  <Button className="w-full">Join</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

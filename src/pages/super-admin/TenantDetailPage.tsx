import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../lib/apiClient';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  category?: string;
  location?: string;
};

type Member = {
  id: string;
  role: string;
  status: string;
  user: { email: string; fullName: string } | null;
};

type Audit = {
  id: string;
  action: string;
  createdAt: string;
};

export function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!tenantId) return;
      const tenants = await apiClient<Tenant[]>('/api/admin/tenants');
      const found = tenants.find((t) => t.id === tenantId) || null;
      setTenant(found);
      if (!found) return;

      const [memberRows, auditRows] = await Promise.all([
        apiClient<Member[]>(`/api/tenants/${tenantId}/members`),
        apiClient<{ items: Audit[] }>(`/api/audit?tenantId=${tenantId}&pageSize=10`)
      ]);
      setMembers(memberRows);
      setAudit(auditRows.items || []);
    };
    void load();
  }, [tenantId]);

  if (!tenant) return <p className="text-sm text-gray-500">Tenant not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <p className="text-gray-500">/{tenant.slug} � {tenant.status}</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Members</h2>
        <ul className="space-y-2 text-sm">
          {members.map((m) => (
            <li key={m.id} className="text-gray-700">
              {(m.user?.fullName || m.user?.email || 'Unknown')} � {m.role} � {m.status}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Recent Audit</h2>
        <ul className="space-y-2 text-sm">
          {audit.map((a) => (
            <li key={a.id} className="text-gray-700">
              {a.action} � {new Date(a.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

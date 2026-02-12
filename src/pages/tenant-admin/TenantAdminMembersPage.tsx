import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Member = {
  _id: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  joinedAt: string;
  userId?: { _id: string; email?: string; fullName?: string; phone?: string };
  profile?: { fullName?: string; phone?: string; customFields?: Record<string, unknown> };
};

const nextRole: Record<Member['role'], Member['role']> = {
  OWNER: 'ADMIN',
  ADMIN: 'MODERATOR',
  MODERATOR: 'MEMBER',
  MEMBER: 'ADMIN'
};

const statusCycle: Record<Member['status'], Member['status']> = {
  PENDING: 'ACTIVE',
  ACTIVE: 'SUSPENDED',
  SUSPENDED: 'BANNED',
  BANNED: 'ACTIVE'
};

export function TenantAdminMembersPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<Member[]>([]);

  const load = async () => {
    if (!tenant?.id) return;
    const rows = await tenantFeaturesGet<Member[]>(tenant.id, '/members');
    setItems(rows);
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const cycleRole = async (member: Member) => {
    if (!tenant?.id || !member.userId?._id) return;
    await tenantFeaturesPut(tenant.id, `/members/${member.userId._id}`, {
      role: nextRole[member.role],
      status: member.status
    });
    await load();
  };

  const cycleStatus = async (member: Member) => {
    if (!tenant?.id || !member.userId?._id) return;
    await tenantFeaturesPut(tenant.id, `/members/${member.userId._id}`, {
      role: member.role,
      status: statusCycle[member.status]
    });
    await load();
  };

  const exportCsv = () => {
    const header = ['name', 'email', 'phone', 'role', 'status', 'joined_at'];
    const lines = items.map((member) => {
      const name = member.profile?.fullName || member.userId?.fullName || '';
      const email = member.userId?.email || '';
      const phone = member.profile?.phone || member.userId?.phone || '';
      return [name, email, phone, member.role, member.status, member.joinedAt || ''].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tenant?.slug || 'members'}-members.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="space-y-3">
        {items.map((member) => (
          <div key={member._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  {member.profile?.fullName || member.userId?.fullName || member.userId?.email || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">{member.userId?.email || ''}</p>
                {member.profile?.phone || member.userId?.phone ? (
                  <p className="text-sm text-gray-600">{member.profile?.phone || member.userId?.phone}</p>
                ) : null}
                <p className="text-sm text-gray-600">{member.role} | {member.status}</p>
                <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void cycleRole(member)}>Change role</Button>
                <Button variant="ghost" onClick={() => void cycleStatus(member)}>Change status</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

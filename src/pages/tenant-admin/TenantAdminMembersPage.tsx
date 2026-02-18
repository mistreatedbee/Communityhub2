import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
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

const ROLES: Member['role'][] = ['MEMBER', 'MODERATOR', 'ADMIN', 'OWNER'];

const statusCycle: Record<Member['status'], Member['status']> = {
  PENDING: 'ACTIVE',
  ACTIVE: 'SUSPENDED',
  SUSPENDED: 'BANNED',
  BANNED: 'ACTIVE'
};

export function TenantAdminMembersPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<Member[]>([]);
  const [roleModalMember, setRoleModalMember] = useState<Member | null>(null);
  const [roleModalValue, setRoleModalValue] = useState<Member['role']>('MEMBER');
  const [roleSaving, setRoleSaving] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    const rows = await tenantFeaturesGet<Member[]>(tenant.id, '/members');
    setItems(rows);
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const openRoleModal = (member: Member) => {
    setRoleModalMember(member);
    setRoleModalValue(member.role);
  };

  const saveRole = async () => {
    if (!tenant?.id || !roleModalMember?.userId?._id) return;
    setRoleSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/members/${roleModalMember.userId._id}`, {
        role: roleModalValue,
        status: roleModalMember.status
      });
      addToast('Role updated', 'success');
      await load();
      setRoleModalMember(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update role', 'error');
    } finally {
      setRoleSaving(false);
    }
  };

  const cycleStatus = async (member: Member) => {
    if (!tenant?.id || !member.userId?._id) return;
    try {
      await tenantFeaturesPut(tenant.id, `/members/${member.userId._id}`, {
        role: member.role,
        status: statusCycle[member.status]
      });
      addToast('Status updated', 'success');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update status', 'error');
    }
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
                <Button variant="outline" onClick={() => openRoleModal(member)}>Change role</Button>
                <Button variant="ghost" onClick={() => void cycleStatus(member)}>Change status</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!roleModalMember}
        onClose={() => setRoleModalMember(null)}
        title="Change role"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRoleModalMember(null)}>Cancel</Button>
            <Button onClick={() => void saveRole()} isLoading={roleSaving}>Save</Button>
          </>
        }
      >
        {roleModalMember && (
          <>
            <p className="text-sm text-gray-600 mb-3">
              {roleModalMember.profile?.fullName || roleModalMember.userId?.fullName || roleModalMember.userId?.email || 'Unknown'}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              value={roleModalValue}
              onChange={(e) => setRoleModalValue(e.target.value as Member['role'])}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </>
        )}
      </Modal>
    </div>
  );
}

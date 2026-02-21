import React, { useEffect, useState } from 'react';
import { Search, Download, Edit, MoreVertical, Filter, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { SafeImage } from '../../components/ui/SafeImage';
import { Spinner } from '../../components/ui/Spinner';

type Member = {
  _id: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  joinedAt: string;
  userId?: { _id: string; email?: string; fullName?: string; phone?: string };
  profile?: { fullName?: string; phone?: string; customFields?: Record<string, unknown> };
};

const ROLES: Member['role'][] = ['MEMBER', 'MODERATOR', 'ADMIN', 'OWNER'];
const STATUSES: Member['status'][] = ['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED'];

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  BANNED: 'bg-red-100 text-red-800 border-red-200',
};

const roleColors = {
  OWNER: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
  MODERATOR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  MEMBER: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function TenantAdminMembersPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [items, setItems] = useState<Member[]>([]);
  const [filteredItems, setFilteredItems] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleModalMember, setRoleModalMember] = useState<Member | null>(null);
  const [roleModalValue, setRoleModalValue] = useState<Member['role']>('MEMBER');
  const [statusModalValue, setStatusModalValue] = useState<Member['status']>('ACTIVE');
  const [roleSaving, setRoleSaving] = useState(false);

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const rows = await tenantFeaturesGet<Member[]>(tenant.id, '/members');
      setItems(rows);
      setFilteredItems(rows);
    } catch (error) {
      addToast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter members based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = items.filter(
      (member) =>
        member.profile?.fullName?.toLowerCase().includes(term) ||
        member.userId?.fullName?.toLowerCase().includes(term) ||
        member.userId?.email?.toLowerCase().includes(term) ||
        member.profile?.phone?.toLowerCase().includes(term) ||
        member.userId?.phone?.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const openRoleModal = (member: Member) => {
    setRoleModalMember(member);
    setRoleModalValue(member.role);
    setStatusModalValue(member.status);
  };

  const saveRole = async () => {
    if (!tenant?.id || !roleModalMember?.userId?._id) return;
    setRoleSaving(true);
    try {
      await tenantFeaturesPut(tenant.id, `/members/${roleModalMember.userId._id}`, {
        role: roleModalValue,
        status: statusModalValue,
      });
      addToast('Member updated', 'success');
      await load();
      setRoleModalMember(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update role', 'error');
    } finally {
      setRoleSaving(false);
    }
  };

  const exportCsv = () => {
    const header = ['name', 'email', 'phone', 'role', 'status', 'joined_at'];
    const lines = items.map((member) => {
      const name = member.profile?.fullName || member.userId?.fullName || '';
      const email = member.userId?.email || '';
      const phone = member.profile?.phone || member.userId?.phone || '';
      return [name, email, phone, member.role, member.status, member.joinedAt || '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
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

  const clearSearch = () => setSearchTerm('');

  return (
    <>
      {/* Animated background – subtle for admin area */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="space-y-6 relative">
        {/* Header with search and export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Members</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 w-full sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button variant="outline" onClick={exportCsv} leftIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Member count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'member' : 'members'} found
        </p>

        {/* Member list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No members found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Members will appear once they join your community</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((member) => (
              <div
                key={member._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">
                        {member.profile?.fullName || member.userId?.fullName || member.userId?.email || 'Unknown'}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[member.role]}`}
                      >
                        {member.role}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[member.status]}`}
                      >
                        {member.status}
                      </span>
                    </div>
                    {member.userId?.email && (
                      <p className="text-sm text-gray-600 mt-1">{member.userId.email}</p>
                    )}
                    {(member.profile?.phone || member.userId?.phone) && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        {member.profile?.phone || member.userId?.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Joined {new Date(member.joinedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRoleModal(member)}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Member Modal */}
        <Modal
          isOpen={!!roleModalMember}
          onClose={() => setRoleModalMember(null)}
          title="Edit member"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setRoleModalMember(null)}>
                Cancel
              </Button>
              <Button onClick={() => void saveRole()} isLoading={roleSaving}>
                Save changes
              </Button>
            </>
          }
        >
          {roleModalMember && (
            <div className="space-y-4">
              <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100">
                <p className="font-medium text-gray-900">
                  {roleModalMember.profile?.fullName ||
                    roleModalMember.userId?.fullName ||
                    roleModalMember.userId?.email ||
                    'Unknown'}
                </p>
                {roleModalMember.userId?.email && (
                  <p className="text-sm text-gray-600 mt-1">{roleModalMember.userId.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                  value={roleModalValue}
                  onChange={(e) => setRoleModalValue(e.target.value as Member['role'])}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                  value={statusModalValue}
                  onChange={(e) => setStatusModalValue(e.target.value as Member['status'])}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-gray-500 pt-2">
                Changing a member's role or status will take effect immediately.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}

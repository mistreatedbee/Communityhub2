import React, { useEffect, useMemo, useState } from 'react';
import { Search, MoreHorizontal, User, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Dropdown } from '../../components/ui/Dropdown';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { setImpersonation } from '../../utils/impersonation';
import { logAudit } from '../../utils/audit';

type UserRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  platform_role: 'user' | 'super_admin';
  created_at: string;
};

type MembershipRow = {
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'supervisor' | 'employee' | 'member';
  status: 'active' | 'inactive' | 'pending';
};

type TenantRow = {
  id: string;
  name: string;
  slug: string;
};
export function PlatformUsersPage() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [tenants, setTenants] = useState<TenantRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, memberRes, tenantRes] = await Promise.all([
          supabase.from('profiles').select('user_id, full_name, email, platform_role, created_at').returns<UserRow[]>(),
          supabase.from('organization_memberships').select('organization_id, user_id, role, status').returns<MembershipRow[]>(),
          supabase.from('organizations').select('id, name, slug').returns<TenantRow[]>()
        ]);
        if (userRes.error && import.meta.env.DEV) console.error('[PlatformUsersPage] profiles', userRes.error);
        if (memberRes.error && import.meta.env.DEV) console.error('[PlatformUsersPage] memberships', memberRes.error);
        if (tenantRes.error && import.meta.env.DEV) console.error('[PlatformUsersPage] organizations', tenantRes.error);
        setUsers(userRes.data ?? []);
        setMemberships(memberRes.data ?? []);
        setTenants(tenantRes.data ?? []);
      } catch (e) {
        if (import.meta.env.DEV) console.error('[PlatformUsersPage] load', e);
        setUsers([]);
        setMemberships([]);
        setTenants([]);
      }
    };
    void load();
  }, []);

  const handleImpersonate = async (user: UserRow) => {
    if (
    window.confirm(
      `Are you sure you want to impersonate ${user.full_name ?? user.email}? You will see the platform exactly as they do.`
    ))
    {
      const membership = memberships.find((m) => m.user_id === user.user_id);
      setImpersonation({
        userId: user.user_id,
        tenantId: membership?.organization_id ?? null,
        startedAt: new Date().toISOString()
      });
      await logAudit('impersonation_started', membership?.organization_id ?? null, { user_id: user.user_id });
      addToast('Impersonation started. Redirecting...', 'info');
      if (membership?.organization_id) {
        const tenant = tenants.find((t) => t.id === membership.organization_id);
        window.location.href = tenant ? `/c/${tenant.slug}/admin` : '/communities';
      } else {
        window.location.href = '/communities';
      }
    }
  };
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        (user.full_name ?? '').toLowerCase().includes(term) ||
        (user.email ?? '').toLowerCase().includes(term)
    );
  }, [users, searchTerm]);
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
          <p className="text-gray-500">
            Manage admin users across all organizations.
          </p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />

          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>User</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Organization</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) =>
              <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar alt={user.full_name ?? user.email ?? 'User'} size="sm" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.full_name ?? 'Unnamed'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email ?? 'No email'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{user.platform_role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {tenants.find((t) => t.id === memberships.find((m) => m.user_id === user.user_id)?.organization_id)?.name ?? 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                    variant={
                    memberships.find((m) => m.user_id === user.user_id)?.status === 'active' ? 'success' : 'secondary'
                    }>

                      {memberships.find((m) => m.user_id === user.user_id)?.status ?? 'inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dropdown
                    align="right"
                    trigger={
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                    }
                    items={[
                    {
                      label: 'Impersonate',
                      onClick: () => handleImpersonate(user),
                      icon: <LogIn className="w-4 h-4" />
                    },
                    {
                      label: 'View Details',
                      icon: <User className="w-4 h-4" />
                    }]
                    } />

                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>);

}
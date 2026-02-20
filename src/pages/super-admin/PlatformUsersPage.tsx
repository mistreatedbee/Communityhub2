import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

type PlatformUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  globalRole: 'SUPER_ADMIN' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
};

export function PlatformUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [editRole, setEditRole] = useState<PlatformUser['globalRole']>('USER');
  const [editStatus, setEditStatus] = useState<PlatformUser['status']>('ACTIVE');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const data = await apiClient<PlatformUser[]>('/api/admin/users');
      setUsers(data);
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(q) || (u.fullName || '').toLowerCase().includes(q));
  }, [users, searchTerm]);

  const openEdit = (user: PlatformUser) => {
    setEditing(user);
    setEditRole(user.globalRole);
    setEditStatus(user.status);
  };

  const saveUser = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await apiClient<PlatformUser>(`/api/admin/users/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          globalRole: editRole,
          status: editStatus
        })
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      addToast('User updated successfully', 'success');
      setEditing(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
        <p className="text-gray-500">All registered users.</p>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.globalRole === 'SUPER_ADMIN' ? 'info' : 'default'}>{user.globalRole}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'SUSPENDED' ? 'warning' : 'danger'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                    Edit role/status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Edit user role and status"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => void saveUser()} isLoading={saving}>Save</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{editing.fullName || editing.email}</p>
            <label className="block text-sm font-medium text-gray-700">Global role</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as PlatformUser['globalRole'])}
            >
              <option value="USER">USER</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as PlatformUser['status'])}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BANNED">BANNED</option>
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}

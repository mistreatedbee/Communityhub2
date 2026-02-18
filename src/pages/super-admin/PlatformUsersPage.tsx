import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/apiClient';

type PlatformUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  globalRole: 'SUPER_ADMIN' | 'USER';
  createdAt: string;
};

export function PlatformUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<PlatformUser[]>([]);

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
              <TableHeader>Created</TableHeader>
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
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

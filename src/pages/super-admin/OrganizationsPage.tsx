import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
};

export function OrganizationsPage() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const load = async () => {
    const data = await apiClient<Tenant[]>('/api/admin/tenants');
    setTenants(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => tenants.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [tenants, searchTerm]
  );

  const createTenant = async () => {
    try {
      await apiClient('/api/admin/tenants', {
        method: 'POST',
        body: JSON.stringify({ name, slug })
      });
      addToast('Tenant created.', 'success');
      setIsCreateOpen(false);
      setName('');
      setSlug('');
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create tenant', 'error');
    }
  };

  const toggleStatus = async (tenant: Tenant) => {
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await apiClient(`/api/admin/tenants/${tenant.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    });
    await load();
  };

  const removeTenant = async (id: string) => {
    if (!window.confirm('Delete this tenant?')) return;
    await apiClient(`/api/admin/tenants/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500">Manage all tenants on the platform.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>
          New Tenant
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tenants" />
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Slug</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Link className="text-[var(--color-primary)] hover:underline" to={`/super-admin/tenants/${tenant.id}`}>
                    {tenant.name}
                  </Link>
                </TableCell>
                <TableCell>{tenant.slug}</TableCell>
                <TableCell>
                  <Badge variant={tenant.status === 'ACTIVE' ? 'success' : 'danger'}>{tenant.status}</Badge>
                </TableCell>
                <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => void toggleStatus(tenant)}>
                    {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => void removeTenant(tenant.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Tenant"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void createTenant()}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} />
        </div>
      </Modal>
    </div>
  );
}

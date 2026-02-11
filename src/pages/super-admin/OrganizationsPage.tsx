import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MoreHorizontal,
  Plus,
  Building2,
  Trash2,
  Ban,
  CheckCircle } from
'lucide-react';
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
import { Dropdown } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../utils/audit';
type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  organization_licenses: {
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    license_plan: { id: string; name: string } | null;
  }[];
};

type MembershipRow = {
  organization_id: string;
  role: 'owner' | 'admin' | 'supervisor' | 'employee' | 'member';
  status: 'active' | 'inactive' | 'pending';
};

type LicenseRow = {
  id: string;
  name: string;
};

export function OrganizationsPage() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState<TenantRow[]>([]);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [plans, setPlans] = useState<LicenseRow[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [planId, setPlanId] = useState('');

  const loadData = async () => {
    const [{ data: orgRows }, { data: memberRows }, { data: planRows }] = await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, slug, status, created_at, organization_licenses(status, license_plan:license_plans(id, name))')
        .order('created_at', { ascending: false })
        .returns<TenantRow[]>(),
      supabase
        .from('organization_memberships')
        .select('organization_id, role, status')
        .returns<MembershipRow[]>(),
      supabase
        .from('license_plans')
        .select('id, name')
        .order('price_cents', { ascending: true })
        .returns<LicenseRow[]>()
    ]);
    setOrganizations(orgRows ?? []);
    setMemberships(memberRows ?? []);
    setPlans(planRows ?? []);
    if (!planId && planRows?.length) setPlanId(planRows[0].id);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'suspended') => {
    const { error } = await supabase.from('organizations').update({ status: newStatus }).eq('id', id);
    if (error) {
      addToast('Unable to update status.', 'error');
      return;
    }
    await logAudit('tenant_status_changed', id, { status: newStatus });
    addToast(`Tenant ${newStatus === 'active' ? 'activated' : 'suspended'}.`, 'success');
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    const { error } = await supabase.from('organizations').delete().eq('id', id);
    if (error) {
      addToast('Unable to delete tenant.', 'error');
      return;
    }
    await logAudit('tenant_deleted', id, {});
    addToast('Tenant deleted.', 'success');
    await loadData();
  };

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim() || !adminEmail.trim()) {
      addToast('Name, slug, and admin email are required.', 'error');
      return;
    }
    const { data: tenantData, error } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        status: 'active'
      })
      .select('id')
      .maybeSingle<{ id: string }>();
    if (error || !tenantData) {
      addToast('Unable to create tenant.', 'error');
      return;
    }
    await supabase.from('organization_licenses').insert({
      organization_id: tenantData.id,
      license_id: planId,
      status: 'trial'
    });
    await supabase.from('tenant_settings').insert({
      organization_id: tenantData.id
    });
    await supabase.from('invitations').insert({
      organization_id: tenantData.id,
      email: adminEmail,
      role: 'admin',
      token: crypto.randomUUID(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    });
    await logAudit('tenant_created', tenantData.id, { name, slug, planId });
    addToast('Tenant created.', 'success');
    setIsCreateModalOpen(false);
    setName('');
    setSlug('');
    setAdminEmail('');
    await loadData();
  };

  const filteredOrgs = useMemo(
    () => organizations.filter((org) => org.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [organizations, searchTerm]
  );
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500">
            Manage all tenants on the platform.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}>

          New Organization
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />

          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Plan</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Members</TableHeader>
                <TableHeader>Admins</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrgs.map((org) =>
              <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                        {org.name.charAt(0)}
                      </div>
                      <div className="font-medium text-gray-900">
                        {org.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{org.organization_licenses?.[0]?.license_plan?.name ?? 'No plan'}</TableCell>
                  <TableCell>
                    <Badge
                    variant={
                    org.status === 'active' ?
                    'success' :
                    'danger'
                    }>

                      {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {memberships.filter((m) => m.organization_id === org.id && m.status === 'active').length}
                  </TableCell>
                  <TableCell>
                    {memberships.filter((m) => m.organization_id === org.id && m.status === 'active' && (m.role === 'admin' || m.role === 'owner')).length}
                  </TableCell>
                  <TableCell>
                    {new Date(org.created_at).toLocaleDateString()}
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
                      label: 'View Details',
                      href: `/super-admin/tenants/${org.id}`,
                      icon: <Building2 className="w-4 h-4" />
                    },
                    {
                      label: org.status === 'suspended' ? 'Activate' : 'Suspend',
                      onClick: () =>
                      handleStatusChange(
                        org.id,
                        org.status === 'suspended' ?
                        'active' :
                        'suspended'
                      ),
                      icon:
                      org.status === 'suspended' ?
                      <CheckCircle className="w-4 h-4" /> :

                      <Ban className="w-4 h-4" />

                    },
                    {
                      label: 'Delete',
                      danger: true,
                      onClick: () => handleDelete(org.id),
                      icon: <Trash2 className="w-4 h-4" />
                    }]
                    } />

                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Tenant"
        footer={
        <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
            onClick={() => void handleCreate()}>
              Create Tenant
            </Button>
          </>
        }>

        <div className="space-y-4">
          <Input label="Tenant Name" placeholder="e.g. Acme Community" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Tenant Slug" placeholder="acme" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input label="Admin Email" type="email" placeholder="admin@example.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>);

}
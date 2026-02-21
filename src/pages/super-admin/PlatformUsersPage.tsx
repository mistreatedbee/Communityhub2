import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Upload, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Link } from 'react-router-dom';
import { uploadLogo, getLogoUrl } from '../../lib/tenantUpload';
import { validateImageFile } from '../../lib/uploadValidation';

type PlatformUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  globalRole: 'SUPER_ADMIN' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
};

type TenantRow = {
  id: string;
  name: string;
  slug: string;
};

type PromoteResult = {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  adminRoute: string;
  createdTenant: boolean;
};

export function PlatformUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [editRole, setEditRole] = useState<PlatformUser['globalRole']>('USER');
  const [editStatus, setEditStatus] = useState<PlatformUser['status']>('ACTIVE');
  const [saving, setSaving] = useState(false);
  const [promoting, setPromoting] = useState<PlatformUser | null>(null);
  const [promotionSaving, setPromotionSaving] = useState(false);
  const [useExistingTenant, setUseExistingTenant] = useState(false);
  const [existingTenantId, setExistingTenantId] = useState('');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantLogoFile, setTenantLogoFile] = useState<File | null>(null);
  const [tenantLogoPreviewUrl, setTenantLogoPreviewUrl] = useState<string | null>(null);
  const [tenantLogoUploading, setTenantLogoUploading] = useState(false);
  const [membershipRole, setMembershipRole] = useState<'OWNER' | 'ADMIN'>('OWNER');
  const [lastPromotedRoute, setLastPromotedRoute] = useState<string | null>(null);
  const tenantLogoInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const data = await apiClient<PlatformUser[]>('/api/admin/users');
      setUsers(data);
    };
    void load();
  }, []);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const rows = await apiClient<TenantRow[]>('/api/admin/tenants');
        setTenants(rows);
      } catch {
        setTenants([]);
      }
    };
    void loadTenants();
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

  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const openPromote = (user: PlatformUser) => {
    setPromoting(user);
    const base = user.fullName?.trim() || user.email.split('@')[0] || 'tenant';
    setTenantName(base);
    setTenantSlug(normalizeSlug(base));
    setTenantLogoFile(null);
    if (tenantLogoPreviewUrl) URL.revokeObjectURL(tenantLogoPreviewUrl);
    setTenantLogoPreviewUrl(null);
    setExistingTenantId('');
    setUseExistingTenant(false);
    setMembershipRole('OWNER');
    setLastPromotedRoute(null);
  };

  const handlePromoteLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setTenantLogoFile(null);
      setTenantLogoPreviewUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
      return;
    }
    const result = validateImageFile(file);
    if (!result.valid) {
      addToast(result.error, 'error');
      e.target.value = '';
      return;
    }
    setTenantLogoFile(file);
    setTenantLogoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearPromoteLogo = () => {
    setTenantLogoFile(null);
    setTenantLogoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (tenantLogoInputRef.current) tenantLogoInputRef.current.value = '';
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

  const submitPromotion = async () => {
    if (!promoting) return;
    if (!useExistingTenant && (!tenantName.trim() || !normalizeSlug(tenantSlug))) {
      addToast('Tenant name and slug are required.', 'error');
      return;
    }
    if (useExistingTenant && !existingTenantId) {
      addToast('Choose an existing tenant.', 'error');
      return;
    }

    let logoUrl: string | undefined;
    if (!useExistingTenant && tenantLogoFile) {
      setTenantLogoUploading(true);
      try {
        const { fileId } = await uploadLogo(tenantLogoFile);
        logoUrl = getLogoUrl(fileId);
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Logo upload failed', 'error');
        setTenantLogoUploading(false);
        return;
      }
      setTenantLogoUploading(false);
    }

    setPromotionSaving(true);
    try {
      const result = await apiClient<PromoteResult>(`/api/admin/users/${promoting.id}/promote-tenant`, {
        method: 'POST',
        body: JSON.stringify({
          existingTenantId: useExistingTenant ? existingTenantId : undefined,
          tenantName: useExistingTenant ? undefined : tenantName.trim(),
          tenantSlug: useExistingTenant ? undefined : normalizeSlug(tenantSlug),
          logoUrl: useExistingTenant ? undefined : logoUrl ?? '',
          membershipRole
        })
      });
      setLastPromotedRoute(result.adminRoute);
      addToast('User promoted to tenant successfully', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to promote user', 'error');
    } finally {
      setPromotionSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Members</h1>
        <p className="text-gray-500">All registered members.</p>
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
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                    Edit role/status
                  </Button>
                  <Button size="sm" onClick={() => openPromote(user)}>
                    Make Tenant
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

      <Modal
        isOpen={!!promoting}
        onClose={() => setPromoting(null)}
        title="Promote user to tenant"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setPromoting(null)}>Cancel</Button>
            <Button onClick={() => void submitPromotion()} isLoading={promotionSaving}>Confirm promotion</Button>
          </>
        }
      >
        {promoting && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will make <span className="font-medium">{promoting.fullName || promoting.email}</span> a tenant admin ({membershipRole}).
            </p>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={useExistingTenant}
                onChange={(e) => setUseExistingTenant(e.target.checked)}
              />
              Assign to existing tenant
            </label>

            {useExistingTenant ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing tenant</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                  value={existingTenantId}
                  onChange={(e) => setExistingTenantId(e.target.value)}
                >
                  <option value="">Select tenant</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <Input
                  label="Tenant/community name"
                  value={tenantName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTenantName(value);
                    setTenantSlug(normalizeSlug(value));
                  }}
                />
                <Input
                  label="Tenant slug"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(normalizeSlug(e.target.value))}
                  placeholder="my-community"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo (optional)</label>
                  <p className="text-xs text-gray-500 mb-2">Upload from device (JPEG, PNG, WebP, or GIF, max 5 MB)</p>
                  <input
                    ref={tenantLogoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handlePromoteLogoChange}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    {tenantLogoPreviewUrl && (
                      <div className="relative inline-block">
                        <img
                          src={tenantLogoPreviewUrl}
                          alt="Logo preview"
                          className="w-12 h-12 rounded-lg object-contain border border-gray-200 bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={clearPromoteLogo}
                          className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                          aria-label="Remove logo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Upload className="w-4 h-4" />}
                      onClick={() => tenantLogoInputRef.current?.click()}
                      disabled={tenantLogoUploading}
                    >
                      {tenantLogoPreviewUrl ? 'Replace' : 'Choose file'}
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership role</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                value={membershipRole}
                onChange={(e) => setMembershipRole(e.target.value as 'OWNER' | 'ADMIN')}
              >
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {lastPromotedRoute ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                User promoted successfully.{' '}
                <Link className="font-semibold underline" to={lastPromotedRoute}>
                  Open tenant admin dashboard
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}

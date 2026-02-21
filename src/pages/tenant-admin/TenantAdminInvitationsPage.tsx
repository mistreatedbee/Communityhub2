import React, { useEffect, useState } from 'react';
import { Search, X, Mail, Phone, Calendar, Link as LinkIcon, RefreshCw, Ban, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../components/ui/Toast';
import { tenantFeaturesGet, tenantFeaturesPost, tenantFeaturesPut } from '../../lib/tenantFeatures';

type Invitation = {
  _id: string;
  email: string;
  phone?: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  token: string;
};

const roleColors = {
  OWNER: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
  MODERATOR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  MEMBER: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusColors = {
  SENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
  EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
  REVOKED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
};

export function TenantAdminInvitationsPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Invitation['role']>('MEMBER');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [items, setItems] = useState<Invitation[]>([]);
  const [filteredItems, setFilteredItems] = useState<Invitation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const rows = await tenantFeaturesGet<Invitation[]>(tenant.id, '/invitations');
      setItems(rows);
      setFilteredItems(rows);
    } catch (error) {
      addToast('Failed to load invitations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  // Filter invitations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.email.toLowerCase().includes(term) ||
        item.phone?.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const create = async () => {
    if (!tenant?.id || !email.trim()) return;
    try {
      await tenantFeaturesPost(tenant.id, '/invitations', {
        email: email.trim(),
        phone: phone.trim(),
        role,
        expiresInDays: Number(expiresInDays) || 7,
      });
      setEmail('');
      setPhone('');
      setExpiresInDays('7');
      setRole('MEMBER');
      await load();
      addToast('Invitation created.', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create invitation', 'error');
    }
  };

  const resend = async (id: string) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesPut(tenant.id, `/invitations/${id}/resend`, {});
      await load();
      addToast('Invitation re-sent with a new token.', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to resend invitation', 'error');
    }
  };

  const revoke = async (id: string) => {
    if (!tenant?.id) return;
    try {
      await tenantFeaturesPut(tenant.id, `/invitations/${id}/revoke`, {});
      await load();
      addToast('Invitation revoked.', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to revoke invitation', 'error');
    }
  };

  const copyJoinLink = (token: string) => {
    if (!tenant?.slug) return;
    const url = `${window.location.origin}/c/${tenant.slug}/join?invite=${token}`;
    navigator.clipboard.writeText(url);
    addToast('Join link copied to clipboard', 'success');
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
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invitations</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by email or phone..."
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
        </div>

        {/* Create invitation form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary)]" />
            Send new invitation
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              required
            />
            <Input
              label="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+27 73 153 1188"
              leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                value={role}
                onChange={(e) => setRole(e.target.value as Invitation['role'])}
              >
                <option value="MEMBER">Member</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Owner</option>
              </select>
            </div>
            <Input
              label="Expires in days"
              type="number"
              min="1"
              max="30"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <Button
            onClick={() => void create()}
            disabled={!email.trim()}
            className="w-full sm:w-auto"
          >
            Send invitation
          </Button>
        </div>

        {/* Invitations count */}
        <p className="text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'invitation' : 'invitations'} found
        </p>

        {/* Invitations list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No invitations found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            ) : (
              <p className="text-sm text-gray-400">Send your first invitation to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{item.email}</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[item.role]}`}
                      >
                        {item.role}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[item.status]}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    {item.phone && (
                      <p className="text-sm text-gray-600 mt-1">{item.phone}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Expires {new Date(item.expiresAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {tenant?.slug && (
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 truncate max-w-xs">
                          /c/{tenant.slug}/join?invite={item.token}
                        </code>
                        <button
                          onClick={() => copyJoinLink(item.token)}
                          className="text-gray-400 hover:text-[var(--color-primary)] transition"
                          title="Copy join link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void resend(item._id)}
                      disabled={item.status === 'ACCEPTED' || item.status === 'REVOKED'}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      Resend
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void revoke(item._id)}
                      disabled={item.status === 'ACCEPTED' || item.status === 'REVOKED'}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      leftIcon={<Ban className="w-4 h-4" />}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

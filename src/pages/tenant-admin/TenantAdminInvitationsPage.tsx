import React, { useEffect, useState } from 'react';
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

export function TenantAdminInvitationsPage() {
  const { tenant } = useTenant();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Invitation['role']>('MEMBER');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [items, setItems] = useState<Invitation[]>([]);

  const load = async () => {
    if (!tenant?.id) return;
    setItems(await tenantFeaturesGet<Invitation[]>(tenant.id, '/invitations'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const create = async () => {
    if (!tenant?.id || !email.trim()) return;
    await tenantFeaturesPost(tenant.id, '/invitations', {
      email: email.trim(),
      phone: phone.trim(),
      role,
      expiresInDays: Number(expiresInDays) || 7
    });
    setEmail('');
    setPhone('');
    await load();
    addToast('Invitation created.', 'success');
  };

  const resend = async (id: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesPut(tenant.id, `/invitations/${id}/resend`, {});
    await load();
    addToast('Invitation re-sent with a new token.', 'success');
  };

  const revoke = async (id: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesPut(tenant.id, `/invitations/${id}/revoke`, {});
    await load();
    addToast('Invitation revoked.', 'success');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Expires in days" type="number" min="1" max="30" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select className="w-full rounded-lg border border-gray-300 p-2" value={role} onChange={(e) => setRole(e.target.value as Invitation['role'])}>
            <option value="MEMBER">MEMBER</option>
            <option value="MODERATOR">MODERATOR</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OWNER">OWNER</option>
          </select>
        </div>
        <Button onClick={() => void create()}>Send invitation</Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-semibold text-gray-900">{item.email}</p>
            {item.phone ? <p className="text-sm text-gray-600">{item.phone}</p> : null}
            <p className="text-sm text-gray-600">{item.role} | {item.status}</p>
            <p className="text-xs text-gray-500">Expires {new Date(item.expiresAt).toLocaleString()}</p>
            {tenant?.slug ? (
              <p className="text-xs text-gray-500 mt-1 break-all">/c/{tenant.slug}/join?invite={item.token}</p>
            ) : null}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => void resend(item._id)} disabled={item.status === 'ACCEPTED'}>
                Resend
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600"
                onClick={() => void revoke(item._id)}
                disabled={item.status === 'ACCEPTED' || item.status === 'REVOKED'}
              >
                Revoke
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

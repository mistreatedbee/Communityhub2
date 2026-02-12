import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';

type JoinField = {
  id: string;
  key: string;
  label: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX';
  required: boolean;
  options: string[];
};

type JoinInfo = {
  tenant: { id: string; name: string; slug: string };
  settings: { publicSignup: boolean; approvalRequired: boolean; registrationFieldsEnabled: boolean };
  registrationFields: JoinField[];
  invitation: null | {
    token: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
    status: 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
    valid: boolean;
    expiresAt: string;
  };
};

export function TenantJoinPage() {
  const { tenant, refresh: refreshTenant } = useTenant();
  const { user, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [searchParams] = useSearchParams();

  const inviteToken = useMemo(() => searchParams.get('invite')?.trim() || '', [searchParams]);
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, string | boolean>>({});
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tenantSlug) return;
      setLoadingInfo(true);
      try {
        const query = inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : '';
        const data = await apiClient<JoinInfo>(`/api/tenants/${tenantSlug}/join-info${query}`);
        setJoinInfo(data);
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Unable to load join page', 'error');
      } finally {
        setLoadingInfo(false);
      }
    };
    void load();
  }, [tenantSlug, inviteToken, addToast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantSlug) return;

    if (!user) {
      const query = inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : '';
      navigate('/login', { state: { from: `/c/${tenantSlug}/join${query}` } });
      return;
    }

    if (joinInfo?.invitation && !joinInfo.invitation.valid) {
      addToast(`Invitation is ${joinInfo.invitation.status.toLowerCase()}.`, 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient<{ pendingApproval: boolean }>(`/api/tenants/${tenantSlug}/join`, {
        method: 'POST',
        body: JSON.stringify({
          inviteToken: inviteToken || undefined,
          fullName,
          phone,
          customFields
        })
      });
      await Promise.all([refreshProfile(), refreshTenant()]);

      if (result.pendingApproval) {
        addToast('Registration submitted. Waiting for admin approval.', 'success');
      } else {
        addToast('You joined the community.', 'success');
      }
      navigate(`/c/${tenantSlug}/app`);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Unable to join', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInfo) {
    return <div className="py-16 text-center text-gray-500">Loading join page...</div>;
  }

  if (!tenant || !joinInfo) {
    return <div className="py-16 text-center text-gray-500">Community not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Join {tenant.name}</h1>
        <p className="text-gray-500">
          {inviteToken ? 'Complete your invitation registration.' : 'Create your member registration for this community.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-8">
        {joinInfo.invitation ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            Invitation for <span className="font-semibold">{joinInfo.invitation.email}</span> ({joinInfo.invitation.role}) -{' '}
            <span className={joinInfo.invitation.valid ? 'text-green-700' : 'text-red-700'}>
              {joinInfo.invitation.valid ? 'valid' : joinInfo.invitation.status.toLowerCase()}
            </span>
          </div>
        ) : null}

        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

        {(joinInfo.registrationFields || []).map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.fieldType === 'TEXTAREA' ? (
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2"
                required={field.required}
                value={String(customFields[field.key] || '')}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            ) : (
              <Input
                required={field.required}
                value={String(customFields[field.key] || '')}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" isLoading={loading}>
          {user ? 'Submit registration' : 'Continue to login'}
        </Button>
      </form>
    </div>
  );
}

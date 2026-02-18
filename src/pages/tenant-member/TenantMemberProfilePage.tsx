import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';

type MemberProfileResponse = {
  membershipStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  profile: {
    fullName: string;
    phone: string;
    customFields: Record<string, unknown>;
  };
};

export function TenantMemberProfilePage() {
  const { addToast } = useToast();
  const { tenant } = useTenant();
  const [profile, setProfile] = useState<MemberProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id) return;
      const data = await tenantFeaturesGet<MemberProfileResponse>(tenant.id, '/member-profile');
      setProfile(data);
    };
    void load();
  }, [tenant?.id]);

  const save = async () => {
    if (!profile || !tenant?.id) return;
    setLoading(true);
    try {
      await tenantFeaturesPut(tenant.id, '/member-profile', {
        fullName: profile.profile.fullName,
        phone: profile.profile.phone,
        customFields: profile.profile.customFields || {}
      });
      addToast('Profile updated', 'success');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <p className="text-sm text-gray-500">Loading profile...</p>;
  }

  return (
    <Card className="p-6 space-y-4 max-w-xl">
      <p className="text-sm text-gray-600">Membership status: {profile.membershipStatus}</p>
      <Input
        label="Full Name"
        value={profile.profile.fullName || ''}
        onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, fullName: e.target.value } })}
      />
      <Input
        label="Phone"
        value={profile.profile.phone || ''}
        onChange={(e) => setProfile({ ...profile, profile: { ...profile.profile, phone: e.target.value } })}
      />
      <Button onClick={() => void save()} isLoading={loading}>Save Profile</Button>
    </Card>
  );
}

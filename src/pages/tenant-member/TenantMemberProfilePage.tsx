import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { MemberPageContainer, PageHeader, Section } from '../../components/member';
import { Spinner } from '../../components/ui/Spinner';

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
    return (
      <MemberPageContainer>
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </MemberPageContainer>
    );
  }

  return (
    <MemberPageContainer narrow>
      <PageHeader
        title="My profile"
        subtitle="Manage your community profile and contact details."
      />
      <Section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Membership</h2>
        <p className="text-sm text-gray-600">
          Your status: <span className="font-medium text-gray-900">{profile.membershipStatus}</span>
        </p>
      </Section>
      <Section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal details</h2>
        <div className="space-y-4 max-w-md">
          <Input
            label="Full name"
            value={profile.profile.fullName || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                profile: { ...profile.profile, fullName: e.target.value }
              })
            }
          />
          <Input
            label="Phone"
            value={profile.profile.phone || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                profile: { ...profile.profile, phone: e.target.value }
              })
            }
          />
          <Button onClick={() => void save()} isLoading={loading}>
            Save profile
          </Button>
        </div>
      </Section>
    </MemberPageContainer>
  );
}

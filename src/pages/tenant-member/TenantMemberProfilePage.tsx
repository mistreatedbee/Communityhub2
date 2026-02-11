import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export function TenantMemberProfilePage() {
  const { user, profileName } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [name, setName] = useState(profileName ?? '');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle<ProfileRow>();
      setProfile(data ?? null);
      setName(data?.full_name ?? '');
      setPhone(data?.phone ?? '');
      setAvatarUrl(data?.avatar_url ?? '');
      setLoading(false);
    };
    void load();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name.trim() || null,
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null
      })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      addToast(error.message ? `Unable to update profile: ${error.message}` : 'Unable to update profile.', 'error');
      return;
    }
    addToast('Profile updated.', 'success');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Spinner />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Update your personal details.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={profile?.email ?? ''} disabled />
        <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input
          label="Avatar URL"
          placeholder="https://..."
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <Button onClick={() => void handleSave()} isLoading={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

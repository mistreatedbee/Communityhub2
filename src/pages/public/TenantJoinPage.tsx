import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getPasswordValidationError, isValidEmail } from '../../utils/validation';
import { setPendingTenantJoin } from '../../utils/pendingAuthIntents';

type RegistrationField = {
  id: string;
  key: string;
  label: string;
  field_type: string;
  required: boolean;
  options: string[];
};

export function TenantJoinPage() {
  const { tenant, settings, license } = useTenant();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadFields = async () => {
      if (!tenant) return;
      const { data } = await supabase
        .from('registration_fields')
        .select('id, key, label, field_type, required, options')
        .eq('organization_id', tenant.id)
        .eq('is_active', true)
        .order('field_order', { ascending: true })
        .returns<RegistrationField[]>();
      setFields(data ?? []);
    };
    void loadFields();
  }, [tenant?.id]);

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenant || !settings) return;

    if (!settings.public_signup) {
      addToast('This community is not accepting public registrations.', 'error');
      return;
    }
    if (license?.status === 'expired' || license?.status === 'cancelled') {
      addToast('This community is not accepting new members at the moment.', 'error');
      return;
    }

    if (!name.trim()) {
      addToast('Full name is required.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      addToast('Enter a valid email address.', 'error');
      return;
    }
    if (!user) {
      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        addToast(passwordError, 'error');
        return;
      }
    }

    for (const field of fields) {
      if (field.required && !formData[field.key]?.trim()) {
        addToast(`${field.label} is required.`, 'error');
        return;
      }
    }

    setIsSubmitting(true);
    const { count: activeCount } = await supabase
      .from('organization_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', tenant.id)
      .eq('status', 'active');
    const { data: licenseRow } = await supabase
      .from('organization_licenses')
      .select('license_plan:license_plans(max_members)')
      .eq('organization_id', tenant.id)
      .maybeSingle<{ license_plan: { max_members: number } }>();
    if (licenseRow?.license_plan?.max_members && (activeCount ?? 0) >= licenseRow.license_plan.max_members) {
      addToast('This community has reached its member limit.', 'error');
      setIsSubmitting(false);
      return;
    }
    let userId = user?.id ?? null;
    if (!userId) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (signUpError || !signUpData.user) {
        addToast(signUpError?.message ?? 'Unable to create account.', 'error');
        setIsSubmitting(false);
        return;
      }
      if (!signUpData.session) {
        setPendingTenantJoin(email, {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          name: name.trim(),
          formData,
          approvalRequired: settings.approval_required
        });
        addToast('Account created. Verify your email, then sign in to complete registration.', 'success');
        setIsSubmitting(false);
        navigate('/login', { state: { from: `/c/${tenant.slug}/join` } });
        return;
      }
      userId = signUpData.user.id;
    }

    const membershipStatus = settings.approval_required ? 'pending' : 'active';
    const { error: membershipError } = await supabase.from('organization_memberships').upsert({
      organization_id: tenant.id,
      user_id: userId,
      role: 'member',
      status: membershipStatus
    });
    if (membershipError) {
      addToast(membershipError.message, 'error');
      setIsSubmitting(false);
      return;
    }

    const { error: submissionError } = await supabase.from('registration_submissions').insert({
      organization_id: tenant.id,
      user_id: userId,
      payload: {
        name,
        email,
        ...formData
      }
    });
    if (submissionError) {
      addToast(submissionError.message, 'error');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);

    if (settings.approval_required) {
      addToast('Registration submitted. An admin will review your request.', 'success');
      navigate(`/c/${tenant.slug}`);
      return;
    }

    addToast('Welcome! Your account is active.', 'success');
    navigate(`/c/${tenant.slug}/app`);
  };

  if (!tenant) {
    return (
      <div className="py-16 text-center text-gray-500">
        Community not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Join {tenant.name}</h1>
        <p className="text-gray-500">Complete your registration to access the community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-8">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {!user && (
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        )}

        {fields.map((field) => (
          <Input
            key={field.id}
            label={field.label}
            required={field.required}
            value={formData[field.key] ?? ''}
            onChange={(event) => updateField(field.key, event.target.value)}
          />
        ))}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Submit registration
        </Button>
      </form>
    </div>
  );
}

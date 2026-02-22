import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { registerWithPassword, loginWithPassword } from '../../lib/apiAuth';
import { getRequiredFieldError, isValidEmail, getPasswordValidationError } from '../../utils/validation';

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
  allowJoin?: boolean;
  registrationFields: JoinField[];
  invitation: null | {
    token: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
    status: 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
    valid: boolean;
    expiresAt: string;
  };
  inviteLink?: null | { token: string; valid: boolean };
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
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [surnameError, setSurnameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'idle' | 'registering' | 'joining'>('idle');
  const [joinBlockedInviteRequired, setJoinBlockedInviteRequired] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tenantSlug) return;
      setLoadingInfo(true);
      try {
        const query = inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : '';
        const data = await apiClient<JoinInfo>(`/api/tenants/${tenantSlug}/join-info${query}`);
        setJoinInfo(data);
        setJoinBlockedInviteRequired(false);
        // Pre-fill email from invitation if available
        if (data.invitation?.email) {
          setEmail(data.invitation.email);
        }
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

    const hasValidInviteLink = joinInfo?.inviteLink?.valid;
    if (joinInfo?.invitation && !joinInfo.invitation.valid && !hasValidInviteLink) {
      addToast(`Invitation is ${joinInfo.invitation.status.toLowerCase()}.`, 'error');
      return;
    }

    // Clear previous errors
    setFirstNameError(null);
    setSurnameError(null);
    setPhoneError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validate all required fields
    const firstErr = getRequiredFieldError(firstName.trim(), 'Name');
    const surErr = getRequiredFieldError(surname.trim(), 'Surname');
    const phoneErr = getRequiredFieldError(phone, 'Phone');
    let hasErrors = false;

    if (firstErr) {
      setFirstNameError(firstErr);
      hasErrors = true;
    }
    if (surErr) {
      setSurnameError(surErr);
      hasErrors = true;
    }
    if (phoneErr) {
      setPhoneError(phoneErr);
      hasErrors = true;
    }

    // If user is not authenticated, require email and password
    if (!user) {
      const emailErr = !email.trim() ? 'Email is required.' : !isValidEmail(email) ? 'Please enter a valid email address.' : null;
      const pwdErr = getPasswordValidationError(password);
      
      if (emailErr) {
        setEmailError(emailErr);
        hasErrors = true;
      }
      if (pwdErr) {
        setPasswordError(pwdErr);
        hasErrors = true;
      }
    }

    // Validate required custom registration fields
    for (const field of joinInfo?.registrationFields || []) {
      if (!field.required) continue;
      const val = customFields[field.key];
      if (field.fieldType === 'CHECKBOX') {
        if (val !== true) hasErrors = true;
      } else if (val == null || String(val).trim() === '') {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      addToast('Please fill in all required fields correctly.', 'error');
      return;
    }

    setLoading(true);
    setRegistrationStep('idle');

    try {
      let currentUser = user;

      // Step 1: Register account if not authenticated
      if (!currentUser) {
        setRegistrationStep('registering');
        const fullName = [firstName.trim(), surname.trim()].filter(Boolean).join(' ').trim();
        try {
          await registerWithPassword({
            email: email.trim().toLowerCase(),
            password,
            fullName,
            phone: phone.trim()
          });
          await refreshProfile();
          // After refreshProfile, user context will be updated
          addToast('Account created successfully.', 'success');
        } catch (regError: any) {
          const errorMsg = regError instanceof Error ? regError.message : 'Unable to create account';
          if (errorMsg.includes('already in use') || errorMsg.includes('EMAIL_EXISTS')) {
            // Email exists - try to sign in instead
            try {
              await loginWithPassword(email.trim().toLowerCase(), password);
              await refreshProfile();
              addToast('Signed in successfully.', 'success');
              // Continue to join step below
            } catch (loginError: any) {
              const loginMsg = loginError instanceof Error ? loginError.message : 'Unable to sign in';
              setEmailError('This email is already registered.');
              setPasswordError('Invalid password. Please check your password or use a different email.');
              addToast('Email exists but password is incorrect. Please check your password.', 'error');
              setLoading(false);
              setRegistrationStep('idle');
              return;
            }
          } else {
            addToast(errorMsg, 'error');
            setLoading(false);
            setRegistrationStep('idle');
            return;
          }
        }
      }

      // Step 2: Join tenant
      setRegistrationStep('joining');
      const fullName = [firstName.trim(), surname.trim()].filter(Boolean).join(' ').trim();
      const result = await apiClient<{ pendingApproval: boolean; nextRoute?: string }>(`/api/tenants/${tenantSlug}/join`, {
        method: 'POST',
        body: JSON.stringify({
          inviteToken: inviteToken || undefined,
          fullName,
          phone: phone.trim(),
          customFields
        })
      });
      await Promise.all([refreshProfile(), refreshTenant()]);

      if (result.pendingApproval) {
        addToast('Registration submitted. Waiting for admin approval.', 'success');
        navigate(result.nextRoute || `/c/${tenantSlug}/pending`, { replace: true });
      } else {
        addToast('You joined the community.', 'success');
        navigate(result.nextRoute || `/c/${tenantSlug}`, { replace: true });
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unable to join';
      addToast(errorMsg, 'error');
      if (errorMsg.toLowerCase().includes('public signup') || errorMsg.toLowerCase().includes('invitation') || errorMsg.toLowerCase().includes('invite')) {
        setJoinBlockedInviteRequired(true);
      }
    } finally {
      setLoading(false);
      setRegistrationStep('idle');
    }
  };

  if (!tenantSlug) {
    return (
      <div className="py-16 text-center text-gray-500">
        Invalid community link. <a href="/communities" className="text-[var(--color-primary)] underline">Browse communities</a>.
      </div>
    );
  }

  if (loadingInfo) {
    return <div className="py-16 text-center text-gray-500">Loading join page...</div>;
  }

  if (!tenant || !joinInfo) {
    return <div className="py-16 text-center text-gray-500">Community not found.</div>;
  }

  const allowJoin = joinInfo.allowJoin !== false;
  const showInviteRequired = !allowJoin || joinBlockedInviteRequired;
  const stepHint = !user ? 'Step 1: Create account' : 'Step 2: Complete your profile';

  if (showInviteRequired) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join {tenant.name}</h1>
          <p className="text-gray-500 mt-1">Public signup is disabled for this community.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 space-y-3">
          <p className="font-medium">Invite required</p>
          <p className="text-sm">
            You need an invitation link to join. Ask the community admin for an invite, or use the link you received by email.
          </p>
          <p className="text-sm pt-2 border-t border-amber-200 mt-3">
            <strong>Community admins:</strong> To allow anyone to join without an invite, go to{' '}
            <a href={`/c/${tenantSlug}/admin/settings`} className="font-medium underline hover:no-underline">
              Settings → Registration settings
            </a>
            {' '}and turn on &quot;Allow directory/public signup&quot;, then save.
          </p>
          <a href={`/c/${tenantSlug}`} className="inline-block mt-4 text-sm font-medium text-amber-700 hover:underline">Back to community</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500 mb-1">{stepHint}</p>
        <h1 className="text-3xl font-bold text-gray-900">Join {tenant.name}</h1>
        <p className="text-gray-500 mt-1">
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
        ) : joinInfo.inviteLink?.valid ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            You&apos;re joining via an invite link.
          </div>
        ) : null}

        {!user && (
          <>
            <div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                required
                disabled={!!joinInfo?.invitation?.email}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && <p id="email-error" className="text-sm text-red-600 mt-1">{emailError}</p>}
              {joinInfo?.invitation?.email && (
                <p className="text-xs text-gray-500 mt-1">Email is set from your invitation.</p>
              )}
            </div>
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                required
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              {passwordError && <p id="password-error" className="text-sm text-red-600 mt-1">{passwordError}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters with uppercase, lowercase, and a number.
              </p>
            </div>
          </>
        )}

        <div>
          <Input
            label="Name"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setFirstNameError(null); }}
            required
            placeholder="First name"
            aria-invalid={!!firstNameError}
            aria-describedby={firstNameError ? 'firstName-error' : undefined}
          />
          {firstNameError && <p id="firstName-error" className="text-sm text-red-600 mt-1">{firstNameError}</p>}
        </div>
        <div>
          <Input
            label="Surname"
            value={surname}
            onChange={(e) => { setSurname(e.target.value); setSurnameError(null); }}
            required
            placeholder="Last name"
            aria-invalid={!!surnameError}
            aria-describedby={surnameError ? 'surname-error' : undefined}
          />
          {surnameError && <p id="surname-error" className="text-sm text-red-600 mt-1">{surnameError}</p>}
        </div>
        <div>
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }}
            required
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? 'phone-error' : undefined}
          />
          {phoneError && <p id="phone-error" className="text-sm text-red-600 mt-1">{phoneError}</p>}
        </div>

        {(joinInfo.registrationFields || []).map((field) => (
          <div key={field.id}>
            {field.fieldType !== 'CHECKBOX' && (
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            )}
            {field.fieldType === 'TEXTAREA' ? (
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2"
                required={field.required}
                value={String(customFields[field.key] || '')}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            ) : field.fieldType === 'SELECT' ? (
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                required={field.required}
                value={String(customFields[field.key] ?? '')}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
              >
                <option value="">Select...</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.fieldType === 'CHECKBOX' ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customFields[field.key] === true}
                  onChange={(e) => setCustomFields((prev) => ({ ...prev, [field.key]: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">{field.required ? `${field.label} (required)` : field.label}</span>
              </label>
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
          {loading && registrationStep === 'registering' && 'Creating account...'}
          {loading && registrationStep === 'joining' && 'Joining community...'}
          {!loading && user && 'Submit registration'}
          {!loading && !user && 'Create account & join'}
        </Button>
      </form>
    </div>
  );
}

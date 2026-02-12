import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  clearPendingTenantBootstrap,
  clearPendingTenantJoin,
  getPendingTenantBootstrap,
  getPendingTenantJoin
} from '../../utils/pendingAuthIntents';
import { hasLicenseSession } from '../../utils/licenseToken';
import { getSafeErrorMessage } from '../../utils/errors';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResolvingRole, setIsResolvingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);
  const [loginSuccessAt, setLoginSuccessAt] = useState<number | null>(null);
  const { organization } = useTheme();
  const { user, loading: authLoading, session, platformRole, memberships, refreshProfile } = useAuth();
  const fallbackProfileCheckDone = useRef(false);
  const rolePriority: Record<string, number> = {
    owner: 4,
    admin: 3,
    supervisor: 2,
    employee: 1,
    member: 0
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/communities';
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Clear any stale post-login redirect when user is signed out (e.g. after sign out, then opening login again).
  useEffect(() => {
    if (!user && !authLoading) {
      setPostLoginRedirect(null);
      fallbackProfileCheckDone.current = false;
    }
  }, [user, authLoading]);

  // Fallback: if auth listener never fires after login, redirect once we have session (e.g. after sign-out/login edge cases).
  useEffect(() => {
    if (loginSuccessAt == null || user != null) return;
    const t = setTimeout(async () => {
      if (location.pathname !== '/login') return;
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;
      setLoginSuccessAt(null);
      const { data: profile } = await supabase
        .from('profiles')
        .select('platform_role')
        .eq('user_id', data.session.user.id)
        .maybeSingle<{ platform_role: 'user' | 'super_admin' }>();
      if (profile?.platform_role === 'super_admin') {
        navigate('/super-admin', { replace: true });
        return;
      }
      const { data: mems } = await supabase
        .from('organization_memberships')
        .select('organization_id, role, status')
        .eq('user_id', data.session.user.id)
        .eq('status', 'active');
      if (mems?.length) {
        const primary = mems.sort((a, b) => (rolePriority[b.role] ?? 0) - (rolePriority[a.role] ?? 0))[0];
        const { data: org } = await supabase
          .from('organizations')
          .select('slug')
          .eq('id', primary.organization_id)
          .maybeSingle<{ slug: string }>();
        if (org?.slug) {
          const adminRoles = ['owner', 'admin', 'supervisor'];
          navigate(
            adminRoles.includes(primary.role) ? `/c/${org.slug}/admin` : `/c/${org.slug}/app`,
            { replace: true }
          );
          return;
        }
      }
      navigate('/communities', { replace: true });
    }, 3500);
    return () => clearTimeout(t);
  }, [loginSuccessAt, user, location.pathname, navigate]);

  // Single source of redirect: wait for AuthContext to finish loading so session + profile (platformRole) are set.
  useEffect(() => {
    if (authLoading || !user) return;

    setLoginSuccessAt(null);

    // Fallback: if context says platformRole 'user' but DB has super_admin (e.g. profile fetch failed or was stale), re-fetch and refresh context.
    if (platformRole === 'user' && !fallbackProfileCheckDone.current) {
      fallbackProfileCheckDone.current = true;
      setIsResolvingRole(true);
      (async () => {
        try {
          const { data, error: profileCheckError } = await supabase
            .from('profiles')
            .select('platform_role')
            .eq('user_id', user.id)
            .maybeSingle<{ platform_role: 'user' | 'super_admin' }>();
          if (profileCheckError && import.meta.env.DEV) {
            console.debug('[Login] fallback profile check failed', profileCheckError.code, profileCheckError.message);
          }
          if (data?.platform_role === 'super_admin') {
            if (import.meta.env.DEV) console.debug('[Login] fallback profile check: DB has super_admin, refreshing AuthContext');
            await refreshProfile();
          }
        } finally {
          setIsResolvingRole(false);
        }
      })();
      return;
    }

    if (isResolvingRole) return;

    if (postLoginRedirect) {
      if (import.meta.env.DEV) {
        console.debug('[Login] redirect effect: authLoading=false, hasUser=true, platformRole=', platformRole, '→', postLoginRedirect);
      }
      navigate(postLoginRedirect, { replace: true });
      setPostLoginRedirect(null);
      return;
    }

    if (platformRole === 'super_admin') {
      if (import.meta.env.DEV) {
        console.debug('[Login] redirect effect: authLoading=false, hasUser=true, platformRole=super_admin → /super-admin');
      }
      navigate('/super-admin', { replace: true });
      return;
    }
    const activeMemberships = memberships.filter((m) => m.status === 'active');
    if (activeMemberships.length > 0) {
      const primary = activeMemberships.sort(
        (a, b) => (rolePriority[b.role] ?? 0) - (rolePriority[a.role] ?? 0)
      )[0];
      if (import.meta.env.DEV) {
        console.debug('[Login] redirect effect: tenant member → fetching org slug for', primary.organization_id);
      }
      supabase
        .from('organizations')
        .select('slug')
        .eq('id', primary.organization_id)
        .maybeSingle<{ slug: string }>()
        .then(({ data }) => {
          if (data?.slug) {
            const adminRoles = ['owner', 'admin', 'supervisor'];
            const target = adminRoles.includes(primary.role)
              ? `/c/${data.slug}/admin`
              : `/c/${data.slug}/app`;
            if (import.meta.env.DEV) console.debug('[Login] redirect effect →', target);
            navigate(target, { replace: true });
          } else {
            if (import.meta.env.DEV) console.debug('[Login] redirect effect → /communities (no slug)');
            navigate('/communities', { replace: true });
          }
        });
      return;
    }
    if (hasLicenseSession()) {
      if (import.meta.env.DEV) console.debug('[Login] redirect effect → /setup-community');
      navigate('/setup-community', { replace: true });
      return;
    }
    if (import.meta.env.DEV) console.debug('[Login] redirect effect → /communities (default)');
    navigate('/communities', { replace: true });
  }, [authLoading, user, session, platformRole, memberships, postLoginRedirect, navigate, refreshProfile, isResolvingRole]);

  const getLoginErrorMessage = (err: unknown): string => {
    const obj = err && typeof err === 'object' ? (err as Record<string, unknown>) : null;
    const message =
      (obj?.error_description && typeof obj.error_description === 'string' ? obj.error_description : null) ||
      (obj?.message && typeof obj.message === 'string' ? obj.message : null) ||
      (err instanceof Error ? err.message : '') ||
      '';

    if (!message) return 'Unable to sign in. Please check your credentials and try again.';
    if (/email not confirmed|signup_not confirmed|email_not_confirmed/i.test(message)) {
      return 'Your email is not verified yet. In Supabase: Authentication → Users → open your user → confirm email, or turn off "Confirm email" in Providers.';
    }
    if (/invalid login credentials|invalid_grant/i.test(message)) {
      return 'Incorrect email or password. If you just created the user in Supabase, confirm the email or use "Send password recovery" to set a new password.';
    }
    if (/user not found|invalid_credentials/i.test(message)) {
      return 'No account found with this email. Create the user in Supabase → Authentication → Users → Add user (check Auto Confirm User).';
    }
    if (/rate limit|too many requests/i.test(message)) {
      return 'Too many attempts. Please wait a few minutes and try again.';
    }
    if (/network|fetch|failed to fetch/i.test(message)) {
      return 'Network error. Check your internet connection and try again.';
    }
    if (/session.*expired|jwt expired/i.test(message)) {
      return 'Your session expired. Please sign in again.';
    }
    if (/timeout/i.test(message)) {
      return 'Request timed out. Please check your connection and try again.';
    }
    return message.length > 120 ? `${message.slice(0, 120)}…` : message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const signInResult = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      const { data, error: signInError } = signInResult;
      if (import.meta.env.DEV) {
        console.debug('[Login] signInWithPassword result', {
          userId: data?.user?.id ?? null,
          error: signInError ? { code: signInError.code, message: signInError.message } : null
        });
      }
      if (signInError) {
        if (import.meta.env.DEV) console.error('[Login] Supabase auth error', signInError);
        const msg = getLoginErrorMessage(signInError);
        setError(msg);
        addToast(msg, 'error');
        return;
      }

      const { data: sessionCheck } = await supabase.auth.getSession();
      if (import.meta.env.DEV) {
        console.debug('[Login] getSession() immediately after signIn', {
          sessionExists: !!sessionCheck?.session,
          expires_at: sessionCheck?.session?.expires_at ?? null,
          userId: sessionCheck?.session?.user?.id ?? null
        });
      }
      if (!sessionCheck?.session) {
        if (import.meta.env.DEV) {
          console.warn('[Login] Session is null right after signIn — continuing anyway; auth listener may set it shortly.');
        }
        addToast('Sign-in accepted. Loading your session…', 'info');
      } else {
        addToast('Successfully logged in!', 'success');
      }

      setLoginSuccessAt(Date.now());

      const userId = data.user?.id;
      const userEmail = (data.user?.email ?? normalizedEmail).trim().toLowerCase();

      // Hard check role with retries to avoid auth/profile timing races.
      if (userId) {
        let roleRow: { platform_role: 'user' | 'super_admin' } | null = null;
        let roleError: { code?: string; message: string } | null = null;

        for (let attempt = 0; attempt < 5; attempt++) {
          const roleResult = await supabase
            .from('profiles')
            .select('platform_role')
            .eq('user_id', userId)
            .maybeSingle<{ platform_role: 'user' | 'super_admin' }>();

          roleRow = roleResult.data;
          roleError = roleResult.error;

          if (roleError && import.meta.env.DEV) {
            console.debug('[Login] immediate role check failed', roleError.code, roleError.message, 'attempt', attempt + 1);
          }
          if (roleRow?.platform_role === 'super_admin') {
            break;
          }
          if (attempt < 4) await sleep(400);
        }

        if (roleRow?.platform_role === 'super_admin') {
          await refreshProfile();
          navigate('/super-admin', { replace: true });
          return;
        }

        if (roleError && import.meta.env.DEV) {
          console.debug('[Login] role lookup failed after retries; continuing with default redirect flow');
        }
      }

      // Do not navigate here — wait for AuthContext to update, then the redirect useEffect will run.
      if (userId && redirectPath !== '/communities') {
        setPostLoginRedirect(redirectPath);
        return;
      }

      // Run one-time pending actions (bootstrap/join) and set postLoginRedirect
      if (userId) {
        const pendingBootstrap = getPendingTenantBootstrap(userEmail);
        if (pendingBootstrap) {
          const { data: orgId, error: bootstrapError } = await supabase.rpc('bootstrap_tenant_admin', {
            p_name: pendingBootstrap.tenantName,
            p_slug: pendingBootstrap.tenantSlug,
            p_license_id: pendingBootstrap.planId
          });
          if (!bootstrapError && orgId) {
            clearPendingTenantBootstrap(userEmail);
            addToast('Tenant setup completed. Continue onboarding.', 'success');
            setPostLoginRedirect(`/c/${pendingBootstrap.tenantSlug}/admin/onboarding`);
            return;
          }
          addToast(
            getSafeErrorMessage(
              bootstrapError,
              'Signed in, but tenant setup is still pending. Please retry tenant registration.'
            ),
            'error'
          );
        }

        const pendingJoin = getPendingTenantJoin(userEmail);
        if (pendingJoin) {
          const membershipStatus = pendingJoin.approvalRequired ? 'pending' : 'active';
          const { error: membershipError } = await supabase.from('organization_memberships').upsert({
            organization_id: pendingJoin.tenantId,
            user_id: userId,
            role: 'member',
            status: membershipStatus
          });
          if (!membershipError) {
            await supabase.from('registration_submissions').insert({
              organization_id: pendingJoin.tenantId,
              user_id: userId,
              payload: {
                name: pendingJoin.name,
                email: userEmail,
                ...pendingJoin.formData
              }
            });
            clearPendingTenantJoin(userEmail);
            if (pendingJoin.approvalRequired) {
              addToast('Registration submitted. An admin will review your request.', 'success');
              setPostLoginRedirect(`/c/${pendingJoin.tenantSlug}`);
            } else {
              addToast('Welcome! Your account is active.', 'success');
              setPostLoginRedirect(`/c/${pendingJoin.tenantSlug}/app`);
            }
            return;
          }
          addToast(getSafeErrorMessage(membershipError, 'Signed in, but join request could not be completed.'), 'error');
        }
      }

      // Redirect is handled only by the useEffect that runs when AuthContext has user + platformRole/memberships.
    } catch (err) {
      console.error('Login failed', err);
      const msg = getLoginErrorMessage(err);
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {isLoading && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/95 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mb-4" />
          <p className="text-gray-600 font-medium">Signing you in…</p>
          <p className="text-sm text-gray-500 mt-1">Taking you to your dashboard</p>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
            {organization.name.charAt(0)}
          </div>
          <span className="font-bold text-2xl text-gray-900">{organization.name}</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/enter-license" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
            Create a tenant
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0 ring-1 ring-gray-200">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit} aria-disabled={isLoading}>
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                required
                leftIcon={<Mail className="w-5 h-5" />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required
                  leftIcon={<Lock className="w-5 h-5" />}
                />

                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-gray-500">
          <strong>Getting 400 or stuck?</strong> In Supabase: <strong>Authentication → Providers → Email</strong> → turn OFF &quot;Confirm email&quot;. Then <strong>Authentication → Users</strong> → open your user → <strong>Confirm user</strong>. Run <code className="bg-gray-100 px-1 rounded">fix-super-admin.sql</code> in SQL Editor for super admin, then try again.
        </p>
      </div>
    </div>
  );
}

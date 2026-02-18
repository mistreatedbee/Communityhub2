import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, KeyRound, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { loginWithPassword } from '../../lib/apiAuth';
import { apiClient } from '../../lib/apiClient';

const whatsappHref =
  'https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noAdminAccess, setNoAdminAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { organization } = useTheme();
  const { user, loading: authLoading, platformRole, memberships, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const redirectFrom = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (authLoading || !user) return;
    if (platformRole === 'SUPER_ADMIN') {
      navigate('/super-admin', { replace: true });
      return;
    }

    if (redirectFrom) {
      navigate(redirectFrom, { replace: true });
      return;
    }

    const adminMembership = memberships.find(
      (m) => m.status === 'ACTIVE' && (m.role === 'OWNER' || m.role === 'ADMIN')
    );

    if (adminMembership?.tenantId) {
      apiClient<{ slug: string }>(`/api/tenants/id/${adminMembership.tenantId}`)
        .then((tenant) => navigate(`/c/${tenant.slug}/admin`, { replace: true }))
        .catch(() => setNoAdminAccess(true));
      return;
    }

    const memberMembership = memberships.find((m) => m.status === 'ACTIVE' || m.status === 'PENDING');
    if (memberMembership?.tenantId) {
      apiClient<{ slug: string }>(`/api/tenants/id/${memberMembership.tenantId}`)
        .then((tenant) => navigate(`/c/${tenant.slug}/app`, { replace: true }))
        .catch(() => setNoAdminAccess(true));
      return;
    }

    setNoAdminAccess(true);
  }, [authLoading, user, platformRole, memberships, navigate, redirectFrom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await loginWithPassword(email.trim().toLowerCase(), password);
      await refreshProfile();
      setNoAdminAccess(false);
      addToast('Successfully logged in!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in';
      setError(message);
      addToast(message, 'error');
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
          <p className="text-gray-600 font-medium">Signing you in...</p>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 justify-center">
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className="h-10 w-auto drop-shadow-lg rounded-xl bg-white/80 p-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              {organization.name.charAt(0)}
            </div>
          )}
          <span className="font-bold text-2xl text-gray-900 tracking-tight">{organization.name}</span>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Login</h2>
        <p className="text-sm text-gray-600 mt-2">
          Sign in to manage your organization&apos;s Community Hub.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This login is for tenant administrators and super admins. Members should join communities from the community page.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl grid md:grid-cols-2 gap-6">
        <Card className="shadow-xl border-0 ring-1 ring-gray-200 bg-white/90 backdrop-blur">
          <CardContent className="p-8 space-y-6">
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                required
                leftIcon={<Mail className="w-5 h-5" />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  required
                  leftIcon={<Lock className="w-5 h-5" />}
                />

                <div className="flex justify-end mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign in
                </Button>
                <p className="text-xs text-gray-500">
                  By signing in you agree to the workspace&apos;s community guidelines.
                </p>
              </div>
            </form>

            {noAdminAccess && (
              <div className="mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <p className="text-sm font-medium">No admin access found for this account.</p>
                <p className="text-xs mt-1">
                  You can browse public communities, or contact sales to create and manage your own tenant hub.
                </p>
                <div className="mt-3 flex gap-2">
                  <Link to="/communities">
                    <Button size="sm" variant="outline">
                      Browse Communities
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await signOut();
                      setNoAdminAccess(false);
                    }}
                  >
                    Use different account
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 ring-1 ring-gray-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardContent className="p-8 space-y-5">
            <h3 className="text-xl font-semibold text-gray-900">Need to set up a new admin hub?</h3>
            <p className="text-sm text-gray-200">
              Onboarding is license-first for new community tenants. Create a branded digital home for your members in
              minutes.
            </p>

            <Link to="/enter-license">
              <Button className="w-full bg-white text-slate-900 hover:bg-gray-100" leftIcon={<KeyRound className="w-4 h-4" />}>
                Enter License Key
              </Button>
            </Link>

            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button className="w-full" variant="secondary" leftIcon={<MessageCircle className="w-4 h-4" />}>
                Contact Sales
              </Button>
            </a>

            <p className="text-xs text-gray-300 pt-2">
              Existing clients: Enter your license to create your admin account and community workspace.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  KeyRound,
  MessageCircle,
  CheckCircle,
  HelpCircle,
  Shield,
} from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false); // new state for remember me
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
    <>
      {/* Animated background gradient with dot pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Loading overlay – glassmorphism style */}
      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-300"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 animate-ping" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">
            Signing you in securely...
          </p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      )}

      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 animate-fade-in-down">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 group transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[var(--color-primary)]/30 group-hover:shadow-xl transition-shadow">
              {organization.name.charAt(0)}
            </div>
            <span className="font-bold text-3xl text-gray-900">{organization.name}</span>
          </Link>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Welcome back</h2>
          <p className="text-base text-gray-600 mt-3 max-w-xs mx-auto">
            Admin login for organizations managing a Community Hub tenant.
          </p>
        </div>

        {/* Main content – two column layout */}
        <div className="sm:mx-auto sm:w-full sm:max-w-5xl grid md:grid-cols-2 gap-8 px-4">
          {/* Left card – Sign in form */}
          <Card className="shadow-2xl border-0 ring-1 ring-gray-200/80 hover:ring-gray-300/80 transition-all duration-300 backdrop-blur-sm bg-white/95">
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit} aria-disabled={isLoading}>
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 animate-shake"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
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
                  leftIcon={<Mail className="w-5 h-5 text-gray-500" />}
                  className="transition-shadow focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30"
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    required
                    leftIcon={<Lock className="w-5 h-5 text-gray-500" />}
                    className="transition-shadow focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30"
                  />

                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30 transition"
                      />
                      <span>Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline-offset-2 hover:underline transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full group relative overflow-hidden"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                >
                  <span className="relative z-10">Sign in</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </form>

              {/* Security badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-6">
                <Shield className="w-4 h-4" />
                <span>Secure, encrypted login</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>2FA ready</span>
              </div>

              {/* No admin access message – enhanced */}
              {noAdminAccess && (
                <div className="mt-6 p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 animate-fade-in">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">No admin access found</p>
                      <p className="text-xs mt-1 leading-relaxed">
                        Your account doesn't have admin rights for any tenant. You can browse public
                        communities, or contact sales to create your own hub.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to="/communities">
                      <Button size="sm" variant="outline" className="gap-2">
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
                      className="gap-2"
                    >
                      Use different account
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right card – Getting started & support */}
          <Card className="shadow-2xl border-0 ring-1 ring-gray-200/80 hover:ring-gray-300/80 transition-all duration-300 backdrop-blur-sm bg-white/95">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--color-primary)]/10">
                    <KeyRound className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">New to {organization.name}?</h3>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  Onboarding is license‑first for new community tenants. Follow these simple steps to
                  get your hub up and running.
                </p>

                {/* Step-by-step guide */}
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Enter your license key</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Provided at purchase – starts your tenant setup.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create admin account</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        You'll become the Owner of your new community.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Set up your workspace</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customize branding, invite members, and go live.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 space-y-3">
                  <Link to="/enter-license">
                    <Button
                      className="w-full gap-2 group"
                      leftIcon={<KeyRound className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                    >
                      Enter License Key
                    </Button>
                  </Link>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="w-full gap-2"
                      variant="secondary"
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                    >
                      Contact Sales via WhatsApp
                    </Button>
                  </a>
                </div>

                {/* Additional support */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Need help?</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Our support team typically responds within 1 hour.{' '}
                        <a
                          href="mailto:support@communityhub.com"
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          support@communityhub.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-500">
          <div className="flex justify-center gap-6 mb-3">
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-gray-700 transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} {organization.name}. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Custom keyframe animations (add to your global CSS or via Tailwind config) */}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </>
  );
}

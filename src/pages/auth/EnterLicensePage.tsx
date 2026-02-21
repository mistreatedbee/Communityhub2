import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { setLicenseToken } from '../../utils/licenseToken';
import { SafeImage } from '../../components/ui/SafeImage';

type VerifyResult = {
  valid: boolean;
  plan?: { name: string };
};

const whatsappHref =
  'https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6';

export function EnterLicensePage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useTheme();
  const { user, loading: authLoading, platformRole } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (authLoading || !user) return;
    if (platformRole === 'SUPER_ADMIN') {
      navigate('/super-admin', { replace: true });
    }
  }, [authLoading, user, platformRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = licenseKey.trim();
    if (!key) {
      addToast('Please enter your license key.', 'error');
      return;
    }
    setError(null);

    setLoading(true);
    try {
      const result = await apiClient<VerifyResult>('/api/licenses/verify', {
        method: 'POST',
        body: JSON.stringify({ licenseKey: key }),
      });

      if (!result?.valid) {
        const msg = 'License invalid, expired, or already claimed.';
        setError(msg);
        addToast(msg, 'error');
        return;
      }

      setLicenseToken(key, key);
      addToast(
        result.plan?.name
          ? `License verified: ${result.plan.name}. Continue to sign up.`
          : 'License verified. Continue to sign up.',
        'success'
      );
      navigate('/signup', { replace: true });
    } catch (err) {
      console.error('Verify license error', err);
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <>
      {/* Animated background – consistent with other pages */}
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

      {/* Glass‑morphism loading overlay */}
      {loading && (
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
            Verifying license key...
          </p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
        </div>
      )}

      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
        {/* Back button */}
        <div className="absolute top-4 left-4 sm:left-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Header with brand logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 animate-fade-in-down px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-6 justify-center group transition-transform hover:scale-105"
          >
            <SafeImage
              src={organization.logo || '/logo.png'}
              alt={organization.name}
              fallbackSrc="/logo.png"
              className="h-12 w-auto object-contain drop-shadow-lg"
            />
            <span className="font-bold text-3xl text-gray-900 tracking-tight">{organization.name}</span>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Enter your license key</h1>
          <p className="text-base text-gray-600 mt-2">
            A license is required to create and manage your own community hub.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Two‑column layout */}
        <div className="sm:mx-auto sm:w-full sm:max-w-5xl grid md:grid-cols-2 gap-8 px-4">
          {/* LEFT CARD – License entry form */}
          <Card className="shadow-2xl border-0 ring-1 ring-gray-200/80 backdrop-blur-sm bg-white/95">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  label="License key"
                  type="text"
                  placeholder="CH-XXXXX-XXXXX-XXXXX-XXXXX"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    setError(null);
                  }}
                  autoComplete="off"
                  leftIcon={<KeyRound className="w-5 h-5 text-gray-500" />}
                  className="transition-shadow focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30"
                />

                <Button
                  type="submit"
                  className="w-full group relative overflow-hidden"
                  size="lg"
                  isLoading={loading}
                >
                  <span className="relative z-10">Verify and continue</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </form>

              {/* Security trust badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-6">
                <Shield className="w-4 h-4" />
                <span>256‑bit encrypted verification</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>No credit card required</span>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT CARD – Onboarding steps & support */}
          <Card className="shadow-2xl border-0 ring-1 ring-gray-200/80 backdrop-blur-sm bg-white/95">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Icon header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--color-primary)]/10">
                    <CheckCircle className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">What happens next?</h3>
                </div>

                {/* Simple steps */}
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Verify license</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        We'll check your key is valid and not already used.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create your admin account</p>
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
                      <p className="font-medium text-gray-900">Launch your hub</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Set up branding, invite members, and go live.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact options */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Need a license or have questions?
                  </p>
                  <div className="flex flex-col gap-3">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button
                        variant="secondary"
                        className="w-full gap-2"
                        leftIcon={<MessageCircle className="w-4 h-4" />}
                      >
                        Contact Sales via WhatsApp
                      </Button>
                    </a>
                    <div className="flex items-start gap-3 text-xs text-gray-500 mt-2">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Typical response time: <strong>under 1 hour</strong>.{' '}
                        <a
                          href="mailto:sales@communityhub.com"
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          sales@communityhub.com
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Existing customer tip */}
                <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-700">Already have an account?</span>{' '}
                    You don't need a new license. Simply{' '}
                    <Link to="/login" className="text-[var(--color-primary)] hover:underline">
                      log in
                    </Link>{' '}
                    with your existing credentials.
                  </p>
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

      {/* Custom keyframe animations */}
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
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </>
  );
}

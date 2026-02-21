import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Users,
  Sparkles,
  KeyRound,
  MessageCircle,
  CheckCircle,
  Building2,
  BarChart3,
  Globe,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { hasLicenseSession } from '../../utils/licenseToken';
import { Spinner } from '../../components/ui/Spinner';

export function HomePage() {
  const { organization } = useTheme();
  const { user, loading, resolveDashboardTarget } = useAuth();
  const navigate = useNavigate();
  const [dashboardTarget, setDashboardTarget] = React.useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(false);

  useEffect(() => {
    if (!user && hasLicenseSession()) {
      navigate('/signup', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setDashboardTarget(null);
      return;
    }
    setDashboardLoading(true);
    void resolveDashboardTarget()
      .then((target) => {
        if (mounted) setDashboardTarget(target);
      })
      .finally(() => {
        if (mounted) setDashboardLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user, resolveDashboardTarget]);

  return (
    <>
      {/* Animated background – consistent with login/license pages */}
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

      <div className="relative min-h-screen flex flex-col">
        {/* Hero section – full width with logo */}
        <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left column – text content */}
              <div className="text-center lg:text-left animate-fade-in-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-6 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Multi‑tenant community platform
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                  Build a secure home <br className="hidden sm:inline" />
                  <span className="text-[var(--color-primary)]">for your community</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  {organization.name} helps organizations launch branded community hubs with
                  licensing, approvals, and analytics – all in one place.
                </p>

                {/* Button group – includes dynamic dashboard button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/communities">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto gap-2 group"
                      rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                      Browse communities
                    </Button>
                  </Link>

                  {user && dashboardTarget && !dashboardLoading && (
                    <Link to={dashboardTarget}>
                      <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                        {dashboardTarget === '/my-communities'
                          ? 'Go to My Communities'
                          : 'Go to My Community'}
                      </Button>
                    </Link>
                  )}

                  {user && dashboardLoading && (
                    <div className="inline-flex items-center justify-center px-4">
                      <Spinner size="sm" />
                    </div>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/login')}
                  >
                    Admin Login
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/enter-license')}
                  >
                    Create a Community Hub
                  </Button>
                </div>

                <p className="mt-6 text-sm text-gray-500 flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No credit card required for admin onboarding
                </p>
              </div>

              {/* Right column – logo + floating cards */}
              <div className="relative hidden lg:flex items-center justify-center animate-fade-in-right">
                <div className="relative w-full max-w-md">
                  {/* Main logo card */}
                  <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                    <img
                      src={organization.logo || '/logo.png'}
                      alt={organization.name}
                      className="w-full h-auto"
                    />
                  </div>
                  {/* Floating feature cards */}
                  <div className="absolute -top-8 -left-12 z-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200/50 animate-float-slow">
                    <Shield className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute -bottom-8 -right-12 z-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200/50 animate-float">
                    <Users className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute bottom-12 -left-16 z-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200/50 animate-float-slow-reverse">
                    <KeyRound className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-4xl font-bold text-gray-900">50+</p>
              <p className="text-sm text-gray-600 mt-1">Active communities</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-4xl font-bold text-gray-900">10k+</p>
              <p className="text-sm text-gray-600 mt-1">Community members</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-4xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-gray-600 mt-1">Uptime</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <p className="text-4xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-600 mt-1">Support</p>
            </div>
          </div>
        </section>

        {/* Feature grid – expanded to 6 features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to run a community
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From tenant isolation to granular permissions – we’ve built the foundation so you can
              focus on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tenant isolation</h3>
              <p className="text-gray-600">
                Data is fully scoped per tenant with role‑based access, audit logs, and strict
                separation.
              </p>
            </div>

            <div
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Member management</h3>
              <p className="text-gray-600">
                Approvals, invitations, and member roles (Owner, Admin, Moderator, Member) are
                built‑in.
              </p>
            </div>

            <div
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Licensing controls</h3>
              <p className="text-gray-600">
                Enforce plan limits, feature toggles, and subscription status across all tenants.
              </p>
            </div>

            <div
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">White‑label branding</h3>
              <p className="text-gray-600">
                Customize the hub with your own logo, colors, and domain – a fully branded
                experience.
              </p>
            </div>

            <div
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & insights</h3>
              <p className="text-gray-600">
                Track engagement, member growth, and activity with built‑in dashboards.
              </p>
            </div>

            <div
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi‑region hosting</h3>
              <p className="text-gray-600">
                Deploy close to your members with global infrastructure and fast CDN.
              </p>
            </div>
          </div>
        </section>

        {/* CTA section – license / sales */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to create your own community hub?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Purchase a license or enter an existing key to get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/enter-license">
                <Button
                  size="lg"
                  variant="primary"
                  className="bg-white text-gray-900 hover:bg-gray-100 gap-2 w-full sm:w-auto"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                >
                  Enter license key
                </Button>
              </Link>
              <a
                href="https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 gap-2 w-full sm:w-auto"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  Contact sales
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Existing customer?{' '}
              <Link to="/login" className="text-white underline underline-offset-2 hover:no-underline">
                Sign in
              </Link>{' '}
              to your admin dashboard.
            </p>
          </div>
        </section>
      </div>

      {/* Keyframe animations – add to global CSS or keep here */}
      <style>{`
        @keyframes fade-in-left {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(15px); }
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-slow-reverse {
          animation: float-slow-reverse 7s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

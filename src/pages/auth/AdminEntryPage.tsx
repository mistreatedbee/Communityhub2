import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  KeyRound,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  LogIn,
  Building2,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

const whatsappHref =
  'https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6';

export function AdminEntryPage() {
  const { organization } = useTheme();

  return (
    <>
      {/* Animated background with subtle gradient and dot pattern */}
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

      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
        {/* Header with animated fade-in */}
        <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" />
            Admin onboarding
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Welcome, Administrator
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            This area is for organizations creating and managing their own Community Hub.
            Choose your path below.
          </p>
        </div>

        {/* Main card – three options */}
        <div className="sm:mx-auto sm:w-full sm:max-w-5xl px-4">
          <Card className="shadow-2xl border-0 ring-1 ring-gray-200/80 backdrop-blur-sm bg-white/95">
            <CardContent className="p-8 md:p-10">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Option 1: Enter License */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-[var(--color-primary)]/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <KeyRound className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">New license</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Purchase or enter an existing license key to create your hub.
                  </p>
                  <Link to="/enter-license" className="w-full mt-auto">
                    <Button
                      className="w-full gap-2"
                      rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                      Enter License Key
                    </Button>
                  </Link>
                </div>

                {/* Option 2: Log In */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-[var(--color-primary)]/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <LogIn className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Existing admin</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Already have an account? Log in to manage your community.
                  </p>
                  <Link to="/login" className="w-full mt-auto">
                    <Button variant="outline" className="w-full gap-2">
                      Sign in
                    </Button>
                  </Link>
                </div>

                {/* Option 3: Contact Sales */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-[var(--color-primary)]/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Need a license?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our sales team via WhatsApp or email.
                  </p>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-auto"
                  >
                    <Button variant="secondary" className="w-full gap-2">
                      Contact Sales
                    </Button>
                  </a>
                </div>
              </div>

              {/* Detailed explanation section */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                      <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
                      What is a license?
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      A license enables your organization to create and manage its own private
                      Community Hub tenant. Each license is tied to one hub and includes all
                      administration features, member management, and customization tools.
                    </p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                      <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                      Already licensed?
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      If you've already purchased a license, simply enter your key above and
                      follow the setup flow. Existing administrators can log in directly to
                      access their hub.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust & support footer inside card */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure license verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>
                    Need help?{' '}
                    <a
                      href="mailto:support@communityhub.com"
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      support@communityhub.com
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Response time: {'<'} 1 hour</span>
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

      {/* Keyframe animations (add to global CSS) */}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
      `}</style>
    </>
  );
}

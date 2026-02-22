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
  Zap,
  Calendar,
  FileText,
  Layers,
  Home,
  Megaphone,
  Grid,
  Lock,
  TrendingUp,
  HeartHandshake,
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
      {/* Premium animated background (same as before) */}
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
        {/* 1️⃣ HERO SECTION — STRONG, CONFIDENT, UNIGNORABLE */}
        <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left column – text content */}
              <div className="text-center lg:text-left animate-fade-in-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                  Your Community.
                  <br />
                  <span className="text-[var(--color-primary)]">Your Website.</span>
                  <br />
                  Your Rules.
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Create a private, branded community platform where members connect, events happen,
                  and content lives — all in one place. No more WhatsApp chaos or Facebook group
                  limits.
                </p>

                {/* CTA group */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/enter-license">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto gap-2 group"
                      rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                      Create a Community Hub
                    </Button>
                  </Link>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/login')}
                  >
                    Admin Login
                  </Button>
                </div>

                {/* Dynamic dashboard link for logged-in users */}
                {user && dashboardTarget && !dashboardLoading && (
                  <div className="mt-4">
                    <Link to={dashboardTarget}>
                      <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                        {dashboardTarget === '/my-communities'
                          ? 'Go to My Communities'
                          : 'Go to My Community'}
                      </Button>
                    </Link>
                  </div>
                )}
                {user && dashboardLoading && (
                  <div className="mt-4 inline-flex items-center justify-center px-4">
                    <Spinner size="sm" />
                  </div>
                )}

                <p className="mt-6 text-sm text-gray-500 flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No credit card required for admin onboarding
                </p>
              </div>

              {/* Right column – abstract visual / floating elements */}
              <div className="relative hidden lg:flex items-center justify-center animate-fade-in-right">
                <div className="relative w-full max-w-md">
                  {/* Main glowing orb (abstract shape) */}
                  <div className="relative z-10 w-72 h-72 mx-auto rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 blur-2xl" />
                  {/* Floating icons representing community elements */}
                  <div className="absolute top-0 -left-12 z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200/50 animate-float-slow">
                    <Home className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute bottom-8 -right-16 z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200/50 animate-float">
                    <Users className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute top-20 -right-8 z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200/50 animate-float-slow-reverse">
                    <Calendar className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute bottom-0 left-0 z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200/50 animate-float">
                    <FileText className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2️⃣ “WHY THIS EXISTS” — PROBLEM → SOLUTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-200/50">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Problem side */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Communities are scattered across WhatsApp, email, PDFs, Facebook…
              </h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-red-100 text-red-600 flex-shrink-0 flex items-center justify-center text-sm">✕</span>
                  <span>No control – your content lives on someone else’s platform</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-red-100 text-red-600 flex-shrink-0 flex items-center justify-center text-sm">✕</span>
                  <span>No structure – important announcements buried in chat</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-red-100 text-red-600 flex-shrink-0 flex items-center justify-center text-sm">✕</span>
                  <span>No ownership – you don’t own your member relationships</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-red-100 text-red-600 flex-shrink-0 flex items-center justify-center text-sm">✕</span>
                  <span>No branding – your community looks like every other group</span>
                </p>
              </div>
            </div>
            {/* Solution side */}
            <div className="bg-[var(--color-primary)]/5 p-8 rounded-3xl border border-[var(--color-primary)]/10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-[var(--color-primary)]" />
                One platform. Full control.
              </h3>
              <div className="space-y-4 text-gray-700 text-lg">
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center text-sm">✓</span>
                  <span>Your own branded website – not a group chat</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center text-sm">✓</span>
                  <span>Clean structure – announcements, events, resources in one place</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center text-sm">✓</span>
                  <span>Full ownership – you control data and relationships</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center text-sm">✓</span>
                  <span>Professional presence – impress your members from day one</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3️⃣ PLATFORM CAPABILITIES — NOT FEATURES, CAPABILITIES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What you can do with your community hub
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful capabilities, not a boring feature list.
            </p>
          </div>

          <div className="space-y-24">
            {/* Capability 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
                  <Home className="w-4 h-4" />
                  A Real Community Website
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Each community gets its own branded home — not a group chat.
                </h3>
                <p className="text-lg text-gray-600">
                  Your members land on a beautiful, custom domain with your logo, colors, and
                  messaging. It feels like your organisation’s digital headquarters.
                </p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Community homepage with header, feed, sidebar]
              </div>
            </div>

            {/* Capability 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Announcements feed with pinned posts]
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
                  <Megaphone className="w-4 h-4" />
                  Announcements That Actually Reach People
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Never lose an important message in chat again.
                </h3>
                <p className="text-lg text-gray-600">
                  Push announcements via email, in-app, or even SMS. Members can comment, react,
                  and you always know who has seen what.
                </p>
              </div>
            </div>

            {/* Capability 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
                  <Calendar className="w-4 h-4" />
                  Events, Programs, and Activities in One Place
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  From weekly gatherings to multi‑week courses.
                </h3>
                <p className="text-lg text-gray-600">
                  Create events with RSVPs, calendars, and reminders. Run programs with
                  curriculum, homework, and progress tracking.
                </p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Event calendar and program overview]
              </div>
            </div>

            {/* Capability 4 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: File library with folders]
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
                  <FileText className="w-4 h-4" />
                  Files, Documents, and Resources — Organised
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  No more emailing PDFs or searching in WhatsApp.
                </h3>
                <p className="text-lg text-gray-600">
                  Upload files, link Google Docs, or embed videos. Everything is searchable and
                  organised in folders.
                </p>
              </div>
            </div>

            {/* Capability 5 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
                  <Grid className="w-4 h-4" />
                  Groups Inside Your Community
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Sub‑communities for teams, regions, or interests.
                </h3>
                <p className="text-lg text-gray-600">
                  Let members form smaller groups with their own feeds, events, and permissions.
                  Perfect for chapters, project teams, or special interests.
                </p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Groups list and group homepage]
              </div>
            </div>

            {/* Capability 6 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Member directory with profiles]
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-4">
                  <Users className="w-4 h-4" />
                  Members With Profiles, Not Phone Numbers
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Know who’s who. Build relationships.
                </h3>
                <p className="text-lg text-gray-600">
                  Members create rich profiles with photos, bios, and social links. Admins see
                  engagement and can assign roles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4️⃣ LIVE COMMUNITY EXPERIENCE PREVIEW */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-50/50 rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See what your community will look like
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This isn’t a dashboard. It’s a beautiful, member‑facing website.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Preview cards – static mockups that look real */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="h-40 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 flex items-center justify-center">
                <Home className="w-12 h-12 text-[var(--color-primary)]/40" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">Community Homepage</p>
                <p className="text-sm text-gray-500">Welcome feed, upcoming events, recent files</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Megaphone className="w-12 h-12 text-blue-400" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">Announcements</p>
                <p className="text-sm text-gray-500">Pinned posts, reactions, read receipts</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="h-40 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-green-400" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">Events Calendar</p>
                <p className="text-sm text-gray-500">RSVPs, reminders, recurring events</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <FileText className="w-12 h-12 text-purple-400" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">Resources</p>
                <p className="text-sm text-gray-500">Files, links, organised folders</p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8 italic">
            *Live previews are static mockups for demonstration.
          </p>
        </section>

        {/* 5️⃣ WHO THIS PLATFORM IS BUILT FOR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for communities that matter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Not a generic tool – a home for your specific mission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <Building2 className="w-10 h-10 text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Churches & Ministries</h3>
              <p className="text-gray-600">
                Connect your congregation beyond Sunday. Small groups, prayer requests, sermon
                notes, and events.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <HeartHandshake className="w-10 h-10 text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">NGOs & Community Organisations</h3>
              <p className="text-gray-600">
                Coordinate volunteers, share impact reports, and run campaigns with transparency.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <Users className="w-10 h-10 text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Training & Education Groups</h3>
              <p className="text-gray-600">
                Offer courses, share materials, and track progress – all under your brand.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <Sparkles className="w-10 h-10 text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Youth & Outreach Programs</h3>
              <p className="text-gray-600">
                Engage young people with modern tools, event signups, and safe communication.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <Globe className="w-10 h-10 text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local Movements & Initiatives</h3>
              <p className="text-gray-600">
                Organise neighbourhood projects, share updates, and grow your local impact.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <BarChart3 className="w-10 h-10 text-[var(--color-primary)] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">…and any membership group</h3>
              <p className="text-gray-600">
                Alumni associations, hobby clubs, professional networks – if you have members, we
                have a home.
              </p>
            </div>
          </div>
        </section>

        {/* 6️⃣ HOW IT WORKS — EXTREMELY SIMPLE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-50/50 rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get started in minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No technical skills required. Just your community’s passion.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[var(--color-primary)]">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create your community</h3>
              <p className="text-gray-600">Choose a name, upload your logo, pick your colours.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[var(--color-primary)]">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customise your website</h3>
              <p className="text-gray-600">Turn on the features you need – events, groups, files.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[var(--color-primary)]">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invite your members</h3>
              <p className="text-gray-600">Send invites via email or share a join link.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[var(--color-primary)]">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage everything in one place</h3>
              <p className="text-gray-600">Post updates, schedule events, and grow.</p>
            </div>
          </div>
        </section>

        {/* 7️⃣ TRUST, SCALE & SERIOUSNESS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                A platform you can trust with your community
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Lock className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Secure by default</h3>
                    <p className="text-gray-600">All data encrypted, SSO ready, and GDPR compliant.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Private & isolated</h3>
                    <p className="text-gray-600">Each community is a separate tenant – your data stays yours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Built for growth</h3>
                    <p className="text-gray-600">From 10 members to 100,000 – we scale with you.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <HeartHandshake className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Managed & supported</h3>
                    <p className="text-gray-600">Dedicated support, regular updates, and 99.9% uptime SLA.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats as trust signals */}
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-4xl font-bold text-gray-900">50+</p>
                <p className="text-sm text-gray-600 mt-1">Active communities</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-4xl font-bold text-gray-900">10k+</p>
                <p className="text-sm text-gray-600 mt-1">Community members</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-4xl font-bold text-gray-900">99.9%</p>
                <p className="text-sm text-gray-600 mt-1">Uptime</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-4xl font-bold text-gray-900">24/7</p>
                <p className="text-sm text-gray-600 mt-1">Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* 8️⃣ FINAL CTA — DECISIVE, CONFIDENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Build your community the right way.
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Stop juggling WhatsApp, Facebook, and email. Get your own branded hub today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/enter-license">
                <Button
                  size="lg"
                  variant="primary"
                  className="bg-white text-gray-900 hover:bg-gray-100 gap-2 w-full sm:w-auto"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                >
                  Create a Community Hub
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
              Already have a license?{' '}
              <Link to="/login" className="text-white underline underline-offset-2 hover:no-underline">
                Sign in
              </Link>{' '}
              to your admin dashboard.
            </p>
          </div>
        </section>
      </div>

      {/* Animations (same as before) */}
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

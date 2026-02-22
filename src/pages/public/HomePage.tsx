import React, { useEffect, useState } from 'react';
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
  const { user, resolveDashboardTarget } = useAuth();
  const navigate = useNavigate();
  const [dashboardTarget, setDashboardTarget] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

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
    resolveDashboardTarget()
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
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-[var(--color-primary)] selection:text-white overflow-x-hidden">
      {/* --- PREMIUM BACKGROUND (MERGED) --- */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Extra glow from first design */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Additional ambient elements from first design */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-[var(--color-primary)]/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-200/30 blur-[100px]" />
      </div>

      <div className="relative flex flex-col">
        {/* --- 1. HERO SECTION (MERGED) --- */}
        <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left column – text */}
              <div className="text-center lg:text-left animate-fade-in-left">
                {/* Pre-heading badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
                  </span>
                  The Future of Community Management
                </div>

                <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                  YOUR COMMUNITY.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-600">
                    YOUR RULES.
                  </span>
                </h1>

                <p className="max-w-2xl mx-auto lg:mx-0 text-lg md:text-2xl text-slate-600 mb-10 leading-relaxed">
                  Stop losing your members in messy group chats. Build a professional, branded hub
                  where events happen, content lives, and growth is inevitable.
                </p>

                {/* CTA group */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/enter-license">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl shadow-2xl shadow-[var(--color-primary)]/20 hover:scale-105 transition-all"
                      rightIcon={<ArrowRight className="w-6 h-6" />}
                    >
                      Create Your Hub
                    </Button>
                  </Link>

                  {user && dashboardTarget && !dashboardLoading ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl"
                      onClick={() => navigate(dashboardTarget)}
                    >
                      {dashboardTarget === '/my-communities'
                        ? 'My Communities'
                        : 'My Community'}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl"
                      onClick={() => navigate('/login')}
                    >
                      Admin Login
                    </Button>
                  )}
                </div>

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

              {/* Right column – floating icons (from second design) */}
              <div className="relative hidden lg:flex items-center justify-center animate-fade-in-right">
                <div className="relative w-full max-w-md">
                  <div className="relative z-10 w-72 h-72 mx-auto rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 blur-2xl" />
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

        {/* --- 2. PROBLEM/SOLUTION (from second design) --- */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                  Group chats are where communities go to die.
                </h2>
                <div className="space-y-6">
                  {[
                    { title: 'No Structure', desc: 'Important announcements get buried in seconds.' },
                    { title: 'No Ownership', desc: 'You are a guest on someone else’s platform.' },
                    { title: 'No Branding', desc: 'Your organization looks like a casual hobby.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        ✕
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                <div className="inline-flex p-3 rounded-2xl bg-green-50 text-green-600 mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">The Community Hub Advantage</h3>
                <p className="text-slate-600 mb-6">
                  One centralized home for everything. Your members don't just chat; they engage with
                  a structured organization designed for scale.
                </p>
                <ul className="space-y-3">
                  {[
                    'Private Member Directory',
                    'Structured Resource Library',
                    'Event Management',
                    'Unified Announcements',
                  ].map((check) => (
                    <li key={check} className="flex items-center gap-2 font-medium">
                      <CheckCircle className="w-5 h-5 text-green-500" /> {check}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. PLATFORM CAPABILITIES (alternating, from second design) --- */}
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
                [Mockup: Community homepage]
              </div>
            </div>

            {/* Capability 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Announcements feed]
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
                  Push announcements via email, in-app, or even SMS. Members can comment, react, and
                  you always know who has seen what.
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
                  Create events with RSVPs, calendars, and reminders. Run programs with curriculum,
                  homework, and progress tracking.
                </p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Event calendar]
              </div>
            </div>

            {/* Capability 4 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: File library]
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
                [Mockup: Groups list]
              </div>
            </div>

            {/* Capability 6 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center text-gray-400 border-2 border-dashed">
                [Mockup: Member directory]
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

        {/* --- 4. LIVE COMMUNITY PREVIEW (from first design, enhanced) --- */}
        <section className="py-24 bg-slate-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Experience the Platform
              </h2>
              <p className="text-slate-400">This isn’t a dashboard. It’s a beautiful, member‑facing website.</p>
            </div>

            {/* Browser mockup */}
            <div className="relative mx-auto max-w-5xl rounded-t-2xl border-x border-t border-slate-700 bg-slate-800 p-4 shadow-2xl">
              <div className="flex gap-2 mb-4 border-b border-slate-700 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="grid grid-cols-12 gap-4 h-[400px]">
                <div className="col-span-3 space-y-3">
                  <div className="h-8 w-full bg-slate-700 rounded animate-pulse" />
                  <div className="h-32 w-full bg-slate-700/50 rounded" />
                  <div className="h-32 w-full bg-slate-700/50 rounded" />
                </div>
                <div className="col-span-9 bg-slate-700/30 rounded-lg p-6">
                  <div className="h-4 w-1/3 bg-slate-600 rounded mb-6" />
                  <div className="space-y-4">
                    <div className="h-20 w-full bg-slate-600/40 rounded-xl" />
                    <div className="h-20 w-full bg-slate-600/40 rounded-xl" />
                    <div className="h-20 w-full bg-slate-600/40 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 5. WHO IT'S BUILT FOR (from second design) --- */}
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
            {[
              { icon: Building2, title: 'Churches & Ministries', desc: 'Connect your congregation beyond Sunday. Small groups, prayer requests, sermon notes, and events.' },
              { icon: HeartHandshake, title: 'NGOs & Community Organisations', desc: 'Coordinate volunteers, share impact reports, and run campaigns with transparency.' },
              { icon: Users, title: 'Training & Education Groups', desc: 'Offer courses, share materials, and track progress – all under your brand.' },
              { icon: Sparkles, title: 'Youth & Outreach Programs', desc: 'Engage young people with modern tools, event signups, and safe communication.' },
              { icon: Globe, title: 'Local Movements & Initiatives', desc: 'Organise neighbourhood projects, share updates, and grow your local impact.' },
              { icon: BarChart3, title: '…and any membership group', desc: 'Alumni associations, hobby clubs, professional networks – if you have members, we have a home.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
                <item.icon className="w-10 h-10 text-[var(--color-primary)] mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- 6. HOW IT WORKS (from second design) --- */}
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
            {[
              { step: '1', title: 'Create your community', desc: 'Choose a name, upload your logo, pick your colours.' },
              { step: '2', title: 'Customise your website', desc: 'Turn on the features you need – events, groups, files.' },
              { step: '3', title: 'Invite your members', desc: 'Send invites via email or share a join link.' },
              { step: '4', title: 'Manage everything in one place', desc: 'Post updates, schedule events, and grow.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[var(--color-primary)]">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- 7. TRUST, SCALE & SERIOUSNESS (from second design) --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                A platform you can trust with your community
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'Secure by default', desc: 'All data encrypted, SSO ready, and GDPR compliant.' },
                  { icon: Shield, title: 'Private & isolated', desc: 'Each community is a separate tenant – your data stays yours.' },
                  { icon: TrendingUp, title: 'Built for growth', desc: 'From 10 members to 100,000 – we scale with you.' },
                  { icon: HeartHandshake, title: 'Managed & supported', desc: 'Dedicated support, regular updates, and 99.9% uptime SLA.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {[
                { stat: '50+', label: 'Active communities' },
                { stat: '10k+', label: 'Community members' },
                { stat: '99.9%', label: 'Uptime' },
                { stat: '24/7', label: 'Support' },
              ].map((item, i) => (
                <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-4xl font-bold text-gray-900">{item.stat}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 8. FINAL CTA (from second design) --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Extra glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
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
                  className="bg-white text-gray-900 hover:bg-gray-100 gap-2 w-full sm:w-auto px-10 py-8 text-xl rounded-2xl"
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
                  className="border-white text-white hover:bg-white/10 gap-2 w-full sm:w-auto px-10 py-8 text-xl rounded-2xl"
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

        {/* --- FOOTER (from first design) --- */}
        <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
          <p>© 2026 {organization.name}. All rights reserved.</p>
        </footer>
      </div>

      {/* --- ANIMATIONS (merged) --- */}
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
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}

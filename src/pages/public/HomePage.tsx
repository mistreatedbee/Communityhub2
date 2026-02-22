import React, { useEffect, useState, useRef } from 'react';
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
  Calendar,
  FileText,
  Layers,
  Home,
  Megaphone,
  Grid,
  Lock,
  TrendingUp,
  HeartHandshake,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { hasLicenseSession } from '../../utils/licenseToken';
import { Spinner } from '../../components/ui/Spinner';

// ─── SCROLL REVEAL HOOK ────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── REVEAL WRAPPER ───────────────────────────────────────────────────────────
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}
function Reveal({ children, className = '', delay = 0, direction = 'up' }: RevealProps) {
  const { ref, visible } = useReveal();
  const transforms: Record<string, string> = {
    up: 'translateY(32px)',
    left: 'translateX(-32px)',
    right: 'translateX(32px)',
    none: 'none',
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : transforms[direction],
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Announcements', 'Event Management', 'Member Profiles',
  'Resource Library', 'Community Groups', 'Admin Controls',
  'Branded Website', 'Private & Secure',
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="ch-marquee-strip" aria-hidden>
      <div className="ch-marquee-track">
        {items.map((item, i) => (
          <span key={i} className={`ch-marquee-item${i % 5 === 2 ? ' ch-marquee-accent' : ''}`}>
            <span className="ch-marquee-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── BROWSER MOCKUP SHELL ─────────────────────────────────────────────────────
function BrowserShell({ children, url = 'hub.yourcommunity.org' }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="ch-browser">
      <div className="ch-browser-bar">
        <span className="ch-browser-dot ch-dot-r" />
        <span className="ch-browser-dot ch-dot-y" />
        <span className="ch-browser-dot ch-dot-g" />
        <span className="ch-browser-url">{url}</span>
      </div>
      {children}
    </div>
  );
}

// ─── COMMUNITY PREVIEW MOCKUP ─────────────────────────────────────────────────
function CommunityPreviewMockup() {
  return (
    <BrowserShell url="hub.gracechurch.org — Community Platform">
      <div className="ch-preview-layout">
        {/* Sidebar */}
        <aside className="ch-preview-sidebar">
          <div className="ch-preview-brand">
            <div className="ch-preview-logo">GC</div>
            <div>
              <div className="ch-preview-org-name">Grace Church</div>
              <div className="ch-preview-org-sub">Community Hub</div>
            </div>
          </div>
          {['Home', 'Announcements', 'Events', 'Members', 'Resources', 'Groups'].map((item, i) => (
            <div key={item} className={`ch-preview-nav-item${i === 0 ? ' active' : ''}`}>
              <span className="ch-preview-nav-icon" />
              {item}
            </div>
          ))}
        </aside>
        {/* Main content */}
        <main className="ch-preview-main">
          <div className="ch-preview-banner">
            <div className="ch-preview-banner-avatar">GC</div>
            <div>
              <div className="ch-preview-banner-title">Welcome to Grace Church Community Hub</div>
              <div className="ch-preview-banner-meta">347 Members · Est. 2018 · Johannesburg</div>
            </div>
          </div>
          <div className="ch-preview-content">
            <div className="ch-preview-block">
              <div className="ch-preview-block-label">📢 Announcements</div>
              {[
                { name: 'Pastor David', text: 'Sunday service moved to 10:00 AM this week.', color: 'var(--ch-accent)' },
                { name: 'Admin Team', text: 'New resource packs uploaded to the library.', color: '#4a9cf5' },
              ].map((a) => (
                <div key={a.name} className="ch-preview-ann">
                  <div className="ch-preview-ann-avatar" style={{ background: a.color }} />
                  <div>
                    <div className="ch-preview-ann-name">{a.name}</div>
                    <div className="ch-preview-ann-text">{a.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ch-preview-block">
              <div className="ch-preview-block-label">📅 Upcoming Events</div>
              {[
                { day: '15', mon: 'Mar', title: 'Youth Leadership Workshop', sub: 'Hall B · 09:00–13:00', c: 'var(--ch-accent)' },
                { day: '22', mon: 'Mar', title: 'Community Prayer Evening', sub: 'Main Hall · 18:30–20:00', c: 'var(--ch-accent2)' },
              ].map((e) => (
                <div key={e.title} className="ch-preview-event">
                  <div className="ch-preview-event-date" style={{ background: e.c }}>
                    <span className="ch-preview-event-day">{e.day}</span>
                    <span className="ch-preview-event-mon">{e.mon}</span>
                  </div>
                  <div>
                    <div className="ch-preview-event-title">{e.title}</div>
                    <div className="ch-preview-event-sub">{e.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </BrowserShell>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CAPABILITIES = [
  {
    Icon: Home, badge: 'Real Community Website',
    title: 'A branded home. Not a group chat.',
    desc: 'Your members land on a beautiful, custom-branded space with your logo, colors, and messaging. It feels like your organization's digital headquarters — not a side project.',
  },
  {
    Icon: Megaphone, badge: 'Announcements That Reach People',
    title: 'Important messages stay visible.',
    desc: 'Structured, pinned, and permanent. No more critical updates buried under memes 30 seconds after posting.',
  },
  {
    Icon: Calendar, badge: 'Events & Programs',
    title: 'From weekly gatherings to full courses.',
    desc: 'RSVPs, calendars, reminders, and multi-session programs — all in one place, always current.',
  },
  {
    Icon: FileText, badge: 'Resources & Documents',
    title: 'Everything organized and findable.',
    desc: 'Upload files, link documents, embed media. Searchable folders. No more emailing PDFs or hunting through old chats.',
  },
  {
    Icon: Grid, badge: 'Groups Inside Communities',
    title: 'Sub-communities with their own space.',
    desc: 'Teams, regions, interests — each with their own feed and events, still under your umbrella.',
  },
  {
    Icon: Users, badge: 'Member Profiles',
    title: 'People, not phone numbers.',
    desc: 'Rich profiles with photos, roles, and bios. Admins see who's engaged. Members feel known.',
  },
];

const AUDIENCES = [
  { Icon: Building2, title: 'Churches & Ministries', desc: 'Connect your congregation beyond Sunday. Small groups, events, and sermon resources.' },
  { Icon: HeartHandshake, title: 'NGOs & Organisations', desc: 'Coordinate volunteers, share impact reports, and run campaigns transparently.' },
  { Icon: Users, title: 'Training & Education', desc: 'Offer courses, share materials, and track progress — under your brand.' },
  { Icon: Sparkles, title: 'Youth & Outreach', desc: 'Engage young people with modern tools, event signups, and safe communication.' },
  { Icon: Globe, title: 'Local Movements', desc: 'Organise neighbourhood projects, share updates, and grow your local impact.' },
  { Icon: BarChart3, title: 'Any Membership Group', desc: 'Alumni associations, clubs, professional networks — if you have members, we have a home.' },
];

const STEPS = [
  { n: '01', title: 'Create your community', desc: 'Name it, upload your logo, pick your colours. Done in minutes.' },
  { n: '02', title: 'Customise your website', desc: 'Turn on the features you need — events, groups, files, announcements.' },
  { n: '03', title: 'Invite your members', desc: 'Share a link or send invites. Members sign up and get approved.' },
  { n: '04', title: 'Manage everything', desc: 'Post updates, schedule events, grow your community from one clean dashboard.' },
];

const TRUST = [
  { Icon: Lock, title: 'Secure by default', desc: 'All data encrypted in transit and at rest. GDPR-compliant, SSO-ready.' },
  { Icon: Shield, title: 'Fully isolated', desc: 'Each community is a separate tenant. Your data stays completely yours.' },
  { Icon: TrendingUp, title: 'Built for growth', desc: 'From 10 members to 100,000 — the platform scales with you.' },
  { Icon: HeartHandshake, title: 'Real support', desc: 'Dedicated team, regular updates, 99.9% uptime SLA. Not a side project.' },
];

const STATS = [
  { value: '50+', label: 'Active communities' },
  { value: '10k+', label: 'Members served' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Support' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function HomePage() {
  const { organization } = useTheme();
  const { user, resolveDashboardTarget } = useAuth();
  const navigate = useNavigate();
  const [dashboardTarget, setDashboardTarget] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!user && hasLicenseSession()) navigate('/signup', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;
    if (!user) { setDashboardTarget(null); return; }
    setDashboardLoading(true);
    resolveDashboardTarget()
      .then((t) => { if (mounted) setDashboardTarget(t); })
      .finally(() => { if (mounted) setDashboardLoading(false); });
    return () => { mounted = false; };
  }, [user, resolveDashboardTarget]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="ch-root">
      {/* ── STYLES ── */}
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <header className={`ch-nav${scrolled ? ' ch-nav--scrolled' : ''}`}>
        <Link to="/" className="ch-nav-logo">
          {organization.logo
            ? <img src={organization.logo} alt={organization.name} className="ch-nav-logo-img" />
            : <span className="ch-nav-logo-text">{organization.name}</span>}
        </Link>
        <nav className="ch-nav-links">
          <Link to="/communities" className="ch-nav-link">Communities</Link>
          <a href="#capabilities" className="ch-nav-link">Capabilities</a>
          <a href="#for-who" className="ch-nav-link">Who it's for</a>
          <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="ch-nav-btn-outline">
            Admin Login
          </Button>
          <Link to="/enter-license">
            <Button size="sm" className="ch-nav-btn-primary">Get Started <ChevronRight className="w-3.5 h-3.5" /></Button>
          </Link>
        </nav>
        <button className="ch-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile menu */}
      <div className={`ch-mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        <Link to="/communities" className="ch-mobile-link" onClick={() => setMobileMenuOpen(false)}>Communities</Link>
        <a href="#capabilities" className="ch-mobile-link" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
        <a href="#for-who" className="ch-mobile-link" onClick={() => setMobileMenuOpen(false)}>Who it's for</a>
        <Button variant="outline" size="sm" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Admin Login</Button>
        <Link to="/enter-license" onClick={() => setMobileMenuOpen(false)}>
          <Button size="sm" className="w-full">Get Started</Button>
        </Link>
      </div>

      {/* ── HERO ── */}
      <section className="ch-hero">
        <div className="ch-hero-bg" aria-hidden>
          <div className="ch-blob ch-blob-1" />
          <div className="ch-blob ch-blob-2" />
          <div className="ch-hero-grid" />
        </div>

        <div className="ch-hero-inner">
          {/* Left */}
          <div className="ch-hero-left" style={{ animation: 'chFadeLeft 0.9s ease forwards' }}>
            <div className="ch-hero-badge">
              <span className="ch-ping"><span className="ch-ping-inner" /><span className="ch-ping-dot" /></span>
              The end of scattered communities
            </div>

            <h1 className="ch-hero-h1">
              YOUR COMMUNITY.<br />
              <span className="ch-hero-gradient">YOUR RULES.</span>
            </h1>

            <p className="ch-hero-sub">
              Stop losing your members in messy group chats. Build a professional,
              branded hub where events happen, content lives, and growth is inevitable.
            </p>

            <div className="ch-hero-ctas">
              <Link to="/enter-license">
                <button className="ch-btn-primary-hero">
                  Create Your Hub
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              {user && dashboardTarget && !dashboardLoading ? (
                <button className="ch-btn-ghost-hero" onClick={() => navigate(dashboardTarget!)}>
                  {dashboardTarget === '/my-communities' ? 'My Communities' : 'My Community'}
                </button>
              ) : (
                <button className="ch-btn-ghost-hero" onClick={() => navigate('/login')}>
                  Admin Login
                </button>
              )}
              {user && dashboardLoading && <Spinner size="sm" />}
            </div>

            <p className="ch-hero-footnote">
              <CheckCircle className="w-4 h-4 ch-green" />
              No credit card required for admin onboarding
            </p>
          </div>

          {/* Right — browser mockup preview */}
          <div className="ch-hero-right" style={{ animation: 'chFadeRight 0.9s 0.15s ease forwards', opacity: 0 }}>
            <div className="ch-hero-mockup-wrap">
              <div className="ch-hero-shadow-block" aria-hidden />
              <BrowserShell url="hub.yourcommunity.org">
                <div className="ch-mini-preview">
                  <div className="ch-mini-banner">
                    <div className="ch-mini-logo">MC</div>
                    <div>
                      <div className="ch-mini-title">My Community Hub</div>
                      <div className="ch-mini-meta">142 Members · Active</div>
                    </div>
                  </div>
                  <div className="ch-mini-grid">
                    <div className="ch-mini-card">
                      <div className="ch-mini-card-label">📢 Latest Announcement</div>
                      <div className="ch-mini-line w-full" />
                      <div className="ch-mini-line w-3/4" />
                    </div>
                    <div className="ch-mini-card">
                      <div className="ch-mini-card-label">📅 Next Event</div>
                      <div className="ch-mini-event-chip">
                        <span className="ch-mini-event-day">15 Mar</span>
                        <span className="ch-mini-event-name">Community Meetup</span>
                      </div>
                    </div>
                  </div>
                  <div className="ch-mini-members">
                    {['MC', 'SR', 'TN', 'LM', 'PK'].map((i) => (
                      <div key={i} className="ch-mini-avatar">{i}</div>
                    ))}
                    <div className="ch-mini-avatar ch-mini-avatar-more">+138</div>
                  </div>
                </div>
              </BrowserShell>
              {/* Floating labels */}
              <div className="ch-float-label ch-float-1">✓ Fully branded</div>
              <div className="ch-float-label ch-float-2">✓ Private & secure</div>
              <div className="ch-float-label ch-float-3">✓ Live in minutes</div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="ch-stats-bar">
          {STATS.map(({ value, label }) => (
            <div key={label} className="ch-stat">
              <span className="ch-stat-value">{value}</span>
              <span className="ch-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── PROBLEM ── */}
      <section className="ch-section ch-problem">
        <div className="ch-container ch-problem-grid">
          <Reveal direction="left">
            <p className="ch-eyebrow">01 — The problem</p>
            <h2 className="ch-section-h2">Group chats are<br />where communities<br />go to die.</h2>
            <p className="ch-section-body">
              Your members are scattered across five different apps. Important announcements
              get buried in seconds. And you're renting space on someone else's platform —
              they make the rules, not you.
            </p>
          </Reveal>

          <div className="ch-problem-items">
            {[
              { icon: '✕', title: 'No structure', desc: 'Important messages get buried under noise within seconds of posting.' },
              { icon: '✕', title: 'No ownership', desc: "You're a guest on someone else's platform. They can shut you down." },
              { icon: '✕', title: 'No branding', desc: 'A WhatsApp group makes your organisation look like a casual hobby.' },
              { icon: '✕', title: 'No engagement', desc: 'No profiles, no history, no reason for members to stay engaged.' },
            ].map(({ icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="ch-problem-item">
                  <div className="ch-problem-icon">{icon}</div>
                  <div>
                    <h4 className="ch-problem-title">{title}</h4>
                    <p className="ch-problem-desc">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="ch-section ch-dark" id="capabilities">
        <div className="ch-container">
          <Reveal>
            <p className="ch-eyebrow ch-eyebrow-light">02 — Capabilities</p>
            <h2 className="ch-section-h2 ch-light">Not features.<br /><span className="ch-accent-text">Capabilities.</span></h2>
          </Reveal>

          <div className="ch-cap-grid">
            {CAPABILITIES.map(({ Icon, badge, title, desc }, i) => (
              <Reveal key={badge} delay={(i % 3) * 0.1} className="ch-cap-card">
                <div className="ch-cap-card-inner">
                  <div className="ch-cap-num">0{i + 1}</div>
                  <div className="ch-cap-badge">
                    <Icon className="w-3.5 h-3.5" />
                    {badge}
                  </div>
                  <h3 className="ch-cap-title">{title}</h3>
                  <p className="ch-cap-desc">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PREVIEW ── */}
      <section className="ch-section ch-preview-section">
        <div className="ch-container">
          <Reveal className="ch-preview-header">
            <p className="ch-eyebrow">03 — See it live</p>
            <h2 className="ch-section-h2">This is a website.<br />Not a dashboard.</h2>
            <p className="ch-section-body">
              Your community gets a beautiful, member-facing home — not an admin panel.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="ch-preview-frame-wrap">
              <CommunityPreviewMockup />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="ch-section ch-paper" id="for-who">
        <div className="ch-container">
          <Reveal className="ch-center">
            <p className="ch-eyebrow">04 — Built for</p>
            <h2 className="ch-section-h2">Serious communities.<br />Not generic groups.</h2>
          </Reveal>

          <div className="ch-who-grid">
            {AUDIENCES.map(({ Icon, title, desc }, i) => (
              <Reveal key={title} delay={(i % 3) * 0.08}>
                <div className="ch-who-card" tabIndex={0}>
                  <div className="ch-who-icon-wrap">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="ch-who-title">{title}</h3>
                  <p className="ch-who-desc">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ch-section">
        <div className="ch-container">
          <Reveal className="ch-center">
            <p className="ch-eyebrow">05 — Process</p>
            <h2 className="ch-section-h2">Up in minutes.<br />Running for years.</h2>
          </Reveal>

          <div className="ch-steps">
            <div className="ch-steps-line" aria-hidden />
            {STEPS.map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.1} className="ch-step">
                <div className="ch-step-num">{n}</div>
                <h3 className="ch-step-title">{title}</h3>
                <p className="ch-step-desc">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="ch-section ch-dark ch-trust-section">
        <div className="ch-container ch-trust-grid">
          <Reveal direction="left">
            <h2 className="ch-section-h2 ch-light">
              Built to<br /><span className="ch-accent-text">last.</span><br />Not to impress.
            </h2>
            <p className="ch-section-body" style={{ color: 'rgba(255,255,255,0.5)' }}>
              This is not a side project. CommunityHub is managed infrastructure
              built for communities that need reliability, privacy, and room to grow.
            </p>
            <div className="ch-trust-items">
              {TRUST.map(({ Icon, title, desc }) => (
                <div key={title} className="ch-trust-item">
                  <Icon className="w-5 h-5 ch-accent-icon" />
                  <div>
                    <div className="ch-trust-item-title">{title}</div>
                    <div className="ch-trust-item-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="ch-trust-stats-grid">
            {STATS.map(({ value, label }, i) => (
              <Reveal key={label} delay={i * 0.08}>
                <div className="ch-trust-stat">
                  <span className="ch-trust-stat-val">{value}</span>
                  <span className="ch-trust-stat-label">{label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="ch-section ch-final-cta">
        <div className="ch-final-bg" aria-hidden>
          <div className="ch-final-blob" />
        </div>
        <div className="ch-container ch-center">
          <Reveal>
            <h2 className="ch-final-h2">
              Build it<br /><span className="ch-accent-text">right.</span>
            </h2>
            <p className="ch-section-body ch-center-text">
              Stop patching together broken tools. Start with a platform built for this exact purpose.
            </p>
            <div className="ch-final-ctas">
              <Link to="/enter-license">
                <button className="ch-btn-primary-hero ch-btn-xl">
                  <KeyRound className="w-5 h-5" />
                  Create a Community Hub
                </button>
              </Link>
              <a
                href="https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="ch-btn-ghost-hero ch-btn-xl">
                  <MessageCircle className="w-5 h-5" />
                  Contact Sales
                </button>
              </a>
            </div>
            <p className="ch-final-footnote">
              Already have a license?{' '}
              <Link to="/login" className="ch-link">Sign in to your admin dashboard</Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ch-footer">
        <Link to="/" className="ch-footer-logo">
          {organization.logo
            ? <img src={organization.logo} alt={organization.name} className="ch-footer-logo-img" />
            : <span>{organization.name}</span>}
        </Link>
        <p className="ch-footer-copy">© 2026 {organization.name}. All rights reserved.</p>
        <div className="ch-footer-links">
          <Link to="/communities" className="ch-footer-link">Communities</Link>
          <Link to="/login" className="ch-footer-link">Admin Login</Link>
          <Link to="/enter-license" className="ch-footer-link">Get Started</Link>
        </div>
      </footer>
    </div>
  );
}

// ─── CSS (injected as <style>) ────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,300&family=DM+Mono:wght@400;500&display=swap');

  .ch-root {
    --ch-ink: #0b0b10;
    --ch-paper: #f5f2ed;
    --ch-paper2: #eceae4;
    --ch-white: #ffffff;
    --ch-accent: #e8420a;
    --ch-accent2: #f5a623;
    --ch-muted: #72706b;
    --ch-border: rgba(0,0,0,0.09);
    --ch-dark-border: rgba(255,255,255,0.08);
    --ch-display: 'Syne', sans-serif;
    --ch-body: 'DM Sans', sans-serif;
    --ch-mono: 'DM Mono', monospace;
    --ch-radius: 16px;
    --ch-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: var(--ch-body);
    background: var(--ch-paper);
    color: var(--ch-ink);
    overflow-x: hidden;
  }

  /* ── NAV ── */
  .ch-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px;
    transition: background var(--ch-transition), padding var(--ch-transition), border-color var(--ch-transition);
    border-bottom: 1px solid transparent;
  }
  .ch-nav--scrolled {
    background: rgba(245,242,237,0.94);
    backdrop-filter: blur(16px) saturate(1.4);
    padding: 14px 48px;
    border-color: var(--ch-border);
  }
  .ch-nav-logo { display: flex; align-items: center; text-decoration: none; }
  .ch-nav-logo-img { height: 36px; width: auto; }
  .ch-nav-logo-text {
    font-family: var(--ch-display); font-size: 1.4rem;
    color: var(--ch-ink); font-weight: 800; letter-spacing: -0.01em;
  }
  .ch-nav-links { display: flex; align-items: center; gap: 28px; }
  .ch-nav-link {
    font-size: 0.84rem; font-weight: 500; letter-spacing: 0.01em;
    color: var(--ch-ink); opacity: 0.6; text-decoration: none;
    transition: opacity var(--ch-transition);
  }
  .ch-nav-link:hover { opacity: 1; }
  .ch-nav-btn-outline { border-radius: 10px !important; }
  .ch-nav-btn-primary {
    display: inline-flex; align-items: center; gap: 4px;
    border-radius: 10px !important;
  }
  .ch-hamburger {
    display: none; background: none; border: none;
    cursor: pointer; color: var(--ch-ink); padding: 4px;
  }
  .ch-mobile-menu {
    display: none; position: fixed; top: 64px; left: 0; right: 0; z-index: 190;
    background: var(--ch-white); border-bottom: 1px solid var(--ch-border);
    padding: 20px 24px; flex-direction: column; gap: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  }
  .ch-mobile-menu.open { display: flex; }
  .ch-mobile-link {
    font-size: 1rem; font-weight: 500; color: var(--ch-ink);
    text-decoration: none; padding: 4px 0;
  }

  @media (max-width: 768px) {
    .ch-nav { padding: 16px 24px; }
    .ch-nav--scrolled { padding: 12px 24px; }
    .ch-nav-links { display: none; }
    .ch-hamburger { display: block; }
  }

  /* ── HERO ── */
  .ch-hero {
    position: relative; min-height: 100vh;
    display: flex; flex-direction: column; justify-content: center;
    padding: 120px 48px 0; overflow: hidden;
  }
  .ch-hero-bg {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
  }
  .ch-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.5;
  }
  .ch-blob-1 {
    width: 60%; height: 70%; top: -10%; left: -10%;
    background: radial-gradient(circle, rgba(232,66,10,0.08) 0%, transparent 70%);
    animation: chPulse 8s ease-in-out infinite;
  }
  .ch-blob-2 {
    width: 50%; height: 60%; bottom: 5%; right: -8%;
    background: radial-gradient(circle, rgba(74,156,245,0.07) 0%, transparent 70%);
    animation: chPulse 10s 2s ease-in-out infinite;
  }
  .ch-hero-grid {
    position: absolute; inset: 0; opacity: 0.3;
    background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0);
    background-size: 32px 32px;
  }
  .ch-hero-inner {
    position: relative; z-index: 1; max-width: 1320px; margin: 0 auto;
    width: 100%; display: grid; grid-template-columns: 1fr 1fr;
    gap: 64px; align-items: center;
  }
  .ch-hero-left { display: flex; flex-direction: column; }
  .ch-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 999px;
    background: rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.1);
    font-family: var(--ch-mono); font-size: 0.72rem; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ch-ink); opacity: 0.7;
    margin-bottom: 28px; align-self: flex-start;
  }
  .ch-ping { position: relative; width: 8px; height: 8px; flex-shrink: 0; }
  .ch-ping-inner {
    position: absolute; inset: 0; border-radius: 50%;
    background: var(--ch-accent); opacity: 0.75;
    animation: chPing 1.5s cubic-bezier(0,0,0.2,1) infinite;
  }
  .ch-ping-dot {
    position: relative; display: block; width: 8px; height: 8px;
    border-radius: 50%; background: var(--ch-accent);
  }
  .ch-hero-h1 {
    font-family: var(--ch-display); font-size: clamp(3.5rem, 7vw, 6.5rem);
    font-weight: 800; line-height: 0.95; letter-spacing: -0.02em;
    color: var(--ch-ink); margin-bottom: 24px;
  }
  .ch-hero-gradient {
    background: linear-gradient(135deg, var(--ch-accent) 0%, var(--ch-accent2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ch-hero-sub {
    font-size: 1.15rem; line-height: 1.7; color: var(--ch-muted);
    font-weight: 300; max-width: 480px; margin-bottom: 40px;
  }
  .ch-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .ch-hero-footnote {
    margin-top: 20px; display: flex; align-items: center; gap: 6px;
    font-size: 0.82rem; color: var(--ch-muted);
  }
  .ch-green { color: #22c55e; }

  /* Hero right */
  .ch-hero-right {
    display: flex; align-items: center; justify-content: center;
  }
  .ch-hero-mockup-wrap { position: relative; width: 100%; max-width: 560px; }
  .ch-hero-shadow-block {
    position: absolute; bottom: -20px; right: -20px;
    width: calc(100% - 20px); height: calc(100% - 20px);
    background: var(--ch-accent); opacity: 0.25;
    border-radius: var(--ch-radius);
    z-index: 0;
  }
  .ch-float-label {
    position: absolute; background: var(--ch-white);
    border: 1.5px solid var(--ch-ink); padding: 8px 14px;
    font-family: var(--ch-mono); font-size: 0.68rem; letter-spacing: 0.06em;
    text-transform: uppercase; box-shadow: 3px 3px 0 var(--ch-ink);
    z-index: 10; white-space: nowrap;
  }
  .ch-float-1 { top: -16px; left: 16px; animation: chFloat 5s ease-in-out infinite; }
  .ch-float-2 { bottom: 48px; left: -20px; animation: chFloat 7s 1s ease-in-out infinite; }
  .ch-float-3 { bottom: -16px; right: 40px; animation: chFloat 6s 0.5s ease-in-out infinite; }

  /* Mini preview inside hero browser */
  .ch-mini-preview { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .ch-mini-banner {
    background: linear-gradient(135deg, rgba(232,66,10,0.12), rgba(245,166,35,0.08));
    border-radius: 10px; padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    border: 1px solid rgba(232,66,10,0.15);
  }
  .ch-mini-logo {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--ch-accent), var(--ch-accent2));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ch-display); font-size: 0.95rem; color: white;
  }
  .ch-mini-title { font-size: 0.85rem; font-weight: 700; color: var(--ch-ink); }
  .ch-mini-meta { font-size: 0.68rem; color: var(--ch-muted); font-family: var(--ch-mono); margin-top: 2px; }
  .ch-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ch-mini-card {
    background: rgba(0,0,0,0.03); border: 1px solid var(--ch-border);
    border-radius: 10px; padding: 12px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .ch-mini-card-label { font-size: 0.65rem; font-family: var(--ch-mono); color: var(--ch-muted); letter-spacing: 0.05em; }
  .ch-mini-line { height: 6px; border-radius: 3px; background: rgba(0,0,0,0.1); }
  .ch-mini-event-chip {
    display: flex; align-items: center; gap: 8px;
    background: rgba(232,66,10,0.08); border-radius: 6px; padding: 6px 8px;
  }
  .ch-mini-event-day { font-family: var(--ch-mono); font-size: 0.65rem; color: var(--ch-accent); font-weight: 500; white-space: nowrap; }
  .ch-mini-event-name { font-size: 0.68rem; color: var(--ch-ink); font-weight: 500; }
  .ch-mini-members { display: flex; align-items: center; gap: -4px; }
  .ch-mini-avatar {
    width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--ch-white);
    background: linear-gradient(135deg, var(--ch-accent), var(--ch-accent2));
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 0.55rem; font-weight: 700; color: white;
    margin-right: -6px; position: relative;
  }
  .ch-mini-avatar-more { background: rgba(0,0,0,0.08); color: var(--ch-muted); }

  /* Stats bar */
  .ch-stats-bar {
    position: relative; z-index: 1; max-width: 1320px; margin: 64px auto 0;
    padding: 32px 0; border-top: 1px solid var(--ch-border);
    display: grid; grid-template-columns: repeat(4, 1fr);
    text-align: center;
  }
  .ch-stat-value {
    display: block; font-family: var(--ch-display); font-size: 2.5rem;
    font-weight: 800; color: var(--ch-ink); line-height: 1; margin-bottom: 6px;
  }
  .ch-stat-label {
    display: block; font-size: 0.8rem; color: var(--ch-muted);
    font-family: var(--ch-mono); letter-spacing: 0.05em;
  }

  /* ── MARQUEE ── */
  .ch-marquee-strip {
    background: var(--ch-ink); border-top: 1px solid rgba(0,0,0,0.2);
    border-bottom: 1px solid rgba(0,0,0,0.2); padding: 16px 0; overflow: hidden;
  }
  .ch-marquee-track {
    display: flex; animation: chMarquee 22s linear infinite;
    white-space: nowrap;
  }
  .ch-marquee-item {
    font-family: var(--ch-display); font-size: 1.1rem; letter-spacing: 0.06em;
    color: rgba(245,242,237,0.5); padding: 0 32px;
    display: inline-flex; align-items: center; gap: 18px;
  }
  .ch-marquee-accent { color: var(--ch-accent); opacity: 1 !important; }
  .ch-marquee-dot {
    width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
    background: var(--ch-accent);
  }

  /* ── SECTION BASE ── */
  .ch-section { padding: 112px 48px; }
  .ch-container { max-width: 1320px; margin: 0 auto; }
  .ch-center { text-align: center; display: flex; flex-direction: column; align-items: center; }
  .ch-center-text { text-align: center; margin-left: auto; margin-right: auto; }
  .ch-eyebrow {
    font-family: var(--ch-mono); font-size: 0.72rem; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--ch-accent); margin-bottom: 16px; display: block;
  }
  .ch-eyebrow-light { color: rgba(232,66,10,0.9); }
  .ch-section-h2 {
    font-family: var(--ch-display); font-size: clamp(2.8rem, 5vw, 4.5rem);
    font-weight: 800; line-height: 0.95; letter-spacing: -0.02em;
    color: var(--ch-ink); margin-bottom: 20px;
  }
  .ch-section-body {
    font-size: 1.05rem; line-height: 1.7; color: var(--ch-muted);
    font-weight: 300; max-width: 520px;
  }

  /* Dark variant */
  .ch-dark { background: var(--ch-ink); }
  .ch-paper { background: var(--ch-paper2); }
  .ch-light { color: var(--ch-white) !important; }
  .ch-accent-text { color: var(--ch-accent); }
  .ch-accent-icon { color: var(--ch-accent); flex-shrink: 0; margin-top: 2px; }

  /* ── PROBLEM ── */
  .ch-problem-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: start;
  }
  .ch-problem-items { display: flex; flex-direction: column; gap: 0; }
  .ch-problem-item {
    display: flex; align-items: flex-start; gap: 16px;
    border-top: 1px solid var(--ch-border); padding: 24px 0;
    transition: padding-left var(--ch-transition);
    cursor: default;
    position: relative;
  }
  .ch-problem-item::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 0; background: var(--ch-accent);
    transition: width var(--ch-transition);
  }
  .ch-problem-item:hover { padding-left: 14px; }
  .ch-problem-item:hover::before { width: 3px; }
  .ch-problem-icon {
    width: 32px; height: 32px; flex-shrink: 0;
    background: var(--ch-accent); color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.85rem; border-radius: 6px;
  }
  .ch-problem-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
  .ch-problem-desc { font-size: 0.87rem; color: var(--ch-muted); line-height: 1.55; font-weight: 300; }

  /* ── CAPABILITIES ── */
  .ch-cap-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: var(--ch-dark-border);
    border: 1px solid var(--ch-dark-border);
    margin-top: 64px;
  }
  .ch-cap-card { background: var(--ch-ink); }
  .ch-cap-card-inner {
    padding: 44px 36px; height: 100%;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    transition: background var(--ch-transition);
  }
  .ch-cap-card:hover .ch-cap-card-inner { background: #12121e; }
  .ch-cap-card-inner::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 3px; height: 0; background: var(--ch-accent);
    transition: height 0.45s ease;
  }
  .ch-cap-card:hover .ch-cap-card-inner::before { height: 100%; }
  .ch-cap-num {
    font-family: var(--ch-mono); font-size: 0.65rem;
    letter-spacing: 0.12em; color: var(--ch-accent); margin-bottom: 20px;
  }
  .ch-cap-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--ch-mono); font-size: 0.65rem; letter-spacing: 0.08em;
    text-transform: uppercase; color: rgba(255,255,255,0.4);
    margin-bottom: 14px;
  }
  .ch-cap-title {
    font-family: var(--ch-display); font-size: 1.6rem; font-weight: 800;
    color: white; line-height: 1.1; margin-bottom: 12px; letter-spacing: -0.01em;
  }
  .ch-cap-desc {
    font-size: 0.88rem; color: rgba(255,255,255,0.4); line-height: 1.65;
    font-weight: 300; flex: 1;
  }

  /* ── PREVIEW ── */
  .ch-preview-section { background: var(--ch-paper); }
  .ch-preview-header { margin-bottom: 56px; }
  .ch-preview-frame-wrap {
    box-shadow: 0 32px 80px rgba(0,0,0,0.18), 20px 20px 0 var(--ch-accent);
    border-radius: var(--ch-radius); overflow: hidden;
  }

  /* Browser shell */
  .ch-browser { background: var(--ch-ink); border-radius: var(--ch-radius); overflow: hidden; }
  .ch-browser-bar {
    background: #141420; padding: 12px 20px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .ch-browser-dot {
    width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  }
  .ch-dot-r { background: #ff5f57; }
  .ch-dot-y { background: #ffbd2e; }
  .ch-dot-g { background: #28c840; }
  .ch-browser-url {
    flex: 1; background: rgba(255,255,255,0.06); border-radius: 6px;
    padding: 5px 14px; font-family: var(--ch-mono); font-size: 0.68rem;
    color: rgba(255,255,255,0.35); letter-spacing: 0.04em;
  }

  /* Preview site layout */
  .ch-preview-layout { display: grid; grid-template-columns: 200px 1fr; min-height: 440px; }
  .ch-preview-sidebar {
    background: #0d0d18; padding: 24px 0;
    border-right: 1px solid rgba(255,255,255,0.05);
  }
  .ch-preview-brand {
    padding: 0 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 12px; display: flex; align-items: center; gap: 10px;
  }
  .ch-preview-logo {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--ch-accent), var(--ch-accent2));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ch-display); font-size: 0.85rem; color: white;
  }
  .ch-preview-org-name { font-size: 0.8rem; font-weight: 700; color: white; }
  .ch-preview-org-sub { font-size: 0.6rem; color: rgba(255,255,255,0.3); font-family: var(--ch-mono); }
  .ch-preview-nav-item {
    padding: 9px 20px; font-size: 0.75rem; color: rgba(255,255,255,0.35);
    display: flex; align-items: center; gap: 8px; cursor: default;
    transition: background var(--ch-transition), color var(--ch-transition);
  }
  .ch-preview-nav-item:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.03); }
  .ch-preview-nav-item.active {
    color: white; background: rgba(255,255,255,0.06);
    border-right: 2px solid var(--ch-accent);
  }
  .ch-preview-nav-icon {
    width: 12px; height: 12px; border-radius: 3px;
    background: currentColor; opacity: 0.5; flex-shrink: 0;
  }
  .ch-preview-main { background: #0f0f1a; overflow: hidden; }
  .ch-preview-banner {
    height: 120px; padding: 0 28px;
    background: linear-gradient(135deg, #1a1a2e, #1e1228);
    display: flex; align-items: center; gap: 16px; position: relative;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .ch-preview-banner::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(232,66,10,0.12), rgba(245,166,35,0.06));
  }
  .ch-preview-banner-avatar {
    width: 52px; height: 52px; border-radius: 12px;
    background: linear-gradient(135deg, var(--ch-accent), var(--ch-accent2));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ch-display); font-size: 1.15rem; color: white;
    position: relative; z-index: 1; flex-shrink: 0;
  }
  .ch-preview-banner-title { font-size: 0.95rem; font-weight: 700; color: white; position: relative; z-index: 1; }
  .ch-preview-banner-meta { font-size: 0.65rem; color: rgba(255,255,255,0.4); font-family: var(--ch-mono); margin-top: 3px; position: relative; z-index: 1; }
  .ch-preview-content {
    padding: 20px 24px; display: grid;
    grid-template-columns: 1fr 1fr; gap: 14px;
  }
  .ch-preview-block {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px; padding: 16px;
  }
  .ch-preview-block-label {
    font-family: var(--ch-mono); font-size: 0.6rem; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--ch-accent); margin-bottom: 12px;
  }
  .ch-preview-ann {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .ch-preview-ann:last-child { border-bottom: none; }
  .ch-preview-ann-avatar { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; }
  .ch-preview-ann-name { font-size: 0.65rem; font-weight: 600; color: rgba(255,255,255,0.65); margin-bottom: 2px; }
  .ch-preview-ann-text { font-size: 0.62rem; color: rgba(255,255,255,0.3); line-height: 1.4; }
  .ch-preview-event {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .ch-preview-event:last-child { border-bottom: none; }
  .ch-preview-event-date {
    width: 34px; text-align: center; border-radius: 6px;
    padding: 4px 0; flex-shrink: 0;
  }
  .ch-preview-event-day { font-family: var(--ch-display); font-size: 1rem; color: white; line-height: 1; display: block; }
  .ch-preview-event-mon { font-size: 0.5rem; color: rgba(255,255,255,0.7); text-transform: uppercase; display: block; }
  .ch-preview-event-title { font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.7); }
  .ch-preview-event-sub { font-size: 0.6rem; color: rgba(255,255,255,0.3); font-family: var(--ch-mono); margin-top: 2px; }

  /* ── FOR WHO ── */
  .ch-who-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px; background: var(--ch-border);
    border: 1px solid var(--ch-border);
    margin-top: 64px;
  }
  .ch-who-card {
    background: var(--ch-paper2); padding: 40px 32px;
    transition: background var(--ch-transition), transform var(--ch-transition);
    cursor: default; position: relative; overflow: hidden;
    outline: none;
  }
  .ch-who-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 0; background: var(--ch-accent);
    transition: height var(--ch-transition);
  }
  .ch-who-card:hover { background: var(--ch-ink); transform: translateY(-3px); }
  .ch-who-card:hover::after { height: 3px; }
  .ch-who-card:hover .ch-who-title,
  .ch-who-card:hover .ch-who-desc { color: white; }
  .ch-who-card:hover .ch-who-icon-wrap { background: rgba(255,255,255,0.1); color: var(--ch-accent); }
  .ch-who-icon-wrap {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(232,66,10,0.08); color: var(--ch-accent);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px; transition: background var(--ch-transition), color var(--ch-transition);
  }
  .ch-who-title {
    font-size: 1rem; font-weight: 700; letter-spacing: -0.01em;
    color: var(--ch-ink); margin-bottom: 8px;
    transition: color var(--ch-transition);
  }
  .ch-who-desc {
    font-size: 0.87rem; color: var(--ch-muted); line-height: 1.6;
    font-weight: 300; transition: color var(--ch-transition);
  }

  /* ── HOW IT WORKS ── */
  .ch-steps {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 0; margin-top: 80px; position: relative;
  }
  .ch-steps-line {
    position: absolute; top: 39px; left: 12%; right: 12%;
    height: 1px; background: linear-gradient(90deg, transparent, var(--ch-accent) 20%, var(--ch-accent) 80%, transparent);
    opacity: 0.3;
  }
  .ch-step { text-align: center; padding: 0 28px; }
  .ch-step-num {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--ch-ink); color: white;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ch-display); font-size: 1.6rem; font-weight: 800;
    margin: 0 auto 28px; position: relative; z-index: 1;
    transition: background var(--ch-transition), transform var(--ch-transition);
    border: 3px solid var(--ch-paper);
    box-shadow: 0 0 0 2px var(--ch-ink);
  }
  .ch-step:hover .ch-step-num { background: var(--ch-accent); transform: scale(1.08); }
  .ch-step-title { font-size: 1rem; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.01em; }
  .ch-step-desc { font-size: 0.87rem; color: var(--ch-muted); line-height: 1.65; font-weight: 300; }

  /* ── TRUST ── */
  .ch-trust-section { position: relative; overflow: hidden; }
  .ch-trust-grid {
    display: grid; grid-template-columns: 1.1fr 1fr;
    gap: 80px; align-items: start;
  }
  .ch-trust-items { display: flex; flex-direction: column; gap: 20px; margin-top: 36px; }
  .ch-trust-item { display: flex; align-items: flex-start; gap: 12px; }
  .ch-trust-item-title { font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 3px; }
  .ch-trust-item-desc { font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.55; font-weight: 300; }
  .ch-trust-stats-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
    background: var(--ch-dark-border); border: 1px solid var(--ch-dark-border);
    align-self: start; margin-top: 40px;
  }
  .ch-trust-stat {
    background: var(--ch-ink); padding: 32px 28px;
    display: flex; flex-direction: column; gap: 8px;
    transition: background var(--ch-transition);
  }
  .ch-trust-stat:hover { background: #12121e; }
  .ch-trust-stat-val {
    font-family: var(--ch-display); font-size: 3rem; font-weight: 800;
    line-height: 1; color: white;
  }
  .ch-trust-stat-label {
    font-family: var(--ch-mono); font-size: 0.68rem; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
  }

  /* ── FINAL CTA ── */
  .ch-final-cta { position: relative; overflow: hidden; }
  .ch-final-bg { position: absolute; inset: 0; pointer-events: none; }
  .ch-final-blob {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 70%; height: 80%; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,66,10,0.07) 0%, transparent 70%);
    filter: blur(40px);
  }
  .ch-final-h2 {
    font-family: var(--ch-display); font-size: clamp(4.5rem, 9vw, 9rem);
    font-weight: 800; line-height: 0.88; letter-spacing: -0.02em;
    color: var(--ch-ink); margin-bottom: 28px; position: relative; z-index: 1;
  }
  .ch-final-ctas {
    display: flex; gap: 16px; justify-content: center;
    flex-wrap: wrap; margin-top: 48px; position: relative; z-index: 1;
  }
  .ch-btn-xl { font-size: 1.05rem !important; padding: 18px 44px !important; }
  .ch-final-footnote {
    margin-top: 28px; font-size: 0.85rem; color: var(--ch-muted);
    position: relative; z-index: 1;
  }
  .ch-link { color: var(--ch-ink); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
  .ch-link:hover { color: var(--ch-accent); }

  /* ── BUTTONS ── */
  .ch-btn-primary-hero {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--ch-accent); color: white;
    padding: 15px 36px; font-family: var(--ch-body);
    font-size: 0.95rem; font-weight: 700; letter-spacing: 0.02em;
    border: none; cursor: pointer; text-decoration: none;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(232,66,10,0.25);
    transition: background var(--ch-transition), transform var(--ch-transition), box-shadow var(--ch-transition);
  }
  .ch-btn-primary-hero:hover {
    background: #c73208; transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(232,66,10,0.35);
  }
  .ch-btn-ghost-hero {
    display: inline-flex; align-items: center; gap: 10px;
    background: transparent; color: var(--ch-ink);
    padding: 15px 36px; font-family: var(--ch-body);
    font-size: 0.95rem; font-weight: 600;
    border: 1.5px solid rgba(0,0,0,0.2); cursor: pointer;
    text-decoration: none; border-radius: 12px;
    transition: background var(--ch-transition), border-color var(--ch-transition), transform var(--ch-transition);
  }
  .ch-btn-ghost-hero:hover {
    background: rgba(0,0,0,0.05); border-color: var(--ch-ink);
    transform: translateY(-2px);
  }

  /* ── FOOTER ── */
  .ch-footer {
    background: var(--ch-ink); padding: 40px 48px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .ch-footer-logo { display: flex; align-items: center; text-decoration: none; }
  .ch-footer-logo-img { height: 28px; width: auto; }
  .ch-footer-logo span {
    font-family: var(--ch-display); font-size: 1.1rem;
    color: white; font-weight: 800;
  }
  .ch-footer-copy { font-size: 0.78rem; color: rgba(255,255,255,0.3); font-family: var(--ch-mono); }
  .ch-footer-links { display: flex; gap: 24px; }
  .ch-footer-link {
    font-size: 0.78rem; color: rgba(255,255,255,0.35);
    text-decoration: none; transition: color var(--ch-transition);
  }
  .ch-footer-link:hover { color: white; }

  /* ── KEYFRAMES ── */
  @keyframes chFadeLeft {
    from { opacity: 0; transform: translateX(-24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes chFadeRight {
    from { opacity: 0; transform: translateX(24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes chFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes chPing {
    75%, 100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes chPulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
  @keyframes chMarquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .ch-hero-inner { grid-template-columns: 1fr; }
    .ch-hero-right { display: none; }
    .ch-hero { padding: 100px 32px 0; }
    .ch-stats-bar { grid-template-columns: repeat(4, 1fr); padding: 24px 0; }
    .ch-section { padding: 80px 32px; }
    .ch-problem-grid { grid-template-columns: 1fr; gap: 48px; }
    .ch-cap-grid { grid-template-columns: 1fr 1fr; }
    .ch-who-grid { grid-template-columns: 1fr 1fr; }
    .ch-steps { grid-template-columns: 1fr 1fr; gap: 48px; }
    .ch-steps-line { display: none; }
    .ch-trust-grid { grid-template-columns: 1fr; gap: 48px; }
    .ch-preview-layout { grid-template-columns: 1fr; }
    .ch-preview-sidebar { display: none; }
    .ch-footer { padding: 32px; flex-direction: column; text-align: center; }
  }

  @media (max-width: 640px) {
    .ch-hero { padding: 88px 24px 0; }
    .ch-section { padding: 64px 24px; }
    .ch-cap-grid { grid-template-columns: 1fr; }
    .ch-who-grid { grid-template-columns: 1fr; }
    .ch-steps { grid-template-columns: 1fr; }
    .ch-stats-bar { grid-template-columns: repeat(2, 1fr); }
    .ch-trust-stats-grid { grid-template-columns: 1fr; }
    .ch-final-ctas { flex-direction: column; }
    .ch-footer-links { flex-wrap: wrap; justify-content: center; }
    .ch-mini-grid { grid-template-columns: 1fr; }
    .ch-preview-content { grid-template-columns: 1fr; }
  }
`;

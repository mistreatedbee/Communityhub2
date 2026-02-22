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
  Home,
  Megaphone,
  Grid,
  Lock,
  TrendingUp,
  HeartHandshake,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { hasLicenseSession } from '../../utils/licenseToken';
import { Spinner } from '../../components/ui/Spinner';

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
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
  direction?: 'up' | 'left' | 'right' | 'scale' | 'none';
}
function Reveal({ children, className = '', delay = 0, direction = 'up' }: RevealProps) {
  const { ref, visible } = useReveal();
  const getInitial = () => {
    switch (direction) {
      case 'up': return 'translateY(40px)';
      case 'left': return 'translateX(-40px)';
      case 'right': return 'translateX(40px)';
      case 'scale': return 'scale(0.92) translateY(20px)';
      default: return 'none';
    }
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : getInitial(),
        transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const { ref, visible } = useReveal();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Announcements', 'Event Management', 'Member Profiles',
  'Resource Library', 'Community Groups', 'Admin Controls',
  'Branded Website', 'Private & Secure', 'No WhatsApp Chaos',
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="ch-marquee-strip" aria-hidden>
      <div className="ch-marquee-track">
        {items.map((item, i) => (
          <span key={i} className={`ch-marquee-item${i % 4 === 2 ? ' ch-marquee-accent' : ''}`}>
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
                { name: 'Pastor David', text: 'Sunday service moved to 10:00 AM this week.', color: '#4f6ef7' },
                { name: 'Admin Team', text: 'New resource packs uploaded to the library.', color: '#7c3aed' },
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
                { day: '15', mon: 'Mar', title: 'Youth Leadership Workshop', sub: 'Hall B · 09:00–13:00', c: '#4f6ef7' },
                { day: '22', mon: 'Mar', title: 'Community Prayer Evening', sub: 'Main Hall · 18:30–20:00', c: '#06b6d4' },
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

// ─── DATA ────────────────────────────────────────────────────────────────────
const CAPABILITIES = [
  {
    Icon: Home, badge: 'Real Community Website',
    title: 'A branded home. Not a group chat.',
    desc: "Your members land on a beautiful, custom-branded space with your logo, colors, and messaging. Your digital HQ, not a side project.",
  },
  {
    Icon: Megaphone, badge: 'Announcements That Reach People',
    title: 'Important messages stay visible.',
    desc: 'Structured, pinned, and permanent. No more critical updates buried under noise 30 seconds after posting.',
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
    desc: 'Rich profiles with photos, roles, and bios. Admins see who is engaged. Members feel known.',
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
  { value: 50, suffix: '+', label: 'Active communities' },
  { value: 10, suffix: 'k+', label: 'Members served' },
  { value: 99, suffix: '.9%', label: 'Uptime SLA' },
  { value: 24, suffix: '/7', label: 'Support' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function HomePage() {
  const { organization } = useTheme();
  const { user, resolveDashboardTarget } = useAuth();
  const navigate = useNavigate();
  const [dashboardTarget, setDashboardTarget] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

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

  return (
    <div className="ch-root">
      <style>{CSS}</style>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="ch-hero">
        {/* Animated background */}
        <div className="ch-hero-bg" aria-hidden>
          <div className="ch-hero-glow-1" />
          <div className="ch-hero-glow-2" />
          <div className="ch-hero-glow-3" />
          <div className="ch-hero-grid" />
          <div className="ch-orb ch-orb-a" />
          <div className="ch-orb ch-orb-b" />
          <div className="ch-orb ch-orb-c" />
        </div>

        <div className="ch-hero-inner">
          {/* Left column */}
          <div className="ch-hero-left">
            {/* Logo - bigger and more visible */}
            <div className="ch-hero-logo-wrap" style={{ animation: 'chSlideDown 0.7s cubic-bezier(0.16,1,0.3,1) forwards' }}>
              {organization.logo ? (
                <img src={organization.logo} alt={organization.name} className="ch-hero-logo" />
              ) : (
                <span className="ch-hero-logo-fallback">{organization.name}</span>
              )}
            </div>

            {/* Badge */}
            <div className="ch-hero-badge" style={{ animation: 'chFadeUp 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both' }}>
              <span className="ch-ping">
                <span className="ch-ping-inner" />
                <span className="ch-ping-dot" />
              </span>
              The future of community management
            </div>

            {/* Headline */}
            <h1 className="ch-hero-h1" style={{ animation: 'chFadeUp 0.8s 0.25s cubic-bezier(0.16,1,0.3,1) both' }}>
              Your community.<br />
              <span className="ch-hero-gradient">Your rules.</span>
            </h1>

            {/* Sub */}
            <p className="ch-hero-sub" style={{ animation: 'chFadeUp 0.8s 0.38s cubic-bezier(0.16,1,0.3,1) both' }}>
              Stop losing your members in messy group chats. Build a professional,
              branded platform where events happen, content lives, and your community
              actually thrives.
            </p>

            {/* CTAs */}
            <div className="ch-hero-ctas" style={{ animation: 'chFadeUp 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
              <Link to="/enter-license">
                <button className="ch-btn-primary">
                  Create Your Hub
                  <ArrowRight className="w-5 h-5 ch-btn-arrow" />
                </button>
              </Link>
              {user && dashboardTarget && !dashboardLoading ? (
                <button className="ch-btn-ghost" onClick={() => navigate(dashboardTarget!)}>
                  {dashboardTarget === '/my-communities' ? 'My Communities' : 'My Community'}
                </button>
              ) : (
                <button className="ch-btn-ghost" onClick={() => navigate('/login')}>
                  Admin Login
                </button>
              )}
              {user && dashboardLoading && <Spinner size="sm" />}
            </div>

            {/* Footnote */}
            <p className="ch-hero-footnote" style={{ animation: 'chFadeUp 0.8s 0.62s cubic-bezier(0.16,1,0.3,1) both' }}>
              <CheckCircle className="w-4 h-4 ch-green-icon" />
              No credit card required · Set up in minutes
            </p>

            {/* Trust chips */}
            <div className="ch-hero-chips" style={{ animation: 'chFadeUp 0.8s 0.72s cubic-bezier(0.16,1,0.3,1) both' }}>
              {['50+ Communities', '10k+ Members', '99.9% Uptime'].map((chip) => (
                <span key={chip} className="ch-chip">{chip}</span>
              ))}
            </div>
          </div>

          {/* Right column — mockup */}
          <div className="ch-hero-right" style={{ animation: 'chFadeRight 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="ch-hero-mockup-wrap">
              <div className="ch-mockup-shadow" aria-hidden />

              <BrowserShell url="hub.yourcommunity.org">
                <div className="ch-mini-preview">
                  <div className="ch-mini-banner">
                    <div className="ch-mini-logo">MC</div>
                    <div>
                      <div className="ch-mini-title">My Community Hub</div>
                      <div className="ch-mini-meta">142 Members · Active</div>
                    </div>
                    <div className="ch-mini-live-badge">
                      <span className="ch-mini-live-dot" />
                      Live
                    </div>
                  </div>
                  <div className="ch-mini-grid">
                    <div className="ch-mini-card">
                      <div className="ch-mini-card-label">📢 Latest Announcement</div>
                      <div className="ch-mini-line" style={{ width: '90%' }} />
                      <div className="ch-mini-line" style={{ width: '65%' }} />
                    </div>
                    <div className="ch-mini-card">
                      <div className="ch-mini-card-label">📅 Next Event</div>
                      <div className="ch-mini-event-chip">
                        <span className="ch-mini-event-day">15 Mar</span>
                        <span className="ch-mini-event-name">Community Meetup</span>
                      </div>
                    </div>
                  </div>
                  <div className="ch-mini-members-row">
                    <div className="ch-mini-members">
                      {['MC', 'SR', 'TN', 'LM', 'PK'].map((initials) => (
                        <div key={initials} className="ch-mini-avatar">{initials}</div>
                      ))}
                      <div className="ch-mini-avatar ch-mini-avatar-more">+138</div>
                    </div>
                    <span className="ch-mini-members-label">Active members</span>
                  </div>
                </div>
              </BrowserShell>

              <div className="ch-float-pill ch-float-1">
                <span className="ch-float-icon">✓</span> Fully branded
              </div>
              <div className="ch-float-pill ch-float-2">
                <span className="ch-float-icon">🔒</span> Private &amp; secure
              </div>
              <div className="ch-float-pill ch-float-3">
                <span className="ch-float-icon">⚡</span> Live in minutes
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="ch-stats-bar" style={{ animation: 'chFadeUp 0.8s 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} className="ch-stat">
              <span className="ch-stat-value">
                <AnimatedNumber target={value} suffix={suffix} />
              </span>
              <span className="ch-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── PROBLEM ── */}
      <section className="ch-section ch-problem-section">
        <div className="ch-container ch-problem-grid">
          <Reveal direction="left">
            <p className="ch-eyebrow">01 — The problem</p>
            <h2 className="ch-section-h2">
              Group chats are where<br />communities go to die.
            </h2>
            <p className="ch-section-body">
              Your members are scattered across five different apps. Important announcements
              get buried instantly. You are renting space on someone else's platform —
              they make the rules, not you.
            </p>
          </Reveal>

          <div className="ch-problem-items">
            {[
              { icon: '✕', title: 'No structure', desc: 'Critical messages disappear under noise within seconds of posting.' },
              { icon: '✕', title: 'No ownership', desc: "You are a guest on someone else's platform. They can shut you down anytime." },
              { icon: '✕', title: 'No branding', desc: 'A WhatsApp group makes your organisation look like a casual hobby group.' },
              { icon: '✕', title: 'No engagement', desc: 'No profiles, no history, no reason for members to stay invested and engaged.' },
            ].map(({ icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.1}>
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
            <p className="ch-eyebrow ch-eyebrow-light">02 — Platform capabilities</p>
            <h2 className="ch-section-h2 ch-light">
              Not features.<br />
              <span className="ch-accent-text">Capabilities.</span>
            </h2>
            <p className="ch-section-body ch-body-muted">
              Everything your community needs to run professionally — in one place.
            </p>
          </Reveal>

          <div className="ch-cap-grid">
            {CAPABILITIES.map(({ Icon, badge, title, desc }, i) => (
              <Reveal key={badge} delay={(i % 3) * 0.1} direction="scale" className="ch-cap-card">
                <div className="ch-cap-card-inner">
                  <div className="ch-cap-icon-wrap">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ch-cap-num">0{i + 1}</div>
                  <h3 className="ch-cap-title">{title}</h3>
                  <p className="ch-cap-desc">{desc}</p>
                  <div className="ch-cap-badge">
                    <Icon className="w-3 h-3" />
                    {badge}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PREVIEW ── */}
      <section className="ch-section ch-preview-section">
        <div className="ch-container">
          <Reveal className="ch-preview-header ch-center">
            <p className="ch-eyebrow">03 — See it live</p>
            <h2 className="ch-section-h2">This is a website.<br />Not a dashboard.</h2>
            <p className="ch-section-body">
              Your community gets a beautiful, member-facing home — not an admin panel buried behind a login.
            </p>
          </Reveal>

          <Reveal delay={0.15} direction="scale">
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
            <p className="ch-section-body">
              Purpose-built for organisations that need more than a chat app.
            </p>
          </Reveal>

          <div className="ch-who-grid">
            {AUDIENCES.map(({ Icon, title, desc }, i) => (
              <Reveal key={title} delay={(i % 3) * 0.1} direction="scale">
                <div className="ch-who-card" tabIndex={0}>
                  <div className="ch-who-card-glow" aria-hidden />
                  <div className="ch-who-icon-wrap">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="ch-who-title">{title}</h3>
                  <p className="ch-who-desc">{desc}</p>
                  <div className="ch-who-arrow">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ch-section ch-how-section">
        <div className="ch-container">
          <Reveal className="ch-center">
            <p className="ch-eyebrow">05 — Process</p>
            <h2 className="ch-section-h2">Up in minutes.<br />Running for years.</h2>
            <p className="ch-section-body">
              No technical skills required. No complex setup. Just your community.
            </p>
          </Reveal>

          <div className="ch-steps">
            <div className="ch-steps-track" aria-hidden />
            {STEPS.map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.12} direction="up" className="ch-step">
                <div className="ch-step-num-wrap">
                  <div className="ch-step-num">{n}</div>
                  <div className="ch-step-pulse" aria-hidden />
                </div>
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
            <p className="ch-eyebrow ch-eyebrow-light">06 — Trust &amp; reliability</p>
            <h2 className="ch-section-h2 ch-light">
              Built to last.<br />
              <span className="ch-accent-text">Not to impress.</span>
            </h2>
            <p className="ch-section-body ch-body-muted">
              This is not a side project. CommunityHub is managed infrastructure
              built for communities that need reliability, privacy, and room to grow.
            </p>
            <div className="ch-trust-items">
              {TRUST.map(({ Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 0.08} direction="left">
                  <div className="ch-trust-item">
                    <div className="ch-trust-icon">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="ch-trust-item-title">{title}</div>
                      <div className="ch-trust-item-desc">{desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <div className="ch-trust-stats-grid">
            {STATS.map(({ value, suffix, label }, i) => (
              <Reveal key={label} delay={i * 0.1} direction="scale">
                <div className="ch-trust-stat">
                  <span className="ch-trust-stat-val">
                    <AnimatedNumber target={value} suffix={suffix} />
                  </span>
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
          <div className="ch-final-glow-1" />
          <div className="ch-final-glow-2" />
        </div>
        <div className="ch-container ch-center">
          <Reveal direction="scale">
            <div className="ch-final-inner">
              <p className="ch-eyebrow">07 — Get started</p>
              <h2 className="ch-final-h2">
                Build your community<br />
                <span className="ch-hero-gradient">the right way.</span>
              </h2>
              <p className="ch-final-sub">
                Stop patching together broken tools. Get a real platform, built for exactly this purpose.
              </p>
              <div className="ch-final-ctas">
                <Link to="/enter-license">
                  <button className="ch-btn-primary ch-btn-xl">
                    <KeyRound className="w-5 h-5" />
                    Create a Community Hub
                  </button>
                </Link>
                <a
                  href="https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="ch-btn-ghost ch-btn-xl">
                    <MessageCircle className="w-5 h-5" />
                    Contact Sales
                  </button>
                </a>
              </div>
              <p className="ch-final-footnote">
                Already have a license?{' '}
                <Link to="/login" className="ch-link">Sign in to your admin dashboard</Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// ─── CSS (modified for bigger logo) ───────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

  .ch-root {
    --ch-ink: #0d0f14;
    --ch-ink2: #1a1f2e;
    --ch-paper: #ffffff;
    --ch-paper2: #f7f8fc;
    --ch-white: #ffffff;
    --ch-accent: #4f6ef7;
    --ch-accent2: #7c3aed;
    --ch-accent3: #06b6d4;
    --ch-muted: #64748b;
    --ch-border: rgba(0,0,0,0.07);
    --ch-border2: rgba(255,255,255,0.08);
    --ch-dark: #080b14;
    --ch-display: 'Outfit', sans-serif;
    --ch-body: 'Plus Jakarta Sans', sans-serif;
    --ch-mono: 'JetBrains Mono', monospace;
    --ch-radius: 20px;
    --ch-radius-sm: 12px;
    --ch-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --ch-t: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: var(--ch-body);
    background: var(--ch-paper);
    color: var(--ch-ink);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── HERO ─────────────────────────────────────────────────────────────── */
  .ch-hero {
    position: relative; min-height: 100vh;
    display: flex; flex-direction: column; justify-content: center;
    padding: 48px 56px 0; overflow: hidden;
    background: #050810;
  }
  .ch-hero-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .ch-hero-glow-1 {
    position: absolute; top: -20%; left: -10%; width: 70%; height: 80%;
    background: radial-gradient(ellipse, rgba(79,110,247,0.18) 0%, transparent 65%);
    filter: blur(60px); animation: chDrift 12s ease-in-out infinite;
  }
  .ch-hero-glow-2 {
    position: absolute; bottom: -10%; right: -5%; width: 55%; height: 70%;
    background: radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 65%);
    filter: blur(80px); animation: chDrift 15s 3s ease-in-out infinite reverse;
  }
  .ch-hero-glow-3 {
    position: absolute; top: 30%; left: 40%; width: 40%; height: 50%;
    background: radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 65%);
    filter: blur(60px); animation: chDrift 18s 1.5s ease-in-out infinite;
  }
  .ch-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }
  .ch-orb {
    position: absolute; border-radius: 50%;
    background: linear-gradient(135deg, rgba(79,110,247,0.12), rgba(124,58,237,0.08));
    border: 1px solid rgba(255,255,255,0.05);
  }
  .ch-orb-a { width: 280px; height: 280px; top: 8%; right: 4%; animation: chOrbit 22s linear infinite; }
  .ch-orb-b { width: 140px; height: 140px; bottom: 18%; left: 4%; animation: chOrbit 15s 2s linear infinite reverse; background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(79,110,247,0.07)); }
  .ch-orb-c { width: 70px; height: 70px; top: 55%; right: 28%; animation: chOrbit 11s 1s linear infinite; }

  .ch-hero-inner {
    position: relative; z-index: 1; max-width: 1320px; margin: 0 auto; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
  }
  .ch-hero-left { display: flex; flex-direction: column; align-items: flex-start; }

  /* Logo - bigger and more visible */
  .ch-hero-logo-wrap { margin-bottom: 32px; }
  .ch-hero-logo {
    height: 72px;
    width: auto;
    filter: drop-shadow(0 8px 16px rgba(79,110,247,0.25));
    transition: transform 0.3s ease;
  }
  .ch-hero-logo:hover {
    transform: scale(1.05);
  }
  .ch-hero-logo-fallback {
    font-family: var(--ch-display);
    font-size: 2rem;
    font-weight: 900;
    background: linear-gradient(135deg, #ffffff, #e0e7ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .ch-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 16px; border-radius: 999px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    font-family: var(--ch-mono); font-size: 0.7rem; letter-spacing: 0.08em;
    text-transform: uppercase; color: rgba(255,255,255,0.6);
    margin-bottom: 24px; backdrop-filter: blur(8px);
  }
  .ch-ping { position: relative; width: 8px; height: 8px; flex-shrink: 0; display: inline-block; }
  .ch-ping-inner {
    position: absolute; inset: 0; border-radius: 50%;
    background: #4f6ef7; opacity: 0.7;
    animation: chPing 2s cubic-bezier(0,0,0.2,1) infinite;
  }
  .ch-ping-dot { position: relative; display: block; width: 8px; height: 8px; border-radius: 50%; background: #4f6ef7; }

  .ch-hero-h1 {
    font-family: var(--ch-display);
    font-size: clamp(3rem, 6.5vw, 5.8rem);
    font-weight: 900; line-height: 1.0; letter-spacing: -0.03em;
    color: #ffffff; margin-bottom: 24px;
  }
  .ch-hero-gradient {
    background: linear-gradient(135deg, #7eb3ff 0%, #a78bfa 40%, #67e8f9 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    background-size: 200% 200%; animation: chGradientShift 6s ease infinite;
  }
  .ch-hero-sub {
    font-size: 1.1rem; line-height: 1.8; color: rgba(255,255,255,0.55);
    font-weight: 400; max-width: 500px; margin-bottom: 36px;
  }
  .ch-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
  .ch-hero-footnote {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.82rem; color: rgba(255,255,255,0.4); margin-bottom: 24px;
  }
  .ch-green-icon { color: #4ade80; }
  .ch-hero-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .ch-chip {
    padding: 5px 12px; border-radius: 999px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    font-size: 0.75rem; font-weight: 500; color: rgba(255,255,255,0.45);
    font-family: var(--ch-mono);
  }

  .ch-hero-right { display: flex; align-items: center; justify-content: center; }
  .ch-hero-mockup-wrap { position: relative; width: 100%; max-width: 560px; }
  .ch-mockup-shadow {
    position: absolute; inset: 20px 0 -20px;
    background: linear-gradient(135deg, rgba(79,110,247,0.3), rgba(124,58,237,0.2));
    border-radius: var(--ch-radius); filter: blur(40px); z-index: 0;
  }

  .ch-mini-preview { padding: 16px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
  .ch-mini-banner {
    background: linear-gradient(135deg, rgba(79,110,247,0.12), rgba(124,58,237,0.08));
    border-radius: 12px; padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    border: 1px solid rgba(79,110,247,0.2);
  }
  .ch-mini-logo {
    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #4f6ef7, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ch-display); font-size: 0.85rem; font-weight: 700; color: white;
  }
  .ch-mini-title { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.9); }
  .ch-mini-meta { font-size: 0.65rem; color: rgba(255,255,255,0.4); font-family: var(--ch-mono); margin-top: 2px; }
  .ch-mini-live-badge {
    margin-left: auto; display: flex; align-items: center; gap: 5px;
    font-size: 0.65rem; font-weight: 600; color: #4ade80; font-family: var(--ch-mono);
  }
  .ch-mini-live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
    animation: chPing 2s cubic-bezier(0,0,0.2,1) infinite;
  }
  .ch-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ch-mini-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;
    transition: background var(--ch-t);
  }
  .ch-mini-card:hover { background: rgba(255,255,255,0.07); }
  .ch-mini-card-label { font-size: 0.62rem; font-family: var(--ch-mono); color: rgba(255,255,255,0.4); }
  .ch-mini-line { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.1); animation: chShimmer 2s ease-in-out infinite; }
  .ch-mini-event-chip {
    display: flex; align-items: center; gap: 8px;
    background: rgba(79,110,247,0.1); border-radius: 6px; padding: 6px 8px;
    border: 1px solid rgba(79,110,247,0.2);
  }
  .ch-mini-event-day { font-family: var(--ch-mono); font-size: 0.62rem; color: #7eb3ff; font-weight: 500; white-space: nowrap; }
  .ch-mini-event-name { font-size: 0.68rem; color: rgba(255,255,255,0.7); font-weight: 500; }
  .ch-mini-members-row { display: flex; align-items: center; justify-content: space-between; }
  .ch-mini-members { display: flex; align-items: center; }
  .ch-mini-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.1);
    background: linear-gradient(135deg, #4f6ef7, #7c3aed);
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 0.5rem; font-weight: 700; color: white;
    margin-right: -6px; position: relative;
    transition: transform var(--ch-t);
  }
  .ch-mini-avatar:hover { transform: translateY(-3px) scale(1.1); z-index: 1; }
  .ch-mini-avatar-more { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 0.45rem; }
  .ch-mini-members-label { font-size: 0.62rem; color: rgba(255,255,255,0.3); font-family: var(--ch-mono); }

  .ch-float-pill {
    position: absolute; z-index: 10;
    background: rgba(255,255,255,0.96); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.8);
    padding: 8px 16px; border-radius: 999px;
    font-size: 0.72rem; font-weight: 600; color: var(--ch-ink);
    display: flex; align-items: center; gap: 6px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15); white-space: nowrap;
  }
  .ch-float-icon { font-size: 0.85rem; }
  .ch-float-1 { top: -12px; left: 20px; animation: chFloat 5s ease-in-out infinite; }
  .ch-float-2 { bottom: 60px; left: -24px; animation: chFloat 7s 1.2s ease-in-out infinite; }
  .ch-float-3 { bottom: -12px; right: 32px; animation: chFloat 6s 0.6s ease-in-out infinite; }

  .ch-stats-bar {
    position: relative; z-index: 1; max-width: 1320px; margin: 72px auto 0;
    padding: 36px 0; border-top: 1px solid rgba(255,255,255,0.06);
    display: grid; grid-template-columns: repeat(4, 1fr); text-align: center;
  }
  .ch-stat { padding: 0 24px; border-right: 1px solid rgba(255,255,255,0.06); }
  .ch-stat:last-child { border-right: none; }
  .ch-stat-value {
    display: block; font-family: var(--ch-display); font-size: 2.8rem; font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    line-height: 1; margin-bottom: 8px;
  }
  .ch-stat-label {
    display: block; font-size: 0.75rem; color: rgba(255,255,255,0.35);
    font-family: var(--ch-mono); letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ── MARQUEE ────────────────────────────────────────────────────────────── */
  .ch-marquee-strip {
    background: var(--ch-ink2);
    border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 18px 0; overflow: hidden;
  }
  .ch-marquee-track { display: flex; animation: chMarquee 28s linear infinite; white-space: nowrap; }
  .ch-marquee-item {
    font-family: var(--ch-display); font-size: 0.95rem; font-weight: 600; letter-spacing: 0.03em;
    color: rgba(255,255,255,0.3); padding: 0 28px;
    display: inline-flex; align-items: center; gap: 16px;
  }
  .ch-marquee-accent { color: #7eb3ff !important; }
  .ch-marquee-dot { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; background: #4f6ef7; }

  /* ── SECTION BASE ───────────────────────────────────────────────────────── */
  .ch-section { padding: 120px 56px; }
  .ch-container { max-width: 1320px; margin: 0 auto; }
  .ch-center { text-align: center; display: flex; flex-direction: column; align-items: center; }

  .ch-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--ch-mono); font-size: 0.7rem; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--ch-accent); margin-bottom: 16px;
  }
  .ch-eyebrow::before {
    content: ''; display: block; width: 20px; height: 2px;
    background: currentColor; border-radius: 1px;
  }
  .ch-eyebrow-light { color: #7eb3ff; }

  .ch-section-h2 {
    font-family: var(--ch-display); font-size: clamp(2.5rem, 4.5vw, 4rem);
    font-weight: 800; line-height: 1.05; letter-spacing: -0.025em;
    color: var(--ch-ink); margin-bottom: 20px;
  }
  .ch-section-body {
    font-size: 1.05rem; line-height: 1.8; color: var(--ch-muted);
    font-weight: 400; max-width: 560px;
  }
  .ch-body-muted { color: rgba(255,255,255,0.4) !important; max-width: 560px; }

  .ch-dark { background: var(--ch-dark); }
  .ch-paper { background: var(--ch-paper2); }
  .ch-light { color: #ffffff !important; }
  .ch-accent-text { color: #7eb3ff; }

  /* ── PROBLEM ──────────────────────────────────────────────────────────── */
  .ch-problem-section { background: var(--ch-paper); }
  .ch-problem-grid { display: grid; grid-template-columns: 5fr 7fr; gap: 80px; align-items: start; }
  .ch-problem-items { display: flex; flex-direction: column; }
  .ch-problem-item {
    display: flex; align-items: flex-start; gap: 16px;
    border-bottom: 1px solid var(--ch-border); padding: 24px 8px;
    position: relative; cursor: default;
    transition: background var(--ch-t), padding-left var(--ch-t);
    border-radius: 8px;
  }
  .ch-problem-item:hover { background: rgba(79,110,247,0.04); padding-left: 16px; }
  .ch-problem-item:last-child { border-bottom: none; }
  .ch-problem-icon {
    width: 34px; height: 34px; flex-shrink: 0;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18);
    color: #ef4444; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.9rem; border-radius: 8px;
    transition: transform var(--ch-t);
  }
  .ch-problem-item:hover .ch-problem-icon { transform: scale(1.1) rotate(-5deg); }
  .ch-problem-title { font-weight: 700; font-size: 1rem; margin-bottom: 4px; color: var(--ch-ink); letter-spacing: -0.01em; }
  .ch-problem-desc { font-size: 0.9rem; color: var(--ch-muted); line-height: 1.65; }

  /* ── CAPABILITIES ────────────────────────────────────────────────────── */
  .ch-cap-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.06); border-radius: var(--ch-radius);
    overflow: hidden; margin-top: 64px;
  }
  .ch-cap-card { background: #080b14; }
  .ch-cap-card-inner {
    padding: 40px 36px; height: 100%; display: flex; flex-direction: column;
    position: relative; overflow: hidden; transition: background var(--ch-t); cursor: default;
  }
  .ch-cap-card:hover .ch-cap-card-inner { background: #0d1220; }
  .ch-cap-card-inner::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #4f6ef7, #7c3aed, transparent);
    opacity: 0; transition: opacity 0.4s ease;
  }
  .ch-cap-card:hover .ch-cap-card-inner::after { opacity: 1; }
  .ch-cap-icon-wrap {
    width: 40px; height: 40px; border-radius: 10px; margin-bottom: 20px;
    background: linear-gradient(135deg, rgba(79,110,247,0.15), rgba(124,58,237,0.1));
    border: 1px solid rgba(79,110,247,0.2); color: #7eb3ff;
    display: flex; align-items: center; justify-content: center;
    transition: transform var(--ch-t), background var(--ch-t);
  }
  .ch-cap-card:hover .ch-cap-icon-wrap { transform: scale(1.1) rotate(-5deg); background: linear-gradient(135deg, rgba(79,110,247,0.25), rgba(124,58,237,0.2)); }
  .ch-cap-num { font-family: var(--ch-mono); font-size: 0.62rem; letter-spacing: 0.15em; color: rgba(79,110,247,0.6); margin-bottom: 12px; text-transform: uppercase; }
  .ch-cap-title { font-family: var(--ch-display); font-size: 1.35rem; font-weight: 700; color: white; line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.015em; }
  .ch-cap-desc { font-size: 0.9rem; color: rgba(255,255,255,0.45); line-height: 1.75; font-weight: 400; flex: 1; margin-bottom: 20px; }
  .ch-cap-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--ch-mono); font-size: 0.6rem; letter-spacing: 0.08em;
    text-transform: uppercase; color: rgba(79,110,247,0.6);
    border: 1px solid rgba(79,110,247,0.15); padding: 4px 10px; border-radius: 999px;
    background: rgba(79,110,247,0.06); align-self: flex-start;
  }

  /* ── PREVIEW ──────────────────────────────────────────────────────────── */
  .ch-preview-section { background: var(--ch-paper); }
  .ch-preview-header { margin-bottom: 60px; }
  .ch-preview-frame-wrap {
    border-radius: var(--ch-radius); overflow: hidden;
    box-shadow: 0 0 0 1px rgba(79,110,247,0.15), 0 40px 80px rgba(0,0,0,0.18), 0 0 60px rgba(79,110,247,0.07);
  }

  .ch-browser { background: #0d1220; border-radius: var(--ch-radius); overflow: hidden; }
  .ch-browser-bar {
    background: #070a12; padding: 14px 20px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .ch-browser-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .ch-dot-r { background: #ff5f57; } .ch-dot-y { background: #ffbd2e; } .ch-dot-g { background: #28c840; }
  .ch-browser-url {
    flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px;
    padding: 6px 14px; font-family: var(--ch-mono); font-size: 0.68rem;
    color: rgba(255,255,255,0.3); letter-spacing: 0.03em;
  }

  .ch-preview-layout { display: grid; grid-template-columns: 200px 1fr; min-height: 460px; }
  .ch-preview-sidebar { background: #060912; padding: 24px 0; border-right: 1px solid rgba(255,255,255,0.04); }
  .ch-preview-brand { padding: 0 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .ch-preview-logo { width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0; background: linear-gradient(135deg, #4f6ef7, #7c3aed); display: flex; align-items: center; justify-content: center; font-family: var(--ch-display); font-size: 0.75rem; font-weight: 700; color: white; }
  .ch-preview-org-name { font-size: 0.78rem; font-weight: 700; color: white; }
  .ch-preview-org-sub { font-size: 0.58rem; color: rgba(255,255,255,0.3); font-family: var(--ch-mono); }
  .ch-preview-nav-item { padding: 9px 18px; font-size: 0.73rem; color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 8px; cursor: default; transition: background var(--ch-t), color var(--ch-t); }
  .ch-preview-nav-item:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); }
  .ch-preview-nav-item.active { color: white; background: rgba(79,110,247,0.12); border-right: 2px solid #4f6ef7; }
  .ch-preview-nav-icon { width: 12px; height: 12px; border-radius: 3px; background: currentColor; opacity: 0.5; flex-shrink: 0; }
  .ch-preview-main { background: #0a0d18; overflow: hidden; }
  .ch-preview-banner { height: 110px; padding: 0 28px; background: linear-gradient(135deg, #0d1528, #110d24); display: flex; align-items: center; gap: 16px; position: relative; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .ch-preview-banner::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(79,110,247,0.12), rgba(124,58,237,0.06)); }
  .ch-preview-banner-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4f6ef7, #7c3aed); display: flex; align-items: center; justify-content: center; font-family: var(--ch-display); font-size: 1rem; font-weight: 700; color: white; position: relative; z-index: 1; flex-shrink: 0; }
  .ch-preview-banner-title { font-size: 0.9rem; font-weight: 700; color: white; position: relative; z-index: 1; }
  .ch-preview-banner-meta { font-size: 0.62rem; color: rgba(255,255,255,0.4); font-family: var(--ch-mono); margin-top: 3px; position: relative; z-index: 1; }
  .ch-preview-content { padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .ch-preview-block { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 16px; }
  .ch-preview-block-label { font-family: var(--ch-mono); font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: #4f6ef7; margin-bottom: 12px; }
  .ch-preview-ann { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .ch-preview-ann:last-child { border-bottom: none; }
  .ch-preview-ann-avatar { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; }
  .ch-preview-ann-name { font-size: 0.62rem; font-weight: 600; color: rgba(255,255,255,0.65); margin-bottom: 2px; }
  .ch-preview-ann-text { font-size: 0.6rem; color: rgba(255,255,255,0.3); line-height: 1.4; }
  .ch-preview-event { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .ch-preview-event:last-child { border-bottom: none; }
  .ch-preview-event-date { width: 32px; text-align: center; border-radius: 6px; padding: 4px 0; flex-shrink: 0; }
  .ch-preview-event-day { font-family: var(--ch-display); font-size: 0.95rem; color: white; line-height: 1; display: block; font-weight: 700; }
  .ch-preview-event-mon { font-size: 0.48rem; color: rgba(255,255,255,0.6); text-transform: uppercase; display: block; }
  .ch-preview-event-title { font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.7); }
  .ch-preview-event-sub { font-size: 0.58rem; color: rgba(255,255,255,0.3); font-family: var(--ch-mono); margin-top: 2px; }

  /* ── FOR WHO ──────────────────────────────────────────────────────────── */
  .ch-who-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 56px; }
  .ch-who-card {
    background: var(--ch-paper); border: 1px solid var(--ch-border);
    border-radius: var(--ch-radius); padding: 36px 28px;
    position: relative; overflow: hidden;
    transition: transform var(--ch-t), box-shadow var(--ch-t), border-color var(--ch-t);
    cursor: default; outline: none;
  }
  .ch-who-card-glow { position: absolute; inset: 0; opacity: 0; background: linear-gradient(135deg, rgba(79,110,247,0.04), rgba(124,58,237,0.03)); transition: opacity var(--ch-t); border-radius: inherit; }
  .ch-who-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(79,110,247,0.1); border-color: rgba(79,110,247,0.25); }
  .ch-who-card:hover .ch-who-card-glow { opacity: 1; }
  .ch-who-card:hover .ch-who-arrow { opacity: 1; transform: translateX(4px); }
  .ch-who-icon-wrap { width: 48px; height: 48px; border-radius: 12px; margin-bottom: 20px; background: linear-gradient(135deg, rgba(79,110,247,0.08), rgba(124,58,237,0.06)); border: 1px solid rgba(79,110,247,0.15); color: var(--ch-accent); display: flex; align-items: center; justify-content: center; transition: transform var(--ch-t), background var(--ch-t); position: relative; z-index: 1; }
  .ch-who-card:hover .ch-who-icon-wrap { transform: scale(1.1) rotate(-6deg); background: linear-gradient(135deg, rgba(79,110,247,0.15), rgba(124,58,237,0.1)); }
  .ch-who-title { font-size: 1rem; font-weight: 700; letter-spacing: -0.015em; color: var(--ch-ink); margin-bottom: 8px; position: relative; z-index: 1; }
  .ch-who-desc { font-size: 0.88rem; color: var(--ch-muted); line-height: 1.7; font-weight: 400; position: relative; z-index: 1; }
  .ch-who-arrow { position: absolute; bottom: 24px; right: 24px; color: var(--ch-accent); opacity: 0; transition: opacity var(--ch-t), transform var(--ch-t); }

  /* ── HOW IT WORKS ────────────────────────────────────────────────────── */
  .ch-how-section { background: var(--ch-paper); }
  .ch-steps { display: grid; grid-template-columns: repeat(4, 1fr); position: relative; margin-top: 80px; }
  .ch-steps-track { position: absolute; top: 27px; left: 12%; right: 12%; height: 2px; background: linear-gradient(90deg, transparent, rgba(79,110,247,0.3) 20%, rgba(124,58,237,0.3) 80%, transparent); }
  .ch-step { text-align: center; padding: 0 20px; }
  .ch-step-num-wrap { position: relative; width: 56px; height: 56px; margin: 0 auto 28px; }
  .ch-step-num { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--ch-accent), var(--ch-accent2)); color: white; display: flex; align-items: center; justify-content: center; font-family: var(--ch-display); font-size: 1.1rem; font-weight: 800; position: relative; z-index: 1; box-shadow: 0 8px 24px rgba(79,110,247,0.3); transition: transform var(--ch-t), box-shadow var(--ch-t); }
  .ch-step:hover .ch-step-num { transform: scale(1.12) translateY(-4px); box-shadow: 0 16px 32px rgba(79,110,247,0.45); }
  .ch-step-pulse { position: absolute; inset: -8px; border-radius: 50%; border: 2px solid rgba(79,110,247,0.2); animation: chStepPulse 3s ease-in-out infinite; }
  .ch-step:nth-child(2) .ch-step-pulse { animation-delay: 0.75s; }
  .ch-step:nth-child(3) .ch-step-pulse { animation-delay: 1.5s; }
  .ch-step:nth-child(4) .ch-step-pulse { animation-delay: 2.25s; }
  .ch-step-title { font-size: 1rem; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.01em; color: var(--ch-ink); }
  .ch-step-desc { font-size: 0.88rem; color: var(--ch-muted); line-height: 1.7; }

  /* ── TRUST ────────────────────────────────────────────────────────────── */
  .ch-trust-section { position: relative; overflow: hidden; }
  .ch-trust-section::before { content: ''; position: absolute; top: -50%; left: -20%; width: 60%; height: 200%; background: radial-gradient(ellipse, rgba(79,110,247,0.05) 0%, transparent 60%); pointer-events: none; }
  .ch-trust-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 80px; align-items: start; }
  .ch-trust-items { display: flex; flex-direction: column; gap: 12px; margin-top: 36px; }
  .ch-trust-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); transition: background var(--ch-t), border-color var(--ch-t); }
  .ch-trust-item:hover { background: rgba(79,110,247,0.06); border-color: rgba(79,110,247,0.15); }
  .ch-trust-icon { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; background: linear-gradient(135deg, rgba(79,110,247,0.15), rgba(124,58,237,0.1)); border: 1px solid rgba(79,110,247,0.2); color: #7eb3ff; display: flex; align-items: center; justify-content: center; transition: transform var(--ch-t); }
  .ch-trust-item:hover .ch-trust-icon { transform: scale(1.1) rotate(-5deg); }
  .ch-trust-item-title { font-size: 0.95rem; font-weight: 600; color: white; margin-bottom: 3px; }
  .ch-trust-item-desc { font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.65; }
  .ch-trust-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-self: start; margin-top: 40px; }
  .ch-trust-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--ch-radius-sm); padding: 28px 24px; display: flex; flex-direction: column; gap: 8px; transition: background var(--ch-t), border-color var(--ch-t), transform var(--ch-t); }
  .ch-trust-stat:hover { background: rgba(79,110,247,0.08); border-color: rgba(79,110,247,0.2); transform: translateY(-3px); }
  .ch-trust-stat-val { font-family: var(--ch-display); font-size: 2.8rem; font-weight: 900; line-height: 1; background: linear-gradient(135deg, #ffffff, rgba(255,255,255,0.6)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.03em; }
  .ch-trust-stat-label { font-family: var(--ch-mono); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.35); }

  /* ── FINAL CTA ────────────────────────────────────────────────────────── */
  .ch-final-cta { position: relative; overflow: hidden; background: #030508; border-top: 1px solid rgba(255,255,255,0.04); }
  .ch-final-bg { position: absolute; inset: 0; pointer-events: none; }
  .ch-final-glow-1 { position: absolute; top: -30%; left: 20%; width: 60%; height: 100%; background: radial-gradient(ellipse, rgba(79,110,247,0.1) 0%, transparent 65%); filter: blur(60px); animation: chDrift 10s ease-in-out infinite; }
  .ch-final-glow-2 { position: absolute; bottom: -30%; right: 20%; width: 50%; height: 80%; background: radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 65%); filter: blur(60px); animation: chDrift 14s 2s ease-in-out infinite reverse; }
  .ch-final-inner { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
  .ch-final-h2 { font-family: var(--ch-display); font-size: clamp(2.8rem, 6vw, 5.5rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; color: white; margin-bottom: 24px; text-align: center; }
  .ch-final-sub { font-size: 1.1rem; line-height: 1.75; color: rgba(255,255,255,0.45); max-width: 500px; text-align: center; }
  .ch-final-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 48px; }
  .ch-final-footnote { margin-top: 28px; font-size: 0.85rem; color: rgba(255,255,255,0.35); }
  .ch-link { color: rgba(255,255,255,0.7); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; transition: color var(--ch-t); }
  .ch-link:hover { color: white; }

  /* ── BUTTONS ──────────────────────────────────────────────────────────── */
  .ch-btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #4f6ef7, #7c3aed);
    color: white; padding: 14px 32px;
    font-family: var(--ch-body); font-size: 0.95rem; font-weight: 700; letter-spacing: -0.01em;
    border: none; cursor: pointer; text-decoration: none; border-radius: var(--ch-radius-sm);
    box-shadow: 0 8px 24px rgba(79,110,247,0.35);
    transition: transform var(--ch-t), box-shadow var(--ch-t), filter var(--ch-t);
    position: relative; overflow: hidden;
  }
  .ch-btn-primary::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent); opacity: 0; transition: opacity var(--ch-t); }
  .ch-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(79,110,247,0.45); filter: brightness(1.05); }
  .ch-btn-primary:hover::before { opacity: 1; }
  .ch-btn-primary:active { transform: translateY(0); }
  .ch-btn-arrow { transition: transform var(--ch-t); }
  .ch-btn-primary:hover .ch-btn-arrow { transform: translateX(4px); }

  .ch-btn-ghost {
    display: inline-flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.06); backdrop-filter: blur(8px);
    color: rgba(255,255,255,0.8); padding: 14px 32px;
    font-family: var(--ch-body); font-size: 0.95rem; font-weight: 600; letter-spacing: -0.01em;
    border: 1px solid rgba(255,255,255,0.12); cursor: pointer;
    text-decoration: none; border-radius: var(--ch-radius-sm);
    transition: background var(--ch-t), border-color var(--ch-t), transform var(--ch-t), color var(--ch-t);
  }
  .ch-btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); color: white; transform: translateY(-2px); }

  .ch-btn-xl { padding: 17px 40px !important; font-size: 1rem !important; }

  /* ── KEYFRAMES ────────────────────────────────────────────────────────── */
  @keyframes chFadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes chSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes chFadeRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes chFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes chPing { 75%, 100% { transform: scale(2.5); opacity: 0; } }
  @keyframes chDrift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(3%, 3%) scale(1.05); }
    66% { transform: translate(-2%, 2%) scale(0.97); }
  }
  @keyframes chOrbit {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(15px, -20px) rotate(90deg); }
    50% { transform: translate(30px, 0) rotate(180deg); }
    75% { transform: translate(15px, 20px) rotate(270deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes chMarquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
  @keyframes chGradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  @keyframes chShimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  @keyframes chStepPulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.4); opacity: 0; } }

  /* ── RESPONSIVE ───────────────────────────────────────────────────────── */
  @media (max-width: 1200px) {
    .ch-hero { padding: 60px 40px 0; }
    .ch-section { padding: 100px 40px; }
  }
  @media (max-width: 1024px) {
    .ch-hero-inner { grid-template-columns: 1fr; }
    .ch-hero-right { display: none; }
    .ch-hero { padding: 80px 32px 48px; min-height: auto; }
    .ch-stats-bar { grid-template-columns: repeat(4, 1fr); padding: 24px 0; margin-top: 48px; }
    .ch-section { padding: 80px 32px; }
    .ch-problem-grid { grid-template-columns: 1fr; gap: 48px; }
    .ch-cap-grid { grid-template-columns: 1fr 1fr; }
    .ch-who-grid { grid-template-columns: 1fr 1fr; }
    .ch-steps { grid-template-columns: 1fr 1fr; gap: 48px; }
    .ch-steps-track { display: none; }
    .ch-trust-grid { grid-template-columns: 1fr; gap: 48px; }
    .ch-preview-layout { grid-template-columns: 1fr; }
    .ch-preview-sidebar { display: none; }
  }
  @media (max-width: 640px) {
    .ch-hero { padding: 56px 20px 32px; }
    .ch-hero-logo { height: 56px; }
    .ch-hero-logo-fallback { font-size: 1.8rem; }
    .ch-hero-h1 { font-size: clamp(2.4rem, 9vw, 3.5rem); }
    .ch-hero-sub { font-size: 1rem; }
    .ch-hero-ctas { flex-direction: column; align-items: stretch; }
    .ch-hero-chips { display: none; }
    .ch-stats-bar { grid-template-columns: repeat(2, 1fr); }
    .ch-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px; }
    .ch-stat:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.06); }
    .ch-section { padding: 64px 20px; }
    .ch-cap-grid { grid-template-columns: 1fr; }
    .ch-who-grid { grid-template-columns: 1fr; }
    .ch-steps { grid-template-columns: 1fr; }
    .ch-trust-stats-grid { grid-template-columns: 1fr 1fr; }
    .ch-final-ctas { flex-direction: column; }
    .ch-mini-grid { grid-template-columns: 1fr; }
    .ch-preview-content { grid-template-columns: 1fr; }
    .ch-section-h2 { font-size: clamp(2rem, 7vw, 2.8rem); }
    .ch-final-h2 { font-size: clamp(2.2rem, 8vw, 3.5rem); }
  }
`;

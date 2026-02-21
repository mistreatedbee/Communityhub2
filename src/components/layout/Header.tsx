import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Menu, User, X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { NavItem } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import { useAuth } from '../../contexts/AuthContext';
import { Dropdown } from '../ui/Dropdown';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dashboardTarget, setDashboardTarget] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const { organization } = useTheme();
  const { user, loading, displayRole, profileName, resolveDashboardTarget, signOut, memberships, platformRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect scroll for glass effect enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const tenantSlugInPath = location.pathname.match(/^\/c\/([^/]+)/)?.[1];
  const isCommunityMode = Boolean(tenantSlugInPath);

  const navItems: NavItem[] = isCommunityMode
    ? [
        { label: 'Home', href: `/c/${tenantSlugInPath}` },
        { label: 'Announcements', href: `/c/${tenantSlugInPath}/announcements` },
        { label: 'Events', href: `/c/${tenantSlugInPath}/events` },
        { label: 'Groups', href: `/c/${tenantSlugInPath}/groups` },
        { label: 'Files', href: `/c/${tenantSlugInPath}/resources` },
        { label: 'Programs', href: `/c/${tenantSlugInPath}/programs` },
        { label: 'Back to Platform', href: '/' }
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Communities', href: '/communities' },
        { label: 'Pricing', href: '/pricing' }
      ];

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user) {
        setDashboardTarget(null);
        return;
      }
      setDashboardLoading(true);
      try {
        const target = await resolveDashboardTarget();
        if (mounted) setDashboardTarget(target);
      } catch {
        if (mounted) setDashboardTarget('/my-communities');
      } finally {
        if (mounted) setDashboardLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [user, memberships, platformRole, resolveDashboardTarget]);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full transition-all duration-300
        ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200/50'
            : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo + brand name */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[0.98] active:scale-95"
          >
            <SafeImage
              src={organization.logo || '/logo.png'}
              alt={organization.name}
              fallbackSrc="/logo.png"
              className="h-8 w-auto md:h-9 object-contain transition-all duration-200 group-hover:opacity-90"
            />
            <span className="font-bold text-xl md:text-2xl text-gray-900 tracking-tight">
              {organization.name}
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  relative text-sm font-medium transition-colors duration-200
                  after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0
                  after:bg-[var(--color-primary)] after:transition-all after:duration-300
                  hover:after:w-full
                  ${
                    isActive(item.href)
                      ? 'text-[var(--color-primary)] after:w-full'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                  Logged in as: {displayRole || 'Member'}
                  {tenantSlugInPath ? ` (${tenantSlugInPath})` : ''}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    if (dashboardTarget) navigate(dashboardTarget);
                  }}
                  disabled={dashboardLoading || !dashboardTarget}
                  leftIcon={dashboardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  {dashboardTarget?.startsWith('/c/') ? 'Go to Community' : 'Go to Dashboard'}
                </Button>
                <Dropdown
                  align="right"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {profileName || user.email}
                    </button>
                  }
                  items={[
                    {
                      label: 'Sign Out',
                      icon: <LogOut className="w-4 h-4" />,
                      danger: true,
                      onClick: async () => {
                        await signOut();
                        navigate('/');
                      }
                    }
                  ]}
                />
              </>
            ) : isCommunityMode ? (
              <Link to="/login" state={{ from: location.pathname }}>
                <Button size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                  Login / Join
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
                >
                  Admin Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/enter-license')}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-sm hover:shadow-md transition-all"
                >
                  Create Community Hub
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu – slide-down with fade animation */}
      <div
        className={`
          md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-lg
          border-b border-gray-200 shadow-lg overflow-hidden transition-all duration-300
          ${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 border-none'}
        `}
      >
        <div className="px-4 py-5 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium
                transition-all duration-200
                ${
                  isActive(item.href)
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                }
              `}
            >
              {item.label}
              <ChevronRight
                size={18}
                className={isActive(item.href) ? 'opacity-100' : 'opacity-50'}
              />
            </Link>
          ))}

          {/* Mobile user section */}
          <div className="mt-6 pt-6 border-t border-gray-200/80 flex flex-col gap-3">
            {loading ? null : user ? (
              <>
                <p className="px-4 py-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                  Logged in as: {displayRole || 'Member'}
                  {tenantSlugInPath ? ` (${tenantSlugInPath})` : ''}
                </p>
                <Button
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    if (dashboardTarget) navigate(dashboardTarget);
                    setIsMenuOpen(false);
                  }}
                  disabled={dashboardLoading || !dashboardTarget}
                >
                  {dashboardTarget?.startsWith('/c/') ? 'Go to Community' : 'Go to Dashboard'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    await signOut();
                    setIsMenuOpen(false);
                    navigate('/');
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : isCommunityMode ? (
              <Link to="/login" state={{ from: location.pathname }} onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full justify-start">Login / Join</Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Admin Login
                </Button>
                <Button
                  className="w-full justify-start bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/enter-license');
                  }}
                >
                  Create Community Hub
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

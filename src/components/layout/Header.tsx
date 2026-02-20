import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Menu, User, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { NavItem } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import { useAuth } from '../../contexts/AuthContext';
import { Dropdown } from '../ui/Dropdown';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dashboardTarget, setDashboardTarget] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const { organization } = useTheme();
  const { user, loading, displayRole, profileName, resolveDashboardTarget, signOut, memberships, platformRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Communities', href: '/communities' },
    { label: 'Pricing', href: '/pricing' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };
  const tenantSlugInPath = location.pathname.match(/^\/c\/([^/]+)/)?.[1];

  React.useEffect(() => {
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

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            {organization.logo ? (
              <SafeImage src={organization.logo} alt={organization.name} fallbackSrc="/logo.png" className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
                {organization.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-xl text-gray-900 tracking-tight">{organization.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href) ? 'text-[var(--color-primary)]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                  Logged in as: {displayRole || 'Member'}{tenantSlugInPath ? ` (${tenantSlugInPath})` : ''}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    if (dashboardTarget) navigate(dashboardTarget);
                  }}
                  disabled={dashboardLoading || !dashboardTarget}
                  leftIcon={dashboardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  Go to Dashboard
                </Button>
                <Dropdown
                  align="right"
                  trigger={
                    <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
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
            ) : (
              <>
                <Link to="/admin">
                  <Button variant="ghost" size="sm">Admin Login</Button>
                </Link>
                <Link to="/admin">
                  <Button size="sm">Create Community Hub</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href) ? 'bg-gray-50 text-[var(--color-primary)]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              {loading ? null : user ? (
                <>
                  <p className="px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    Logged in as: {displayRole || 'Member'}{tenantSlugInPath ? ` (${tenantSlugInPath})` : ''}
                  </p>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      if (dashboardTarget) navigate(dashboardTarget);
                      setIsMenuOpen(false);
                    }}
                    disabled={dashboardLoading || !dashboardTarget}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={async () => {
                      await signOut();
                      setIsMenuOpen(false);
                      navigate('/');
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Admin Login</Button>
                  </Link>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start">Create Community Hub</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

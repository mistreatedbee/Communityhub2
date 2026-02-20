import React, { useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { SafeImage } from '../ui/SafeImage';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Footer } from './Footer';
import { Search } from 'lucide-react';

const SECTION_LABELS: Record<string, string> = {
  announcements: 'Announcements',
  events: 'Events',
  resources: 'Files',
  groups: 'Groups',
  programs: 'Programs'
};

function isAdminRole(role: string) {
  return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
}

export function CommunityLayout() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { tenant, enabledSections, membership, loading } = useTenant();
  const { user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tenantBase = tenantSlug ? `/c/${tenantSlug}` : '';

  const isActive = (path: string) => {
    if (path === tenantBase && location.pathname !== tenantBase) return false;
    return location.pathname === path || (path !== tenantBase && location.pathname.startsWith(path + '/'));
  };

  const sectionNavItems = (enabledSections || []).map((key) => ({
    label: SECTION_LABELS[key] ?? key,
    href: `${tenantBase}/${key}`
  }));

  const hasMemberAccess = membership?.status === 'ACTIVE' && ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER'].includes(membership?.role ?? '');
  const showAdminLink = membership?.status === 'ACTIVE' && isAdminRole(membership?.role ?? '');

  const memberNavItems = hasMemberAccess
    ? [
        { label: 'Notifications', href: `${tenantBase}/notifications` },
        { label: 'Profile', href: `${tenantBase}/profile` }
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <EmptyState
          icon={Search}
          title="Community not found"
          description="This community might be inactive or unavailable."
        />
      </div>
    );
  }

  const navItems = [
    { label: 'Home', href: tenantBase },
    ...sectionNavItems,
    ...memberNavItems,
    ...(showAdminLink ? [{ label: 'Admin', href: `${tenantBase}/admin` }] : [])
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100"
        style={{ borderBottomColor: 'var(--color-primary)', borderBottomWidth: '2px' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={tenantBase} className="flex items-center gap-2 min-w-0">
              {tenant.logo_url ? (
                <SafeImage
                  src={tenant.logo_url}
                  alt={tenant.name}
                  fallbackSrc="/logo.png"
                  className="h-8 w-auto shrink-0"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-xl text-gray-900 tracking-tight truncate">{tenant.name}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-[var(--color-primary)]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link to="/communities" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Back to directory
                </Link>
              ) : (
                <Link to={`${tenantBase}/join`}>
                  <Button size="sm">Join community</Button>
                </Link>
              )}
            </div>

            <button
              type="button"
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                    isActive(item.href)
                      ? 'bg-gray-50 text-[var(--color-primary)]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {user ? (
                  <Link
                    to="/communities"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Back to directory
                  </Link>
                ) : (
                  <Link
                    to={`${tenantBase}/join`}
                    className="block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join community
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

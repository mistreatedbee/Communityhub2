import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { clearImpersonation, getImpersonation } from '../../utils/impersonation';
interface TopBarProps {
  isSidebarCollapsed: boolean;
  variant: 'tenant-admin' | 'tenant-member' | 'super-admin';
  tenantId?: string | null;
  tenantSlug?: string;
}
export function TopBar({ isSidebarCollapsed, variant, tenantId, tenantSlug = '' }: TopBarProps) {
  const navigate = useNavigate();
  const { user, profileName, signOut, memberships } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [memberTenants, setMemberTenants] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user || variant === 'super-admin' || !tenantId) {
        setUnreadCount(0);
        return;
      }
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('organization_id', tenantId)
        .is('read_at', null);
      setUnreadCount(count ?? 0);
    };

    void load();
  }, [user?.id, variant, tenantId]);

  useEffect(() => {
    const impersonation = getImpersonation();
    setIsImpersonating(Boolean(impersonation));
  }, [variant]);

  useEffect(() => {
    const loadTenants = async () => {
      if (memberships.length < 2) {
        setMemberTenants([]);
        return;
      }
      const tenantIds = memberships.map((m) => m.organization_id);
      const { data } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .in('id', tenantIds);
      setMemberTenants(data ?? []);
    };
    void loadTenants();
  }, [memberships]);

  const profilePath =
    variant === 'super-admin'
      ? '/super-admin/settings'
      : variant === 'tenant-admin'
      ? tenantSlug ? `/c/${tenantSlug}/admin` : '/communities'
      : tenantSlug ? `/c/${tenantSlug}/app/profile` : '/communities';

  return (
    <header
      className={`
        fixed top-0 right-0 z-20 h-16 bg-white border-b border-gray-200 transition-all duration-300
        ${isSidebarCollapsed ? 'left-20' : 'left-64'}
      `}>

      <div className="h-full px-8 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, members, or discussions..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm" />

          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white">
                {Math.min(unreadCount, 9)}
              </span>
            )}
          </button>

          {/* User Menu */}
          <Dropdown
            align="right"
            trigger={
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {profileName ?? user?.email ?? 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {variant === 'super-admin' ? 'Super Admin' : variant === 'tenant-admin' ? 'Admin' : 'Member'}
                  </p>
                </div>
                <Avatar alt={profileName ?? user?.email ?? 'User'} size="sm" />
              </div>
            }
            items={[
            {
              label: 'My Profile',
              href: profilePath,
              icon: <User className="w-4 h-4" />
            },
            ...memberTenants.map((tenant) => ({
              label: `Switch to ${tenant.name}`,
              href: `/c/${tenant.slug}/app`
            })),
            ...(variant === 'super-admin' && isImpersonating
              ? [
                  {
                    label: 'Stop Impersonation',
                    onClick: () => {
                      clearImpersonation();
                      window.location.reload();
                    }
                  }
                ]
              : []),
            {
              label: 'Settings',
              href: profilePath
            },
            {
              label: 'Sign Out',
              danger: true,
              onClick: async () => {
                await signOut();
                navigate('/login');
              }
            }]
            } />

        </div>
      </div>
    </header>);

}
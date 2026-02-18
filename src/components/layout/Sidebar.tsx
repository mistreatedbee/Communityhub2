import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  Users,
  MessageSquare,
  Settings,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileCheck,
  Building2,
  CreditCard,
  BarChart2,
  Globe,
  Bell } from
'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NavItem } from '../../types';
interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  variant: 'tenant-admin' | 'tenant-member' | 'super-admin';
  tenantSlug?: string;
  tenantName?: string;
}
export function Sidebar({ isCollapsed, toggleCollapse, variant, tenantSlug = '', tenantName }: SidebarProps) {
  const { organization } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdminRoute = variant === 'super-admin';
  const tenantBase = tenantSlug ? `/c/${tenantSlug}` : '/communities';
  const memberItems: NavItem[] = [
    {
      label: 'Feed',
      href: `${tenantBase}/app`,
      icon: LayoutDashboard
    },
    {
      label: 'Announcements',
      href: `${tenantBase}/app/announcements`,
      icon: Megaphone
    },
    {
      label: 'Resources',
      href: `${tenantBase}/app/resources`,
      icon: FileText
    },
    {
      label: 'Groups',
      href: `${tenantBase}/app/groups`,
      icon: Users
    },
    {
      label: 'Events',
      href: `${tenantBase}/app/events`,
      icon: Calendar
    },
    {
      label: 'Programs',
      href: `${tenantBase}/app/programs`,
      icon: FileText
    },
    {
      label: 'Notifications',
      href: `${tenantBase}/app/notifications`,
      icon: Bell
    },
    {
      label: 'Profile',
      href: `${tenantBase}/app/profile`,
      icon: Settings
    }
  ];

  const adminItems: NavItem[] = [
    {
      label: 'Overview',
      href: `${tenantBase}/admin`,
      icon: Shield
    },
    {
      label: 'Members',
      href: `${tenantBase}/admin/members`,
      icon: Users
    },
    {
      label: 'Announcements',
      href: `${tenantBase}/admin/announcements`,
      icon: Megaphone
    },
    {
      label: 'Invitations',
      href: `${tenantBase}/admin/invitations`,
      icon: FileCheck
    },
    {
      label: 'Content',
      href: `${tenantBase}/admin/content`,
      icon: Megaphone
    },
    {
      label: 'Resources',
      href: `${tenantBase}/admin/resources`,
      icon: FileText
    },
    {
      label: 'Groups',
      href: `${tenantBase}/admin/groups`,
      icon: Users
    },
    {
      label: 'Events',
      href: `${tenantBase}/admin/events`,
      icon: Calendar
    },
    {
      label: 'Programs',
      href: `${tenantBase}/admin/programs`,
      icon: FileText
    },
    {
      label: 'Registration',
      href: `${tenantBase}/admin/registration-form`,
      icon: Settings
    },
    {
      label: 'Community Profile & Settings',
      href: `${tenantBase}/admin/settings`,
      icon: Settings
    },
    {
      label: 'Analytics',
      href: `${tenantBase}/admin/analytics`,
      icon: BarChart2
    },
    {
      label: 'Billing',
      href: `${tenantBase}/admin/billing`,
      icon: CreditCard
    }
  ];

  const superAdminItems: NavItem[] = [
  {
    label: 'Platform Overview',
    href: '/super-admin',
    icon: Globe
  },
  {
    label: 'Tenants',
    href: '/super-admin/tenants',
    icon: Building2
  },
  {
    label: 'Platform Users',
    href: '/super-admin/users',
    icon: Users
  },
  {
    label: 'Licenses',
    href: '/super-admin/licenses',
    icon: CreditCard
  },
  {
    label: 'Audit Logs',
    href: '/super-admin/audit-logs',
    icon: BarChart2
  },
  {
    label: 'Analytics',
    href: '/super-admin/analytics',
    icon: BarChart2
  },
  {
    label: 'Settings',
    href: '/super-admin/settings',
    icon: Settings
  }];

  let items = memberItems;
  if (variant === 'super-admin') items = superAdminItems;
  if (variant === 'tenant-admin') items = adminItems;
  return (
    <aside
      className={`
        fixed left-0 top-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>

      {/* Sidebar Header */}
      <div
        className={`h-16 flex items-center justify-center border-b border-gray-100 px-4 shrink-0 ${isSuperAdminRoute ? 'bg-gray-900' : ''}`}>

        <Link
          to={isSuperAdminRoute ? '/super-admin' : `${tenantBase}/app`}
          className="flex items-center gap-2 overflow-hidden">

          <div
            className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-lg ${isSuperAdminRoute ? 'bg-blue-600' : 'bg-[var(--color-primary)]'}`}>

            {isSuperAdminRoute ? 'S' : (tenantName ?? organization.name).charAt(0)}
          </div>
          {!isCollapsed &&
          <span
            className={`font-bold text-lg truncate ${isSuperAdminRoute ? 'text-white' : 'text-gray-900'}`}>

              {isSuperAdminRoute ? 'Super Admin' : tenantName ?? organization.name}
            </span>
          }
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
          location.pathname === item.href ||
          (item.href !== '/super-admin' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                ${isActive ? isSuperAdminRoute ? 'bg-gray-900 text-white shadow-sm' : 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}>

              <Icon
                className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />

              {!isCollapsed &&
              <span className="font-medium text-sm">{item.label}</span>
              }
            </Link>);

        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      <div className="p-4 shrink-0">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">

          {isCollapsed ?
          <ChevronRight className="w-5 h-5" /> :

          <ChevronLeft className="w-5 h-5" />
          }
          {!isCollapsed &&
          <span className="font-medium text-sm">Collapse</span>
          }
        </button>

        <div className="mt-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            className={`
            w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
            onClick={async () => {
              await signOut();
              navigate('/');
            }}>

            <LogOut className="w-5 h-5" />
            {!isCollapsed &&
            <span className="font-medium text-sm">Sign Out</span>
            }
          </button>
        </div>
      </div>
    </aside>);

}

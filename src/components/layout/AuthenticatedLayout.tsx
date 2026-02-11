import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
type LayoutProps = {
  variant: 'tenant-admin' | 'tenant-member' | 'super-admin';
  tenantSlug?: string;
  tenantName?: string;
  tenantId?: string | null;
};
export function AuthenticatedLayout({ variant, tenantSlug, tenantName, tenantId }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        variant={variant}
        tenantSlug={tenantSlug}
        tenantName={tenantName} />


      <TopBar isSidebarCollapsed={isSidebarCollapsed} variant={variant} tenantId={tenantId} tenantSlug={tenantSlug} />

      <main
        className={`
          pt-24 pb-12 px-8 transition-all duration-300 min-h-screen
          ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}
        `}>

        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 px-8 text-sm text-gray-500" style={{ marginLeft: isSidebarCollapsed ? '5rem' : '16rem' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-x-6 gap-y-1">
          <a href="mailto:ashleymashigo013@gmail.com" className="hover:text-[var(--color-primary)]">ashleymashigo013@gmail.com</a>
          <a href="https://wa.me/27731531188" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)]">WhatsApp: 073 153 1188</a>
        </div>
      </footer>
    </div>);

}
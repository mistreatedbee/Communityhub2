import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../ui/Spinner';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    if (import.meta.env.DEV) {
      console.debug('[RequireAuth] showing spinner (loading=true)');
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    if (import.meta.env.DEV) {
      console.debug('[RequireAuth] redirecting because loading=false and user=null');
    }
    
    // Check if this is a member section route (/c/:tenantSlug/announcements, etc.)
    const memberSectionMatch = location.pathname.match(/^\/c\/([^/]+)\/(announcements|events|groups|resources|programs|notifications|profile)(?:\/|$)/);
    if (memberSectionMatch) {
      const tenantSlug = memberSectionMatch[1];
      return <Navigate to={`/c/${tenantSlug}/join`} replace state={{ from: location.pathname }} />;
    }
    
    // For admin routes, super-admin, etc., redirect to /login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

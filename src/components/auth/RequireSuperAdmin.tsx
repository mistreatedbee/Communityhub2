import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { loading, platformRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }
  if (platformRole !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

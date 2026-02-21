import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Debug page to verify session and profile state.
 * Visit /debug-session after login to confirm session exists and platform_role is set.
 * Remove or guard behind env in production.
 */
export function DebugSessionPage() {
  const { session, user, loading, platformRole, role, organizationId, memberships } = useAuth();
  const [directSession, setDirectSession] = useState<{ expires_at?: number; hasSession: boolean } | null>(null);

  useEffect(() => {
    setDirectSession({
      hasSession: !!session,
      expires_at: undefined
    });
  }, [session]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading auth…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Session debug</h1>
      <p className="text-sm text-gray-600 mb-6">
        Use this page to confirm the browser has a session and AuthContext has the correct role after login.
      </p>

      <div className="space-y-4 font-mono text-sm">
        <section className="p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2">AuthContext</h2>
          <pre className="whitespace-pre-wrap break-all text-gray-700">
            {JSON.stringify(
              {
                hasSession: !!session,
                hasUser: !!user,
                userId: user?.id ?? null,
                email: user?.email ?? null,
                loading,
                platformRole,
                role,
                organizationId,
                membershipsCount: memberships?.length ?? 0
              },
              null,
              2
            )}
          </pre>
        </section>

        <section className="p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2">Direct getSession()</h2>
          <pre className="whitespace-pre-wrap break-all text-gray-700">
            {directSession
              ? JSON.stringify(
                  {
                    ...directSession,
                    expiresAt: directSession.expires_at
                      ? new Date(directSession.expires_at * 1000).toISOString()
                      : null
                  },
                  null,
                  2
                )
              : 'Fetching…'}
          </pre>
        </section>

        <section className="p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2">Redirect expectations</h2>
          <p className="text-gray-700">
            {platformRole === 'super_admin'
              ? '→ Should redirect to /super-admin'
              : memberships?.some((m) => m.status === 'active')
                ? '→ Should redirect to tenant (e.g. /c/:slug/admin or /c/:slug)'
                : '→ Should redirect to /communities or /setup-community'}
          </p>
        </section>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          to="/login"
          className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          Back to Login
        </Link>
        {platformRole === 'super_admin' && (
          <Link
            to="/super-admin"
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            Super Admin dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

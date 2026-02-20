import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, LayoutDashboard, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeImage } from '../../components/ui/SafeImage';

type TenantInfo = {
  id: string;
  name: string;
  slug: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: string;
};

export function MyCommunitiesPage() {
  const { user, memberships, loading: authLoading } = useAuth();
  const { organization } = useTheme();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    const active = memberships.filter((m) => m.status === 'ACTIVE' || m.status === 'PENDING');
    if (active.length === 0) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const results = await Promise.all(
          active.map((m) =>
            apiClient<{ id: string; name: string; slug: string }>(`/api/tenants/id/${m.tenantId}`).then((t) => ({
              ...t,
              role: m.role,
              status: m.status
            }))
          )
        );
        setTenants(results);
      } catch {
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [authLoading, user, memberships]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const canAdmin = (role: string) => role === 'OWNER' || role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
              {organization.logo ? (
                <SafeImage src={organization.logo} alt={organization.name} fallbackSrc="/logo.png" className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
                  {organization.name.charAt(0)}
                </div>
              )}
              <span className="font-semibold">{organization.name}</span>
            </Link>
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Communities</h1>
        <p className="text-sm text-gray-600 mb-6">
          Choose a community to open. You can switch between communities anytime.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">You are not a member of any community yet.</p>
            <Link to="/communities" className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
              Browse communities to join
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {tenants.map((t) => (
              <li
                key={t.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{t.role.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/c/${t.slug}/app`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Open
                  </button>
                  {canAdmin(t.role) && (
                    <button
                      type="button"
                      onClick={() => navigate(`/c/${t.slug}/admin`)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

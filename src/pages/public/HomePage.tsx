import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Users, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { hasLicenseSession } from '../../utils/licenseToken';
import { getDefaultTenantRoute, getEligibleMemberships, normalizeMemberships, pickHighestRoleMembership } from '../../utils/membershipRouting';
import { apiClient } from '../../lib/apiClient';

export function HomePage() {
  const { organization } = useTheme();
  const { user, loading, platformRole, memberships } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;

    if (platformRole === 'SUPER_ADMIN') {
      navigate('/super-admin', { replace: true });
      return;
    }

    const eligibleMemberships = getEligibleMemberships(normalizeMemberships(memberships));
    const uniqueTenantIds = new Set(eligibleMemberships.map((m) => m.tenantId));
    if (uniqueTenantIds.size > 1) {
      navigate('/my-communities', { replace: true });
      return;
    }

    const primary = pickHighestRoleMembership(eligibleMemberships);
    if (primary?.tenantId) {
      void apiClient<{ slug: string }>(`/api/tenants/id/${primary.tenantId}`)
        .then((tenant) => {
          navigate(getDefaultTenantRoute(tenant.slug, primary), { replace: true });
        })
        .catch(() => navigate('/communities', { replace: true }));
      return;
    }

    if (hasLicenseSession()) {
      navigate('/setup-community', { replace: true });
    }
  }, [loading, user, platformRole, memberships, navigate]);

  return (
    <div className="bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4" /> Multi-tenant Community Platform
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Build a secure home for your community</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          {organization.name} helps organizations launch branded community hubs with licensing, approvals, and analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/communities">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>Browse Communities</Button>
          </Link>
          <Link to="/admin">
            <Button size="lg" variant="outline">Admin / Create a Community Hub</Button>
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-500">Admin access is for organisations managing a community hub.</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Shield className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tenant Isolation</h3>
          <p className="text-sm text-gray-600">Data is scoped per tenant with role-based access and audit logs.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Users className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Management</h3>
          <p className="text-sm text-gray-600">Approvals, invitations, and member roles are built-in.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Sparkles className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Licensing Controls</h3>
          <p className="text-sm text-gray-600">Enforce plan limits and feature toggles across tenants.</p>
        </div>
      </section>
    </div>
  );
}

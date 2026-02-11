import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

export function HomePage() {
  const { organization } = useTheme();
  return (
    <div className="bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4" /> Multi-tenant Community Platform
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Build a secure home for your community
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          {organization.name} helps organizations launch branded community hubs with licensing, approvals, and analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/communities">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Communities
            </Button>
          </Link>
          <Link to="/enter-license">
            <Button size="lg" variant="outline">
              Start a Community
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Shield className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tenant Isolation</h3>
          <p className="text-sm text-gray-600">
            Data is scoped per tenant with role-based access and audit logs.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Users className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Management</h3>
          <p className="text-sm text-gray-600">
            Approvals, invitations, and member roles are built-in.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Sparkles className="w-6 h-6 text-[var(--color-primary)] mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Licensing Controls</h3>
          <p className="text-sm text-gray-600">
            Enforce plan limits and feature toggles across tenants.
          </p>
        </div>
      </section>
    </div>
  );
}

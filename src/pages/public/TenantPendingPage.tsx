import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';

export function TenantPendingPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { tenant, loading, error } = useTenant();

  if (!tenantSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-500">Invalid community link.</p>
          <Link to="/communities" className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
            Browse communities
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-500">Community not found.</p>
          <Link to="/communities" className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
            Browse communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Your registration is pending approval</h1>
        <p className="text-sm text-gray-600">
          You will get access once a community admin approves your request. You can check back later or contact the
          community if you have questions.
        </p>
        {tenant?.name && (
          <p className="text-sm text-gray-500 mt-3">Community: {tenant.name}</p>
        )}
        <Link
          to={`/c/${tenantSlug}`}
          className="mt-6 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to community
        </Link>
      </div>
    </div>
  );
}

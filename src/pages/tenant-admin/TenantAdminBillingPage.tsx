import React from 'react';
import { CreditCard } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

export function TenantAdminBillingPage() {
  const { license } = useTenant();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>
        <p className="text-gray-500">Review your current license and usage limits.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
        </div>
        <p className="text-sm text-gray-600">
          Plan: {license?.plan?.name ?? 'No plan assigned'} � Status: {license?.status ?? 'UNKNOWN'}
        </p>
        {license?.status === 'EXPIRED' ? (
          <p className="text-sm text-red-600 mt-2">This license is expired. Some features may be restricted.</p>
        ) : null}
        {license?.expiresAt ? <p className="text-xs text-gray-500 mt-1">Expires {new Date(license.expiresAt).toLocaleDateString()}</p> : null}

        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <div>Max members: {license?.plan?.maxMembers ?? '-'}</div>
          <div>Max admins: {license?.plan?.maxAdmins ?? '-'}</div>
        </div>

        <div className="mt-6">
          <a
            href="/pricing"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            View upgrade options
          </a>
        </div>
      </div>
    </div>
  );
}

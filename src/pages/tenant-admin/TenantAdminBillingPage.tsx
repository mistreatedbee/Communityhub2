import React, { useEffect, useState } from 'react';
import { CreditCard, AlertCircle, Calendar, Users, Shield, ExternalLink } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { Button } from '../../components/ui/Button';

export function TenantAdminBillingPage() {
  const { tenant, license } = useTenant();
  const [loading, setLoading] = useState(true);

  // Simulate loading if license not immediately available
  useEffect(() => {
    if (license) {
      setLoading(false);
    } else {
      // Optional: set a timeout to avoid flicker
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [license]);

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <>
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="space-y-6 relative">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing & Plan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review your current license and usage limits.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        )}

        {/* Main content */}
        {!loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
            {/* Plan card */}
            <div className="p-6 space-y-6">
              {/* Header with icon */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
              </div>

              {/* Plan details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column – plan info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="text-xl font-bold text-gray-900">
                      {license?.plan?.name ?? 'No plan assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                        license?.status
                      )}`}
                    >
                      {license?.status ?? 'UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(license?.expiresAt)}
                    </p>
                  </div>
                </div>

                {/* Right column – limits */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Member limit</p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      {license?.plan?.maxMembers ?? 'Unlimited'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admin limit</p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <Shield className="w-4 h-4 text-gray-400" />
                      {license?.plan?.maxAdmins ?? 'Unlimited'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expired warning */}
              {license?.status === 'EXPIRED' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    This license is expired. Some features may be restricted. Please renew to continue full access.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="/pricing">
                  <Button
                    variant="outline"
                    className="gap-2"
                    rightIcon={<ExternalLink className="w-4 h-4" />}
                  >
                    View upgrade options
                  </Button>
                </a>
                <a
                  href="https://wa.me/27731531188?text=I'm%20interested%20in%20upgrading%20my%20Community%20Hub%20license"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="gap-2">
                    Contact Sales
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

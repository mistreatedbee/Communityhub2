import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  Activity
} from 'lucide-react';
import { StatsCard } from '../../components/widgets/StatsCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { OrganizationWithPlan } from '../../types';

type PlanCount = { id: string; name: string; count: number };
type AuditEntry = {
  id: string;
  action: string;
  created_at: string;
  organization_id: string | null;
};

const POLL_INTERVAL_MS = 25000;

export function SuperAdminDashboardPage() {
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeLicenses, setActiveLicenses] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [recentOrgs, setRecentOrgs] = useState<OrganizationWithPlan[]>([]);
  const [planCounts, setPlanCounts] = useState<PlanCount[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const queries = [
      supabase.from('organizations').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
      supabase
        .from('organization_licenses')
        .select('status, license_plans(price_cents)')
        .in('status', ['active', 'trial']),
      supabase
        .from('organizations')
        .select('id, name, created_at, organization_licenses(status, license_plans(id, name))')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('license_plans')
        .select('id, name, organization_licenses(organization_id)'),
      supabase
        .from('audit_logs')
        .select('id, action, created_at, organization_id')
        .order('created_at', { ascending: false })
        .limit(10)
    ];

    const results = await Promise.allSettled(queries.map((q) => q));
    const errors: string[] = [];

    const tenantResult = results[0].status === 'fulfilled' ? results[0].value : null;
    const userResult = results[1].status === 'fulfilled' ? results[1].value : null;
    const licenseResult = results[2].status === 'fulfilled' ? results[2].value : null;
    const orgResult = results[3].status === 'fulfilled' ? results[3].value : null;
    const plansResult = results[4].status === 'fulfilled' ? results[4].value : null;
    const auditResult = results[5].status === 'fulfilled' ? results[5].value : null;

    const hasError = (r: unknown): r is { error: unknown } => r != null && typeof r === 'object' && 'error' in r && (r as { error: unknown }).error != null;

    if (results[0].status === 'rejected' || hasError(tenantResult)) {
      errors.push('organizations');
      if (import.meta.env.DEV) console.error('[SuperAdminDashboard] organizations', results[0].status === 'rejected' ? results[0].reason : (tenantResult as { error: unknown })?.error);
    }
    if (results[1].status === 'rejected' || hasError(userResult)) {
      errors.push('profiles');
      if (import.meta.env.DEV) console.error('[SuperAdminDashboard] profiles', results[1].status === 'rejected' ? results[1].reason : (userResult as { error: unknown })?.error);
    }
    if (results[2].status === 'rejected' || hasError(licenseResult)) {
      errors.push('organization_licenses');
      if (import.meta.env.DEV) console.error('[SuperAdminDashboard] organization_licenses', results[2].status === 'rejected' ? results[2].reason : (licenseResult as { error: unknown })?.error);
    }
    if (results[3].status === 'rejected' || hasError(orgResult)) {
      errors.push('organizations recent');
      if (import.meta.env.DEV) console.error('[SuperAdminDashboard] organizations recent', results[3].status === 'rejected' ? results[3].reason : (orgResult as { error: unknown })?.error);
    }
    if (results[4].status === 'rejected' || hasError(plansResult)) {
      errors.push('license_plans');
      if (import.meta.env.DEV) console.error('[SuperAdminDashboard] license_plans', results[4].status === 'rejected' ? results[4].reason : (plansResult as { error: unknown })?.error);
    }
    if (results[5].status === 'rejected' || hasError(auditResult)) {
      errors.push('audit_logs');
      if (import.meta.env.DEV) console.error('[SuperAdminDashboard] audit_logs', results[5].status === 'rejected' ? results[5].reason : (auditResult as { error: unknown })?.error);
    }

    if (errors.length > 0) {
      setLoadError(`Failed to load: ${errors.join(', ')}. Check RLS and that you are signed in as super admin.`);
    }

    const tenantCount = (tenantResult && !(tenantResult as { error?: unknown }).error) ? (tenantResult as { count?: number }).count ?? 0 : 0;
    const userCount = (userResult && !(userResult as { error?: unknown }).error) ? (userResult as { count?: number }).count ?? 0 : 0;
    const licenseRows = (licenseResult && !(licenseResult as { error?: unknown }).error) ? (licenseResult as { data?: unknown[] }).data ?? [] : [];
    const orgRows = (orgResult && !(orgResult as { error?: unknown }).error) ? (orgResult as { data?: unknown[] }).data ?? [] : [];
    const plansWithOrgs = (plansResult && !(plansResult as { error?: unknown }).error) ? (plansResult as { data?: unknown[] }).data ?? [] : [];
    const auditRows = (auditResult && !(auditResult as { error?: unknown }).error) ? (auditResult as { data?: unknown[] }).data ?? [] : [];

    setTotalTenants(tenantCount ?? 0);
    setTotalUsers(userCount ?? 0);
    setActiveLicenses(licenseRows.length);
    const revenue = licenseRows.reduce((sum: number, row: { license_plans?: { price_cents?: number }; license_plan?: { price_cents?: number } }) => {
      const p = row.license_plans ?? row.license_plan;
      return sum + (p?.price_cents ?? 0);
    }, 0);
    setMonthlyRevenue(revenue / 100);

    const mapped = (orgRows ?? []).map((row: { id: string; name: string; created_at: string; organization_licenses?: Array<{ status?: string; license_plans?: { id: string; name: string }; license_plan?: { id: string; name: string } }> }) => {
      const ol = row.organization_licenses?.[0];
      const plan = ol?.license_plans ?? ol?.license_plan;
      return {
        id: row.id,
        name: row.name,
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        planId: plan?.id ?? '',
        planName: plan?.name ?? 'No plan',
        status: ol?.status ?? 'trial',
        createdAt: row.created_at,
        adminCount: 0,
        memberCount: 0
      };
    });
    setRecentOrgs(mapped);

    const planCountsMap: PlanCount[] = (plansWithOrgs ?? []).map((p: { id: string; name: string; organization_licenses?: { organization_id: string }[] }) => ({
      id: p.id,
      name: p.name,
      count: Array.isArray(p.organization_licenses) ? p.organization_licenses.length : 0
    }));
    setPlanCounts(planCountsMap);

    setRecentActivity((auditRows ?? []).map((r: { id: string; action: string; created_at: string; organization_id: string | null }) => ({
      id: r.id,
      action: r.action,
      created_at: r.created_at,
      organization_id: r.organization_id
    })));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="space-y-8">
      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">{loadError}</p>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-500">Super Admin dashboard for system-wide management.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/super-admin/tenants">
            <Button leftIcon={<Plus className="w-4 h-4" />}>New Organization</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Tenants" value={totalTenants.toString()} icon={Building2} color="blue" />
        <StatsCard label="Total Users" value={totalUsers.toString()} icon={Users} color="purple" />
        <StatsCard label="Active Licenses" value={activeLicenses.toString()} icon={CreditCard} color="green" />
        <StatsCard label="Monthly Revenue" value={`R${monthlyRevenue.toFixed(0)}`} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Organizations</h3>
            <Link to="/super-admin/tenants">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <div className="overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Organization</TableHeader>
                  <TableHeader>Plan</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Created</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{org.name}</div>
                    </TableCell>
                    <TableCell>{org.planName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          org.status === 'active' ? 'success' : org.status === 'trial' ? 'info' : 'danger'
                        }
                      >
                        {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900">Tenants per plan</h3>
          </CardHeader>
          <CardContent>
            {planCounts.length === 0 ? (
              <p className="text-sm text-gray-500">No plans or no tenant assignments yet.</p>
            ) : (
              <ul className="space-y-2">
                {planCounts.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{p.name}</span>
                    <span className="text-gray-600">{p.count} tenant(s)</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Recent activity</h3>
          <Link to="/super-admin/audit-logs">
            <Button variant="ghost" size="sm" leftIcon={<Activity className="w-4 h-4" />}>
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No audit entries yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-medium text-gray-900">{entry.action}</span>
                  <span className="text-gray-500">{new Date(entry.created_at).toLocaleString()}</span>
                  <span className="text-gray-500">· {entry.organization_id ?? 'Platform'}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

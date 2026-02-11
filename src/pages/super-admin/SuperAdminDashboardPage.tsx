import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Plus } from
'lucide-react';
import { StatsCard } from '../../components/widgets/StatsCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { OrganizationWithPlan } from '../../types';
export function SuperAdminDashboardPage() {
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeLicenses, setActiveLicenses] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [recentOrgs, setRecentOrgs] = useState<OrganizationWithPlan[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: tenantCount }, { count: userCount }, { data: licenseRows }, { data: orgRows }] =
        await Promise.all([
          supabase.from('organizations').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
          supabase
            .from('organization_licenses')
            .select('status, license_plan:license_plans(price_cents)')
            .in('status', ['active', 'trial']),
          supabase
            .from('organizations')
            .select('id, name, created_at, organization_licenses(status, license_plan:license_plans(id, name))')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

      setTotalTenants(tenantCount ?? 0);
      setTotalUsers(userCount ?? 0);
      const active = (licenseRows ?? []).length;
      setActiveLicenses(active);
      const revenue = (licenseRows ?? []).reduce((sum, row) => {
        const price = (row as any).license_plan?.price_cents ?? 0;
        return sum + price;
      }, 0);
      setMonthlyRevenue(revenue / 100);

      const mapped = (orgRows ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        planId: row.organization_licenses?.[0]?.license_plan?.id ?? '',
        planName: row.organization_licenses?.[0]?.license_plan?.name ?? 'No plan',
        status: row.organization_licenses?.[0]?.status ?? 'trial',
        createdAt: row.created_at,
        adminCount: 0,
        memberCount: 0
      }));
      setRecentOrgs(mapped);
    };
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Overview
          </h1>
          <p className="text-gray-500">
            Super Admin dashboard for system-wide management.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/super-admin/tenants">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Tenants"
          value={totalTenants.toString()}
          trend={{
            value: '12 new',
            isPositive: true
          }}
          icon={Building2}
          color="blue" />

        <StatsCard
          label="Total Users"
          value={totalUsers.toString()}
          trend={{
            value: '8% growth',
            isPositive: true
          }}
          icon={Users}
          color="purple" />

        <StatsCard
          label="Active Licenses"
          value={activeLicenses.toString()}
          trend={{
            value: '92% retention',
            isPositive: true
          }}
          icon={CreditCard}
          color="green" />

        <StatsCard
          label="Monthly Revenue"
          value={`R${monthlyRevenue.toFixed(0)}`}
          trend={{
            value: '15% vs last mo',
            isPositive: true
          }}
          icon={TrendingUp}
          color="orange" />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Organizations */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">
              Recent Organizations
            </h3>
            <Link to="/super-admin/tenants">
              <Button variant="ghost" size="sm">
                View All
              </Button>
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
                {recentOrgs.map((org) =>
                <TableRow key={org.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {org.name}
                      </div>
                    </TableCell>
                    <TableCell>{org.planName}</TableCell>
                    <TableCell>
                      <Badge
                      variant={
                      org.status === 'active' ?
                      'success' :
                      org.status === 'trial' ?
                      'info' :
                      'danger'
                      }>

                        {org.status.charAt(0).toUpperCase() +
                      org.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(org.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900">License Summary</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Active licenses generate the monthly revenue shown above. Manage plan pricing in the Licenses section.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>);

}
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Building2, DollarSign } from 'lucide-react';
import { StatsCard } from '../../components/widgets/StatsCard';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
export function SystemAnalyticsPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [activeTenants, setActiveTenants] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [planBreakdown, setPlanBreakdown] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const [{ data: licenses }, { count: activeCount }, { count: userCount }] = await Promise.all([
        supabase
          .from('organization_licenses')
          .select('status, license_plan:license_plans(name, price_cents)')
          .in('status', ['active', 'trial']),
        supabase
          .from('organizations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase.from('profiles').select('user_id', { count: 'exact', head: true })
      ]);

      const activeLicenses = licenses ?? [];
      const revenue = activeLicenses.reduce((sum, row: any) => sum + (row.license_plan?.price_cents ?? 0), 0);
      setMrr(revenue / 100);
      setTotalRevenue(revenue / 100);
      setActiveTenants(activeCount ?? 0);
      setTotalUsers(userCount ?? 0);

      const breakdown = activeLicenses.reduce<Record<string, number>>((acc, row: any) => {
        const name = row.license_plan?.name ?? 'Unknown';
        acc[name] = (acc[name] ?? 0) + (row.license_plan?.price_cents ?? 0);
        return acc;
      }, {});
      setPlanBreakdown(breakdown);
    };
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-500">
            Platform-wide performance metrics and growth stats.
          </p>
        </div>
        <div className="text-sm text-gray-500">All Time</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Revenue"
          value={`R${totalRevenue.toFixed(0)}`}
          icon={DollarSign}
          color="green" />

        <StatsCard
          label="MRR"
          value={`R${mrr.toFixed(0)}`}
          icon={TrendingUp}
          color="blue" />

        <StatsCard
          label="Active Orgs"
          value={activeTenants.toString()}
          icon={Building2}
          color="purple" />

        <StatsCard
          label="Total Users"
          value={totalUsers.toString()}
          icon={Users}
          color="orange" />

      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900">Revenue by Plan</h3>
        </CardHeader>
        <CardContent>
          {Object.keys(planBreakdown).length === 0 ? (
            <p className="text-sm text-gray-500">No active licenses yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(planBreakdown).map(([planName, amount]) => (
                <div key={planName} className="flex justify-between text-sm text-gray-700">
                  <span>{planName}</span>
                  <span>R{(amount / 100).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>);

}
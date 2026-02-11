import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const PAGE_SIZE = 25;

type AuditRow = {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  organization_id: string | null;
  actor_user_id: string | null;
};

type OrgRow = { id: string; name: string; slug: string };
type ProfileRow = { user_id: string; full_name: string | null; email: string | null };

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [organizations, setOrganizations] = useState<OrgRow[]>([]);
  const [profilesByUserId, setProfilesByUserId] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [organizationIdFilter, setOrganizationIdFilter] = useState('');

  const loadOrgs = useCallback(async () => {
    const { data } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .order('name')
      .returns<OrgRow[]>();
    setOrganizations(data ?? []);
  }, []);

  const load = useCallback(async (pageNum: number, append: boolean) => {
    setLoading(true);
    let q = supabase
      .from('audit_logs')
      .select('id, action, metadata, created_at, organization_id, actor_user_id')
      .order('created_at', { ascending: false });

    if (dateFrom) {
      q = q.gte('created_at', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      q = q.lte('created_at', end.toISOString());
    }
    if (actionFilter.trim()) {
      q = q.ilike('action', `%${actionFilter.trim()}%`);
    }
    if (organizationIdFilter) {
      q = q.eq('organization_id', organizationIdFilter);
    }

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await q.range(from, to).returns<AuditRow[]>();

    if (error) {
      setLoading(false);
      return;
    }
    const rows = data ?? [];
    setLogs(append ? (prev) => (pageNum === 0 ? rows : [...prev, ...rows]) : rows);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);

    const actorIds = [...new Set(rows.map((r) => r.actor_user_id).filter(Boolean))] as string[];
    if (actorIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', actorIds)
        .returns<ProfileRow[]>();
      setProfilesByUserId((prev) => {
        const next = { ...prev };
        (profileRows ?? []).forEach((p) => {
          next[p.user_id] = p;
        });
        return next;
      });
    }
  }, [dateFrom, dateTo, actionFilter, organizationIdFilter]);

  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);

  useEffect(() => {
    void load(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    setPage(0);
    void load(0, false);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    void load(next, true);
  };

  const orgName = (id: string | null) => {
    if (!id) return 'Platform';
    const org = organizations.find((o) => o.id === id);
    return org ? `${org.name} (${org.slug})` : id;
  };

  const actorName = (userId: string | null) => {
    if (!userId) return '—';
    const p = profilesByUserId[userId];
    return p ? p.full_name || p.email || userId : userId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500">Track sensitive actions across the platform.</p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <Input
            label="From date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="To date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Input
            label="Action"
            placeholder="e.g. license_created"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
            <select
              className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2"
              value={organizationIdFilter}
              onChange={(e) => setOrganizationIdFilter(e.target.value)}
            >
              <option value="">All</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleApplyFilters}>Apply filters</Button>
        </div>
      </Card>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-500 p-6">No audit entries match your filters.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50/50">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        Tenant: {orgName(log.organization_id)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Actor: {actorName(log.actor_user_id)}
                      </p>
                    </div>
                    {Object.keys(log.metadata ?? {}).length > 0 && (
                      <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
                        {JSON.stringify(log.metadata)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
            {hasMore && logs.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex justify-center">
                <Button variant="outline" onClick={loadMore} isLoading={loading}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { setImpersonation } from '../../utils/impersonation';
import { logAudit } from '../../utils/audit';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  contact_email: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  created_at: string;
};

export function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<TenantRow | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [usage, setUsage] = useState({ members: 0, posts: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tenantId) return;
      try {
        const { data: tenantData, error: tenantError } = await supabase
          .from('organizations')
          .select('id, name, slug, status, created_at, contact_email')
          .eq('id', tenantId)
          .maybeSingle<TenantRow>();
        if (tenantError && import.meta.env.DEV) console.error('[TenantDetailPage] organizations', tenantError);
        const { data: auditData } = await supabase
          .from('audit_logs')
          .select('id, action, created_at')
          .eq('organization_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(10)
          .returns<AuditRow[]>();
        const { data: adminMembership } = await supabase
          .from('organization_memberships')
          .select('user_id')
          .eq('organization_id', tenantId)
          .in('role', ['owner', 'admin'])
          .eq('status', 'active')
          .limit(1)
          .maybeSingle<{ user_id: string }>();
        const [memRes, postsRes, resourcesRes] = await Promise.all([
          supabase
            .from('organization_memberships')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', tenantId)
            .eq('status', 'active'),
          supabase
            .from('tenant_posts')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', tenantId),
          supabase
            .from('tenant_resources')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', tenantId)
        ]);
        setTenant(tenantData ?? null);
        setAuditLogs(auditData ?? []);
        setAdminUserId(adminMembership?.user_id ?? null);
        setUsage({
          members: memRes.count ?? 0,
          posts: postsRes.count ?? 0,
          resources: resourcesRes.count ?? 0
        });
      } catch (e) {
        if (import.meta.env.DEV) console.error('[TenantDetailPage] load', e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!tenant) {
    return <div className="text-gray-500">Tenant not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <p className="text-gray-500">Slug: {tenant.slug} · Status: {tenant.status}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Tenant Overview</h2>
        <p className="text-sm text-gray-600">Created: {new Date(tenant.created_at).toLocaleDateString()}</p>
        <p className="text-sm text-gray-600">Contact: {tenant.contact_email ?? 'N/A'}</p>
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <div>Members: {usage.members}</div>
          <div>Posts: {usage.posts}</div>
          <div>Resources: {usage.resources}</div>
        </div>
        {adminUserId && (
          <div className="mt-4">
            <Button
              onClick={() => {
                setImpersonation({ userId: adminUserId, tenantId: tenant.id, startedAt: new Date().toISOString() });
                void logAudit('impersonation_started', tenant.id, { user_id: adminUserId });
                window.location.href = `/c/${tenant.slug}/admin`;
              }}
            >
              Impersonate Admin
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Audit Logs</h2>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No audit logs yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-gray-600">
            {auditLogs.map((log) => (
              <li key={log.id}>
                {log.action} · {new Date(log.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

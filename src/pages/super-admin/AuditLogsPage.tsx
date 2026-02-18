import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../lib/apiClient';

type AuditItem = {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  tenantId: string | null;
  actorUserId: string | null;
};

type AuditResponse = {
  items: AuditItem[];
  pagination: { page: number; totalPages: number };
};

export function AuditLogsPage() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditResponse | null>(null);

  const load = async () => {
    const q = new URLSearchParams({ page: String(page), pageSize: '25' });
    if (action.trim()) q.set('action', action.trim());
    const result = await apiClient<AuditResponse>(`/api/audit?${q.toString()}`);
    setData(result);
  };

  useEffect(() => {
    void load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500">Platform activity history.</p>
      </div>

      <Card className="p-4 flex gap-3 items-end">
        <Input label="Action filter" value={action} onChange={(e) => setAction(e.target.value)} />
        <Button onClick={() => { setPage(1); void load(); }}>Apply</Button>
      </Card>

      <Card className="p-4 space-y-3">
        {!data?.items?.length ? (
          <p className="text-sm text-gray-500">No logs found.</p>
        ) : (
          data.items.map((log) => (
            <div key={log.id} className="border-b border-gray-100 pb-3 last:border-0">
              <p className="text-sm font-medium text-gray-900">{log.action}</p>
              <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
              {log.tenantId && <p className="text-xs text-gray-500">Tenant: {log.tenantId}</p>}
              {Object.keys(log.metadata || {}).length > 0 && (
                <pre className="text-xs text-gray-500 overflow-x-auto">{JSON.stringify(log.metadata)}</pre>
              )}
            </div>
          ))
        )}

        <div className="flex justify-between">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <Button
            variant="ghost"
            disabled={page >= (data?.pagination.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

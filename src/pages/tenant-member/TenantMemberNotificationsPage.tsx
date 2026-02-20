import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTenant } from '../../contexts/TenantContext';
import { tenantFeaturesGet, tenantFeaturesPut } from '../../lib/tenantFeatures';
import { MemberPageContainer, PageHeader } from '../../components/member';

type Notification = {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export function TenantMemberNotificationsPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<Notification[]>([]);

  const load = async () => {
    if (!tenant?.id) return;
    setItems(await tenantFeaturesGet<Notification[]>(tenant.id, '/notifications'));
  };

  useEffect(() => {
    void load();
  }, [tenant?.id]);

  const markRead = async (id: string) => {
    if (!tenant?.id) return;
    await tenantFeaturesPut(tenant.id, `/notifications/${id}/read`, {});
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  return (
    <MemberPageContainer>
      <PageHeader
        title="Notifications"
        subtitle="Your notification timeline."
      />
      <div className="space-y-0">
        {items.length === 0 && (
          <p className="text-gray-500 py-8">No notifications yet.</p>
        )}
        {items.map((n) => {
          const unread = !n.readAt;
          return (
            <div
              key={n._id}
              className={`
                flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 py-4 px-4 rounded-xl transition-colors
                ${unread ? 'bg-gray-50/80' : ''}
                border-b border-gray-100 last:border-0
              `}
            >
              <div className="flex gap-3 min-w-0 flex-1">
                {unread && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0 mt-2"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    aria-hidden
                  />
                )}
                <div className={unread ? '' : 'sm:pl-5'}>
                  <h2 className={`text-gray-900 ${unread ? 'font-semibold' : 'font-medium'}`}>
                    {n.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
              {unread && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void markRead(n._id)}
                  className="shrink-0"
                >
                  Mark read
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </MemberPageContainer>
  );
}

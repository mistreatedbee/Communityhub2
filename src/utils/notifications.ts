type NotificationPayload = {
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
};

export async function notifyTenantMembers(_organizationId: string, _payload: NotificationPayload) {
  return;
}

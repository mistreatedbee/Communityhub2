import { supabase } from '../lib/supabase';

export async function logAudit(action: string, tenantId: string | null, metadata: Record<string, unknown> = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('audit_logs').insert({
    organization_id: tenantId,
    actor_user_id: user?.id ?? null,
    action,
    entity_type: (metadata.entity_type as string) ?? 'system',
    entity_id: (metadata.entity_id as string) ?? null,
    metadata
  });
}

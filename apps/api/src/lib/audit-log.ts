import { createAdminClient } from '../db/client.js';

export interface AuditEventInput {
  actor_user_id: string | null;
  org_id?: string | null;
  scope: 'user' | 'organization' | 'billing' | 'content' | 'membership';
  action: string;
  target_type: string;
  target_id?: string | null;
  details?: Record<string, unknown>;
}

export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    const client = createAdminClient();
    await client.from('audit_logs').insert({
      actor_user_id: input.actor_user_id,
      org_id: input.org_id ?? null,
      scope: input.scope,
      action: input.action,
      target_type: input.target_type,
      target_id: input.target_id ?? null,
      details: input.details ?? {},
    });
  } catch {
    // Audit logging should never block the primary mutation path.
  }
}

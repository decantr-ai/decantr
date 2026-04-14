import { createAdminClient } from '../db/client.js';

export interface UsageEventInput {
  user_id: string;
  org_id?: string | null;
  metric:
    | 'api_request'
    | 'content_publish'
    | 'private_package_publish'
    | 'org_package_publish'
    | 'approval_action';
  quantity?: number;
  source?: 'jwt' | 'api_key';
  path?: string | null;
  method?: string | null;
}

export async function recordUsageEvent(input: UsageEventInput): Promise<void> {
  try {
    const client = createAdminClient();
    await client.from('usage_events').insert({
      user_id: input.user_id,
      org_id: input.org_id ?? null,
      metric: input.metric,
      quantity: input.quantity ?? 1,
      source: input.source ?? 'jwt',
      path: input.path ?? null,
      method: input.method ?? null,
    });
  } catch {
    // Metering should not block request handling.
  }
}

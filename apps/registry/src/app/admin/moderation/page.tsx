import { createClient } from '@/lib/supabase/server';
import { api, type ModerationQueueItem } from '@/lib/api';
import { ModerationClient } from './moderation-client';

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';
  const adminKey = process.env.DECANTR_ADMIN_KEY || '';

  let items: ModerationQueueItem[] = [];
  let error = '';

  try {
    const res = await api.getModerationQueue(token, adminKey, { limit: 50 });
    items = res.items || [];
  } catch (err: any) {
    error = err.message || 'Failed to load moderation queue';
  }

  return <ModerationClient initialItems={items} error={error} />;
}

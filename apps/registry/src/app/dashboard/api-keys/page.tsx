import { createClient } from '@/lib/supabase/server';
import { api, type ApiKey } from '@/lib/api';
import { ApiKeysClient } from './client';

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  let keys: ApiKey[] = [];
  let error = '';

  try {
    const res = await api.getApiKeys(token);
    keys = Array.isArray(res) ? res : res?.keys || [];
  } catch (err: any) {
    error = err.message || 'Failed to load API keys';
  }

  return <ApiKeysClient initialKeys={keys} error={error} />;
}

import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import type { ApiKey } from '@/lib/api';
import { ApiKeyList } from '@/components/dashboard/api-key-list';
import { CreateApiKeyForm } from '@/components/dashboard/create-api-key-form';

export const metadata = {
  title: 'API Keys — Decantr',
};

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let keys: ApiKey[] = [];

  try {
    const result = await api.getApiKeys(token);
    keys = Array.isArray(result) ? result : (result?.items ?? []);
  } catch {
    // API may not be reachable
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">API Keys</h1>
      <CreateApiKeyForm />
      <ApiKeyList keys={keys} />
    </div>
  );
}

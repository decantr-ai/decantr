'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.access_token;
}

export async function createApiKeyAction(name: string, scopes: string[], orgId?: string | null) {
  const token = await getToken();
  try {
    const result = await api.createApiKey(token, { name, scopes, org_id: orgId ?? null });
    revalidatePath('/dashboard/api-keys');
    return { key: result.key };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create API key' };
  }
}

export async function revokeApiKeyAction(id: string) {
  const token = await getToken();
  try {
    await api.deleteApiKey(token, id);
    revalidatePath('/dashboard/api-keys');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to revoke API key' };
  }
}

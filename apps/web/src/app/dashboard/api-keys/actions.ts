'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session!.access_token;
}

export async function createApiKeyAction(name: string, scopes: string[]) {
  const token = await getToken();
  try {
    const result = await api.createApiKey(token, { name, scopes });
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

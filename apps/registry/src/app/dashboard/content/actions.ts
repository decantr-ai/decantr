'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

export async function deleteContentAction(contentId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'Not authenticated' };
  }

  try {
    const res = await fetch(`${API_URL}/content/${contentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Delete failed' }));
      return { error: data.error || `Delete failed (${res.status})` };
    }

    revalidatePath('/dashboard/content');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete content' };
  }
}

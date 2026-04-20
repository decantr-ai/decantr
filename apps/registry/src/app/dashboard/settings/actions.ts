'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'Not authenticated' };
  }

  const displayName = formData.get('display_name') as string;
  const username = formData.get('username') as string;

  const body: Record<string, string> = {};
  if (displayName) body.display_name = displayName;
  if (username) body.username = username;

  if (Object.keys(body).length === 0) {
    return { error: 'No changes to save' };
  }

  const res = await fetch(`${API_URL}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Update failed' }));
    return { error: data.error || `Update failed (${res.status})` };
  }

  // Also update auth metadata for display_name
  if (displayName) {
    await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        ...(username ? { username, user_name: username } : {}),
      },
    });
  } else if (username) {
    await supabase.auth.updateUser({
      data: { username, user_name: username },
    });
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

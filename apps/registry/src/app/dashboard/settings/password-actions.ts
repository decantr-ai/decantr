'use server';

import { createClient } from '@/lib/supabase/server';

export async function changePasswordAction(newPassword: string) {
  if (!newPassword || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update password' };
  }
}

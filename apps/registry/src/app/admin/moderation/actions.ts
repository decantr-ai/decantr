'use server';

import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin';

async function getAdminContext() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error('Unauthorized');
  }

  const token = session.access_token;
  const adminKey = process.env.DECANTR_ADMIN_KEY;

  if (!adminKey) {
    throw new Error('Admin key not configured');
  }

  return { token, adminKey };
}

export async function approveSubmission(queueId: string) {
  const { token, adminKey } = await getAdminContext();

  try {
    const result = await api.approveContent(token, adminKey, queueId);
    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve',
    };
  }
}

export async function rejectSubmission(queueId: string, reason: string) {
  const { token, adminKey } = await getAdminContext();

  if (!reason.trim()) {
    return { success: false, message: 'Rejection reason is required' };
  }

  try {
    const result = await api.rejectContent(token, adminKey, queueId, reason);
    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reject',
    };
  }
}

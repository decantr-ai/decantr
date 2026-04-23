'use server';

import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { requireAdminRequestContext } from '@/lib/admin-workspace';

export async function approveSubmission(queueId: string) {
  const { token, adminKey } = await requireAdminRequestContext();

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
  const { token, adminKey } = await requireAdminRequestContext();

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

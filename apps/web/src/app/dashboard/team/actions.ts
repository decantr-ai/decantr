'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session!.access_token;
}

export async function inviteMemberAction(orgSlug: string, identifier: string, role: string) {
  const token = await getToken();
  try {
    const body: Record<string, string> = { role };
    if (identifier.startsWith('@')) {
      body.username = identifier;
    } else {
      body.email = identifier;
    }
    await api.inviteOrgMember(token, orgSlug, body as any);
    revalidatePath('/dashboard/team');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to invite member' };
  }
}

export async function removeMemberAction(orgSlug: string, userId: string) {
  const token = await getToken();
  try {
    await api.removeOrgMember(token, orgSlug, userId);
    revalidatePath('/dashboard/team');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to remove member' };
  }
}

export async function updateRoleAction(orgSlug: string, userId: string, role: string) {
  const token = await getToken();
  try {
    await api.updateOrgMemberRole(token, orgSlug, userId, { role });
    revalidatePath('/dashboard/team');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update role' };
  }
}

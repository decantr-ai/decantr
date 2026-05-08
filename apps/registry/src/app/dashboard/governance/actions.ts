'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { api, type OrgPolicy } from '@/lib/api';

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

export async function loadOrgGovernanceStateAction(
  orgSlug: string,
  filters?: { scope?: string; action?: string },
) {
  if (!orgSlug) {
    return {
      state: {
        policy: null,
        approvals: [],
        auditEntries: [],
        usage: null,
      },
    };
  }

  const token = await getToken();
  try {
    const [policy, approvalsResult, auditResult, usageResult] = await Promise.all([
      api.getOrgPolicy(token, orgSlug).catch(() => null),
      api.getOrgApprovals(token, orgSlug, { limit: 12, offset: 0 }).catch(() => null),
      api
        .getOrgAuditLog(token, orgSlug, {
          limit: 12,
          offset: 0,
          scope: filters?.scope || undefined,
          action: filters?.action || undefined,
        })
        .catch(() => null),
      api.getOrgUsage(token, orgSlug).catch(() => null),
    ]);

    return {
      state: {
        policy,
        approvals: Array.isArray(approvalsResult) ? approvalsResult : approvalsResult?.items ?? [],
        auditEntries: auditResult?.items ?? [],
        usage: usageResult?.usage ?? null,
      },
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to load organization governance' };
  }
}

export async function updateOrgPolicyAction(orgSlug: string, policy: OrgPolicy) {
  const token = await getToken();
  try {
    const updated = await api.updateOrgPolicy(token, orgSlug, {
      require_public_content_approval: policy.require_public_content_approval,
      allow_member_submissions: policy.allow_member_submissions ?? false,
      require_private_content_approval: policy.require_private_content_approval ?? false,
    });
    revalidatePath('/dashboard/governance');
    return { policy: updated };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update organization policy' };
  }
}

export async function reviewOrgContentAction(
  orgSlug: string,
  contentId: string,
  decision: 'approve' | 'reject',
) {
  const token = await getToken();
  try {
    if (decision === 'approve') {
      await api.approveOrgContent(token, orgSlug, contentId);
    } else {
      await api.rejectOrgContent(token, orgSlug, contentId);
    }
    revalidatePath('/dashboard/governance');
    revalidatePath('/dashboard/content');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update approval queue' };
  }
}

import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import type { OrgMember } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamMemberList } from '@/components/dashboard/team-member-list';
import { InviteMemberForm } from '@/components/dashboard/invite-member-form';
import Link from 'next/link';

export const metadata = {
  title: 'Team — Decantr',
};

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let profile: { id: string; tier: string; org_slug?: string } = {
    id: '',
    tier: 'free',
  };

  try {
    const me = await api.getMe(token);
    profile = {
      id: me.id ?? '',
      tier: me.tier ?? 'free',
      org_slug: me.org_slug,
    };
  } catch {
    // API may not be reachable
  }

  if (profile.tier !== 'team' && profile.tier !== 'enterprise') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Team</h1>
        <Card>
          <h2 className="mb-2 text-lg font-semibold">Upgrade to Team</h2>
          <p className="mb-4 text-sm text-[var(--fg-muted)]">
            Team management is available on the Team plan ($99/seat/mo). Collaborate with
            your organization, share content under a team namespace, and manage API keys together.
          </p>
          <Link href="/dashboard/billing">
            <Button>Upgrade Now</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const orgSlug = profile.org_slug ?? '';
  let members: OrgMember[] = [];
  let currentUserRole = 'member';

  if (orgSlug) {
    try {
      const orgResult = await api.getOrgMembers(token, orgSlug);
      members = orgResult.members ?? [];
      const currentMember = members.find((m) => m.user_id === profile.id);
      currentUserRole = currentMember?.role || 'member';
    } catch {
      // Org not yet set up
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>
      {orgSlug ? (
        <>
          <InviteMemberForm orgSlug={orgSlug} />
          <TeamMemberList members={members} orgSlug={orgSlug} currentUserRole={currentUserRole} />
        </>
      ) : (
        <Card>
          <p className="text-sm text-[var(--fg-muted)]">
            Your team organization has not been set up yet. Contact support to get started.
          </p>
        </Card>
      )}
    </div>
  );
}

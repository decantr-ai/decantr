import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { CommandPalette } from '@/components/command-palette';
import { api } from '@/lib/api';
import { isAdmin } from '@/lib/admin';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user) {
    redirect('/login');
  }

  const email = user.email ?? '';
  const token = session?.access_token ?? '';

  let me = null;
  try {
    me = token ? await api.getMe(token) : null;
  } catch {
    me = null;
  }

  const display_name =
    me?.display_name
    ?? (user.user_metadata?.display_name as string | undefined)
    ?? (user.user_metadata?.name as string | undefined)
    ?? undefined;
  const username =
    me?.username
    ?? (user.user_metadata?.username as string | undefined)
    ?? (user.user_metadata?.user_name as string | undefined)
    ?? null;
  const entitlements = me?.entitlements ?? {
    tier: 'free' as const,
    personal_private_packages: false,
    org_collaboration: false,
    org_private_packages: false,
    shared_packages: false,
    audit_logs: false,
    approval_workflows: false,
    private_registry_portal: false,
    support_level: 'community' as const,
  };
  const admin = isAdmin(email);

  return (
    <div className="registry-shell-root">
      <Sidebar
        user={{
          email,
          display_name,
          username,
          tier: me?.tier ?? 'free',
          organizations: me?.organizations ?? [],
          entitlements,
          isAdmin: admin,
        }}
      />

      <div className="registry-shell-main">
        <DashboardHeader />
        <CommandPalette
          isAdmin={admin}
          organizations={me?.organizations ?? []}
          entitlements={entitlements}
        />
        <main className="registry-shell-body entrance-fade">
          {children}
        </main>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { api } from '@/lib/api';

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
  const display_name =
    (user.user_metadata?.display_name as string | undefined) ?? undefined;
  const token = session?.access_token ?? '';

  let me = null;
  try {
    me = token ? await api.getMe(token) : null;
  } catch {
    me = null;
  }

  return (
    <div className="registry-shell-root">
      <Sidebar
        user={{
          email,
          display_name,
          tier: me?.tier ?? 'free',
          organizations: me?.organizations ?? [],
          entitlements: me?.entitlements ?? {
            tier: 'free',
            personal_private_packages: false,
            org_collaboration: false,
            org_private_packages: false,
            shared_packages: false,
            audit_logs: false,
            approval_workflows: false,
            private_registry_portal: false,
            support_level: 'community',
          },
        }}
      />

      <div className="registry-shell-main">
        <DashboardHeader />
        <main className="registry-shell-body entrance-fade">
          {children}
        </main>
      </div>
    </div>
  );
}

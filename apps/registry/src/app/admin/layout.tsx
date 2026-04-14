import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import type { Metadata } from 'next';
import { api } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminLayout({
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
  if (!isAdmin(user.email ?? '')) {
    redirect('/dashboard');
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
    <div style={{ display: 'flex', height: '100vh' }}>
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

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main
          className="entrance-fade"
          style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

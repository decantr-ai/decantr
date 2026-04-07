import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const email = user.email ?? '';
  const display_name =
    (user.user_metadata?.display_name as string | undefined) ?? undefined;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar user={{ email, display_name }} />

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

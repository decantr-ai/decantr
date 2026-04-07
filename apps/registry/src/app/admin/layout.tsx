import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin(user.email)) {
    redirect('/dashboard');
  }

  return (
    <div className="flex" style={{ height: '100vh' }}>
      <Sidebar isAdmin={true} />
      <div className="flex flex-col flex-1" style={{ overflow: 'hidden' }}>
        <DashboardHeader />
        <main className="entrance-fade" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

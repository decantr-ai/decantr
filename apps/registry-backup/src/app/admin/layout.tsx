import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Supabase unavailable
  }

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin(user.email)) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 md:px-8 py-8">
      {children}
    </main>
  );
}

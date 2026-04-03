import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
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
    // Supabase unavailable, treat as unauthenticated
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 md:px-8 py-8">
      {children}
    </main>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export interface AdminRequestContext {
  token: string;
  adminKey: string;
  email: string;
}

export async function requireAdminRequestContext(): Promise<AdminRequestContext> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/dashboard');
  }

  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';
  return {
    token: session.access_token,
    adminKey,
    email: session.user.email,
  };
}

'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session!.access_token;
}

export async function upgradeAction(plan: 'pro' | 'team') {
  const token = await getToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const result = await api.createCheckout(token, {
    plan,
    success_url: `${siteUrl}/dashboard/billing?upgraded=true`,
    cancel_url: `${siteUrl}/dashboard/billing`,
  });
  redirect(result.url);
}

export async function manageBillingAction() {
  const token = await getToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const result = await api.createPortal(token, {
    return_url: `${siteUrl}/dashboard/billing`,
  });
  redirect(result.url);
}

'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { headers } from 'next/headers';

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.access_token;
}

async function getSiteUrl() {
  const hdrs = await headers();
  const host = hdrs.get('host') || 'registry.decantr.ai';
  const proto = hdrs.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

export async function upgradeAction(plan: 'pro' | 'team') {
  let checkoutUrl: string;

  try {
    const token = await getToken();
    const siteUrl = await getSiteUrl();

    const result = await api.createCheckout(token, {
      plan,
      success_url: `${siteUrl}/dashboard/billing?upgraded=true`,
      cancel_url: `${siteUrl}/dashboard/billing`,
    });

    checkoutUrl = result.checkout_url || result.url;

    if (!checkoutUrl) {
      throw new Error(`No checkout URL in response: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Upgrade error:', message);
    redirect(`/dashboard/billing?error=${encodeURIComponent(message)}`);
  }

  redirect(checkoutUrl);
}

export async function manageBillingAction() {
  let portalUrl: string;

  try {
    const token = await getToken();
    const siteUrl = await getSiteUrl();

    const result = await api.createPortal(token, {
      return_url: `${siteUrl}/dashboard/billing`,
    });

    portalUrl = result.portal_url || result.url;

    if (!portalUrl) {
      throw new Error(`No portal URL in response: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Billing portal error:', message);
    redirect(`/dashboard/billing?error=${encodeURIComponent(message)}`);
  }

  redirect(portalUrl);
}

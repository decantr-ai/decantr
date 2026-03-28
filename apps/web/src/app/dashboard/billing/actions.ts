'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { headers } from 'next/headers';

async function getToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return session.access_token;
}

async function getSiteUrl() {
  const hdrs = await headers();
  const host = hdrs.get('host') || 'registry.decantr.ai';
  const proto = hdrs.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

export async function upgradeAction(plan: 'pro' | 'team'): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) {
    return { error: 'Not authenticated. Please sign in again.' };
  }

  const siteUrl = await getSiteUrl();

  let result;
  try {
    result = await api.createCheckout(token, {
      plan,
      success_url: `${siteUrl}/dashboard/billing?upgraded=true`,
      cancel_url: `${siteUrl}/dashboard/billing`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session';
    console.error('Upgrade error:', message);
    return { error: message };
  }

  const checkoutUrl = result.checkout_url || result.url;
  if (!checkoutUrl) {
    return { error: 'No checkout URL returned from Stripe' };
  }

  redirect(checkoutUrl);
}

export async function manageBillingAction(): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) {
    return { error: 'Not authenticated. Please sign in again.' };
  }

  const siteUrl = await getSiteUrl();

  let result;
  try {
    result = await api.createPortal(token, {
      return_url: `${siteUrl}/dashboard/billing`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to open billing portal';
    console.error('Billing portal error:', message);
    return { error: message };
  }

  const portalUrl = result.portal_url || result.url;
  if (!portalUrl) {
    return { error: 'No portal URL returned from Stripe' };
  }

  redirect(portalUrl);
}

import { Hono } from 'hono';
import type { Env } from '../types.js';
import type { AuthContext } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import { logger } from '../lib/logger.js';
import {
  getStripe,
  getStripeWebhookSecret,
  STRIPE_PRO_PRICE_ID,
  STRIPE_TEAM_PRICE_ID,
} from '../stripe/index.js';
import { handleStripeWebhook } from '../stripe/webhooks.js';
import {
  getCommercialEntitlements,
  getCommercialLimits,
  type OrganizationEntitlementSummary,
} from '../lib/entitlements.js';
import { recordAuditEvent } from '../lib/audit-log.js';

export const billingRoutes = new Hono<Env>();

// ---------------------------------------------------------------------------
// POST /billing/checkout -- Create a Stripe Checkout session for Pro or Team
// ---------------------------------------------------------------------------
billingRoutes.post('/billing/checkout', requireAuth(), async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  const body = await c.req.json<{
    plan: 'pro' | 'team';
    quantity?: number;
    success_url: string;
    cancel_url: string;
  }>();

  if (!body.plan || !['pro', 'team'].includes(body.plan)) {
    return c.json({ error: 'Invalid plan. Must be "pro" or "team".' }, 400);
  }

  if (!body.success_url || !body.cancel_url) {
    return c.json({ error: 'success_url and cancel_url are required.' }, 400);
  }

  if (body.plan === 'team' && user.tier === 'team') {
    return c.json({ error: 'Already on Team plan. Use billing portal to manage seats.' }, 400);
  }

  if (body.plan === 'pro' && (user.tier === 'pro' || user.tier === 'team' || user.tier === 'enterprise')) {
    return c.json({ error: 'Already on a paid plan equal to or above Pro.' }, 400);
  }

  const stripe = getStripe();
  const adminClient = createAdminClient();

  // Get or create Stripe customer
  let stripeCustomerId: string;

  const { data: userRow } = await adminClient
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (userRow?.stripe_customer_id) {
    stripeCustomerId = userRow.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    stripeCustomerId = customer.id;

    await adminClient
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() })
      .eq('id', user.id);
  }

  const priceId = body.plan === 'pro' ? STRIPE_PRO_PRICE_ID : STRIPE_TEAM_PRICE_ID;
  const quantity = body.plan === 'team' ? (body.quantity ?? 1) : 1;

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: quantity,
      },
    ],
    metadata: {
      supabase_user_id: user.id,
      plan: body.plan,
      quantity: String(quantity),
    },
    success_url: body.success_url,
    cancel_url: body.cancel_url,
  });

  await recordAuditEvent({
    actor_user_id: user.id,
    scope: 'billing',
    action: 'checkout.started',
    target_type: 'checkout_session',
    target_id: session.id,
    details: {
      plan: body.plan,
      quantity,
    },
  });

  return c.json({ checkout_url: session.url, session_id: session.id });
});

// ---------------------------------------------------------------------------
// POST /billing/portal -- Create a Stripe Billing Portal session
// ---------------------------------------------------------------------------
billingRoutes.post('/billing/portal', requireAuth(), async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  const body = await c.req.json<{ return_url: string }>();

  if (!body.return_url) {
    return c.json({ error: 'return_url is required.' }, 400);
  }

  const stripe = getStripe();
  const adminClient = createAdminClient();
  const { data: userRow } = await adminClient
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!userRow?.stripe_customer_id) {
    return c.json({ error: 'No billing account found. Subscribe to a plan first.' }, 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: userRow.stripe_customer_id,
    return_url: body.return_url,
  });

  await recordAuditEvent({
    actor_user_id: user.id,
    scope: 'billing',
    action: 'portal.started',
    target_type: 'billing_portal',
    target_id: userRow.stripe_customer_id,
    details: {
      return_url: body.return_url,
    },
  });

  return c.json({ portal_url: session.url });
});

// ---------------------------------------------------------------------------
// GET /billing/status -- Get current subscription status
// ---------------------------------------------------------------------------
billingRoutes.get('/billing/status', requireAuth(), async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  const stripe = getStripe();
  const adminClient = createAdminClient();
  const { data: userRow } = await adminClient
    .from('users')
    .select('id, username, display_name, tier, stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!userRow) {
    return c.json({ error: 'User not found.' }, 404);
  }

  const { data: memberships } = await adminClient
    .from('org_members')
    .select('org_id, role, organizations(id, name, slug, tier, stripe_subscription_id, seat_limit)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const organizationLists = await Promise.all(
    (memberships ?? []).map(async (membership: any) => {
      const org = membership.organizations;
      if (!org?.id || !org?.slug || !org?.name || !org?.tier) return [];

      const { count } = await adminClient
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);

      return [{
        id: org.id,
        slug: org.slug,
        name: org.name,
        tier: org.tier,
        role: membership.role,
        seat_limit: org.seat_limit ?? 1,
        member_count: count ?? 0,
        stripe_subscription_id: org.stripe_subscription_id ?? null,
      }];
    }),
  );
  const organizations: OrganizationEntitlementSummary[] = organizationLists.flat();

  const activeOrg = organizations[0] ?? null;
  const entitlements = getCommercialEntitlements(userRow.tier);
  const limits = getCommercialLimits(userRow.tier, activeOrg);

  const { count: personalContentItems } = await adminClient
    .from('content')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .is('org_id', null);

  const { count: personalPrivatePackages } = await adminClient
    .from('content')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .is('org_id', null)
    .eq('visibility', 'private');

  const { count: orgContentItems } = activeOrg
    ? await adminClient
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', activeOrg.id)
    : { count: 0 };

  // Base response for free users or users without Stripe
  if (!userRow.stripe_customer_id) {
    return c.json({
      tier: userRow.tier,
      entitlements,
      limits,
      usage: {
        personal_content_items: personalContentItems ?? 0,
        personal_private_packages: personalPrivatePackages ?? 0,
        org_content_items: orgContentItems ?? 0,
        seats_used: activeOrg?.member_count ?? 0,
        seats_limit: activeOrg?.seat_limit ?? 0,
      },
      organizations,
      subscription: null,
    });
  }

  // Fetch active subscriptions from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: userRow.stripe_customer_id,
    status: 'active',
    limit: 1,
  });

  const subscription = subscriptions.data[0] ?? null;

  if (!subscription) {
    return c.json({
      tier: userRow.tier,
      entitlements,
      limits,
      usage: {
        personal_content_items: personalContentItems ?? 0,
        personal_private_packages: personalPrivatePackages ?? 0,
        org_content_items: orgContentItems ?? 0,
        seats_used: activeOrg?.member_count ?? 0,
        seats_limit: activeOrg?.seat_limit ?? 0,
      },
      organizations,
      subscription: null,
    });
  }

  const item = subscription.items.data[0];

  return c.json({
    tier: userRow.tier,
    entitlements,
    limits,
    usage: {
      personal_content_items: personalContentItems ?? 0,
      personal_private_packages: personalPrivatePackages ?? 0,
      org_content_items: orgContentItems ?? 0,
      seats_used: activeOrg?.member_count ?? 0,
      seats_limit: activeOrg?.seat_limit ?? 0,
    },
    organizations,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      price_id: item?.price.id ?? null,
      quantity: item?.quantity ?? null,
      current_period_start: item?.current_period_start ?? null,
      current_period_end: item?.current_period_end ?? null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
  });
});

// ---------------------------------------------------------------------------
// POST /billing/webhooks -- Stripe webhook handler (raw body required)
// ---------------------------------------------------------------------------
billingRoutes.post('/billing/webhooks', async (c) => {
  const signature = c.req.header('stripe-signature');

  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header.' }, 400);
  }

  let rawBody: string;
  try {
    rawBody = await c.req.text();
  } catch {
    return c.json({ error: 'Failed to read request body.' }, 400);
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ error: message }, 'Webhook signature verification failed');
    return c.json({ error: `Webhook signature verification failed: ${message}` }, 400);
  }

  // Idempotency: skip if we've already processed this event
  const adminClient = createAdminClient();
  const { error: insertError } = await adminClient
    .from('stripe_events')
    .insert({ event_id: event.id, event_type: event.type });

  if (insertError) {
    // Unique constraint violation = already processed
    if (insertError.code === '23505') {
      logger.info({ eventId: event.id }, 'Webhook event already processed, skipping');
      return c.json({ received: true, deduplicated: true });
    }
    // Other DB error — log but still try to process (fail open)
    logger.error({ eventId: event.id, error: insertError.message }, 'Failed to record webhook event');
  }

  try {
    await handleStripeWebhook(event);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ eventType: event.type, error: message }, 'Webhook handler error');
    return c.json({ error: 'Webhook handler failed.' }, 500);
  }

  return c.json({ received: true });
});

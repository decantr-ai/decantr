# Phase 3: Stripe Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Stripe for subscription billing with Pro ($29/mo) and Team ($99/seat/mo) tiers, including checkout, webhooks, and billing portal.

**Architecture:** Stripe Checkout for upgrades, Stripe Billing Portal for self-service management, webhook handler for subscription lifecycle events. User tier stored in Supabase users table.

**Tech Stack:** Stripe, Hono, Supabase, TypeScript

**Spec:** `docs/specs/2026-03-27-registry-platform-design.md`

---

## Task 1: Install Stripe Dependency and Create Stripe Client

Add the `stripe` npm package and create a typed Stripe client module with environment variable validation.

### Files to create/modify

- **Modify:** `apps/api/package.json`
- **Create:** `apps/api/src/stripe/client.ts`
- **Create:** `apps/api/src/stripe/index.ts`

### Steps

- [ ] **1.1** Install the `stripe` package:

```bash
cd apps/api && pnpm add stripe
```

- [ ] **1.2** Create `apps/api/src/stripe/client.ts`:

```typescript
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
export const STRIPE_TEAM_PRICE_ID = process.env.STRIPE_TEAM_PRICE_ID;

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
}

if (!STRIPE_PRO_PRICE_ID) {
  throw new Error('Missing STRIPE_PRO_PRICE_ID environment variable');
}

if (!STRIPE_TEAM_PRICE_ID) {
  throw new Error('Missing STRIPE_TEAM_PRICE_ID environment variable');
}
```

- [ ] **1.3** Create `apps/api/src/stripe/index.ts`:

```typescript
export { stripe, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_TEAM_PRICE_ID } from './client.js';
export { handleStripeWebhook } from './webhooks.js';
```

### Run

```bash
cd apps/api && pnpm typecheck
```

> Note: typecheck will fail until `webhooks.ts` is created in Task 3. That is expected. Proceed to Task 2.

### Commit

```
feat(api): add stripe client and configuration
```

---

## Task 2: Create Billing Routes (Checkout, Portal, Status)

Create the billing router with four endpoints: create checkout session, create billing portal session, get subscription status, and the webhook endpoint (delegating to the handler in Task 3).

### Files to create/modify

- **Create:** `apps/api/src/routes/billing.ts`

### Steps

- [ ] **2.1** Create `apps/api/src/routes/billing.ts`:

```typescript
import { Hono } from 'hono';
import type { Env } from '../types.js';
import type { AuthContext } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';
import {
  stripe,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRO_PRICE_ID,
  STRIPE_TEAM_PRICE_ID,
} from '../stripe/index.js';
import { handleStripeWebhook } from '../stripe/webhooks.js';

export const billingRoutes = new Hono<Env>();

// ---------------------------------------------------------------------------
// POST /billing/checkout — Create a Stripe Checkout session for Pro or Team
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
  const quantity = body.plan === 'team' ? (body.quantity ?? 1) : undefined;

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
    },
    success_url: body.success_url,
    cancel_url: body.cancel_url,
  });

  return c.json({ checkout_url: session.url, session_id: session.id });
});

// ---------------------------------------------------------------------------
// POST /billing/portal — Create a Stripe Billing Portal session
// ---------------------------------------------------------------------------
billingRoutes.post('/billing/portal', requireAuth(), async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  const body = await c.req.json<{ return_url: string }>();

  if (!body.return_url) {
    return c.json({ error: 'return_url is required.' }, 400);
  }

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

  return c.json({ portal_url: session.url });
});

// ---------------------------------------------------------------------------
// GET /billing/status — Get current subscription status
// ---------------------------------------------------------------------------
billingRoutes.get('/billing/status', requireAuth(), async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  const adminClient = createAdminClient();
  const { data: userRow } = await adminClient
    .from('users')
    .select('tier, stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!userRow) {
    return c.json({ error: 'User not found.' }, 404);
  }

  // Base response for free users or users without Stripe
  if (!userRow.stripe_customer_id) {
    return c.json({
      tier: userRow.tier,
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
      subscription: null,
    });
  }

  const item = subscription.items.data[0];

  return c.json({
    tier: userRow.tier,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      price_id: item?.price.id ?? null,
      quantity: item?.quantity ?? null,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
  });
});

// ---------------------------------------------------------------------------
// POST /billing/webhooks — Stripe webhook handler (raw body required)
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

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return c.json({ error: `Webhook signature verification failed: ${message}` }, 400);
  }

  try {
    await handleStripeWebhook(event);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook handler error for ${event.type}: ${message}`);
    return c.json({ error: 'Webhook handler failed.' }, 500);
  }

  return c.json({ received: true });
});
```

### Run

```bash
cd apps/api && pnpm typecheck
```

> Note: typecheck will still fail until `webhooks.ts` is created in Task 3. Proceed.

### Commit

```
feat(api): add billing routes for checkout, portal, status, and webhooks
```

---

## Task 3: Create Webhook Handler with All Event Processors

Implement the webhook event handler that processes four Stripe events: checkout completed, subscription updated, subscription deleted, and payment failed.

### Files to create/modify

- **Create:** `apps/api/src/stripe/webhooks.ts`

### Steps

- [ ] **3.1** Create `apps/api/src/stripe/webhooks.ts`:

```typescript
import type Stripe from 'stripe';
import { stripe, STRIPE_PRO_PRICE_ID, STRIPE_TEAM_PRICE_ID } from './client.js';
import { createAdminClient } from '../db/client.js';

type UserTier = 'free' | 'pro' | 'team' | 'enterprise';

// ---------------------------------------------------------------------------
// Main webhook dispatcher
// ---------------------------------------------------------------------------
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
}

// ---------------------------------------------------------------------------
// checkout.session.completed
// Create/upgrade subscription, update user tier, optionally create org
// ---------------------------------------------------------------------------
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const adminClient = createAdminClient();
  const userId = session.metadata?.supabase_user_id;
  const plan = session.metadata?.plan as 'pro' | 'team' | undefined;

  if (!userId || !plan) {
    console.error('checkout.session.completed: missing metadata (supabase_user_id or plan)');
    return;
  }

  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!stripeCustomerId) {
    console.error('checkout.session.completed: missing customer ID');
    return;
  }

  // Retrieve the subscription to get details
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    console.error('checkout.session.completed: missing subscription ID');
    return;
  }

  const newTier: UserTier = plan === 'team' ? 'team' : 'pro';

  // Update user tier and stripe_customer_id
  await adminClient
    .from('users')
    .update({
      tier: newTier,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // For Team plan, create an organization if one doesn't already exist for this user
  if (plan === 'team') {
    const { data: existingOrg } = await adminClient
      .from('organizations')
      .select('id')
      .eq('owner_id', userId)
      .limit(1)
      .single();

    if (!existingOrg) {
      // Fetch user email for default org name
      const { data: userRow } = await adminClient
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      const defaultSlug = (userRow?.email?.split('@')[0] ?? 'team').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const orgName = `${defaultSlug}'s Team`;

      const { data: newOrg } = await adminClient
        .from('organizations')
        .insert({
          name: orgName,
          slug: defaultSlug,
          owner_id: userId,
          tier: 'team',
          stripe_subscription_id: subscriptionId,
        })
        .select('id')
        .single();

      if (newOrg) {
        // Add owner as org member
        await adminClient.from('org_members').insert({
          org_id: newOrg.id,
          user_id: userId,
          role: 'owner',
        });
      }
    } else {
      // Update existing org with subscription ID
      await adminClient
        .from('organizations')
        .update({
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('owner_id', userId);
    }
  }

  console.log(`checkout.session.completed: user ${userId} upgraded to ${newTier}`);
}

// ---------------------------------------------------------------------------
// customer.subscription.updated
// Sync tier and seat count when subscription changes
// ---------------------------------------------------------------------------
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const adminClient = createAdminClient();
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  // Look up user by stripe_customer_id
  const { data: userRow } = await adminClient
    .from('users')
    .select('id, tier')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!userRow) {
    console.error(`subscription.updated: no user found for customer ${customerId}`);
    return;
  }

  const item = subscription.items.data[0];
  if (!item) {
    console.error(`subscription.updated: no line items on subscription ${subscription.id}`);
    return;
  }

  // Determine tier from price ID
  const priceId = item.price.id;
  let newTier: UserTier;

  if (priceId === STRIPE_PRO_PRICE_ID) {
    newTier = 'pro';
  } else if (priceId === STRIPE_TEAM_PRICE_ID) {
    newTier = 'team';
  } else {
    console.log(`subscription.updated: unrecognized price ${priceId}, skipping tier sync`);
    return;
  }

  // Update user tier if changed
  if (userRow.tier !== newTier) {
    await adminClient
      .from('users')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('id', userRow.id);
  }

  // For team subscriptions, sync the seat count on the organization
  if (newTier === 'team') {
    const seatQuantity = item.quantity ?? 1;

    await adminClient
      .from('organizations')
      .update({
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', userRow.id);

    console.log(`subscription.updated: user ${userRow.id} team seats = ${seatQuantity}`);
  }

  console.log(`subscription.updated: user ${userRow.id} tier synced to ${newTier}`);
}

// ---------------------------------------------------------------------------
// customer.subscription.deleted
// Downgrade to free and hide private content
// ---------------------------------------------------------------------------
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const adminClient = createAdminClient();
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  // Look up user
  const { data: userRow } = await adminClient
    .from('users')
    .select('id, tier')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!userRow) {
    console.error(`subscription.deleted: no user found for customer ${customerId}`);
    return;
  }

  // Downgrade to free
  await adminClient
    .from('users')
    .update({ tier: 'free', updated_at: new Date().toISOString() })
    .eq('id', userRow.id);

  // Hide private content (set visibility to private — content is NOT deleted)
  // This hides it from public views; user can resubscribe to restore access
  await adminClient
    .from('content')
    .update({ visibility: 'private', updated_at: new Date().toISOString() })
    .eq('owner_id', userRow.id)
    .eq('visibility', 'private');

  // If they had a team org, clear the subscription ID
  if (userRow.tier === 'team') {
    await adminClient
      .from('organizations')
      .update({
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', userRow.id);
  }

  console.log(`subscription.deleted: user ${userRow.id} downgraded to free`);
}

// ---------------------------------------------------------------------------
// invoice.payment_failed
// Flag the account — user keeps access until subscription is actually deleted
// ---------------------------------------------------------------------------
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const adminClient = createAdminClient();
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  if (!customerId) {
    console.error('invoice.payment_failed: missing customer ID');
    return;
  }

  const { data: userRow } = await adminClient
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!userRow) {
    console.error(`invoice.payment_failed: no user found for customer ${customerId}`);
    return;
  }

  // Log the payment failure for monitoring/alerting
  // In production, this would trigger an email notification or alert
  console.warn(
    `invoice.payment_failed: user ${userRow.id} (${userRow.email}) — ` +
    `invoice ${invoice.id}, attempt ${invoice.attempt_count}`
  );
}
```

### Run

```bash
cd apps/api && pnpm typecheck
```

### Commit

```
feat(api): add stripe webhook handlers for subscription lifecycle events
```

---

## Task 4: Mount Billing Routes in app.ts and Update Environment Config

Wire the billing routes into the main Hono app. The webhook endpoint needs to receive the raw request body (not JSON-parsed), so it is mounted after auth middleware but the webhook route itself skips auth (Stripe signs the payload instead). Also create a `.env.example` with the new Stripe variables.

### Files to create/modify

- **Modify:** `apps/api/src/app.ts`
- **Create:** `apps/api/.env.example`

### Steps

- [ ] **4.1** Update `apps/api/src/app.ts` to import and mount billing routes:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types.js';
import { healthRoutes } from './routes/health.js';
import { contentRoutes } from './routes/content.js';
import { searchRoutes } from './routes/search.js';
import { authRoutes } from './routes/auth.js';
import { publishRoutes } from './routes/publish.js';
import { orgRoutes } from './routes/orgs.js';
import { adminRoutes } from './routes/admin.js';
import { billingRoutes } from './routes/billing.js';
import { optionalAuth } from './middleware/auth.js';
import { rateLimiter } from './middleware/rate-limit.js';

export function createApp(): Hono<Env> {
  const app = new Hono<Env>();

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    })
  );

  // Optional auth on all v1 routes
  app.use('/v1/*', optionalAuth());

  // Rate limiting (after auth so it can read the auth context)
  app.use('/v1/*', rateLimiter());

  // Mount route modules
  app.route('/', healthRoutes);
  app.route('/v1', contentRoutes);
  app.route('/v1', searchRoutes);
  app.route('/v1', authRoutes);
  app.route('/v1', publishRoutes);
  app.route('/v1', orgRoutes);
  app.route('/v1', adminRoutes);
  app.route('/v1', billingRoutes);

  return app;
}
```

- [ ] **4.2** Create `apps/api/.env.example`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# Server
PORT=3001
```

### Run

```bash
cd apps/api && pnpm typecheck
```

### Commit

```
feat(api): mount billing routes and add .env.example with stripe config
```

---

## Task 5: Verify Build Compiles and Dev Server Boots

Run the full build pipeline and confirm the dev server starts without errors. This is a validation-only task with no code changes.

### Steps

- [ ] **5.1** Run TypeScript type-checking:

```bash
cd apps/api && pnpm typecheck
```

Expected: exits with code 0 and no errors.

- [ ] **5.2** Run the production build:

```bash
cd apps/api && pnpm build
```

Expected: `dist/` directory is created with compiled JS. Exits with code 0.

- [ ] **5.3** Verify the dev server boots (with placeholder env vars):

```bash
cd apps/api && SUPABASE_URL=https://placeholder.supabase.co \
  SUPABASE_ANON_KEY=placeholder \
  SUPABASE_SERVICE_ROLE_KEY=placeholder \
  STRIPE_SECRET_KEY=sk_test_placeholder \
  STRIPE_WEBHOOK_SECRET=whsec_placeholder \
  STRIPE_PRO_PRICE_ID=price_placeholder \
  STRIPE_TEAM_PRICE_ID=price_placeholder \
  timeout 5 pnpm dev || true
```

Expected: Server prints `Decantr API v2 running at http://localhost:3001` before the timeout kills it. The Stripe client initializes (validation of env vars passes). If it throws on invalid Stripe key format, that is acceptable at this stage — the important thing is that module resolution and imports work.

- [ ] **5.4** Run existing tests to confirm no regressions:

```bash
cd apps/api && pnpm test
```

Expected: all existing tests pass. No billing-specific tests are added in this phase (those come later with integration test infrastructure).

### Commit

No commit for this task — it is validation only.

---

## Summary of Files

| Action | File Path |
|--------|-----------|
| Create | `apps/api/src/stripe/client.ts` |
| Create | `apps/api/src/stripe/index.ts` |
| Create | `apps/api/src/stripe/webhooks.ts` |
| Create | `apps/api/src/routes/billing.ts` |
| Create | `apps/api/.env.example` |
| Modify | `apps/api/src/app.ts` |
| Modify | `apps/api/package.json` (via `pnpm add stripe`) |

## Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/billing/checkout` | Required | Create Stripe Checkout session for Pro or Team upgrade |
| `POST` | `/v1/billing/portal` | Required | Create Stripe Billing Portal session |
| `GET` | `/v1/billing/status` | Required | Get current subscription and tier info |
| `POST` | `/v1/billing/webhooks` | None (Stripe signature) | Receive and process Stripe webhook events |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for the Pro plan ($29/mo) |
| `STRIPE_TEAM_PRICE_ID` | Stripe Price ID for the Team plan ($99/seat/mo) |

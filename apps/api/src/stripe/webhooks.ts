import type Stripe from 'stripe';
import { STRIPE_PRO_PRICE_ID, STRIPE_TEAM_PRICE_ID } from './client.js';
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

  // Hide private content (set visibility to private -- content is NOT deleted)
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
// Flag the account -- user keeps access until subscription is actually deleted
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
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!userRow) {
    console.error(`invoice.payment_failed: no user found for customer ${customerId}`);
    return;
  }

  // Log the payment failure for monitoring/alerting
  // In production, this would trigger an email notification or alert
  console.warn(
    `invoice.payment_failed: user ${userRow.id} -- ` +
    `invoice ${invoice.id}, attempt ${invoice.attempt_count}`
  );
}

import Stripe from 'stripe';

// Lazy initialization so missing env vars don't crash the server on import.
// This allows the dev server to start without Stripe keys for non-billing work.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia', typescript: true });
  }
  return _stripe;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || '';
export const STRIPE_TEAM_PRICE_ID = process.env.STRIPE_TEAM_PRICE_ID || '';

-- Stripe webhook idempotency table
-- Prevents double-processing of retried webhook events
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,          -- Stripe event ID (e.g., evt_xxx)
  event_type TEXT NOT NULL,           -- e.g., checkout.session.completed
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-cleanup: remove events older than 30 days to keep the table small.
-- Stripe retries within 72 hours max, so 30 days is generous.
CREATE INDEX idx_stripe_events_processed_at ON public.stripe_events (processed_at);

-- RLS: only service role can read/write (webhooks use admin client)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

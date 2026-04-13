CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('api_request')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  source TEXT NOT NULL DEFAULT 'jwt' CHECK (source IN ('jwt', 'api_key')),
  path TEXT,
  method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_events_user_metric_created_at
  ON public.usage_events(user_id, metric, created_at DESC);
CREATE INDEX idx_usage_events_org_metric_created_at
  ON public.usage_events(org_id, metric, created_at DESC);
CREATE INDEX idx_usage_events_created_at
  ON public.usage_events(created_at DESC);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_events_select_own ON public.usage_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY usage_events_select_org ON public.usage_events
  FOR SELECT USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.usage_events IS 'Durable billable usage ledger for authenticated hosted product activity.';

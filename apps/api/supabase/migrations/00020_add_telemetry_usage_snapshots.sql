CREATE TABLE IF NOT EXISTS public.telemetry_usage_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  range_days INTEGER NOT NULL CHECK (range_days IN (1, 7, 14, 30, 90)),
  actor_type TEXT NOT NULL DEFAULT 'all' CHECK (actor_type IN ('all', 'anonymous', 'customer', 'internal', 'official_pipeline', 'service')),
  source TEXT NOT NULL DEFAULT 'all' CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'mcp', 'registry-web')),
  total_events INTEGER NOT NULL DEFAULT 0 CHECK (total_events >= 0),
  customer_events INTEGER NOT NULL DEFAULT 0 CHECK (customer_events >= 0),
  internal_events INTEGER NOT NULL DEFAULT 0 CHECK (internal_events >= 0),
  official_pipeline_events INTEGER NOT NULL DEFAULT 0 CHECK (official_pipeline_events >= 0),
  anonymous_events INTEGER NOT NULL DEFAULT 0 CHECK (anonymous_events >= 0),
  service_events INTEGER NOT NULL DEFAULT 0 CHECK (service_events >= 0),
  unclassified_events INTEGER NOT NULL DEFAULT 0 CHECK (unclassified_events >= 0),
  failure_events INTEGER NOT NULL DEFAULT 0 CHECK (failure_events >= 0),
  active_identities INTEGER NOT NULL DEFAULT 0 CHECK (active_identities >= 0),
  active_anonymous_ids INTEGER NOT NULL DEFAULT 0 CHECK (active_anonymous_ids >= 0),
  active_installs INTEGER NOT NULL DEFAULT 0 CHECK (active_installs >= 0),
  active_projects INTEGER NOT NULL DEFAULT 0 CHECK (active_projects >= 0),
  active_orgs INTEGER NOT NULL DEFAULT 0 CHECK (active_orgs >= 0),
  candidate_aliases INTEGER NOT NULL DEFAULT 0 CHECK (candidate_aliases >= 0),
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  trends JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_mix JSONB NOT NULL DEFAULT '[]'::jsonb,
  actor_mix JSONB NOT NULL DEFAULT '[]'::jsonb,
  event_counts JSONB NOT NULL DEFAULT '[]'::jsonb,
  failure_counts JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_quality JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date, range_days, actor_type, source)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_usage_snapshots_captured_at
  ON public.telemetry_usage_snapshots(captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_usage_snapshots_filter
  ON public.telemetry_usage_snapshots(actor_type, source, range_days, snapshot_date DESC);

ALTER TABLE public.telemetry_usage_snapshots ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS telemetry_usage_snapshots_updated_at ON public.telemetry_usage_snapshots;
CREATE TRIGGER telemetry_usage_snapshots_updated_at
  BEFORE UPDATE ON public.telemetry_usage_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.telemetry_signal_bucket_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_snapshot_id UUID NOT NULL REFERENCES public.telemetry_usage_snapshots(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  range_days INTEGER NOT NULL CHECK (range_days IN (1, 7, 14, 30, 90)),
  actor_type TEXT NOT NULL DEFAULT 'all' CHECK (actor_type IN ('all', 'anonymous', 'customer', 'internal', 'official_pipeline', 'service')),
  source TEXT NOT NULL DEFAULT 'all' CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'mcp', 'registry-web')),
  bucket_key TEXT NOT NULL,
  label TEXT NOT NULL,
  current_events INTEGER NOT NULL DEFAULT 0 CHECK (current_events >= 0),
  previous_events INTEGER NOT NULL DEFAULT 0 CHECK (previous_events >= 0),
  delta INTEGER NOT NULL DEFAULT 0,
  change_rate NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usage_snapshot_id, bucket_key)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_signal_bucket_snapshots_lookup
  ON public.telemetry_signal_bucket_snapshots(usage_snapshot_id, bucket_key);

CREATE INDEX IF NOT EXISTS idx_telemetry_signal_bucket_snapshots_filter
  ON public.telemetry_signal_bucket_snapshots(bucket_key, actor_type, source, snapshot_date DESC);

ALTER TABLE public.telemetry_signal_bucket_snapshots ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.telemetry_operating_alert_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_snapshot_id UUID NOT NULL REFERENCES public.telemetry_usage_snapshots(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  range_days INTEGER NOT NULL CHECK (range_days IN (1, 7, 14, 30, 90)),
  actor_type TEXT NOT NULL DEFAULT 'all' CHECK (actor_type IN ('all', 'anonymous', 'customer', 'internal', 'official_pipeline', 'service')),
  source TEXT NOT NULL DEFAULT 'all' CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'mcp', 'registry-web')),
  level TEXT NOT NULL CHECK (level IN ('critical', 'info', 'warning')),
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_operating_alert_snapshots_lookup
  ON public.telemetry_operating_alert_snapshots(usage_snapshot_id, level);

CREATE INDEX IF NOT EXISTS idx_telemetry_operating_alert_snapshots_filter
  ON public.telemetry_operating_alert_snapshots(level, actor_type, source, snapshot_date DESC);

ALTER TABLE public.telemetry_operating_alert_snapshots ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.telemetry_usage_snapshots IS 'Durable Decantr-owned telemetry usage rollups derived from PostHog for operator reporting and future customer dashboards.';
COMMENT ON TABLE public.telemetry_signal_bucket_snapshots IS 'Per-snapshot product adoption bucket metrics for durable Decantr telemetry intelligence.';
COMMENT ON TABLE public.telemetry_operating_alert_snapshots IS 'Per-snapshot telemetry operating alerts for reporting and notification workflows.';

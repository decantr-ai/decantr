CREATE TABLE IF NOT EXISTS public.telemetry_attribution_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  range_days INTEGER NOT NULL CHECK (range_days IN (1, 7, 14, 30, 90)),
  actor_type TEXT NOT NULL DEFAULT 'all' CHECK (actor_type IN ('all', 'anonymous', 'customer', 'internal', 'official_pipeline', 'service')),
  source TEXT NOT NULL DEFAULT 'all' CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'mcp', 'registry-web')),
  row_rank INTEGER NOT NULL DEFAULT 0 CHECK (row_rank >= 0),
  row_actor_type TEXT NOT NULL DEFAULT 'unclassified' CHECK (row_actor_type IN ('anonymous', 'customer', 'internal', 'official_pipeline', 'service', 'unclassified')),
  row_source TEXT NOT NULL DEFAULT 'unknown',
  org_id TEXT,
  org_name TEXT,
  org_slug TEXT,
  org_tier TEXT CHECK (org_tier IS NULL OR org_tier IN ('team', 'enterprise')),
  org_is_internal BOOLEAN NOT NULL DEFAULT false,
  org_is_test BOOLEAN NOT NULL DEFAULT false,
  project_id TEXT,
  events INTEGER NOT NULL DEFAULT 0 CHECK (events >= 0),
  last_seen TIMESTAMPTZ,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_telemetry_attribution_snapshots_unique
  ON public.telemetry_attribution_snapshots(
    snapshot_date,
    range_days,
    actor_type,
    source,
    row_actor_type,
    row_source,
    COALESCE(org_id, '__none__'),
    COALESCE(project_id, '__none__')
  );

CREATE INDEX IF NOT EXISTS idx_telemetry_attribution_snapshots_captured_at
  ON public.telemetry_attribution_snapshots(captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_attribution_snapshots_filter
  ON public.telemetry_attribution_snapshots(actor_type, source, range_days, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_attribution_snapshots_org
  ON public.telemetry_attribution_snapshots(org_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_attribution_snapshots_project
  ON public.telemetry_attribution_snapshots(project_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_attribution_snapshots_row
  ON public.telemetry_attribution_snapshots(row_actor_type, row_source, snapshot_date DESC);

ALTER TABLE public.telemetry_attribution_snapshots ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS telemetry_attribution_snapshots_updated_at ON public.telemetry_attribution_snapshots;
CREATE TRIGGER telemetry_attribution_snapshots_updated_at
  BEFORE UPDATE ON public.telemetry_attribution_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

COMMENT ON TABLE public.telemetry_attribution_snapshots IS 'Durable Decantr-owned org/project attribution rollups derived from PostHog for customer adoption reporting and future private-registry dashboards.';

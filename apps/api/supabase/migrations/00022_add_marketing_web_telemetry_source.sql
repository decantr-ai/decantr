ALTER TABLE public.telemetry_usage_snapshots
  DROP CONSTRAINT IF EXISTS telemetry_usage_snapshots_source_check,
  ADD CONSTRAINT telemetry_usage_snapshots_source_check
    CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'marketing-web', 'mcp', 'registry-web'));

ALTER TABLE public.telemetry_signal_bucket_snapshots
  DROP CONSTRAINT IF EXISTS telemetry_signal_bucket_snapshots_source_check,
  ADD CONSTRAINT telemetry_signal_bucket_snapshots_source_check
    CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'marketing-web', 'mcp', 'registry-web'));

ALTER TABLE public.telemetry_operating_alert_snapshots
  DROP CONSTRAINT IF EXISTS telemetry_operating_alert_snapshots_source_check,
  ADD CONSTRAINT telemetry_operating_alert_snapshots_source_check
    CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'marketing-web', 'mcp', 'registry-web'));

ALTER TABLE public.telemetry_attribution_snapshots
  DROP CONSTRAINT IF EXISTS telemetry_attribution_snapshots_source_check,
  ADD CONSTRAINT telemetry_attribution_snapshots_source_check
    CHECK (source IN ('all', 'api', 'cli', 'content-ci', 'marketing-web', 'mcp', 'registry-web'));

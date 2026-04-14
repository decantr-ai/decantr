ALTER TABLE public.usage_events
  DROP CONSTRAINT IF EXISTS usage_events_metric_check;

ALTER TABLE public.usage_events
  ADD CONSTRAINT usage_events_metric_check
  CHECK (metric IN (
    'api_request',
    'content_publish',
    'private_package_publish',
    'org_package_publish',
    'approval_action'
  ));

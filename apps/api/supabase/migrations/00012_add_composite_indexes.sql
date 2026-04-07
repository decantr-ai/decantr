-- Composite indexes for common multi-column query patterns.
-- These replace bitmap AND scans across single-column indexes with single seeks.

-- Browse by type: GET /v1/patterns, /v1/themes, etc.
CREATE INDEX IF NOT EXISTS idx_content_type_status_vis
  ON public.content(type, status, visibility);

-- Browse by namespace: GET /v1/patterns?namespace=@official
CREATE INDEX IF NOT EXISTS idx_content_ns_status_vis
  ON public.content(namespace, status, visibility);

-- User dashboard / publishing: content owned by a specific user
CREATE INDEX IF NOT EXISTS idx_content_owner_status
  ON public.content(owner_id, status);

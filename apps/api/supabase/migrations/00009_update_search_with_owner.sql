-- Drop existing function first since return type is changing
DROP FUNCTION IF EXISTS public.search_content(TEXT, TEXT, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.search_content(
  search_query TEXT,
  content_type TEXT DEFAULT NULL,
  content_namespace TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  slug TEXT,
  namespace TEXT,
  version TEXT,
  data JSONB,
  published_at TIMESTAMPTZ,
  owner_display_name TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.type,
    c.slug,
    c.namespace,
    c.version,
    c.data,
    c.published_at,
    u.display_name AS owner_display_name,
    COUNT(*) OVER() AS total_count
  FROM public.content c
  LEFT JOIN public.users u ON u.id = c.owner_id
  WHERE
    c.visibility = 'public'
    AND c.status = 'published'
    AND (
      c.slug ILIKE '%' || search_query || '%'
      OR (c.data->>'name') ILIKE '%' || search_query || '%'
      OR (c.data->>'description') ILIKE '%' || search_query || '%'
      OR (c.data->>'id') ILIKE '%' || search_query || '%'
    )
    AND (content_type IS NULL OR c.type = content_type)
    AND (content_namespace IS NULL OR c.namespace = content_namespace)
  ORDER BY
    CASE
      WHEN c.slug = search_query THEN 0
      WHEN c.slug ILIKE search_query || '%' THEN 1
      WHEN (c.data->>'name') ILIKE search_query || '%' THEN 2
      ELSE 3
    END,
    c.published_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

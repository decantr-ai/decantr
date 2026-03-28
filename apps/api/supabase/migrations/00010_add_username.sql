-- Add username column to users table
ALTER TABLE public.users ADD COLUMN username TEXT;

-- Create a helper to generate a slug from text
-- Strips non-alphanumeric, lowercases, replaces spaces with hyphens, trims hyphens
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(trim(input)),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '[\s-]+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill: generate username from display_name, falling back to email prefix
-- Append a random suffix to avoid collisions during backfill
UPDATE public.users
SET username = public.slugify(
  COALESCE(display_name, split_part(email, '@', 1))
) || '-' || substr(gen_random_uuid()::text, 1, 4)
WHERE username IS NULL;

-- Now make it NOT NULL and add unique constraint + index
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
CREATE INDEX idx_users_username ON public.users(username);

-- Add a CHECK constraint for format: 3-30 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
ALTER TABLE public.users ADD CONSTRAINT users_username_format CHECK (
  username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
);

-- Update handle_new_user trigger to auto-generate username on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  candidate TEXT;
  counter INTEGER := 0;
BEGIN
  -- Derive base username from auth metadata or email
  base_username := public.slugify(
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  );

  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || '-user';
  END IF;

  -- Truncate to 30 chars max
  base_username := left(base_username, 30);

  -- Ensure it ends with alphanumeric (trim trailing hyphens)
  base_username := trim(both '-' from base_username);

  -- Find a unique username by appending a counter if needed
  candidate := base_username;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE users.username = candidate) LOOP
    counter := counter + 1;
    candidate := left(base_username, 30 - length(counter::text) - 1) || '-' || counter::text;
  END LOOP;

  INSERT INTO public.users (id, email, display_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    ),
    candidate
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy allowing anyone to read username, display_name, reputation_score, tier, created_at
-- This is needed for the public profile page
CREATE POLICY users_public_read ON public.users
  FOR SELECT
  USING (true);

-- Drop the old select-own policy since the public read policy is more permissive
-- The API layer controls which fields are exposed publicly
DROP POLICY IF EXISTS users_select_own ON public.users;

-- Update the search function to also return owner_username
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
  owner_username TEXT,
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
    u.username AS owner_username,
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

COMMENT ON COLUMN public.users.username IS 'Unique URL-safe username (3-30 chars, lowercase alphanumeric + hyphens)';

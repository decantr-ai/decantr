ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_telemetry_flags
  ON public.users(is_internal, is_test)
  WHERE is_internal OR is_test;

CREATE INDEX IF NOT EXISTS idx_organizations_telemetry_flags
  ON public.organizations(is_internal, is_test)
  WHERE is_internal OR is_test;

CREATE TABLE IF NOT EXISTS public.telemetry_identity_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_type TEXT NOT NULL CHECK (identity_type IN ('anonymous', 'install', 'project')),
  identity_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('anonymous', 'customer', 'internal', 'official_pipeline', 'service')),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (identity_type, identity_id)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_identity_aliases_actor_type
  ON public.telemetry_identity_aliases(actor_type);

CREATE INDEX IF NOT EXISTS idx_telemetry_identity_aliases_user_id
  ON public.telemetry_identity_aliases(user_id);

CREATE INDEX IF NOT EXISTS idx_telemetry_identity_aliases_org_id
  ON public.telemetry_identity_aliases(org_id);

ALTER TABLE public.telemetry_identity_aliases ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS telemetry_identity_aliases_updated_at ON public.telemetry_identity_aliases;
CREATE TRIGGER telemetry_identity_aliases_updated_at
  BEFORE UPDATE ON public.telemetry_identity_aliases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

UPDATE public.organizations
SET is_internal = true
WHERE slug = 'decantr';

UPDATE public.users
SET is_internal = true
WHERE email ILIKE '%@decantr.ai'
  OR id IN (
    SELECT owner_id FROM public.organizations WHERE slug = 'decantr'
  )
  OR id IN (
    SELECT user_id
    FROM public.org_members
    WHERE org_id IN (SELECT id FROM public.organizations WHERE slug = 'decantr')
  );

UPDATE public.organizations
SET is_test = true
WHERE slug LIKE 'qa-%'
  OR slug LIKE 'decantr-test-%';

UPDATE public.users
SET is_test = true
WHERE email ILIKE '%@decantr.test'
  OR email ILIKE '%@example.com'
  OR id IN (
    SELECT user_id
    FROM public.org_members
    WHERE org_id IN (
      SELECT id
      FROM public.organizations
      WHERE slug LIKE 'qa-%'
         OR slug LIKE 'decantr-test-%'
    )
  );

COMMENT ON COLUMN public.users.is_internal IS 'Marks Decantr-owned users for product telemetry exclusion and internal diagnostics.';
COMMENT ON COLUMN public.users.is_test IS 'Marks synthetic or QA users for product telemetry exclusion and diagnostics.';
COMMENT ON COLUMN public.organizations.is_internal IS 'Marks Decantr-owned organizations for product telemetry exclusion and internal diagnostics.';
COMMENT ON COLUMN public.organizations.is_test IS 'Marks synthetic or QA organizations for product telemetry exclusion and diagnostics.';
COMMENT ON TABLE public.telemetry_identity_aliases IS 'Opaque install, project, and anonymous telemetry identity overrides for server-side actor attribution.';

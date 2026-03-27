CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read'],
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_org_id ON public.api_keys(org_id);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_keys_select_own ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY api_keys_insert_own ON public.api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY api_keys_update_own ON public.api_keys
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY api_keys_delete_own ON public.api_keys
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY api_keys_select_org ON public.api_keys
  FOR SELECT USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

COMMENT ON TABLE public.api_keys IS 'API keys for programmatic access';

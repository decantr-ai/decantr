CREATE TABLE public.organization_policies (
  org_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  require_public_content_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY organization_policies_select_org ON public.organization_policies
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY organization_policies_update_owner_admin ON public.organization_policies
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

COMMENT ON TABLE public.organization_policies IS 'Organization governance toggles and approval behavior.';

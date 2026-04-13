ALTER TABLE public.organizations
  ADD COLUMN seat_limit INTEGER NOT NULL DEFAULT 1;

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('user', 'organization', 'billing', 'content', 'membership')),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor_user_id ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_org_id ON public.audit_logs(org_id);
CREATE INDEX idx_audit_logs_scope ON public.audit_logs(scope);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_details ON public.audit_logs USING GIN (details);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select_actor ON public.audit_logs
  FOR SELECT USING (actor_user_id = auth.uid());

CREATE POLICY audit_logs_select_org ON public.audit_logs
  FOR SELECT USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

COMMENT ON COLUMN public.organizations.seat_limit IS 'Current billable seat allowance for the organization.';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for billing, membership, content, and org governance actions.';

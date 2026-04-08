CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('pattern', 'theme', 'blueprint', 'archetype', 'shell')),
  slug TEXT NOT NULL,
  namespace TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id),
  org_id UUID REFERENCES public.organizations(id),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  version TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE (namespace, type, slug)
);

CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_content_namespace ON public.content(namespace);
CREATE INDEX idx_content_owner_id ON public.content(owner_id);
CREATE INDEX idx_content_org_id ON public.content(org_id);
CREATE INDEX idx_content_status ON public.content(status);
CREATE INDEX idx_content_visibility ON public.content(visibility);
CREATE INDEX idx_content_data ON public.content USING GIN (data);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_select_public ON public.content
  FOR SELECT USING (
    visibility = 'public' AND status = 'published'
  );

CREATE POLICY content_select_own ON public.content
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY content_select_org ON public.content
  FOR SELECT USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY content_insert_own ON public.content
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY content_update_own ON public.content
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY content_update_org ON public.content
  FOR UPDATE USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY content_delete_own ON public.content
  FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY content_delete_org ON public.content
  FOR DELETE USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE TABLE public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

CREATE INDEX idx_content_versions_content_id ON public.content_versions(content_id);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_versions_select ON public.content_versions
  FOR SELECT USING (
    content_id IN (SELECT id FROM public.content)
  );

COMMENT ON TABLE public.content IS 'Registry content items (patterns, themes, etc.)';
COMMENT ON TABLE public.content_versions IS 'Version history for content items';

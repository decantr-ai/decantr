CREATE TABLE public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  notes TEXT
);

CREATE INDEX idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX idx_moderation_queue_submitted_by ON public.moderation_queue(submitted_by);
CREATE INDEX idx_moderation_queue_submitted_at ON public.moderation_queue(submitted_at);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY moderation_select_own ON public.moderation_queue
  FOR SELECT USING (submitted_by = auth.uid());

COMMENT ON TABLE public.moderation_queue IS 'Content moderation queue for community submissions';

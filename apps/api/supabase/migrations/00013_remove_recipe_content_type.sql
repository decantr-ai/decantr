-- Retire the legacy "recipe" content type from the registry platform.
-- Any remaining rows are removed before the stricter constraint is applied.

DELETE FROM public.content
WHERE type = 'recipe';

ALTER TABLE public.content
  DROP CONSTRAINT IF EXISTS content_type_check;

ALTER TABLE public.content
  ADD CONSTRAINT content_type_check
  CHECK (type IN ('pattern', 'theme', 'blueprint', 'archetype', 'shell'));

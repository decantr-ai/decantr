CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.queue_content_for_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.namespace = '@community' THEN
    INSERT INTO public.moderation_queue (content_id, submitted_by)
    VALUES (NEW.id, NEW.owner_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER content_moderation_queue
  AFTER INSERT ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_content_for_moderation();

COMMENT ON FUNCTION public.update_updated_at IS 'Updates updated_at column on row update';
COMMENT ON FUNCTION public.handle_new_user IS 'Creates user profile when auth user signs up';
COMMENT ON FUNCTION public.queue_content_for_moderation IS 'Adds community content to moderation queue';

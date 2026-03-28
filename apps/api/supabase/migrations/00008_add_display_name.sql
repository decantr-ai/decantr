-- Add display_name column to users
ALTER TABLE public.users ADD COLUMN display_name TEXT;

-- Backfill from email (use part before @)
UPDATE public.users SET display_name = split_part(email, '@', 1) WHERE display_name IS NULL;

-- Update the handle_new_user trigger to also capture display name from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

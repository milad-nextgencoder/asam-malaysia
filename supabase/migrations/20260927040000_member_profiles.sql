-- Phase 1: Member profile table
-- Additive only. Does not modify existing tables.

CREATE TABLE public.member_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  middle_name text,
  last_name text,
  preferred_name text,
  email text,
  phone text,
  profile_photo_url text,
  university_id uuid REFERENCES public.universities(id) ON DELETE SET NULL,
  program text,
  faculty text,
  city text,
  state text,
  bio text,
  profile_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX member_profiles_user_id_idx ON public.member_profiles (user_id);
CREATE INDEX member_profiles_university_id_idx ON public.member_profiles (university_id);

CREATE TRIGGER member_profiles_set_updated_at
  BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_profiles_select_own
  ON public.member_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY member_profiles_insert_own
  ON public.member_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY member_profiles_update_own
  ON public.member_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Storage policy for member profile photos (existing bucket)
CREATE POLICY member_profiles_upload_own_photo
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'asam-public-media'
    AND (storage.foldername(name))[1] = 'member-profiles'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

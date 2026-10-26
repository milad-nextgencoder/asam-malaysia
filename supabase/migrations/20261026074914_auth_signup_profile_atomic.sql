-- Create the member profile in the same database transaction as every Auth account.
-- This prevents "signup succeeded but profile never appeared" when email confirmation
-- opens a PKCE link in another browser. Existing profiles and IDs are preserved.
BEGIN;

CREATE OR REPLACE FUNCTION asam_private.create_member_profile_for_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $function$
DECLARE
  first_name text;
  last_name text;
  preferred_name text;
BEGIN
  IF nullif(lower(btrim(NEW.email)), '') IS NULL THEN
    RETURN NEW;
  END IF;

  first_name := left(btrim(coalesce(NEW.raw_user_meta_data->>'first_name','')),100);
  last_name := left(btrim(coalesce(NEW.raw_user_meta_data->>'last_name','')),100);
  preferred_name := left(btrim(coalesce(
    nullif(NEW.raw_user_meta_data->>'preferred_name',''),
    nullif(NEW.raw_user_meta_data->>'full_name',''),
    nullif(NEW.raw_user_meta_data->>'name',''),
    concat_ws(' ',nullif(first_name,''),nullif(last_name,''))
  )),100);

  INSERT INTO public.member_profiles(user_id,email,first_name,last_name,preferred_name)
  VALUES(NEW.id,lower(btrim(NEW.email)),nullif(first_name,''),nullif(last_name,''),nullif(preferred_name,''))
  ON CONFLICT(user_id) DO NOTHING;

  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS asam_create_member_profile_after_auth_user ON auth.users;
CREATE TRIGGER asam_create_member_profile_after_auth_user
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION asam_private.create_member_profile_for_auth_user();
REVOKE ALL ON FUNCTION asam_private.create_member_profile_for_auth_user() FROM PUBLIC,anon,authenticated;

-- Repair all email accounts that were created before the trigger existed.
INSERT INTO public.member_profiles(user_id,email,first_name,last_name,preferred_name)
SELECT u.id,lower(btrim(u.email)),
  nullif(left(btrim(coalesce(u.raw_user_meta_data->>'first_name','')),100),''),
  nullif(left(btrim(coalesce(u.raw_user_meta_data->>'last_name','')),100),''),
  nullif(left(btrim(coalesce(
    nullif(u.raw_user_meta_data->>'preferred_name',''),
    nullif(u.raw_user_meta_data->>'full_name',''),
    nullif(u.raw_user_meta_data->>'name',''),
    concat_ws(' ',
      nullif(left(btrim(coalesce(u.raw_user_meta_data->>'first_name','')),100),''),
      nullif(left(btrim(coalesce(u.raw_user_meta_data->>'last_name','')),100),'')
    )
  )),100),'')
FROM auth.users u
WHERE nullif(lower(btrim(u.email)),'') IS NOT NULL
  AND NOT EXISTS(SELECT 1 FROM public.member_profiles p WHERE p.user_id=u.id)
ON CONFLICT(user_id) DO NOTHING;

COMMIT;

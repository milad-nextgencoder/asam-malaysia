-- Public certificate verification.
--
-- WHY: the QR code on every certificate resolves to
--   https://asam.org.my/certificate/{member_id}
-- and that page read public.membership_applications and public.member_profiles
-- with the anonymous key. Neither table has an anon SELECT policy, so every
-- anonymous scan was answered with "Certificate not found".
--
-- DESIGN: instead of exposing the tables, this adds one SECURITY DEFINER
-- function that returns only the fields a visitor needs to confirm a membership.
-- No email, phone, bio, photo or auth user id is returned. Row level security on
-- the underlying tables is untouched, so the private data model is unchanged.
--
-- The application already handles the case where this function does not exist
-- yet (lib/member/certificate.ts falls back to the owner/admin table read), so
-- applying this migration is additive and can be done at any time.
--
-- Member ids are only allocated by approve_membership_application(), so a
-- member_id match already implies an approved membership.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_public_certificate(p_member_id text)
RETURNS TABLE (
  member_id text,
  certificate_number text,
  status text,
  approved_at timestamptz,
  full_name text,
  university_name text,
  program text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $function$
  SELECT
    application.member_id,
    application.certificate_number,
    application.status,
    application.approved_at,
    COALESCE(
      NULLIF(BTRIM(profile.preferred_name), ''),
      NULLIF(BTRIM(CONCAT_WS(' ', profile.first_name, profile.last_name)), '')
    ) AS full_name,
    university.name AS university_name,
    profile.program AS program
  FROM public.membership_applications AS application
  LEFT JOIN public.member_profiles AS profile
    ON profile.user_id = application.user_id
  LEFT JOIN public.universities AS university
    ON university.id = profile.university_id
  WHERE application.member_id = p_member_id
    AND application.status = 'approved'
    AND application.member_id IS NOT NULL
  LIMIT 1;
$function$;

-- Exposed to anonymous visitors (QR scanners) and to signed-in members/admins.
GRANT EXECUTE ON FUNCTION public.get_public_certificate(text) TO anon, authenticated;

COMMENT ON FUNCTION public.get_public_certificate(text) IS
  'Public, read-only certificate lookup used by /certificate/{member_id} and /verify/member/{member_id}. Returns approved memberships only.';

COMMIT;

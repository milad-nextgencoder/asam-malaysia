-- Certificate number format consistency.
--
-- WHY: 20260929040000 documents the format as
--   ASAM-CERT-YYYY-NNNNNN  (example: ASAM-CERT-2026-000001)
-- but generates it with
--   'ASAM-CERT-' || SUBSTRING(member_id FROM 6) || '-' || SUBSTRING(member_id FROM 11)
-- which for ASAM-2026-000001 produces ASAM-CERT-2026-000001-000001 (the serial
-- number twice). The website fallback built the documented 3-part form, so a
-- certificate could display two different numbers depending on whether the
-- column was populated.
--
-- This migration makes the database match the documented format by moving the
-- expression into one IMMUTABLE helper, backfilling any existing 4-part value,
-- and reusing the helper for future approvals.
--
-- It does not change member_id, the membership state machine, or the transition
-- trigger installed in 20260929040000. The backfill only rewrites
-- certificate_number, which the trigger explicitly ignores (its early return
-- covers updates that touch no state field), so no state validation is bypassed.
--
-- Idempotent: running it twice is a no-op.

BEGIN;

-- ============================================================
-- 1. Single source of truth for the certificate number
-- ============================================================
CREATE OR REPLACE FUNCTION public.certificate_number_for(p_member_id text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
  v_match text[];
BEGIN
  IF p_member_id IS NULL OR BTRIM(p_member_id) = '' THEN
    RETURN NULL;
  END IF;

  -- MUST be regexp_match(), not SUBSTRING(... FROM <regex>).
  --
  -- SUBSTRING(<string> FROM <regex>) returns only the FIRST parenthesized
  -- subexpression, as scalar text. Wrapping it in ARRAY[...] therefore yields a
  -- one-element array whose [2] and [3] are always NULL, so the guard below
  -- never passed and every id fell through to the malformed fallback, producing
  -- 'ASAM-CERT-ASAM-2026-000001'. regexp_match() is the function that actually
  -- returns ALL capture groups as a text[].
  v_match := regexp_match(BTRIM(p_member_id), '^(ASAM)-(\d{4})-(\d{6})$');

  IF v_match[2] IS NOT NULL AND v_match[3] IS NOT NULL THEN
    RETURN 'ASAM-CERT-' || v_match[2] || '-' || v_match[3];
  END IF;

  -- Unexpected member id: keep a deterministic, readable fallback.
  RETURN 'ASAM-CERT-' || BTRIM(p_member_id);
END;
$function$;

COMMENT ON FUNCTION public.certificate_number_for(text) IS
  'Documented ASAM-CERT-YYYY-NNNNNN format. Mirrors certificateNumberFor() in lib/member/certificate-html.ts.';

-- ============================================================
-- 2. Backfill any value that does not already match the format
-- ============================================================
DO $block$
DECLARE
  v_before integer := 0;
  v_after integer := 0;
  v_bad integer := 0;
BEGIN
  SELECT COUNT(*) INTO v_before
  FROM public.membership_applications
  WHERE certificate_number IS DISTINCT FROM public.certificate_number_for(member_id);

  IF v_before > 0 THEN
    UPDATE public.membership_applications
    SET certificate_number = public.certificate_number_for(member_id)
    WHERE certificate_number IS DISTINCT FROM public.certificate_number_for(member_id);

    RAISE NOTICE 'certificate_number: normalised % row(s) to ASAM-CERT-YYYY-NNNNNN', v_before;
  END IF;

  -- Approved rows that never received a number.
  UPDATE public.membership_applications
  SET certificate_number = public.certificate_number_for(member_id)
  WHERE status = 'approved'
    AND member_id IS NOT NULL
    AND certificate_number IS NULL;

  -- Independent assertions.
  --
  -- The previous check compared certificate_number_for() against ITSELF, so a
  -- wrong implementation satisfied it and the migration committed corrupted data
  -- with no error. These checks are deliberately independent of the function.
  IF public.certificate_number_for('ASAM-2026-000001') IS DISTINCT FROM 'ASAM-CERT-2026-000001' THEN
    RAISE EXCEPTION
      'certificate_number_for() is broken: expected ASAM-CERT-2026-000001, got %',
      public.certificate_number_for('ASAM-2026-000001');
  END IF;

  IF public.certificate_number_for('ASAM-2026-000123') IS DISTINCT FROM 'ASAM-CERT-2026-000123' THEN
    RAISE EXCEPTION
      'certificate_number_for() is broken: expected ASAM-CERT-2026-000123, got %',
      public.certificate_number_for('ASAM-2026-000123');
  END IF;

  IF public.certificate_number_for(NULL) IS NOT NULL THEN
    RAISE EXCEPTION 'certificate_number_for(NULL) must return NULL';
  END IF;

  -- Every stored value must now match the documented format for a well-formed
  -- member id, and must never contain the doubled 'ASAM-CERT-ASAM-' shape.
  SELECT COUNT(*) INTO v_after
  FROM public.membership_applications
  WHERE member_id ~ '^ASAM-\d{4}-\d{6}$'
    AND certificate_number IS DISTINCT FROM public.certificate_number_for(member_id);

  SELECT COUNT(*) INTO v_bad
  FROM public.membership_applications
  WHERE certificate_number LIKE '%-ASAM-%';

  IF v_after > 0 OR v_bad > 0 THEN
    RAISE EXCEPTION
      'certificate_number normalisation incomplete: % row(s) still differ, % malformed. No commit.',
      v_after, v_bad;
  END IF;
END
$block$;

-- ============================================================
-- 3. Future approvals use the same helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_membership_application(p_member_user_id uuid)
RETURNS public.membership_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_admin_id uuid := auth.uid();
  v_admin_role text;
  v_application public.membership_applications;
  v_new_member_id text;
  v_result public.membership_applications;
BEGIN
  SELECT role INTO v_admin_role
  FROM public.admin_roles
  WHERE user_id = v_admin_id;

  IF v_admin_role IS NULL OR v_admin_role NOT IN ('SUPER_ADMIN', 'EDITOR') THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  SELECT * INTO v_application
  FROM public.membership_applications
  WHERE user_id = p_member_user_id;

  IF v_application IS NULL THEN
    RAISE EXCEPTION 'No membership application found.';
  END IF;

  IF v_application.status <> 'under_review' THEN
    RAISE EXCEPTION 'Only applications under review can be approved.';
  END IF;

  v_new_member_id := public.generate_member_id();

  UPDATE public.membership_applications
  SET status = 'approved',
      member_id = v_new_member_id,
      certificate_number = public.certificate_number_for(v_new_member_id),
      approved_at = now(),
      reviewed_at = now(),
      reviewed_by = v_admin_id
  WHERE user_id = p_member_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.approve_membership_application(uuid) TO authenticated;

COMMIT;

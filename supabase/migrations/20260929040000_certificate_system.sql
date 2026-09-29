-- Certificate System: Add certificate_number to membership_applications
-- The certificate number is derived from member_id for determinism.
-- Format: ASAM-CERT-YYYY-NNNNNN (e.g., ASAM-CERT-2026-000001)

-- ============================================================
-- 1. Add certificate_number column if it does not exist
-- ============================================================
ALTER TABLE public.membership_applications
  ADD COLUMN IF NOT EXISTS certificate_number text;

-- ============================================================
-- 2. Update trigger to ignore non-state updates
--    If NO membership-state fields are changing, the trigger
--    returns immediately without enforcing transitions.
--    This is safe: it only skips the check when status, member_id,
--    approved_at, reviewed_at, reviewed_by, and rejection_reason
--    are all unchanged. All existing transition validation is
--    preserved when any state field DOES change.
--
--    THIS MUST RUN BEFORE THE BACKFILL so the backfill UPDATE
--    does NOT fire the old state-transition enforcement.
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_membership_state_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Early return: if no membership-state fields are changing,
  -- this is not a state transition (e.g., certificate_number backfill).
  IF OLD.status = NEW.status
     AND OLD.member_id IS NOT DISTINCT FROM NEW.member_id
     AND OLD.approved_at IS NOT DISTINCT FROM NEW.approved_at
     AND OLD.reviewed_at IS NOT DISTINCT FROM NEW.reviewed_at
     AND OLD.reviewed_by IS NOT DISTINCT FROM NEW.reviewed_by
     AND OLD.rejection_reason IS NOT DISTINCT FROM NEW.rejection_reason
  THEN
    RETURN NEW;
  END IF;

  -- Check if current user is admin
  is_admin := public.is_admin();

  -- Allow admins to perform any valid transition
  IF is_admin THEN
    -- Validate the transition is legal
    IF OLD.status = 'draft' AND NEW.status IN ('submitted') THEN
      RETURN NEW;
    ELSIF OLD.status = 'submitted' AND NEW.status IN ('under_review') THEN
      RETURN NEW;
    ELSIF OLD.status = 'under_review' AND NEW.status IN ('approved', 'rejected') THEN
      RETURN NEW;
    ELSIF OLD.status = 'rejected' AND NEW.status IN ('submitted') THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Invalid membership status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;

  -- For non-admins, only allow rejected -> submitted (resubmission)
  IF NOT is_admin THEN
    IF OLD.status = 'rejected' AND NEW.status = 'submitted' THEN
      -- Ensure system fields are not being set
      IF NEW.member_id IS NOT NULL OR NEW.reviewed_by IS NOT NULL OR NEW.approved_at IS NOT NULL THEN
        RAISE EXCEPTION 'Members cannot set system-owned fields';
      END IF;
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Members can only resubmit rejected applications';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Backfill certificate_number for existing approved applications
--    This UPDATE only sets certificate_number and does NOT change
--    any membership-state fields (status, member_id, approved_at,
--    reviewed_at, reviewed_by, rejection_reason).
--    The trigger replacement in step 2 ensures this backfill
--    does NOT fire the state-transition enforcement.
-- ============================================================
UPDATE public.membership_applications
SET certificate_number = 'ASAM-CERT-' || SUBSTRING(member_id FROM 6) || '-' || SUBSTRING(member_id FROM 11)
WHERE status = 'approved' AND member_id IS NOT NULL AND certificate_number IS NULL;

-- ============================================================
-- 4. Unique constraint on certificate_number
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS membership_applications_certificate_number_key
  ON public.membership_applications (certificate_number);

-- ============================================================
-- 5. Index for certificate lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS membership_applications_certificate_number_idx
  ON public.membership_applications (certificate_number);

-- ============================================================
-- 6. Update approve_membership_application() to also set certificate_number
--    for NEW approvals. Existing logic is preserved exactly.
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_membership_application(p_member_user_id uuid)
RETURNS public.membership_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_admin_role text;
  v_application public.membership_applications;
  v_new_member_id text;
  v_result public.membership_applications;
BEGIN
  -- Verify admin
  SELECT role INTO v_admin_role
  FROM public.admin_roles
  WHERE user_id = v_admin_id;

  IF v_admin_role IS NULL OR v_admin_role NOT IN ('SUPER_ADMIN', 'EDITOR') THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  -- Get application
  SELECT * INTO v_application
  FROM public.membership_applications
  WHERE user_id = p_member_user_id;

  IF v_application IS NULL THEN
    RAISE EXCEPTION 'No membership application found.';
  END IF;

  IF v_application.status <> 'under_review' THEN
    RAISE EXCEPTION 'Only applications under review can be approved.';
  END IF;

  -- Generate Member ID atomically
  v_new_member_id := public.generate_member_id();

  -- Update with both member_id and certificate_number
  UPDATE public.membership_applications
  SET status = 'approved',
      member_id = v_new_member_id,
      certificate_number = 'ASAM-CERT-' || SUBSTRING(v_new_member_id FROM 6) || '-' || SUBSTRING(v_new_member_id FROM 11),
      approved_at = now(),
      reviewed_at = now(),
      reviewed_by = v_admin_id
  WHERE user_id = p_member_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated
GRANT EXECUTE ON FUNCTION public.approve_membership_application(uuid) TO authenticated;

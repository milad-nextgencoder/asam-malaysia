-- Phase 3 Final Security Repair
-- Additive only. Does not modify existing tables or drop anything.

-- ============================================================
-- 1. Remove the dangerous broad member UPDATE policy
-- ============================================================
DROP POLICY IF EXISTS membership_applications_update_own
  ON public.membership_applications;

-- ============================================================
-- 2. Fix member INSERT policy — only allow DRAFT with null system fields
-- ============================================================
DROP POLICY IF EXISTS membership_applications_insert_own
  ON public.membership_applications;

CREATE POLICY membership_applications_insert_own
  ON public.membership_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'draft'
    AND member_id IS NULL
    AND rejection_reason IS NULL
    AND application_submitted_at IS NULL
    AND reviewed_at IS NULL
    AND reviewed_by IS NULL
    AND approved_at IS NULL
  );

-- ============================================================
-- 3. State transition enforcement trigger
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

DROP TRIGGER IF EXISTS enforce_membership_state_transition
  ON public.membership_applications;

CREATE TRIGGER enforce_membership_state_transition
  BEFORE UPDATE ON public.membership_applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_membership_state_transition();

-- ============================================================
-- 4. Secure SECURITY DEFINER functions for member operations
-- ============================================================

-- Function: Submit or resubmit membership application
CREATE OR REPLACE FUNCTION public.submit_membership_application()
RETURNS public.membership_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile_completed boolean;
  v_existing public.membership_applications;
  v_result public.membership_applications;
BEGIN
  -- Check profile completion
  SELECT profile_completed INTO v_profile_completed
  FROM public.member_profiles
  WHERE user_id = v_user_id;

  IF NOT v_profile_completed THEN
    RAISE EXCEPTION 'Please complete your profile before submitting a membership application.';
  END IF;

  -- Get existing application
  SELECT * INTO v_existing
  FROM public.membership_applications
  WHERE user_id = v_user_id;

  IF v_existing IS NOT NULL AND v_existing.status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'You already have a membership application in progress.';
  END IF;

  IF v_existing IS NOT NULL AND v_existing.status = 'rejected' THEN
    -- Resubmit rejected application
    UPDATE public.membership_applications
    SET status = 'submitted',
        application_submitted_at = now(),
        rejection_reason = NULL
    WHERE user_id = v_user_id
    RETURNING * INTO v_result;
    RETURN v_result;
  END IF;

  -- Insert new draft application
  INSERT INTO public.membership_applications (user_id, status)
  VALUES (v_user_id, 'submitted')
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Function: Start review (SUBMITTED -> UNDER_REVIEW)
CREATE OR REPLACE FUNCTION public.start_membership_review(p_member_user_id uuid)
RETURNS public.membership_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_admin_role text;
  v_application public.membership_applications;
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

  IF v_application.status <> 'submitted' THEN
    RAISE EXCEPTION 'Only submitted applications can be moved to review.';
  END IF;

  UPDATE public.membership_applications
  SET status = 'under_review',
      reviewed_at = now(),
      reviewed_by = v_admin_id
  WHERE user_id = p_member_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Function: Approve membership (UNDER_REVIEW -> APPROVED)
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

  UPDATE public.membership_applications
  SET status = 'approved',
      member_id = v_new_member_id,
      approved_at = now(),
      reviewed_at = now(),
      reviewed_by = v_admin_id
  WHERE user_id = p_member_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Function: Reject membership (UNDER_REVIEW -> REJECTED)
CREATE OR REPLACE FUNCTION public.reject_membership_application(p_member_user_id uuid, p_reason text)
RETURNS public.membership_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_admin_role text;
  v_application public.membership_applications;
  v_result public.membership_applications;
BEGIN
  -- Verify admin
  SELECT role INTO v_admin_role
  FROM public.admin_roles
  WHERE user_id = v_admin_id;

  IF v_admin_role IS NULL OR v_admin_role NOT IN ('SUPER_ADMIN', 'EDITOR') THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  -- Validate reason
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'A rejection reason is required.';
  END IF;

  -- Get application
  SELECT * INTO v_application
  FROM public.membership_applications
  WHERE user_id = p_member_user_id;

  IF v_application IS NULL THEN
    RAISE EXCEPTION 'No membership application found.';
  END IF;

  IF v_application.status <> 'under_review' THEN
    RAISE EXCEPTION 'Only applications under review can be rejected.';
  END IF;

  UPDATE public.membership_applications
  SET status = 'rejected',
      rejection_reason = btrim(p_reason),
      reviewed_at = now(),
      reviewed_by = v_admin_id
  WHERE user_id = p_member_user_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================
-- 5. Initialize sequence safely from existing data
-- ============================================================
DO $$
DECLARE
  v_max_num integer := 0;
  v_current_max text;
BEGIN
  SELECT member_id INTO v_current_max
  FROM public.membership_applications
  WHERE member_id IS NOT NULL
  ORDER BY member_id DESC
  LIMIT 1;

  IF v_current_max IS NOT NULL THEN
    v_max_num := CAST(SUBSTRING(v_current_max FROM 10) AS integer);
  END IF;

  PERFORM setval('public.member_id_seq', v_max_num, true);
END;
$$;

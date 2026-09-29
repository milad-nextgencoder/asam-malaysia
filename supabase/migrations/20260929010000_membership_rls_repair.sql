-- Phase 3 Repair: RLS policies for admin access + atomic Member ID sequence
-- Additive only. Does not modify existing tables or drop anything.

-- ============================================================
-- 1. SECURITY DEFINER function to check admin status
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'EDITOR')
  );
$$;

-- ============================================================
-- 2. RLS policies for membership_applications
-- ============================================================

-- Members can SELECT their own application
CREATE POLICY membership_applications_select_own
  ON public.membership_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Members can INSERT their own application
CREATE POLICY membership_applications_insert_own
  ON public.membership_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Members can UPDATE only their own application (for resubmission)
CREATE POLICY membership_applications_update_own
  ON public.membership_applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can SELECT all applications
CREATE POLICY membership_applications_select_admin
  ON public.membership_applications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can UPDATE all applications (for approve/reject/review)
CREATE POLICY membership_applications_update_admin
  ON public.membership_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 3. RLS policies for member_profiles (admin read access)
-- ============================================================

-- Admins can SELECT member profiles
CREATE POLICY member_profiles_select_admin
  ON public.member_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 4. Atomic Member ID sequence
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS public.member_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- Function to generate next Member ID atomically
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  next_num := nextval('public.member_id_seq');
  RETURN 'ASAM-2026-' || LPAD(next_num::text, 6, '0');
END;
$$;

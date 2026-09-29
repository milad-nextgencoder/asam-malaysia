-- Phase 3: Membership Foundation
-- Additive only. Does not modify existing tables or drop anything.

CREATE TABLE IF NOT EXISTS public.membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  member_id text,
  rejection_reason text,
  application_submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS membership_applications_member_id_key
  ON public.membership_applications (member_id);

CREATE INDEX IF NOT EXISTS membership_applications_status_idx
  ON public.membership_applications (status);

CREATE INDEX IF NOT EXISTS membership_applications_user_id_idx
  ON public.membership_applications (user_id);

CREATE TRIGGER membership_applications_set_updated_at
  BEFORE UPDATE ON public.membership_applications
  FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();

ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY membership_applications_select_own
  ON public.membership_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY membership_applications_insert_own
  ON public.membership_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY membership_applications_update_own
  ON public.membership_applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

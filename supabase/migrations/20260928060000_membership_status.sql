-- Phase D: Membership application/status architecture
-- Additive only. Does not modify existing columns or drop anything.

ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'account_created'
    CHECK (membership_status IN ('account_created', 'application_submitted', 'under_review', 'approved', 'active', 'suspended')),
  ADD COLUMN IF NOT EXISTS member_id text,
  ADD COLUMN IF NOT EXISTS application_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- Unique constraint on member_id (nullable, but unique when set)
CREATE UNIQUE INDEX IF NOT EXISTS member_profiles_member_id_key
  ON public.member_profiles (member_id);

-- Index for filtering by membership status
CREATE INDEX IF NOT EXISTS member_profiles_membership_status_idx
  ON public.member_profiles (membership_status);

-- RLS policies remain unchanged (members can only access own records)
-- Admin access is handled through admin_roles and server-side authorization

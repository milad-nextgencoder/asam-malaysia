-- Phase K: Member notifications
-- Additive only. Does not modify existing tables.

CREATE TABLE IF NOT EXISTS public.member_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'
    CHECK (type IN ('info', 'success', 'warning', 'error')),
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS member_notifications_user_id_idx ON public.member_notifications (user_id);
CREATE INDEX IF NOT EXISTS member_notifications_read_idx ON public.member_notifications (read);

ALTER TABLE public.member_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_notifications_select_own
  ON public.member_notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY member_notifications_update_own
  ON public.member_notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

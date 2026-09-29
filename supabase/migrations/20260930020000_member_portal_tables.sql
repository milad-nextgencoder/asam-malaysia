-- Member portal tables that were declared but never applied.
--
-- WHY: /member/events and /member/notifications query event_registrations and
-- member_notifications, and the membership actions insert notifications. The
-- live database has neither table (PostgREST: "Could not find the table"), so
-- those pages error out and the notification writes fail silently.
--
-- Also missing: member_notifications had no INSERT policy, so even after the
-- table exists an administrator could not write an approval notification for a
-- member, and a member could not write their own "application submitted"
-- notification. Both policies are added here.
--
-- Additive and idempotent. Nothing existing is modified or dropped.
-- Note: 20260928070000/20260928100000 (event_registrations) and
-- 20260928080000/20260928110000 (member_notifications) are duplicates of each
-- other; the table definitions below match those files. The duplicate files are
-- left in place because they are migration history.

BEGIN;

-- ============================================================
-- 1. Event registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'cancelled', 'attended', 'no_show')),
  registered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON public.event_registrations (event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON public.event_registrations (user_id);

DO $block$
BEGIN
  IF to_regclass('public.event_registrations') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_trigger WHERE tgname = 'event_registrations_set_updated_at'
     )
  THEN
    EXECUTE 'CREATE TRIGGER event_registrations_set_updated_at
      BEFORE UPDATE ON public.event_registrations
      FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at()';
  END IF;
END
$block$;

DO $block$
BEGIN
  IF to_regclass('public.event_registrations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY';
  END IF;
END
$block$;

DROP POLICY IF EXISTS event_registrations_select_own ON public.event_registrations;
CREATE POLICY event_registrations_select_own
  ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS event_registrations_insert_own ON public.event_registrations;
CREATE POLICY event_registrations_insert_own
  ON public.event_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS event_registrations_delete_own ON public.event_registrations;
CREATE POLICY event_registrations_delete_own
  ON public.event_registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 2. Member notifications
-- ============================================================
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

DO $block$
BEGIN
  IF to_regclass('public.member_notifications') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_trigger WHERE tgname = 'member_notifications_set_updated_at'
     )
  THEN
    EXECUTE 'CREATE TRIGGER member_notifications_set_updated_at
      BEFORE UPDATE ON public.member_notifications
      FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at()';
  END IF;
END
$block$;

DO $block$
BEGIN
  IF to_regclass('public.member_notifications') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.member_notifications ENABLE ROW LEVEL SECURITY';
  END IF;
END
$block$;

DROP POLICY IF EXISTS member_notifications_select_own ON public.member_notifications;
CREATE POLICY member_notifications_select_own
  ON public.member_notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS member_notifications_update_own ON public.member_notifications;
CREATE POLICY member_notifications_update_own
  ON public.member_notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Missing policies: a member writing their own notification, and an
-- administrator writing a notification for a member (used by
-- app/member/actions/membership.ts when approving or rejecting).
DROP POLICY IF EXISTS member_notifications_insert_own ON public.member_notifications;
CREATE POLICY member_notifications_insert_own
  ON public.member_notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS member_notifications_insert_admin ON public.member_notifications;
CREATE POLICY member_notifications_insert_admin
  ON public.member_notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

COMMIT;

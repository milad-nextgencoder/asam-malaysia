-- Phase G: Event registrations
-- Additive only. Does not modify existing tables.

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

CREATE TRIGGER event_registrations_set_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_registrations_select_own
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY event_registrations_insert_own
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY event_registrations_delete_own
  ON public.event_registrations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

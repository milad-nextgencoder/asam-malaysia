-- Additive support for the remaining general website CMS.
-- This migration does not recreate tables or alter existing content.

BEGIN;

ALTER TABLE public.gallery_albums
  ADD COLUMN IF NOT EXISTS category text;

-- Editors may add their own audit events, but cannot impersonate another actor.
-- Existing table grants still allow only SELECT/INSERT; this adds no update/delete policy.
CREATE POLICY asam_editor_insert_own_audit_logs
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (
    actor_user_id = (SELECT auth.uid())
    AND public.asam_has_website_admin_role(ARRAY['EDITOR'])
  );

-- Audit history is restricted to SUPER_ADMIN. Editors may append only their own
-- events through the policy above, but cannot browse the audit trail.
DROP POLICY IF EXISTS asam_admin_read_audit_logs ON public.audit_logs;
CREATE POLICY asam_super_admin_read_audit_logs
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN']));

-- Settings affect organization-wide public identity and are SUPER_ADMIN-only.
-- Replacing this policy preserves the rows and table while enforcing the boundary in RLS.
DROP POLICY IF EXISTS asam_admin_manage_site_settings ON public.site_settings;
CREATE POLICY asam_super_admin_manage_site_settings
  ON public.site_settings FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN']));

COMMIT;

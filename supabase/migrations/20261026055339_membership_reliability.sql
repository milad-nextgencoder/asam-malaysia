-- Membership reliability repair. Additive for deployed databases; preserves existing identities and issued credentials.
BEGIN;
CREATE SCHEMA IF NOT EXISTS asam_private;
REVOKE ALL ON SCHEMA asam_private FROM PUBLIC, anon, authenticated;

DO $$ BEGIN
  IF EXISTS (
    SELECT lower(btrim(u.email)) FROM public.member_profiles p JOIN auth.users u ON u.id=p.user_id
    WHERE nullif(btrim(u.email),'') IS NOT NULL GROUP BY lower(btrim(u.email)) HAVING count(*)>1
  ) THEN RAISE EXCEPTION 'Duplicate member emails require manual resolution. No accounts have been deleted or merged.'; END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS universities_name_normalized_key ON public.universities (lower(btrim(name)));
INSERT INTO public.universities(name,state,city,website,description,status,chapter_status)
VALUES('Albukhary International University','Kedah','Alor Setar','https://aiu.edu.my',
'Albukhary International University in Alor Setar, Kedah.','published','coming_soon')
ON CONFLICT(lower(btrim(name))) DO UPDATE SET status='published',website=EXCLUDED.website;

CREATE OR REPLACE FUNCTION asam_private.profile_complete(p public.member_profiles)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path='' AS $$
  SELECT coalesce(nullif(btrim(p.first_name),'') IS NOT NULL AND nullif(btrim(p.last_name),'') IS NOT NULL
    AND nullif(btrim(p.preferred_name),'') IS NOT NULL AND length(btrim(p.phone))>=6
    AND p.profile_photo_url ~ '^https?://[^[:space:]]+$' AND p.university_id IS NOT NULL
    AND nullif(btrim(p.program),'') IS NOT NULL AND nullif(btrim(p.faculty),'') IS NOT NULL
    AND nullif(btrim(p.city),'') IS NOT NULL AND nullif(btrim(p.state),'') IS NOT NULL AND nullif(btrim(p.bio),'') IS NOT NULL,false);
$$;
CREATE OR REPLACE FUNCTION asam_private.prepare_member_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE canonical_email text;
BEGIN
  IF TG_OP='UPDATE' AND (NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.id IS DISTINCT FROM OLD.id OR NEW.created_at IS DISTINCT FROM OLD.created_at)
    THEN RAISE EXCEPTION 'Profile identity cannot be changed'; END IF;
  SELECT nullif(lower(btrim(u.email)),'') INTO canonical_email FROM auth.users u WHERE u.id=NEW.user_id;
  IF canonical_email IS NULL THEN RAISE EXCEPTION 'An email account is required'; END IF;
  NEW.email:=canonical_email;
  NEW.first_name:=regexp_replace(NEW.first_name,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.last_name:=regexp_replace(NEW.last_name,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.preferred_name:=regexp_replace(NEW.preferred_name,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.phone:=regexp_replace(NEW.phone,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.program:=regexp_replace(NEW.program,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.faculty:=regexp_replace(NEW.faculty,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.city:=regexp_replace(NEW.city,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.state:=regexp_replace(NEW.state,'^[[:space:]]+|[[:space:]]+$','','g');
  NEW.bio:=regexp_replace(NEW.bio,'^[[:space:]]+|[[:space:]]+$','','g');
  IF (nullif(NEW.phone,'') IS NOT NULL AND length(NEW.phone)<6 AND (TG_OP='INSERT' OR NEW.phone IS DISTINCT FROM OLD.phone))
    OR (nullif(NEW.profile_photo_url,'') IS NOT NULL AND NEW.profile_photo_url !~ '^https?://[^[:space:]]+$'
      AND (TG_OP='INSERT' OR NEW.profile_photo_url IS DISTINCT FROM OLD.profile_photo_url))
    THEN RAISE EXCEPTION 'Enter a valid phone number and profile photo URL'; END IF;
  IF length(coalesce(NEW.middle_name,''))>100 OR length(coalesce(NEW.first_name,''))>100 OR length(coalesce(NEW.last_name,''))>100
    OR length(coalesce(NEW.preferred_name,''))>100 OR length(coalesce(NEW.bio,''))>2000
    OR length(coalesce(NEW.phone,''))>20 OR length(coalesce(NEW.program,''))>200
    OR length(coalesce(NEW.faculty,''))>200 OR length(coalesce(NEW.city,''))>100
    OR length(coalesce(NEW.state,''))>100 OR length(coalesce(NEW.profile_photo_url,''))>2048
    THEN RAISE EXCEPTION 'One or more profile fields are too long'; END IF;
  NEW.profile_completed:=asam_private.profile_complete(NEW);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS asam_prepare_member_profile ON public.member_profiles;
CREATE TRIGGER asam_prepare_member_profile BEFORE INSERT OR UPDATE ON public.member_profiles
FOR EACH ROW EXECUTE FUNCTION asam_private.prepare_member_profile();
UPDATE public.member_profiles p SET email=lower(btrim(u.email)),profile_completed=asam_private.profile_complete(p)
FROM auth.users u WHERE u.id=p.user_id;
CREATE UNIQUE INDEX IF NOT EXISTS member_profiles_normalized_email_key ON public.member_profiles(lower(btrim(email))) WHERE email IS NOT NULL;

REVOKE INSERT,UPDATE,DELETE ON public.member_profiles FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.member_profiles TO authenticated;
GRANT INSERT(user_id,email,first_name,middle_name,last_name,preferred_name,phone,profile_photo_url,university_id,program,faculty,city,state,bio,profile_completed),
UPDATE(email,first_name,middle_name,last_name,preferred_name,phone,profile_photo_url,university_id,program,faculty,city,state,bio,profile_completed)
ON public.member_profiles TO authenticated;
REVOKE INSERT,UPDATE,DELETE ON public.membership_applications FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.membership_applications TO authenticated;

ALTER TABLE public.member_notifications ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
REVOKE INSERT,UPDATE,DELETE ON public.member_notifications FROM PUBLIC,anon,authenticated;
GRANT SELECT,UPDATE(read,read_at) ON public.member_notifications TO authenticated;
DROP POLICY IF EXISTS member_notifications_insert_own ON public.member_notifications;

CREATE TABLE IF NOT EXISTS public.membership_certificates(
  application_id uuid PRIMARY KEY REFERENCES public.membership_applications(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
  member_id text NOT NULL UNIQUE, certificate_number text NOT NULL UNIQUE,
  full_name text NOT NULL, university_name text NOT NULL, program text NOT NULL,
  approved_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.membership_certificates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.membership_certificates FROM PUBLIC,anon,authenticated;
INSERT INTO public.membership_certificates(application_id,user_id,member_id,certificate_number,full_name,university_name,program,approved_at)
SELECT a.id,a.user_id,a.member_id,public.certificate_number_for(a.member_id),
coalesce(nullif(btrim(p.preferred_name),''),nullif(btrim(concat_ws(' ',p.first_name,p.last_name)),''),'Member'),
coalesce(nullif(btrim(u.name),''),'Not recorded'),coalesce(nullif(btrim(p.program),''),'Not recorded'),coalesce(a.approved_at,a.created_at)
FROM public.membership_applications a LEFT JOIN public.member_profiles p ON p.user_id=a.user_id
LEFT JOIN public.universities u ON u.id=p.university_id
WHERE a.status='approved' AND a.member_id IS NOT NULL ON CONFLICT(application_id) DO NOTHING;

-- Synchronize without ever rewinding the allocated sequence.
DO $$
DECLARE highest bigint; previous bigint; called boolean;
BEGIN
  SELECT coalesce(max((regexp_match(member_id,'^ASAM-[0-9]{4}-([0-9]{6})$'))[1]::bigint),0)
    INTO highest FROM public.membership_applications;
  SELECT last_value,is_called INTO previous,called FROM public.member_id_seq;
  PERFORM setval('public.member_id_seq',greatest(highest,previous,1),highest>0 OR called);
END $$;
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE serial bigint;
BEGIN
  serial:=nextval('public.member_id_seq'::regclass);
  IF serial>999999 THEN RAISE EXCEPTION 'Membership ID capacity reached. Contact the administrator.'; END IF;
  RETURN 'ASAM-'||to_char(now() AT TIME ZONE 'Asia/Kuala_Lumpur','YYYY')||'-'||lpad(serial::text,6,'0');
END $$;
REVOKE ALL ON FUNCTION public.generate_member_id() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON SEQUENCE public.member_id_seq FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION asam_private.membership_event(uid uuid,title text,message text,kind text,action_name text,application uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.member_notifications(user_id,title,message,type,link) VALUES(uid,title,message,kind,'/member/membership');
  INSERT INTO public.audit_logs(actor_user_id,action,entity_type,entity_id,metadata)
    VALUES(auth.uid(),action_name,'membership_application',application,'{}'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.enforce_membership_state_transition()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN RAISE EXCEPTION 'Membership identity cannot be changed'; END IF;
  IF OLD.status=NEW.status THEN
    IF NEW.member_id IS DISTINCT FROM OLD.member_id OR NEW.certificate_number IS DISTINCT FROM OLD.certificate_number
      OR NEW.approved_at IS DISTINCT FROM OLD.approved_at OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
      OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
      OR NEW.application_submitted_at IS DISTINCT FROM OLD.application_submitted_at
      THEN RAISE EXCEPTION 'Membership fields require a valid transition'; END IF;
    RETURN NEW;
  END IF;
  IF OLD.status IN ('draft','rejected') AND NEW.status='submitted' AND OLD.user_id=auth.uid() THEN
    IF NEW.member_id IS NOT NULL OR NEW.certificate_number IS NOT NULL OR NEW.approved_at IS NOT NULL
      OR NEW.reviewed_at IS NOT NULL OR NEW.reviewed_by IS NOT NULL OR NEW.rejection_reason IS NOT NULL
      THEN RAISE EXCEPTION 'Invalid submission system fields'; END IF;
  ELSIF public.is_admin() AND OLD.status='submitted' AND NEW.status='under_review' THEN NULL;
  ELSIF public.is_admin() AND OLD.status='under_review' AND NEW.status IN ('approved','rejected') THEN NULL;
  ELSE RAISE EXCEPTION 'Invalid membership status transition: % -> %',OLD.status,NEW.status;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.enforce_membership_state_transition() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.submit_membership_application()
RETURNS public.membership_applications LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); p public.member_profiles; a public.membership_applications;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Sign in to submit your application'; END IF;
  IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=uid AND email_confirmed_at IS NOT NULL)
    THEN RAISE EXCEPTION 'Verify your email before submitting your application'; END IF;
  SELECT * INTO p FROM public.member_profiles WHERE user_id=uid FOR UPDATE;
  IF NOT FOUND OR NOT asam_private.profile_complete(p) OR NOT EXISTS(SELECT 1 FROM public.universities WHERE id=p.university_id AND status='published')
    THEN RAISE EXCEPTION 'Complete your profile and choose a published university before submitting'; END IF;
  SELECT * INTO a FROM public.membership_applications WHERE user_id=uid FOR UPDATE;
  IF FOUND THEN
    IF a.status IN ('submitted','under_review','approved') THEN RETURN a; END IF;
    IF a.status NOT IN ('draft','rejected') THEN RAISE EXCEPTION 'Application cannot be submitted in its current state'; END IF;
    UPDATE public.membership_applications SET status='submitted',application_submitted_at=now(),reviewed_at=NULL,
      reviewed_by=NULL,rejection_reason=NULL,member_id=NULL,certificate_number=NULL,approved_at=NULL WHERE id=a.id RETURNING * INTO a;
  ELSE
    INSERT INTO public.membership_applications(user_id,status,application_submitted_at)
      VALUES(uid,'submitted',now()) RETURNING * INTO a;
  END IF;
  PERFORM asam_private.membership_event(uid,'Application submitted','Your membership application has been submitted for review.','info','membership.submitted',a.id);
  RETURN a;
END $$;

CREATE OR REPLACE FUNCTION public.start_membership_review(p_member_user_id uuid)
RETURNS public.membership_applications LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.membership_applications;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT * INTO a FROM public.membership_applications WHERE user_id=p_member_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No membership application found'; END IF;
  IF a.status='under_review' THEN RETURN a; END IF;
  IF a.status<>'submitted' THEN RAISE EXCEPTION 'Only submitted applications can be moved to review'; END IF;
  UPDATE public.membership_applications SET status='under_review',reviewed_at=now(),reviewed_by=auth.uid() WHERE id=a.id RETURNING * INTO a;
  PERFORM asam_private.membership_event(p_member_user_id,'Application under review','The ASAM team is reviewing your membership application.','info','membership.review_started',a.id);
  RETURN a;
END $$;

CREATE OR REPLACE FUNCTION public.approve_membership_application(p_member_user_id uuid)
RETURNS public.membership_applications LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.member_profiles; a public.membership_applications; university text; mid text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT * INTO p FROM public.member_profiles WHERE user_id=p_member_user_id FOR UPDATE;
  SELECT * INTO a FROM public.membership_applications WHERE user_id=p_member_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No membership application found'; END IF;
  IF a.status='approved' THEN RETURN a; END IF;
  IF a.status<>'under_review' THEN RAISE EXCEPTION 'Only applications under review can be approved'; END IF;
  IF p.id IS NULL OR NOT asam_private.profile_complete(p) THEN RAISE EXCEPTION 'Member profile is incomplete'; END IF;
  IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=p_member_user_id AND email_confirmed_at IS NOT NULL)
    THEN RAISE EXCEPTION 'Member email is not verified'; END IF;
  SELECT name INTO university FROM public.universities WHERE id=p.university_id AND status='published';
  IF NOT FOUND THEN RAISE EXCEPTION 'Choose a published university before approval'; END IF;
  mid:=public.generate_member_id();
  INSERT INTO public.membership_certificates(application_id,user_id,member_id,certificate_number,full_name,university_name,program,approved_at)
    VALUES(a.id,p_member_user_id,mid,public.certificate_number_for(mid),btrim(p.preferred_name),university,btrim(p.program),now());
  UPDATE public.membership_applications SET status='approved',member_id=mid,certificate_number=public.certificate_number_for(mid),
    approved_at=now(),reviewed_at=now(),reviewed_by=auth.uid(),rejection_reason=NULL WHERE id=a.id RETURNING * INTO a;
  PERFORM asam_private.membership_event(p_member_user_id,'Membership approved','Your membership has been approved. Your Member ID is '||mid||'.','success','membership.approved',a.id);
  RETURN a;
END $$;

CREATE OR REPLACE FUNCTION public.reject_membership_application(p_member_user_id uuid,p_reason text)
RETURNS public.membership_applications LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.membership_applications;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Provide a rejection reason of up to 2,000 characters'; END IF;
  SELECT * INTO a FROM public.membership_applications WHERE user_id=p_member_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No membership application found'; END IF;
  IF a.status<>'under_review' THEN RAISE EXCEPTION 'Only applications under review can be rejected'; END IF;
  UPDATE public.membership_applications SET status='rejected',rejection_reason=btrim(p_reason),reviewed_at=now(),reviewed_by=auth.uid()
    WHERE id=a.id RETURNING * INTO a;
  PERFORM asam_private.membership_event(p_member_user_id,'Membership application update','Your application was reviewed. View the reason in your membership page.','warning','membership.rejected',a.id);
  RETURN a;
END $$;
REVOKE ALL ON FUNCTION public.submit_membership_application(),public.start_membership_review(uuid),
public.approve_membership_application(uuid),public.reject_membership_application(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_membership_application(),public.start_membership_review(uuid),
public.approve_membership_application(uuid),public.reject_membership_application(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_public_certificate(p_member_id text)
RETURNS TABLE(member_id text,certificate_number text,status text,approved_at timestamptz,full_name text,university_name text,program text)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path='' AS $$
  SELECT c.member_id,c.certificate_number,a.status,c.approved_at,c.full_name,c.university_name,c.program
  FROM public.membership_certificates c JOIN public.membership_applications a ON a.id=c.application_id
  WHERE c.member_id=upper(btrim(p_member_id)) AND a.status='approved' LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_certificate(text) TO anon,authenticated;

DROP POLICY IF EXISTS event_registrations_insert_own ON public.event_registrations;
CREATE POLICY event_registrations_insert_own ON public.event_registrations FOR INSERT TO authenticated
WITH CHECK(user_id=(SELECT auth.uid()) AND status='registered' AND EXISTS(
  SELECT 1 FROM public.events e WHERE e.id=event_id AND e.status='published' AND e.date IS NOT NULL
  AND ((e.date+coalesce(e.time,time '23:59:59')) AT TIME ZONE 'Asia/Kuala_Lumpur')>now()));
DROP POLICY IF EXISTS event_registrations_delete_own ON public.event_registrations;
CREATE POLICY event_registrations_delete_own ON public.event_registrations FOR DELETE TO authenticated
USING(user_id=(SELECT auth.uid()) AND status='registered' AND EXISTS(
  SELECT 1 FROM public.events e WHERE e.id=event_id AND e.date IS NOT NULL
  AND ((e.date+coalesce(e.time,time '23:59:59')) AT TIME ZONE 'Asia/Kuala_Lumpur')>now()));
GRANT SELECT,INSERT,DELETE ON public.event_registrations TO authenticated;
REVOKE UPDATE ON public.event_registrations FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.get_upcoming_events(p_limit integer DEFAULT 3)
RETURNS SETOF public.events LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT e.* FROM public.events e WHERE e.status='published' AND (e.date IS NULL OR
    ((e.date+coalesce(e.time,time '23:59:59')) AT TIME ZONE 'Asia/Kuala_Lumpur')>=now())
  ORDER BY e.date ASC NULLS LAST,e.time ASC NULLS LAST,e.id LIMIT least(greatest(coalesce(p_limit,3),1),20);
$$;
REVOKE ALL ON FUNCTION public.get_upcoming_events(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_upcoming_events(integer) TO anon,authenticated;

-- Shared database limits also cover direct Data API requests.
CREATE INDEX IF NOT EXISTS contact_messages_recent_idx ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS contact_messages_email_recent_idx ON public.contact_messages(lower(btrim(email)),created_at);
CREATE OR REPLACE FUNCTION asam_private.validate_contact_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  NEW.created_at:=now();
  NEW.email:=lower(btrim(NEW.email)); NEW.name:=btrim(NEW.name); NEW.message:=btrim(NEW.message);
  IF NEW.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR length(NEW.email)>254 OR length(NEW.name) NOT BETWEEN 1 AND 160
    OR length(coalesce(NEW.subject,''))>200 OR length(NEW.message) NOT BETWEEN 1 AND 10000
    THEN RAISE EXCEPTION 'Please check your contact details and message length'; END IF;
  IF NOT public.is_admin() THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('asam.contact.global',0));
    IF (SELECT count(*) FROM public.contact_messages WHERE created_at>now()-interval '10 minutes')>=300
      OR (SELECT count(*) FROM public.contact_messages WHERE lower(btrim(email))=NEW.email AND created_at>now()-interval '10 minutes')>=3
      THEN RAISE EXCEPTION 'Too many messages. Please wait before trying again'; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS asam_validate_contact_submission ON public.contact_messages;
CREATE TRIGGER asam_validate_contact_submission BEFORE INSERT ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION asam_private.validate_contact_submission();

CREATE TABLE IF NOT EXISTS asam_private.download_limits(
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL, hits integer NOT NULL, PRIMARY KEY(user_id,window_start)
);
CREATE OR REPLACE FUNCTION public.authorize_certificate_download(p_member_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); bucket timestamptz:=date_trunc('minute',now()); used integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION USING ERRCODE='PT401',MESSAGE='Sign in to download a certificate'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.membership_applications WHERE member_id=p_member_id AND status='approved'
    AND (user_id=uid OR public.is_admin())) THEN RAISE EXCEPTION USING ERRCODE='PT403',MESSAGE='You cannot download this certificate'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('asam.download.global',0));
  IF (SELECT coalesce(sum(hits),0) FROM asam_private.download_limits WHERE window_start=bucket)>=60
    THEN RAISE EXCEPTION USING ERRCODE='PT429',MESSAGE='The download service is busy. Please try again shortly'; END IF;
  INSERT INTO asam_private.download_limits(user_id,window_start,hits) VALUES(uid,bucket,1)
    ON CONFLICT(user_id,window_start) DO UPDATE SET hits=asam_private.download_limits.hits+1
    WHERE asam_private.download_limits.hits<5 RETURNING hits INTO used;
  IF used IS NULL THEN RAISE EXCEPTION USING ERRCODE='PT429',MESSAGE='Please wait before downloading again'; END IF;
  DELETE FROM asam_private.download_limits WHERE window_start<now()-interval '1 day';
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.authorize_certificate_download(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.authorize_certificate_download(text) TO authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA asam_private FROM PUBLIC,anon,authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA asam_private FROM PUBLIC,anon,authenticated;

-- Joined, server-filtered admin directory. Invoker permissions and RLS remain active.
CREATE OR REPLACE FUNCTION public.get_admin_directory(p_kind text,p_query text DEFAULT '',p_status text DEFAULT 'all',p_offset integer DEFAULT 0,p_limit integer DEFAULT 50)
RETURNS TABLE(record jsonb,total_count bigint) LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
  IF p_kind='members' THEN
    RETURN QUERY SELECT to_jsonb(p)||jsonb_build_object('membership_status',coalesce(a.status,'draft'),'member_id',a.member_id),
      count(*) OVER()
    FROM public.member_profiles p LEFT JOIN public.membership_applications a ON a.user_id=p.user_id
    WHERE (p_status='all' OR coalesce(a.status,'draft')=p_status)
      AND position(lower(coalesce(p_query,'')) IN lower(concat_ws(' ',p.first_name,p.last_name,p.preferred_name,p.email,a.member_id)))>0
    ORDER BY p.created_at DESC,p.user_id LIMIT least(greatest(p_limit,1),100) OFFSET greatest(p_offset,0);
  ELSIF p_kind='applications' THEN
    RETURN QUERY SELECT to_jsonb(a)||jsonb_build_object('member',CASE WHEN p.id IS NULL THEN NULL ELSE to_jsonb(p) END),
      count(*) OVER()
    FROM public.membership_applications a LEFT JOIN public.member_profiles p ON p.user_id=a.user_id
    WHERE (p_status='all' OR a.status=p_status)
      AND position(lower(coalesce(p_query,'')) IN lower(concat_ws(' ',p.first_name,p.last_name,p.preferred_name,p.email,a.member_id)))>0
    ORDER BY a.created_at DESC,a.id LIMIT least(greatest(p_limit,1),100) OFFSET greatest(p_offset,0);
  ELSE RAISE EXCEPTION 'Unknown directory'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.get_admin_directory(text,text,text,integer,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_admin_directory(text,text,text,integer,integer) TO authenticated;

CREATE OR REPLACE FUNCTION asam_private.sync_member_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN UPDATE public.member_profiles SET email=NEW.email WHERE user_id=NEW.id; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS asam_sync_member_email ON auth.users;
CREATE TRIGGER asam_sync_member_email AFTER UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION asam_private.sync_member_email();
REVOKE ALL ON FUNCTION asam_private.sync_member_email() FROM PUBLIC,anon,authenticated;
REVOKE INSERT ON public.contact_messages FROM authenticated;
GRANT INSERT(name,email,subject,message) ON public.contact_messages TO authenticated;
REVOKE INSERT ON public.event_registrations FROM authenticated;
GRANT INSERT(event_id,user_id,status) ON public.event_registrations TO authenticated;
CREATE INDEX IF NOT EXISTS download_limits_window_idx ON asam_private.download_limits(window_start);


CREATE OR REPLACE FUNCTION asam_private.protect_admin_roles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('asam.admin.roles',0));
  IF TG_OP='UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'Administrator identity cannot be changed'; END IF;
  IF auth.uid()=OLD.user_id AND (TG_OP='DELETE' OR NEW.role IS DISTINCT FROM OLD.role)
    THEN RAISE EXCEPTION 'You cannot remove or change your own administrator role'; END IF;
  IF OLD.role='SUPER_ADMIN' AND (TG_OP='DELETE' OR NEW.role<>'SUPER_ADMIN')
    AND (SELECT count(*) FROM public.admin_roles WHERE role='SUPER_ADMIN')<=1
    THEN RAISE EXCEPTION 'The final SUPER_ADMIN cannot be removed or demoted'; END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS asam_protect_admin_roles ON public.admin_roles;
CREATE TRIGGER asam_protect_admin_roles BEFORE UPDATE OR DELETE ON public.admin_roles FOR EACH ROW EXECUTE FUNCTION asam_private.protect_admin_roles();
REVOKE ALL ON FUNCTION asam_private.protect_admin_roles() FROM PUBLIC,anon,authenticated;
ALTER TABLE asam_private.download_limits ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ASAM public website admin schema.
-- Safe behavior: this migration stops before making changes if any target
-- table or the planned media bucket already exists.

BEGIN;

DO $preflight$
DECLARE
  existing_relations text;
BEGIN
  SELECT string_agg(format('%I', relation.relname), ', ' ORDER BY relation.relname)
  INTO existing_relations
  FROM pg_catalog.pg_class AS relation
  JOIN pg_catalog.pg_namespace AS namespace
    ON namespace.oid = relation.relnamespace
  WHERE namespace.nspname = 'public'
    AND relation.relname = ANY (ARRAY[
      'site_settings', 'homepage_sections', 'leadership', 'departments',
      'chapters', 'universities', 'events', 'news', 'opportunities',
      'scholarships', 'gallery_albums', 'gallery_items', 'partners',
      'documents', 'faqs', 'contact_messages', 'admin_roles', 'audit_logs'
    ])
    AND relation.relkind IN ('r', 'p', 'v', 'm', 'f');

  IF existing_relations IS NOT NULL THEN
    RAISE EXCEPTION
      'ASAM website migration stopped: these public relations already exist: %. No tables were changed.',
      existing_relations;
  END IF;

  IF to_regclass('storage.buckets') IS NULL
     OR to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION
      'ASAM website migration stopped: Supabase Storage is not available in this project.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'asam-public-media'
       OR name = 'asam-public-media'
  ) THEN
    RAISE EXCEPTION
      'ASAM website migration stopped: a storage bucket named asam-public-media already exists.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'asam_admin_manage_public_media'
  ) THEN
    RAISE EXCEPTION
      'ASAM website migration stopped: the storage policy name asam_admin_manage_public_media already exists.';
  END IF;

  IF to_regprocedure('public.asam_has_website_admin_role(text[])') IS NOT NULL
     OR to_regprocedure('public.asam_set_updated_at()') IS NOT NULL THEN
    RAISE EXCEPTION
      'ASAM website migration stopped: a helper function with an ASAM migration name already exists.';
  END IF;
END;
$preflight$;

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE CHECK (singleton),
  organization_name text NOT NULL DEFAULT 'Afghan Students Association of Malaysia',
  tagline text,
  contact_email text,
  phone text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(social_links) = 'object'),
  footer_text text,
  logo_url text,
  favicon_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE CHECK (section_key ~ '^[a-z0-9_]+$'),
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text,
  button_text text,
  button_url text,
  secondary_button_text text,
  secondary_button_url text,
  display_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number text NOT NULL UNIQUE CHECK (number ~ '^[0-9]{2}$'),
  description text,
  mission text,
  icon text,
  image_url text,
  leader text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  bio text,
  photo_url text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(social_links) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  city text,
  description text,
  university text,
  representative text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('coming_soon', 'active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text,
  city text,
  website text,
  description text,
  logo_url text,
  chapter_status text
    CHECK (chapter_status IS NULL OR chapter_status IN ('coming_soon', 'active', 'inactive')),
  representative text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  date date,
  time time,
  location text,
  category text
    CHECK (category IS NULL OR category IN (
      'Academic', 'Career', 'Cultural', 'Leadership', 'Sports',
      'Networking', 'Entrepreneurship'
    )),
  featured_image_url text,
  registration_url text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text,
  content text,
  featured_image_url text,
  author text,
  category text,
  publication_date timestamptz,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text,
  category text,
  description text,
  eligibility text,
  location text,
  deadline date,
  application_url text,
  image_url text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text,
  description text,
  eligibility text,
  deadline date,
  amount text,
  application_url text,
  image_url text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_url text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.gallery_albums(id) ON DELETE RESTRICT,
  image_url text NOT NULL,
  title text,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  description text,
  website text,
  logo_url text,
  partner_type text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  file_url text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  email text NOT NULL CHECK (length(trim(email)) > 0),
  subject text,
  message text NOT NULL CHECK (length(trim(message)) > 0),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'EDITOR')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (length(trim(action)) > 0),
  entity_type text NOT NULL CHECK (length(trim(entity_type)) > 0),
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX departments_status_order_idx ON public.departments (status, display_order);
CREATE INDEX leadership_status_order_idx ON public.leadership (status, display_order);
CREATE INDEX leadership_department_id_idx ON public.leadership (department_id);
CREATE INDEX chapters_state_status_idx ON public.chapters (state, status);
CREATE INDEX universities_state_status_idx ON public.universities (state, status);
CREATE INDEX universities_chapter_status_idx ON public.universities (chapter_status);
CREATE INDEX events_status_date_idx ON public.events (status, date);
CREATE INDEX events_category_idx ON public.events (category);
CREATE INDEX news_status_publication_date_idx ON public.news (status, publication_date DESC);
CREATE INDEX news_category_idx ON public.news (category);
CREATE INDEX opportunities_status_deadline_idx ON public.opportunities (status, deadline);
CREATE INDEX opportunities_category_idx ON public.opportunities (category);
CREATE INDEX scholarships_status_deadline_idx ON public.scholarships (status, deadline);
CREATE INDEX scholarships_provider_idx ON public.scholarships (provider);
CREATE INDEX gallery_albums_status_order_idx ON public.gallery_albums (status, display_order);
CREATE INDEX gallery_items_album_status_order_idx ON public.gallery_items (album_id, status, display_order);
CREATE INDEX partners_status_order_idx ON public.partners (status, display_order);
CREATE INDEX partners_type_idx ON public.partners (partner_type);
CREATE INDEX documents_status_category_idx ON public.documents (status, category);
CREATE INDEX faqs_status_category_order_idx ON public.faqs (status, category, display_order);
CREATE INDEX contact_messages_status_created_at_idx ON public.contact_messages (status, created_at DESC);
CREATE INDEX admin_roles_role_idx ON public.admin_roles (role);
CREATE INDEX audit_logs_actor_created_at_idx ON public.audit_logs (actor_user_id, created_at DESC);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id);
-- Keep updated_at in sync whenever editable rows change.
CREATE FUNCTION public.asam_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER homepage_sections_set_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER departments_set_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER leadership_set_updated_at BEFORE UPDATE ON public.leadership FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER chapters_set_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER universities_set_updated_at BEFORE UPDATE ON public.universities FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER news_set_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER opportunities_set_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER scholarships_set_updated_at BEFORE UPDATE ON public.scholarships FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER gallery_albums_set_updated_at BEFORE UPDATE ON public.gallery_albums FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER gallery_items_set_updated_at BEFORE UPDATE ON public.gallery_items FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER partners_set_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER faqs_set_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();
CREATE TRIGGER admin_roles_set_updated_at BEFORE UPDATE ON public.admin_roles FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();

CREATE FUNCTION public.asam_has_website_admin_role(required_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles AS role_record
    WHERE role_record.user_id = (SELECT auth.uid())
      AND role_record.role = ANY (required_roles)
  );
$function$;

REVOKE ALL ON FUNCTION public.asam_has_website_admin_role(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.asam_has_website_admin_role(text[]) TO authenticated;
REVOKE ALL ON FUNCTION public.asam_set_updated_at() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE
  public.site_settings, public.homepage_sections, public.leadership,
  public.departments, public.chapters, public.universities, public.events,
  public.news, public.opportunities, public.scholarships,
  public.gallery_albums, public.gallery_items, public.partners,
  public.documents, public.faqs
TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE
  public.site_settings, public.homepage_sections, public.leadership,
  public.departments, public.chapters, public.universities, public.events,
  public.news, public.opportunities, public.scholarships,
  public.gallery_albums, public.gallery_items, public.partners,
  public.documents, public.faqs
TO authenticated;
GRANT INSERT (name, email, subject, message)
  ON TABLE public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contact_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_roles TO authenticated;
GRANT SELECT, INSERT ON TABLE public.audit_logs TO authenticated;

-- Standard public content: published items are readable; admins manage all items.
DO $policies$
DECLARE
  content_table text;
BEGIN
  FOREACH content_table IN ARRAY ARRAY[
    'leadership', 'departments', 'universities', 'events', 'news',
    'opportunities', 'scholarships', 'gallery_albums', 'partners',
    'documents', 'faqs'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (status = %L)',
      'asam_public_read_' || content_table,
      content_table,
      'published'
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.asam_has_website_admin_role(ARRAY[''SUPER_ADMIN'', ''EDITOR''])) WITH CHECK (public.asam_has_website_admin_role(ARRAY[''SUPER_ADMIN'', ''EDITOR'']))',
      'asam_admin_manage_' || content_table,
      content_table
    );
  END LOOP;
END;
$policies$;

CREATE POLICY asam_public_read_site_settings
  ON public.site_settings FOR SELECT TO anon, authenticated
  USING (singleton);
CREATE POLICY asam_admin_manage_site_settings
  ON public.site_settings FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']));

CREATE POLICY asam_public_read_homepage_sections
  ON public.homepage_sections FOR SELECT TO anon, authenticated
  USING (visible AND status = 'published');
CREATE POLICY asam_admin_manage_homepage_sections
  ON public.homepage_sections FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']));

CREATE POLICY asam_public_read_chapters
  ON public.chapters FOR SELECT TO anon, authenticated
  USING (status IN ('coming_soon', 'active'));
CREATE POLICY asam_admin_manage_chapters
  ON public.chapters FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']));

CREATE POLICY asam_public_read_gallery_items
  ON public.gallery_items FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM public.gallery_albums AS album
      WHERE album.id = gallery_items.album_id
        AND album.status = 'published'
    )
  );
CREATE POLICY asam_admin_manage_gallery_items
  ON public.gallery_items FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']));

CREATE POLICY asam_admin_manage_contact_messages
  ON public.contact_messages FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']));
CREATE POLICY asam_public_submit_contact_messages
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new');

CREATE POLICY asam_admin_read_own_role
  ON public.admin_roles FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN'])
  );
CREATE POLICY asam_super_admin_manage_roles
  ON public.admin_roles FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN']));

CREATE POLICY asam_admin_read_audit_logs
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR']));
CREATE POLICY asam_super_admin_insert_audit_logs
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (
    actor_user_id = (SELECT auth.uid())
    AND public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN'])
  );

-- Public files are downloadable by URL; listing and file management require an admin.
INSERT INTO storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) VALUES (
  'asam-public-media',
  'asam-public-media',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
);

CREATE POLICY asam_admin_manage_public_media
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'asam-public-media'
    AND public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR'])
  )
  WITH CHECK (
    bucket_id = 'asam-public-media'
    AND public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN', 'EDITOR'])
  );

-- Seed only existing ASAM details and content already present on the public site.
INSERT INTO public.site_settings (
  organization_name, tagline, contact_email, social_links, footer_text, logo_url
) VALUES (
  'Afghan Students Association of Malaysia',
  'Connecting Afghan students across Malaysia through education, leadership, opportunity, culture, and community.',
  'info@asam.org.my',
  '{}'::jsonb,
  'Built for students. Designed for community. Created for the future.',
  '/logo.png'
);

INSERT INTO public.departments (number, name, display_order, status) VALUES
  ('01', 'Academic Affairs', 1, 'published'),
  ('02', 'Student Welfare', 2, 'published'),
  ('03', 'Career & Entrepreneurship', 3, 'published'),
  ('04', 'External Relations', 4, 'published'),
  ('05', 'Events & Programs', 5, 'published'),
  ('06', 'Communications & Media', 6, 'published'),
  ('07', 'Research & Policy', 7, 'published'),
  ('08', 'Membership & Community', 8, 'published'),
  ('09', 'Technology & Digital', 9, 'published'),
  ('10', 'Culture & Heritage', 10, 'published'),
  ('11', 'Sports & Recreation', 11, 'published'),
  ('12', 'Alumni Relations', 12, 'published');

INSERT INTO public.leadership (name, position, display_order, status) VALUES
  ('Mohammad Elyas Yamen', 'President', 1, 'published'),
  ('Milad Sahebi', 'Deputy President', 2, 'published');

INSERT INTO public.homepage_sections (
  section_key, title, subtitle, description, image_url,
  button_text, button_url, secondary_button_text, secondary_button_url,
  display_order, visible, status
) VALUES
  (
    'hero', 'ONE COMMUNITY. MANY UNIVERSITIES. ONE FUTURE.',
    'Afghan Students Association of Malaysia',
    'Connecting Afghan students across Malaysia through education, leadership, opportunity, culture, and community.',
    '/gallery/events/photo%201.jpg', 'Become a Member', '/membership',
    'Explore ASAM', '/about', 1, true, 'published'
  ),
  (
    'introduction', 'A national platform for Afghan students in Malaysia',
    'Introduction',
    'ASAM connects Afghan students studying at universities across Malaysia and is building a unified community that supports, empowers, and represents its members.',
    NULL, 'Learn more about ASAM', '/about', NULL, NULL, 2, true, 'published'
  ),
  (
    'vision', 'Our Vision', NULL,
    'To build a connected, empowered, and thriving Afghan student community across Malaysia, where every student has access to support, opportunity, and belonging.',
    NULL, NULL, NULL, NULL, NULL, 3, true, 'published'
  ),
  (
    'mission', 'Our Mission', NULL,
    'To connect Afghan students across Malaysian universities through academic collaboration, student welfare, professional development, cultural engagement, leadership, and community building.',
    NULL, NULL, NULL, NULL, NULL, 4, true, 'published'
  ),
  (
    'what_asam_does', 'Building a comprehensive student ecosystem', 'What We Do',
    'ASAM operates across twelve key areas, each managed by a dedicated department focused on serving Afghan students in Malaysia.',
    NULL, 'View All 12 Departments', '/departments', NULL, NULL, 5, true, 'published'
  ),
  (
    'leadership', 'Founded by students, for students', 'Leadership',
    'Meet the founding leadership team building ASAM from the ground up.',
    NULL, 'Meet the Full Team', '/leadership', NULL, NULL, 6, true, 'published'
  ),
  (
    'departments_overview', 'Twelve departments, one mission', 'Departments',
    'Each department focuses on a specific area of student life, working together to create a comprehensive support system.',
    NULL, 'View All 12 Departments', '/departments', NULL, NULL, 7, true, 'published'
  ),
  (
    'student_network', 'From Kabul to Kuala Lumpur', 'Student Network',
    'ASAM is building a connected Afghan student community through chapters, events, programs, and digital tools.',
    NULL, NULL, NULL, NULL, NULL, 8, true, 'published'
  ),
  (
    'chapters', 'A growing national network', 'Chapters',
    'ASAM is building state, city, and university chapters across Malaysia. Chapter information will appear as chapters are established.',
    NULL, 'Explore the Chapter Network', '/chapters', NULL, NULL, 9, true, 'published'
  ),
  (
    'events', 'Upcoming events and programs', 'Events',
    'Discover what is happening across the ASAM community, from workshops to conferences.',
    NULL, 'View All Events', '/events', NULL, NULL, 10, true, 'published'
  ),
  (
    'opportunities', 'Your gateway to academic and professional growth', 'Opportunities',
    'ASAM is building a central hub for scholarships, internships, jobs, competitions, conferences, and volunteer opportunities.',
    NULL, 'Explore Opportunities', '/opportunities', NULL, NULL, 11, true, 'published'
  ),
  (
    'academic_support', 'Excelling in your studies', 'Academic Support',
    'ASAM provides academic resources, mentorship, and information to help students succeed at their Malaysian universities.',
    NULL, 'Visit the Academic Hub', '/academic', NULL, NULL, 12, true, 'published'
  ),
  (
    'career_entrepreneurship', 'Building professional pathways', 'Career & Entrepreneurship',
    'From your first internship to your first startup, ASAM''s Career & Entrepreneurship department is here to support your professional journey in Malaysia and beyond.',
    NULL, 'Explore Career Resources', '/career', NULL, NULL, 13, true, 'published'
  ),
  (
    'cultural_community', 'Celebrating Afghan heritage in Malaysia', 'Culture & Community',
    'ASAM celebrates Afghan language, traditions, arts, and stories while building bridges with Malaysian culture.',
    NULL, 'Explore Culture & Heritage', '/culture', NULL, NULL, 14, true, 'published'
  ),
  (
    'alumni_network', 'A lifelong connection', 'Alumni Network',
    'ASAM is building an alumni network that keeps Afghan graduates connected as mentors, supporters, and leaders.',
    NULL, 'Explore the Alumni Network', '/alumni', NULL, NULL, 15, true, 'published'
  ),
  (
    'latest_news', 'The latest from ASAM', 'News & Stories',
    'Updates, announcements, and stories from the Afghan student community in Malaysia.',
    NULL, 'Visit News & Stories', '/news', NULL, NULL, 16, true, 'published'
  ),
  (
    'featured_programs', 'Programs that define our future', 'Flagship Initiatives',
    'ASAM is developing initiatives designed to create lasting impact for Afghan students in Malaysia.',
    NULL, NULL, NULL, NULL, NULL, 17, true, 'published'
  ),
  (
    'partners', 'Building institutional partnerships', 'Partners',
    'ASAM is building relationships with universities, organizations, and companies. Partner information will appear as partnerships are established.',
    NULL, 'Become a Partner', '/partners', NULL, NULL, 18, true, 'published'
  ),
  (
    'membership_cta', 'Join the ASAM community', NULL,
    'Become part of a growing national platform connecting Afghan students across Malaysia. Your journey starts here.',
    NULL, 'Become a Member', '/membership', 'Explore ASAM', '/about', 19, true, 'published'
  ),
  (
    'newsletter', 'Stay Connected', NULL,
    'Subscribe to receive ASAM updates, event announcements, and opportunities directly to your inbox.',
    NULL, 'Subscribe', NULL, NULL, NULL, 20, true, 'published'
  )
ON CONFLICT (section_key) DO NOTHING;

COMMIT;

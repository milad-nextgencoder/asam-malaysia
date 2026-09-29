-- Additive public page content CMS. Existing page copy is seeded from the current
-- public pages so the appearance and wording stay the same when this is applied.
CREATE TABLE public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL CHECK (page_key IN ('about','governance','academic','career','culture','research','sports','alumni','membership','welfare','transparency')),
  section_key text NOT NULL CHECK (section_key ~ '^[a-z0-9_]+$'),
  section_label text NOT NULL,
  eyebrow text,
  title text NOT NULL,
  subtitle text,
  description text,
  body text,
  image_url text,
  secondary_image_url text,
  button_text text,
  button_url text,
  secondary_button_text text,
  secondary_button_url text,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  visible boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_sections_page_key_section_key_key UNIQUE (page_key, section_key)
);

CREATE INDEX page_sections_public_order_idx ON public.page_sections (page_key, display_order)
  WHERE status = 'published' AND visible = true;

CREATE TRIGGER page_sections_set_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.page_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.page_sections TO authenticated;

CREATE POLICY asam_public_read_page_sections
  ON public.page_sections FOR SELECT TO anon, authenticated
  USING (status = 'published' AND visible = true);

CREATE POLICY asam_admin_manage_page_sections
  ON public.page_sections FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN','EDITOR']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN','EDITOR']));

INSERT INTO public.page_sections
  (page_key, section_key, section_label, eyebrow, title, description, display_order, visible, status)
VALUES
  ('about','hero','Page Hero','About ASAM','Building a national platform for Afghan students in Malaysia','ASAM is being built to connect, support, empower, and develop Afghan students and alumni in Malaysia through academic collaboration, student welfare, professional development, cultural engagement, leadership, networking, events, research, and community building.',0,true,'published'),
  ('governance','hero','Page Hero','Governance & Structure','The architecture of a national association','ASAM is built on a clear organizational structure, defined governance principles, and a decision-making framework designed to ensure accountability, transparency, and effective coordination.',0,true,'published'),
  ('academic','hero','Page Hero','Academic Hub','Your academic support center','ASAM''s Academic Affairs department provides resources, mentorship, and information to help you succeed academically at your Malaysian university.',0,true,'published'),
  ('career','hero','Page Hero','Career & Entrepreneurship','Building professional pathways','From your first internship to your first startup, ASAM''s Career & Entrepreneurship department is here to support your professional journey in Malaysia and beyond.',0,true,'published'),
  ('culture','hero','Page Hero','Culture & Heritage','Celebrating Afghan heritage in Malaysia','Our culture is our identity. ASAM celebrates Afghan heritage — our language, our traditions, our arts, and our stories — while building bridges with Malaysian culture and the broader international community.',0,true,'published'),
  ('research','hero','Page Hero','Research & Policy','The ASAM research center','Generating data, research, and policy insights to better understand and serve the Afghan student community in Malaysia.',0,true,'published'),
  ('sports','hero','Page Hero','Sports & Community','Healthy body, strong community','ASAM promotes health, teamwork, and community through sports and recreational activities. From football tournaments to hiking trips, there''s something for everyone.',0,true,'published'),
  ('alumni','hero','Page Hero','ASAM Alumni Network','A lifelong connection','ASAM is building an alumni network that keeps Afghan graduates connected to the community — as mentors, supporters, and leaders.',0,true,'published'),
  ('membership','hero','Page Hero','Membership','Join the ASAM community','Become part of a growing national platform connecting Afghan students across Malaysia. Your journey starts here.',0,true,'published'),
  ('welfare','hero','Page Hero','Student Welfare','Supporting you every step of the way','ASAM''s Student Welfare department provides informational and community support for new and continuing students — from orientation to peer support and referral resources.',0,true,'published'),
  ('transparency','hero','Page Hero','Transparency','Accountability and openness','ASAM is committed to operating with full transparency. This page provides information about our governance, policies, and accountability framework.',0,true,'published');

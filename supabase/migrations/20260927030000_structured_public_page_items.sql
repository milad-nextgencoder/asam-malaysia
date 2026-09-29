-- Structured, ordered content records for public page collections such as
-- cards, timeline phases, roadmap phases, and factual display statements.
CREATE TABLE public.page_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL CHECK (page_key IN ('about','governance','academic','career','culture','research','sports','alumni','membership','welfare','transparency')),
  collection_key text NOT NULL CHECK (collection_key ~ '^[a-z0-9_]+$'),
  item_type text NOT NULL CHECK (item_type IN ('card','feature','list_item','timeline','roadmap','statistic')),
  title text NOT NULL,
  description text,
  body text,
  phase text,
  metric text,
  icon text,
  image_url text,
  link_text text,
  link_url text,
  button_text text,
  button_url text,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  visible boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX page_items_public_order_idx
  ON public.page_items (page_key, collection_key, display_order)
  WHERE status = 'published' AND visible = true;

CREATE TRIGGER page_items_set_updated_at
  BEFORE UPDATE ON public.page_items
  FOR EACH ROW EXECUTE FUNCTION public.asam_set_updated_at();

ALTER TABLE public.page_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.page_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.page_items TO authenticated;

CREATE POLICY asam_public_read_page_items
  ON public.page_items FOR SELECT TO anon, authenticated
  USING (status = 'published' AND visible = true);

CREATE POLICY asam_admin_manage_page_items
  ON public.page_items FOR ALL TO authenticated
  USING (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN','EDITOR']))
  WITH CHECK (public.asam_has_website_admin_role(ARRAY['SUPER_ADMIN','EDITOR']));

-- Preserve the About page's current card, timeline, and roadmap content while
-- making those same records editable in the admin CMS.
INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, phase, display_order, visible, status)
VALUES
  ('about','core_values','card','Connection','We believe Afghan students in Malaysia are stronger together. We build bridges between universities, communities, and individuals.',NULL,1,true,'published'),
  ('about','core_values','card','Representation','We are working toward a platform that gives Afghan students a collective voice in Malaysian higher education.',NULL,2,true,'published'),
  ('about','core_values','card','Education','We champion academic excellence and support every student’s educational journey.',NULL,3,true,'published'),
  ('about','core_values','card','Opportunity','We create and share opportunities for academic, professional, and personal growth.',NULL,4,true,'published'),
  ('about','core_values','card','Leadership','We develop the next generation of Afghan leaders through mentorship, experience, and responsibility.',NULL,5,true,'published'),
  ('about','core_values','card','Culture','We celebrate Afghan heritage while embracing the richness of Malaysian culture.',NULL,6,true,'published'),
  ('about','core_values','card','Community','We are a family away from home, supporting each other through challenges and successes.',NULL,7,true,'published'),
  ('about','core_values','card','Integrity','We operate with transparency, accountability, and the highest ethical standards.',NULL,8,true,'published'),
  ('about','timeline','timeline','Foundation','Establishing ASAM’s core structure and leadership',NULL,1,true,'published'),
  ('about','timeline','timeline','Building','Creating the digital platform and membership system',NULL,2,true,'published'),
  ('about','timeline','timeline','Connecting','Linking Afghan students across universities',NULL,3,true,'published'),
  ('about','timeline','timeline','Expanding','Growing chapters and programs nationwide',NULL,4,true,'published'),
  ('about','timeline','timeline','Empowering','Delivering programs that create real impact',NULL,5,true,'published'),
  ('about','timeline','timeline','Sustaining','Building a lasting, self-sustaining community',NULL,6,true,'published'),
  ('about','roadmap','roadmap','Foundation','Establishing ASAM’s core leadership, governance, and digital platform.','01 · In Progress',1,true,'published'),
  ('about','roadmap','roadmap','Membership','Building the membership base and verification system.','02 · In Progress',2,true,'published'),
  ('about','roadmap','roadmap','University Network','Establishing university representatives and chapters across Malaysia.','03 · Planned',3,true,'published'),
  ('about','roadmap','roadmap','Chapter Expansion','Expanding to state and city-level chapters nationwide.','04 · Planned',4,true,'published'),
  ('about','roadmap','roadmap','Programs','Launching academic, career, cultural, and sports programs.','05 · Planned',5,true,'published'),
  ('about','roadmap','roadmap','Research & Partnerships','Building research initiatives and institutional partnerships.','06 · Planned',6,true,'published'),
  ('about','roadmap','roadmap','National Scale','Achieving national representation and impact.','07 · Planned',7,true,'published'),
  ('about','roadmap','roadmap','Alumni Ecosystem','Establishing a self-sustaining alumni community.','08 · Planned',8,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, display_order, visible, status)
VALUES
  ('career','career_services','card','Career Development','Career planning, guidance, and resources to help you navigate your professional path.','Briefcase',1,true,'published'),
  ('career','career_services','card','Internship Network','Information about internship opportunities and how to find them.','Network',2,true,'published'),
  ('career','career_services','card','Professional Mentorship','Connect with experienced professionals who can guide your career.','Users',3,true,'published'),
  ('career','career_services','card','Entrepreneurship','Support for student founders including resources, mentorship, and networking.','Rocket',4,true,'published'),
  ('career','career_services','card','CV & Interview Prep','Workshops, reviews, and mock interviews to help you stand out.','BookOpen',5,true,'published'),
  ('career','career_services','card','Professional Networking','Events and platforms to build your professional network.','Network',6,true,'published'),
  ('career','entrepreneurship','list_item','Founder stories and inspiration from the community',NULL,NULL,1,true,'published'),
  ('career','entrepreneurship','list_item','Mentorship from experienced entrepreneurs',NULL,NULL,2,true,'published'),
  ('career','entrepreneurship','list_item','Networking with potential co-founders and team members',NULL,NULL,3,true,'published'),
  ('career','entrepreneurship','list_item','Resources for business planning, legal structure, and funding',NULL,NULL,4,true,'published'),
  ('career','entrepreneurship','list_item','Showcase opportunities for student ventures',NULL,NULL,5,true,'published'),
  ('career','entrepreneurship_stages','card','Start','Turn your idea into a plan','Rocket',1,true,'published'),
  ('career','entrepreneurship_stages','card','Build','Find co-founders and mentors','Users',2,true,'published'),
  ('career','entrepreneurship_stages','card','Grow','Scale with resources and support','TrendingUp',3,true,'published'),
  ('career','entrepreneurship_stages','card','Showcase','Present at ASAM events','Award',4,true,'published'),
  ('career','cv_support','card','CV Writing','Learn how to structure and write an effective CV for the Malaysian and international job markets.',NULL,1,true,'published'),
  ('career','cv_support','card','Cover Letters','Craft compelling cover letters that get noticed by employers.',NULL,2,true,'published'),
  ('career','cv_support','card','Interview Prep','Mock interviews and tips for common interview questions and formats.',NULL,3,true,'published'),
  ('career','cv_support','card','LinkedIn','Optimize your LinkedIn profile for professional networking and job searching.',NULL,4,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, display_order, visible, status)
VALUES
  ('sports','programs','card','Football','Football teams and inter-university tournaments.','Trophy',1,true,'published'),
  ('sports','programs','card','Cricket','Cricket teams and competitive matches.','Trophy',2,true,'published'),
  ('sports','programs','card','Volleyball','Volleyball teams and community games.','Trophy',3,true,'published'),
  ('sports','programs','card','Badminton','Badminton clubs and tournaments.','Trophy',4,true,'published'),
  ('sports','programs','card','Basketball','Basketball teams and pickup games.','Trophy',5,true,'published'),
  ('sports','programs','card','Outdoor Activities','Hiking, camping, and outdoor adventures.','Heart',6,true,'published'),
  ('sports','community_activities','card','Fitness','Group fitness sessions and challenges','Activity',1,true,'published'),
  ('sports','community_activities','card','Recreation','Social and recreational activities','Heart',2,true,'published'),
  ('sports','community_activities','card','Team Building','Activities that build community bonds','Users',3,true,'published'),
  ('sports','community_activities','card','Community Days','Regular community sports days','CalendarDays',4,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, phase, display_order, visible, status)
VALUES
  ('governance','principles','card','Accountability','Every leader and member is accountable to the community and the organization’s values.','Shield',NULL,1,true,'published'),
  ('governance','principles','card','Transparency','Decisions, finances, and operations are conducted with openness and clarity.','FileText',NULL,2,true,'published'),
  ('governance','principles','card','Inclusivity','Every member has a voice. Decisions consider the needs of the entire community.','Users',NULL,3,true,'published'),
  ('governance','principles','card','Fairness','All members are treated equitably, regardless of university, background, or status.','Scale',NULL,4,true,'published'),
  ('governance','principles','card','Clear Structure','Roles, responsibilities, and reporting lines are clearly defined and communicated.','Network',NULL,5,true,'published'),
  ('governance','principles','card','Succession','Leadership transitions are planned, orderly, and ensure continuity of the organization.','RefreshCw',NULL,6,true,'published'),
  ('governance','principles','card','Participation','Members are encouraged to participate in decision-making and community building.','MessageSquare',NULL,7,true,'published'),
  ('governance','principles','card','Integrity','All actions and decisions are guided by the highest ethical standards.','Check',NULL,8,true,'published'),
  ('governance','decision_steps','list_item','Proposal','Any member or leader can propose an initiative, event, or policy change.',NULL,'01',1,true,'published'),
  ('governance','decision_steps','list_item','Review','Proposals are reviewed by the relevant department director and executive team.',NULL,'02',2,true,'published'),
  ('governance','decision_steps','list_item','Consultation','Affected members and stakeholders are consulted for input and feedback.',NULL,'03',3,true,'published'),
  ('governance','decision_steps','list_item','Decision','The executive team makes a decision based on input, feasibility, and alignment with ASAM’s mission.',NULL,'04',4,true,'published'),
  ('governance','decision_steps','list_item','Implementation','Approved proposals are implemented by the responsible department or team.',NULL,'05',5,true,'published'),
  ('governance','decision_steps','list_item','Review & Feedback','Implemented decisions are reviewed for effectiveness and community feedback is gathered.',NULL,'06',6,true,'published'),
  ('governance','coordination','card','Executive Meetings','Regular meetings of the executive leadership team to review progress, set priorities, and make decisions.',NULL,NULL,1,true,'published'),
  ('governance','coordination','card','Department Reports','Each department provides regular reports on activities, progress, and challenges.',NULL,NULL,2,true,'published'),
  ('governance','coordination','card','Chapter Coordination','Chapter leaders meet regularly to share updates and coordinate activities.',NULL,NULL,3,true,'published'),
  ('governance','coordination','card','Member Feedback','Members can provide feedback and suggestions through the member portal and regular surveys.',NULL,NULL,4,true,'published'),
  ('governance','coordination','card','Annual Review','A comprehensive annual review of ASAM’s activities, finances, and impact.',NULL,NULL,5,true,'published'),
  ('governance','coordination','card','Strategic Planning','Regular strategic planning sessions to set direction and priorities for the coming period.',NULL,NULL,6,true,'published')
ON CONFLICT DO NOTHING;

-- Extend the existing About page_sections records with meaningful long-form
-- copy already shown in the source page. This keeps its current presentation.
INSERT INTO public.page_sections
  (page_key, section_key, section_label, eyebrow, title, description, body, display_order, visible, status)
VALUES
  ('about','who_we_are','Who We Are','Who We Are','A community-driven national student platform',NULL,$body$The Afghan Students Association of Malaysia (ASAM) is a national platform being built by Afghan students, for Afghan students. We are creating a unified community that spans universities, cities, and states — connecting students who might otherwise never meet, and building a support system that extends far beyond any single campus.

We are working toward becoming a comprehensive national student association. While we are not yet the official representative body for every Afghan student in Malaysia, we are building the foundation, infrastructure, and community that will make that vision a reality.

ASAM serves participating members — students who choose to join, engage, and contribute to the community. Our commitment is to every member, and our goal is to make the Afghan student experience in Malaysia one of connection, growth, and opportunity.$body$,11,true,'published'),
  ('about','purpose','Purpose',NULL,'Our Purpose',NULL,'To ensure that no Afghan student in Malaysia is alone — that every student has access to a community, resources, opportunities, and a platform that amplifies their voice and supports their journey.',12,true,'published'),
  ('about','vision','Vision',NULL,'Our Vision',NULL,'To build a connected, empowered, and thriving Afghan student community across Malaysia — one where every student has access to support, opportunity, and a sense of belonging, regardless of which university they attend.',13,true,'published'),
  ('about','mission','Mission',NULL,'Our Mission',NULL,'To connect Afghan students across Malaysian universities through academic collaboration, student welfare, professional development, cultural engagement, leadership, and community building — creating a national platform that serves and empowers its members.',14,true,'published'),
  ('about','why_asam_exists','Why ASAM Exists','Why ASAM Exists','Because community is not optional — it is essential',NULL,$body$Afghan students in Malaysia come from diverse backgrounds, study at different universities, and live in different cities. But they share common experiences, challenges, and aspirations. ASAM exists to ensure that these shared experiences become the foundation for a strong, supportive community.

We believe that when students are connected, they are stronger. When they have access to resources, they succeed. When they have a platform, they are heard. And when they have a community, they thrive.$body$,15,true,'published'),
  ('about','long_term_vision','Long-Term Vision','Long-Term Vision','A self-sustaining community for generations',NULL,'Our long-term vision is to build an organization that outlives its founders — one that continues to serve Afghan students in Malaysia for decades to come. A community where today’s students become tomorrow’s alumni, mentors, and leaders, passing the torch to the next generation.',16,true,'published')
ON CONFLICT (page_key, section_key) DO NOTHING;

-- Membership page informational content only; no accounts or applications are created.
INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, body, phase, icon, display_order, visible, status)
VALUES
  ('membership','benefits','card','Community','Connect with Afghan students across all Malaysian universities',NULL,NULL,'Users',1,true,'published'),
  ('membership','benefits','card','Academic Support','Access scholarships, mentorship, and academic resources',NULL,NULL,'GraduationCap',2,true,'published'),
  ('membership','benefits','card','Opportunities','Discover internships, jobs, competitions, and training programs',NULL,NULL,'Award',3,true,'published'),
  ('membership','benefits','card','Welfare Support','Get orientation support, peer connections, and referral resources',NULL,NULL,'Heart',4,true,'published'),
  ('membership','benefits','card','Network','Build professional and social connections for life',NULL,NULL,'Handshake',5,true,'published'),
  ('membership','membership_types','card','Student Member','For Afghan students currently enrolled at a Malaysian university.','Access to all ASAM events and programs; Member portal access; Academic and career resources; Mentorship program eligibility; Voting rights in chapter elections; Community network access','Current enrollment at a Malaysian university and Afghan nationality.','GraduationCap',1,true,'published'),
  ('membership','membership_types','card','Alumni Member','For Afghan graduates who completed their studies in Malaysia.','Alumni network access; Mentorship program participation; Professional networking events; Opportunity sharing; Community event access','Completion of studies at a Malaysian university and Afghan nationality.','Users',2,true,'published'),
  ('membership','membership_types','card','Associate Member','For individuals who support ASAM''s mission but are not Afghan students.','Community event access; Newsletter subscription; Selective program participation','Support for ASAM''s mission and values.','Heart',3,true,'published'),
  ('membership','membership_types','card','Honorary Member','Extended to individuals who have made significant contributions to the Afghan student community.','Lifetime recognition; Special event invitations; Community recognition','By invitation of the executive leadership team.','Award',4,true,'published'),
  ('membership','membership_types','card','Institutional Partner','For universities, organizations, and companies partnering with ASAM.','Partnership recognition; Event collaboration opportunities; Access to ASAM network; Joint program development','Formal partnership agreement with ASAM.','Handshake',5,true,'published'),
  ('membership','process','list_item','Register','Fill out the membership registration form with your details and university information.',NULL,'01',NULL,1,true,'published'),
  ('membership','process','list_item','Verify','ASAM verifies your enrollment status and Afghan nationality.',NULL,'02',NULL,2,true,'published'),
  ('membership','process','list_item','Activate','Once verified, your membership is activated and you receive access to the member portal.',NULL,'03',NULL,3,true,'published'),
  ('membership','process','list_item','Engage','Join events, access resources, connect with the community, and start your ASAM journey.',NULL,'04',NULL,4,true,'published'),
  ('membership','responsibilities','list_item','Uphold ASAM''s values and mission',NULL,NULL,NULL,NULL,1,true,'published'),
  ('membership','responsibilities','list_item','Respect fellow members and the community',NULL,NULL,NULL,NULL,2,true,'published'),
  ('membership','responsibilities','list_item','Provide accurate information during registration',NULL,NULL,NULL,NULL,3,true,'published'),
  ('membership','responsibilities','list_item','Participate in community activities when possible',NULL,NULL,NULL,NULL,4,true,'published'),
  ('membership','responsibilities','list_item','Represent ASAM positively in the broader community',NULL,NULL,NULL,NULL,5,true,'published'),
  ('membership','responsibilities','list_item','Maintain membership information up to date',NULL,NULL,NULL,NULL,6,true,'published'),
  ('membership','member_conduct','list_item','Treat all members with respect and dignity',NULL,NULL,NULL,NULL,1,true,'published'),
  ('membership','member_conduct','list_item','Do not discriminate based on ethnicity, gender, religion, or background',NULL,NULL,NULL,NULL,2,true,'published'),
  ('membership','member_conduct','list_item','Do not use ASAM platforms for personal gain at the community''s expense',NULL,NULL,NULL,NULL,3,true,'published'),
  ('membership','member_conduct','list_item','Respect the privacy of fellow members',NULL,NULL,NULL,NULL,4,true,'published'),
  ('membership','member_conduct','list_item','Report violations through appropriate channels',NULL,NULL,NULL,NULL,5,true,'published'),
  ('membership','member_conduct','list_item','Contribute to a positive and inclusive community',NULL,NULL,NULL,NULL,6,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections
  (page_key, section_key, section_label, eyebrow, title, description, button_text, button_url, display_order, visible, status)
VALUES
  ('membership','join_asam_today','Join ASAM CTA','Join ASAM','Join ASAM today','Your membership is the foundation of our community. Join ASAM and help build a national platform for Afghan students in Malaysia.','Register Now','/contact',6,true,'published')
ON CONFLICT (page_key, section_key) DO NOTHING;

INSERT INTO public.page_sections
  (page_key, section_key, section_label, title, description, body, display_order, visible, status)
VALUES
  ('academic','scholarship_information','Scholarship Information','Discover scholarship opportunities',NULL,'ASAM is building a scholarship information network to help Afghan students discover and apply for scholarships available in Malaysia. While ASAM does not directly offer scholarships, we connect our members with opportunities from universities, government programs, and private organizations.',2,true,'published')
ON CONFLICT (page_key, section_key) DO NOTHING;

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, display_order, visible, status)
VALUES
  ('welfare','new_student_guide','card','Arrival','What to do when you first arrive in Malaysia — airport, transport, accommodation.','Home',1,true,'published'),
  ('welfare','new_student_guide','card','University Enrollment','Guide to university registration, student ID, and course enrollment.','BookOpen',2,true,'published'),
  ('welfare','new_student_guide','card','Health & Wellbeing','Information on healthcare, insurance, and mental health resources.','Heart',3,true,'published'),
  ('welfare','new_student_guide','card','Community','How to connect with the Afghan student community and ASAM.','Users',4,true,'published'),
  ('welfare','new_student_guide','card','Living in Malaysia','Essential information about daily life, culture, and practicalities.','Info',5,true,'published'),
  ('welfare','new_student_guide','card','Important Contacts','Key contacts for emergencies, university offices, and embassies.','Phone',6,true,'published'),
  ('welfare','daily_life','card','Accommodation','Types of student housing, what to expect, and how to find accommodation.',NULL,1,true,'published'),
  ('welfare','daily_life','card','Transportation','Public transport, student cards, and getting around Malaysian cities.',NULL,2,true,'published'),
  ('welfare','daily_life','card','Banking & Finance','Opening a bank account, managing finances, and money transfer options.',NULL,3,true,'published'),
  ('welfare','daily_life','card','Food & Dining','Halal food availability, Afghan restaurants, and cooking options.',NULL,4,true,'published'),
  ('welfare','daily_life','card','Weather & Clothing','Malaysia’s tropical climate and what to pack.',NULL,5,true,'published'),
  ('welfare','daily_life','card','Communication','Mobile plans, internet, and staying connected with family.',NULL,6,true,'published'),
  ('welfare','daily_life','card','Safety','General safety tips and emergency contacts.',NULL,7,true,'published'),
  ('welfare','daily_life','card','Culture & Customs','Understanding Malaysian culture, customs, and etiquette.',NULL,8,true,'published'),
  ('welfare','peer_support','card','Peer Mentors','Connect with experienced students who can answer your questions and provide guidance.','Heart',1,true,'published'),
  ('welfare','peer_support','card','Community Groups','Join WhatsApp, Telegram, or other community groups organized by university or city.','Heart',2,true,'published'),
  ('welfare','peer_support','card','Welfare Referrals','If you need specialized support, ASAM can refer you to appropriate services.','Heart',3,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections
  (page_key, section_key, section_label, eyebrow, title, subtitle, description, body, display_order, visible, status)
VALUES
  ('welfare','asam_new_student_orientation','Orientation','Orientation','New Student Welcome & Orientation','A virtual session for new students','A virtual welcome session for new Afghan students arriving in Malaysia.','Join our virtual orientation session to learn about university life, living in Malaysia, student resources, and how to connect with the ASAM community. This session is designed for new Afghan students and covers everything you need to know to get started.',2,true,'published')
ON CONFLICT (page_key, section_key) DO NOTHING;

UPDATE public.page_sections
SET body = COALESCE(body, 'Join our virtual orientation session to learn about university life, living in Malaysia, student resources, and how to connect with the ASAM community. This session is designed for new Afghan students and covers everything you need to know to get started.')
WHERE page_key = 'welfare' AND section_key = 'asam_new_student_orientation';

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, display_order, visible, status)
VALUES
  ('transparency','pillars','card','Open Governance','Clear organizational structure, roles, and decision-making processes.','Eye',1,true,'published'),
  ('transparency','pillars','card','Public Policies','Constitution, code of conduct, and policies available to all members.','FileText',2,true,'published'),
  ('transparency','pillars','card','Annual Reports','Regular reports on activities, finances, and impact.','ScrollText',3,true,'published'),
  ('transparency','pillars','card','Data Privacy','Clear data handling practices and member privacy protections.','Lock',4,true,'published'),
  ('transparency','privacy','feature','Data Collection','ASAM collects member information necessary for membership management, including name, university enrollment, contact details, and membership preferences. We do not collect sensitive personal information such as passport numbers or financial details through the website.',NULL,1,true,'published'),
  ('transparency','privacy','feature','Data Usage','Member data is used for membership verification, communication, event registration, and community building. We do not sell or share member data with third parties.',NULL,2,true,'published'),
  ('transparency','privacy','feature','Data Protection','ASAM implements appropriate security measures to protect member data. Access to member data is restricted to authorized personnel only. The full privacy policy will be published once finalized.',NULL,3,true,'published'),
  ('transparency','privacy','feature','Member Rights','Members have the right to access, update, and request deletion of their personal data. Members can control the visibility of their profile information through the member portal.',NULL,4,true,'published'),
  ('transparency','privacy','feature','Malaysian Data Protection','ASAM is designed to comply with applicable Malaysian data protection obligations, including the Personal Data Protection Act (PDPA). The full compliance framework will be published once finalized.',NULL,5,true,'published'),
  ('transparency','conduct','list_item','Treat all members with respect, dignity, and fairness',NULL,NULL,1,true,'published'),
  ('transparency','conduct','list_item','Do not discriminate based on ethnicity, gender, religion, or background',NULL,NULL,2,true,'published'),
  ('transparency','conduct','list_item','Do not use ASAM platforms for personal gain at the community’s expense',NULL,NULL,3,true,'published'),
  ('transparency','conduct','list_item','Respect the privacy and confidentiality of fellow members',NULL,NULL,4,true,'published'),
  ('transparency','conduct','list_item','Represent ASAM positively in the broader community',NULL,NULL,5,true,'published'),
  ('transparency','conduct','list_item','Report violations through appropriate channels',NULL,NULL,6,true,'published'),
  ('transparency','conduct','list_item','Contribute to a positive, inclusive, and supportive community',NULL,NULL,7,true,'published'),
  ('transparency','conduct','list_item','Uphold the values and mission of ASAM in all activities',NULL,NULL,8,true,'published')
ON CONFLICT DO NOTHING;

-- Existing academic information cards; scholarship and event records continue
-- to come from their dedicated CMS tables rather than being duplicated here.
INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, display_order, visible, status)
VALUES
  ('academic','academic_resources','card','Scholarships','Information and guidance on scholarship opportunities available to Afghan students in Malaysia.','Award',1,true,'published'),
  ('academic','academic_resources','card','Academic Mentorship','Connect with mentors who can guide you through your academic journey at your university.','Users',2,true,'published'),
  ('academic','academic_resources','card','Research','Find research partners, collaborate on projects, and access research resources.','FlaskConical',3,true,'published'),
  ('academic','academic_resources','card','Study Resources','Access shared study materials, notes, and academic resources from the community.','BookOpen',4,true,'published'),
  ('academic','academic_resources','card','Language Support','Support for English and Bahasa Malaysia language learning.','Languages',5,true,'published'),
  ('academic','academic_resources','card','Academic Events','Workshops, seminars, and academic-focused events.','CalendarDays',6,true,'published'),
  ('academic','mentorship','card','Peer Mentors','Connect with senior students in your field of study who can share their experience and advice.','GraduationCap',1,true,'published'),
  ('academic','mentorship','card','Alumni Mentors','Learn from graduates who have successfully navigated the Malaysian university system.','GraduationCap',2,true,'published'),
  ('academic','mentorship','card','Faculty Connections','Get guidance on building relationships with professors and academic advisors.','GraduationCap',3,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, display_order, visible, status)
VALUES
  ('culture','heritage','card','Literature','Poetry, stories, and literary traditions','BookOpen',1,true,'published'),
  ('culture','heritage','card','Arts & Crafts','Carpets, calligraphy, and visual arts','Lightbulb',2,true,'published'),
  ('culture','heritage','card','Music','Traditional instruments and melodies','Music',3,true,'published'),
  ('culture','heritage','card','Traditions','Festivals, customs, and celebrations','Sparkles',4,true,'published'),
  ('culture','language','card','Dari','The Persian dialect spoken by many Afghans, rich in poetry and literature.','Languages',1,true,'published'),
  ('culture','language','card','Pashto','The language of the Pashtun people, with a deep oral tradition and poetry.','Languages',2,true,'published'),
  ('culture','language','card','Language Events','Poetry readings, storytelling, and language-focused community events.','Languages',3,true,'published'),
  ('culture','language','card','Language Support','Resources for maintaining your language skills while studying abroad.','Languages',4,true,'published'),
  ('culture','connection','card','Intercultural Programs','Events that celebrate both Afghan and Malaysian culture','Globe2',1,true,'published'),
  ('culture','connection','card','Community Exchange','Connecting with Malaysian student communities','Users',2,true,'published'),
  ('culture','connection','card','Shared Values','Celebrating common values and traditions','Heart',3,true,'published'),
  ('culture','connection','card','Cultural Showcases','Sharing Afghan culture with the Malaysian public','Sparkles',4,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, metric, display_order, visible, status)
VALUES
  ('research','research_cards','card','Student Research','Supporting student-led research projects about the Afghan student experience in Malaysia.','FlaskConical',NULL,1,true,'published'),
  ('research','research_cards','card','Surveys','Regular community surveys to understand member needs and gather feedback.','BarChart3',NULL,2,true,'published'),
  ('research','research_cards','card','Publications','Research publications, working papers, and policy briefs.','FileText',NULL,3,true,'published'),
  ('research','research_cards','card','Reports','Annual and special reports on the state of the Afghan student community.','Database',NULL,4,true,'published'),
  ('research','research_cards','card','Data Analysis','Data-driven insights to inform ASAM programs and advocacy.','TrendingUp',NULL,5,true,'published'),
  ('research','research_cards','card','Policy Research','Research on policies affecting Afghan students in Malaysia.','BookOpen',NULL,6,true,'published'),
  ('research','statistics','statistic','Total Members','Verified members',NULL,'Not published',1,true,'published'),
  ('research','statistics','statistic','Universities','With ASAM presence',NULL,'Not published',2,true,'published'),
  ('research','statistics','statistic','State Chapters','Active chapters',NULL,'Not published',3,true,'published'),
  ('research','statistics','statistic','Events Held','Total events',NULL,'Not published',4,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_items
  (page_key, collection_key, item_type, title, description, icon, display_order, visible, status)
VALUES
  ('alumni','lifecycle','list_item','Student',NULL,NULL,1,true,'published'),
  ('alumni','lifecycle','list_item','Graduate',NULL,NULL,2,true,'published'),
  ('alumni','lifecycle','list_item','Alumni',NULL,NULL,3,true,'published'),
  ('alumni','lifecycle','list_item','Mentor',NULL,NULL,4,true,'published'),
  ('alumni','lifecycle','list_item','Leader',NULL,NULL,5,true,'published'),
  ('alumni','lifecycle','list_item','Supporter',NULL,NULL,6,true,'published'),
  ('alumni','programs','card','Alumni Mentorship','Mentor current students and share your experience and guidance.','Heart',1,true,'published'),
  ('alumni','programs','card','Career Network','Share job opportunities and professional connections with the community.','Briefcase',2,true,'published'),
  ('alumni','programs','card','Alumni Events','Reunions, networking events, and alumni gatherings.','CalendarDays',3,true,'published'),
  ('alumni','programs','card','Professional Stories','Share your professional journey and inspire current students.','Users',4,true,'published'),
  ('alumni','programs','card','Alumni Opportunities','Post jobs, internships, and opportunities for the community.','TrendingUp',5,true,'published'),
  ('alumni','programs','card','Alumni Recognition','Recognizing alumni achievements and contributions to the community.','Award',6,true,'published'),
  ('alumni','mentorship','card','Academic','Guide students academically','BookOpen',1,true,'published'),
  ('alumni','mentorship','card','Career','Share professional insights','Briefcase',2,true,'published'),
  ('alumni','mentorship','card','Personal','Offer personal support','Heart',3,true,'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections
  (page_key, section_key, section_label, title, body, button_text, button_url, display_order, visible, status)
VALUES
  ('alumni','volunteer_as_a_mentor','Volunteer as a Mentor','Volunteer as a Mentor','If you are an Afghan alumnus of a Malaysian university, you can make a lasting impact by mentoring current students. Share your knowledge, experience, and network to help the next generation succeed.',NULL,NULL,4,true,'published'),
  ('alumni','join_the_alumni_network','Join the Alumni Network','Join the Alumni Network','If you are an Afghan graduate of a Malaysian university, register with ASAM’s Alumni Network and stay connected with the community.','Register as Alumni','/contact',5,true,'published')
ON CONFLICT (page_key, section_key) DO NOTHING;

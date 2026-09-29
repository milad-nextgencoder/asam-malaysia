export type PageContentModule = 'about' | 'governance' | 'academic' | 'career' | 'culture' | 'research' | 'sports' | 'alumni' | 'membership-content' | 'welfare' | 'transparency';
export type PageItemsModule = 'about-items' | 'governance-items' | 'academic-items' | 'career-items' | 'culture-items' | 'research-items' | 'sports-items' | 'alumni-items' | 'membership-content-items' | 'welfare-items' | 'transparency-items';
export type ContentModule = 'leadership' | 'departments' | 'chapters' | 'universities' | 'events' | 'news' | 'opportunities' | 'scholarships' | 'partners' | 'faqs' | 'documents' | PageContentModule | PageItemsModule;
export type ContentField = { name: string; label: string; type?: 'text' | 'textarea' | 'url' | 'date' | 'time' | 'number' | 'image' | 'file' | 'select'; options?: string[]; required?: boolean };

type ContentConfig = { title: string; table: string; fields: ContentField[]; ordered?: boolean; chapter?: boolean; pageContent?: boolean; pageItems?: boolean };

const pageSections: Record<PageContentModule, { pageKey: string; title: string; sections: string[] }> = {
  about: { pageKey: 'about', title: 'About Page', sections: ['hero','who_we_are','purpose','vision','mission','why_asam_exists','long_term_vision','what_we_stand_for','the_road_ahead','eight_phases_to_national_scale','cta'] },
  governance: { pageKey: 'governance', title: 'Governance Page', sections: ['hero','from_president_to_volunteers','the_principles_that_guide_our_decisions','how_decisions_are_made','how_we_stay_aligned','cta'] },
  academic: { pageKey: 'academic', title: 'Academic Page', sections: ['hero','academic_resources_at_your_fingertips','scholarship_information','academic_mentorship_program','research_collaboration','resources_for_your_university','cta'] },
  career: { pageKey: 'career', title: 'Career Page', sections: ['hero','your_career_development_hub','internship_opportunities','stand_out_from_the_crowd','stories_from_afghan_entrepreneurs','cta'] },
  culture: { pageKey: 'culture', title: 'Culture Page', sections: ['hero','preserving_dari_and_pashto','celebrating_together','from_kabul_to_kuala_lumpur','cta'] },
  research: { pageKey: 'research', title: 'Research Page', sections: ['hero','understanding_our_community_through_data','visualizing_our_community','research_publications','policy_discussions_student_input','cta'] },
  sports: { pageKey: 'sports', title: 'Sports Page', sections: ['hero','find_your_sport','upcoming_competitions','more_than_just_sports','tournament_results','cta'] },
  alumni: { pageKey: 'alumni', title: 'Alumni Page', sections: ['hero','from_student_to_supporter','afghan_graduates_of_malaysian_universities','ways_to_stay_connected','volunteer_as_a_mentor','join_the_alumni_network'] },
  'membership-content': { pageKey: 'membership', title: 'Membership Information Page', sections: ['hero','five_reasons_to_become_a_member','choose_the_right_membership_for_you','the_membership_process','frequently_asked_questions','join_asam_today'] },
  welfare: { pageKey: 'welfare', title: 'Welfare Page', sections: ['hero','welcome_to_malaysia','asam_new_student_orientation','practical_information_for_daily_life','you_are_not_alone','frequently_asked_questions','cta'] },
  transparency: { pageKey: 'transparency', title: 'Transparency Page', sections: ['hero','what_transparency_means_to_us','official_documents','how_we_handle_your_data','our_community_standards','cta'] },
};

const pageContentConfig = Object.fromEntries(Object.entries(pageSections).map(([module, page]) => [module, {
  title: page.title,
  table: 'page_sections',
  pageContent: true,
  ordered: true,
  fields: [
    { name: 'section_key', label: 'Page Section', type: 'select', options: page.sections, required: true },
    { name: 'section_label', label: 'Section Name', required: true },
    { name: 'eyebrow', label: 'Eyebrow' },
    { name: 'title', label: 'Title', required: true },
    { name: 'subtitle', label: 'Subtitle' },
    { name: 'description', label: 'Short Description', type: 'textarea' },
    { name: 'body', label: 'Long-form Content', type: 'textarea' },
    { name: 'image_url', label: 'Image', type: 'image' },
    { name: 'secondary_image_url', label: 'Secondary Image', type: 'image' },
    { name: 'display_order', label: 'Display Order', type: 'number' },
    { name: 'button_text', label: 'Button Text' },
    { name: 'button_url', label: 'Button URL', type: 'url' },
    { name: 'secondary_button_text', label: 'Secondary Button Text' },
    { name: 'secondary_button_url', label: 'Secondary Button URL', type: 'url' },
  ],
}])) as Record<PageContentModule, ContentConfig>;

export const pageContentPageKeys: Record<PageContentModule, string> = Object.fromEntries(Object.entries(pageSections).map(([module, page]) => [module, page.pageKey])) as Record<PageContentModule, string>;
export const pageContentModules = Object.keys(pageSections) as PageContentModule[];

const pageItemPages: Record<PageItemsModule, { pageKey: string; collections: string[] }> = {
  'about-items': { pageKey: 'about', collections: ['core_values','timeline','roadmap'] },
  'governance-items': { pageKey: 'governance', collections: ['principles','decision_steps','coordination'] },
  'academic-items': { pageKey: 'academic', collections: ['academic_resources','mentorship','study_resources','language_support'] },
  'career-items': { pageKey: 'career', collections: ['career_services','professional_development','cv_support','entrepreneurship','entrepreneurship_stages'] },
  'culture-items': { pageKey: 'culture', collections: ['heritage','language','connection'] },
  'research-items': { pageKey: 'research', collections: ['research_cards','statistics','policy_topics'] },
  'sports-items': { pageKey: 'sports', collections: ['programs','community_activities','teams'] },
  'alumni-items': { pageKey: 'alumni', collections: ['lifecycle','programs','mentorship'] },
  'membership-content-items': { pageKey: 'membership', collections: ['benefits','membership_types','process','responsibilities','member_conduct'] },
  'welfare-items': { pageKey: 'welfare', collections: ['new_student_guide','daily_life','peer_support','important_contacts'] },
  'transparency-items': { pageKey: 'transparency', collections: ['pillars','conduct','privacy'] },
};

const pageItemConfig = Object.fromEntries(Object.entries(pageItemPages).map(([module, page]) => [module, {
  title: `${page.pageKey[0].toUpperCase()}${page.pageKey.slice(1)} Cards & Items`,
  table: 'page_items',
  pageItems: true,
  ordered: true,
  fields: [
    { name: 'collection_key', label: 'Page Collection', type: 'select', options: page.collections, required: true },
    { name: 'item_type', label: 'Content Type', type: 'select', options: ['card','feature','list_item','timeline','roadmap','statistic'], required: true },
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'body', label: 'Additional Content', type: 'textarea' },
    { name: 'phase', label: 'Phase / Date' },
    { name: 'metric', label: 'Statistic Label / Value' },
    { name: 'icon', label: 'Icon Name' },
    { name: 'image_url', label: 'Image', type: 'image' },
    { name: 'link_text', label: 'Link Text' },
    { name: 'link_url', label: 'Link URL', type: 'url' },
    { name: 'button_text', label: 'Button Text' },
    { name: 'button_url', label: 'Button URL', type: 'url' },
    { name: 'display_order', label: 'Display Order', type: 'number' },
  ],
}])) as Record<PageItemsModule, ContentConfig>;

export const pageItemsModules = Object.keys(pageItemPages) as PageItemsModule[];
export const pageItemPageKeys: Record<PageItemsModule, string> = Object.fromEntries(Object.entries(pageItemPages).map(([module, page]) => [module, page.pageKey])) as Record<PageItemsModule, string>;

export const contentConfig: Record<ContentModule, ContentConfig> = {
  leadership: { title: 'Leadership', table: 'leadership', ordered: true, fields: [
    { name: 'name', label: 'Full Name', required: true }, { name: 'position', label: 'Position', required: true }, { name: 'bio', label: 'Biography', type: 'textarea' }, { name: 'department_id', label: 'Department', type: 'select', options: [] }, { name: 'photo_url', label: 'Profile Photo', type: 'image' }, { name: 'social_links', label: 'Social Links' }, { name: 'display_order', label: 'Display Order', type: 'number' },
  ] },
  departments: { title: 'Departments', table: 'departments', ordered: true, fields: [
    { name: 'name', label: 'Name', required: true }, { name: 'number', label: 'Number', required: true }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'mission', label: 'Mission', type: 'textarea' }, { name: 'icon', label: 'Icon', type: 'select', options: ['GraduationCap', 'HeartHandshake', 'Briefcase', 'Handshake', 'CalendarDays', 'Megaphone', 'FlaskConical', 'Users', 'Cpu', 'Palette', 'Trophy', 'Building2'] }, { name: 'image_url', label: 'Image', type: 'image' }, { name: 'leader', label: 'Leader' }, { name: 'display_order', label: 'Display Order', type: 'number' },
  ] },
  chapters: { title: 'Chapters', table: 'chapters', ordered: true, chapter: true, fields: [
    { name: 'name', label: 'Chapter Name', required: true }, { name: 'state', label: 'State', required: true }, { name: 'city', label: 'City' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'university', label: 'University' }, { name: 'representative', label: 'Representative' }, { name: 'image_url', label: 'Image', type: 'image' }, { name: 'display_order', label: 'Display Order', type: 'number' },
  ] },
  universities: { title: 'Universities', table: 'universities', fields: [
    { name: 'name', label: 'University Name', required: true }, { name: 'state', label: 'State' }, { name: 'city', label: 'City' }, { name: 'website', label: 'Website', type: 'url' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'logo_url', label: 'Logo', type: 'image' }, { name: 'chapter_status', label: 'Chapter Status', type: 'select', options: ['active', 'coming_soon', 'inactive'] }, { name: 'representative', label: 'Representative' },
  ] },
  events: { title: 'Events', table: 'events', ordered: false, fields: [
    { name: 'title', label: 'Title', required: true }, { name: 'slug', label: 'Slug (auto if empty)' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'time', label: 'Time', type: 'time' }, { name: 'location', label: 'Location' }, { name: 'category', label: 'Category', type: 'select', options: ['Academic', 'Career', 'Cultural', 'Leadership', 'Sports', 'Networking', 'Entrepreneurship'] }, { name: 'featured_image_url', label: 'Featured Image', type: 'image' }, { name: 'registration_url', label: 'Registration URL', type: 'url' },
  ] },
  news: { title: 'News', table: 'news', ordered: false, fields: [
    { name: 'title', label: 'Title', required: true }, { name: 'slug', label: 'Slug (auto if empty)' }, { name: 'excerpt', label: 'Excerpt', type: 'textarea' }, { name: 'content', label: 'Article Content', type: 'textarea' }, { name: 'featured_image_url', label: 'Featured Image', type: 'image' }, { name: 'author', label: 'Author' }, { name: 'category', label: 'Category' }, { name: 'publication_date', label: 'Publication Date', type: 'date' },
  ] },
  opportunities: { title: 'Opportunities', table: 'opportunities', ordered: false, fields: [
    { name: 'title', label: 'Title', required: true }, { name: 'organization', label: 'Organization' }, { name: 'category', label: 'Category' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'eligibility', label: 'Eligibility', type: 'textarea' }, { name: 'location', label: 'Location' }, { name: 'deadline', label: 'Deadline', type: 'date' }, { name: 'application_url', label: 'Application URL', type: 'url' }, { name: 'image_url', label: 'Image', type: 'image' },
  ] },
  scholarships: { title: 'Scholarships', table: 'scholarships', ordered: false, fields: [
    { name: 'title', label: 'Title', required: true }, { name: 'provider', label: 'Provider' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'eligibility', label: 'Eligibility', type: 'textarea' }, { name: 'deadline', label: 'Deadline', type: 'date' }, { name: 'amount', label: 'Amount' }, { name: 'application_url', label: 'Application URL', type: 'url' }, { name: 'image_url', label: 'Featured Image', type: 'image' },
  ] },
  partners: { title: 'Partners', table: 'partners', ordered: true, fields: [
    { name: 'organization', label: 'Organization', required: true }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'website', label: 'Website', type: 'url' }, { name: 'logo_url', label: 'Logo', type: 'image' }, { name: 'partner_type', label: 'Partner Type' }, { name: 'display_order', label: 'Display Order', type: 'number' },
  ] },
  faqs: { title: 'FAQs', table: 'faqs', ordered: true, fields: [
    { name: 'question', label: 'Question', required: true }, { name: 'answer', label: 'Answer', type: 'textarea', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['Membership', 'Universities', 'Events', 'Scholarships', 'Chapters', 'Careers', 'Alumni', 'Student Welfare', 'Partnerships', 'General'] }, { name: 'display_order', label: 'Display Order', type: 'number' },
  ] },
  documents: { title: 'Documents', table: 'documents', ordered: false, fields: [
    { name: 'title', label: 'Title', required: true }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'category', label: 'Category', type: 'select', options: ['Governance', 'Policies', 'Reports', 'Resources', 'Forms', 'Publications', 'Other'] }, { name: 'file_url', label: 'Public File (PDF)', type: 'file' }, { name: 'published_at', label: 'Publication Date', type: 'date' },
  ] },
  ...pageContentConfig,
  ...pageItemConfig,
};

export const contentModules = Object.keys(contentConfig) as ContentModule[];

export type HomepageSection = {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  display_order: number;
  visible: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
};

export type HomepageSectionDraft = Pick<HomepageSection,
  'section_key' | 'title' | 'subtitle' | 'description' | 'image_url' |
  'button_text' | 'button_url' | 'secondary_button_text' |
  'secondary_button_url' | 'display_order' | 'visible' | 'status'
>;

export type HomepageSectionGroup = {
  key: string;
  title: string;
  description: string;
  keys: string[];
};

export const homepageSectionGroups: HomepageSectionGroup[] = [
  { key: 'hero', title: 'Hero', description: 'Opening statement, calls to action, and rotating background imagery.', keys: ['hero'] },
  { key: 'introduction', title: 'Introduction', description: 'ASAM introduction and the Learn More link.', keys: ['introduction'] },
  { key: 'vision', title: 'Vision & Mission', description: 'The paired vision and mission cards.', keys: ['vision', 'mission'] },
  { key: 'what_asam_does', title: 'What ASAM Does', description: 'Department ecosystem introduction and departments link.', keys: ['what_asam_does'] },
  { key: 'leadership', title: 'Leadership', description: 'Founding team introduction and leadership link.', keys: ['leadership'] },
  { key: 'departments_overview', title: 'Departments Overview', description: 'Department overview introduction and directory link.', keys: ['departments_overview'] },
  { key: 'student_network', title: 'Student Network', description: 'Student network introduction and link.', keys: ['student_network'] },
  { key: 'chapters', title: 'Chapters', description: 'National chapter network introduction and link.', keys: ['chapters'] },
  { key: 'events', title: 'Upcoming Events', description: 'Events introduction and events link.', keys: ['events'] },
  { key: 'opportunities', title: 'Opportunities', description: 'Academic and professional opportunities introduction.', keys: ['opportunities'] },
  { key: 'academic_support', title: 'Academic Support', description: 'Academic support introduction and link.', keys: ['academic_support'] },
  { key: 'career_entrepreneurship', title: 'Career & Entrepreneurship', description: 'Career introduction and resources link.', keys: ['career_entrepreneurship'] },
  { key: 'cultural_community', title: 'Cultural Community', description: 'Culture introduction and heritage link.', keys: ['cultural_community'] },
  { key: 'alumni_network', title: 'Alumni Network', description: 'Alumni introduction and link.', keys: ['alumni_network'] },
  { key: 'latest_news', title: 'Latest News', description: 'News introduction and news link.', keys: ['latest_news'] },
  { key: 'featured_programs', title: 'Featured Programs', description: 'Flagship initiatives introduction.', keys: ['featured_programs'] },
  { key: 'partners', title: 'Partners', description: 'Partnership introduction and partner link.', keys: ['partners'] },
  { key: 'membership_cta', title: 'Membership Call to Action', description: 'Membership prompt with two calls to action.', keys: ['membership_cta'] },
  { key: 'newsletter', title: 'Newsletter', description: 'Newsletter heading and subscription prompt.', keys: ['newsletter'] },
];

export const homepageLegacyOrder: Record<string, number> = Object.fromEntries(
  homepageSectionGroups.map((group, index) => [group.key, index + 1])
);


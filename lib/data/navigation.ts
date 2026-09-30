export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description: string }[];
}

export const navItems: NavItem[] = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'About ASAM', href: '/about', description: 'Who we are and why we exist' },
      { label: 'Leadership', href: '/leadership', description: 'Meet our founding leadership team' },
      { label: 'Governance & Structure', href: '/governance', description: 'Organizational architecture' },
      { label: 'Transparency', href: '/transparency', description: 'Accountability and openness' },
    ],
  },
  {
    label: 'Departments',
    href: '/departments',
    children: [
      { label: 'All Departments', href: '/departments', description: 'Explore all 12 departments' },
      { label: 'Academic Affairs', href: '/departments#academic-affairs', description: 'Scholarships, mentorship, research' },
      { label: 'Student Welfare', href: '/departments#student-welfare', description: 'Support, orientation, resources' },
      { label: 'Career & Entrepreneurship', href: '/departments#career-entrepreneurship', description: 'Jobs, internships, networking' },
      { label: 'External Relations', href: '/departments#external-relations', description: 'Partnerships and external engagement' },
      { label: 'Events & Programs', href: '/departments#events-programs', description: 'Events and community programs' },
      { label: 'Communications & Media', href: '/departments#communications-media', description: 'Communications and media' },
      { label: 'Research & Policy', href: '/departments#research-policy', description: 'Research and policy initiatives' },
      { label: 'Membership & Community', href: '/departments#membership-community', description: 'Membership and community building' },
      { label: 'Technology & Digital', href: '/departments#technology-digital', description: 'Digital tools and technology' },
      { label: 'Culture & Heritage', href: '/departments#culture-heritage', description: 'Afghan culture and heritage' },
      { label: 'Sports & Recreation', href: '/departments#sports-recreation', description: 'Sports and recreation' },
      { label: 'Alumni Relations', href: '/departments#alumni-relations', description: 'Alumni connections and engagement' },
    ],
  },
  {
    label: 'Chapters',
    href: '/chapters',
    children: [
      { label: 'State Chapters', href: '/chapters', description: 'National chapter network' },
      { label: 'University Network', href: '/universities', description: 'Searchable university directory' },
    ],
  },
  {
    label: 'Membership',
    href: '/membership',
    children: [
      { label: 'Become a Member', href: '/membership', description: 'Join the ASAM community' },
      { label: 'Member Portal', href: '/member', description: 'Member dashboard' },
      { label: 'Volunteer', href: '/join', description: 'Volunteer roles and opportunities' },
    ],
  },
  {
    label: 'Academic',
    href: '/academic',
    children: [
      { label: 'Academic Hub', href: '/academic', description: 'Scholarships, resources, research' },
      { label: 'Scholarships', href: '/scholarships', description: 'Published scholarship opportunities' },
      { label: 'Research & Policy', href: '/research', description: 'Data, reports, publications' },
    ],
  },
  {
    label: 'Career',
    href: '/career',
    children: [
      { label: 'Career & Entrepreneurship', href: '/career', description: 'Professional development' },
      { label: 'Opportunities', href: '/opportunities', description: 'Jobs, internships, scholarships' },
      { label: 'Alumni Network', href: '/alumni', description: 'Alumni community and mentorship' },
    ],
  },
  {
    label: 'Events',
    href: '/events',
  },
  {
    label: 'Gallery',
    href: '/gallery',
  },
  {
    label: 'Community',
    href: '/culture',
    children: [
      { label: 'Culture & Heritage', href: '/culture', description: 'Afghan culture in Malaysia' },
      { label: 'Sports & Community', href: '/sports', description: 'Sports and recreation' },
      { label: 'Student Welfare', href: '/welfare', description: 'Support and resources' },
    ],
  },
  {
    label: 'News',
    href: '/news',
    children: [
      { label: 'News & Stories', href: '/news', description: 'Latest updates and stories' },
      { label: 'Partners', href: '/partners', description: 'Institutional partnerships' },
    ],
  },
];

export const footerNav: Record<string, { label: string; href: string; highlight?: boolean }[]> = {
  Organization: [
    { label: 'About ASAM', href: '/about' },
    { label: 'Leadership', href: '/leadership' },
    { label: 'Governance', href: '/governance' },
    { label: 'Departments', href: '/departments' },
    { label: 'Transparency', href: '/transparency' },
  ],
  Community: [
    { label: 'Membership', href: '/membership' },
    { label: 'Chapters', href: '/chapters' },
    { label: 'University Network', href: '/universities' },
    { label: 'Volunteer', href: '/join' },
    { label: 'Alumni', href: '/alumni' },
  ],
  Resources: [
    { label: 'Academic Hub', href: '/academic' },
    { label: 'Career Center', href: '/career' },
    { label: 'Student Welfare', href: '/welfare' },
    { label: 'Research & Policy', href: '/research' },
    { label: 'Opportunities', href: '/opportunities' },
    { label: 'Scholarships', href: '/scholarships' },
  ],
  Connect: [
    { label: 'Events', href: '/events' },
    { label: 'News & Stories', href: '/news' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Partners', href: '/partners' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/transparency#privacy' },
    { label: 'Code of Conduct', href: '/transparency#conduct' },
    { label: 'Terms', href: '/transparency#terms' },
    { label: 'Web Developer', href: '/web-developer', highlight: true },
  ],
};

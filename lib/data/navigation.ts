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
      { label: 'Departments', href: '/departments', description: 'How ASAM organizes its work' },
    ],
  },
  {
    label: 'Programs',
    href: '/academic',
    children: [
      { label: 'Academic Hub', href: '/academic', description: 'Academic support and resources' },
      { label: 'Scholarships', href: '/scholarships', description: 'Published scholarship opportunities' },
      { label: 'Opportunities', href: '/opportunities', description: 'Jobs, internships, and scholarships' },
      { label: 'Career Development', href: '/career', description: 'Professional development' },
      { label: 'Research & Policy', href: '/research', description: 'Published research and reports' },
      { label: 'Student Welfare', href: '/welfare', description: 'Student support and resources' },
    ],
  },
  {
    label: 'Community',
    href: '/membership',
    children: [
      { label: 'Membership', href: '/membership', description: 'Membership information and guidance' },
      { label: 'Join ASAM', href: '/join-asam', description: 'Start a membership application' },
      { label: 'Member Portal', href: '/member', description: 'Member dashboard' },
      { label: 'Volunteer', href: '/join', description: 'Explore volunteer pathways' },
      { label: 'Chapters', href: '/chapters', description: 'State and local chapters' },
      { label: 'Universities', href: '/universities', description: 'University network' },
      { label: 'Culture & Heritage', href: '/culture', description: 'Afghan culture and community' },
      { label: 'Sports & Recreation', href: '/sports', description: 'Sports and recreation' },
      { label: 'Alumni Network', href: '/alumni', description: 'Alumni community and mentorship' },
    ],
  },
  {
    label: 'Stories & Events',
    href: '/events',
    children: [
      { label: 'Events', href: '/events', description: 'Upcoming and published events' },
      { label: 'News & Stories', href: '/news', description: 'Updates from ASAM' },
      { label: 'Gallery', href: '/gallery', description: 'Published event photographs' },
    ],
  },
  {
    label: 'Connect',
    href: '/contact',
    children: [
      { label: 'Contact ASAM', href: '/contact', description: 'Contact channels and message form' },
      { label: 'Partners', href: '/partners', description: 'Institutional partners and inquiries' },
      { label: 'Frequently Asked Questions', href: '/faq', description: 'Answers to common questions' },
      { label: 'Verify Membership', href: '/verify', description: 'Public membership verification' },
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
    { label: 'Privacy information', href: '/transparency#privacy' },
    { label: 'Code of Conduct', href: '/transparency#conduct' },
    { label: 'Web Developer', href: '/web-developer', highlight: true },
  ],
};

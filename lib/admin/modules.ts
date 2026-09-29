export interface AdminModule {
  label: string;
  href: string;
  description: string;
  icon: string;
}

export interface AdminNavigationGroup {
  label: string;
  items: AdminModule[];
}

export const adminNavigation: AdminNavigationGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        description: 'A live overview of the public ASAM website.',
        icon: 'layout-dashboard',
      },
    ],
  },
    {
      label: 'Content',
    items: [
      { label: 'Homepage', href: '/admin/homepage', description: 'Manage published homepage sections and content.', icon: 'panels-top-left' },
      { label: 'Leadership', href: '/admin/leadership', description: 'Manage published ASAM leadership records.', icon: 'users-round' },
      { label: 'Departments', href: '/admin/departments', description: 'Manage the public department directory.', icon: 'building-2' },
      { label: 'Chapters', href: '/admin/chapters', description: 'Manage active and upcoming ASAM chapters.', icon: 'network' },
      { label: 'Universities', href: '/admin/universities', description: 'Manage published university directory records.', icon: 'graduation-cap' },
    ],
    },
    {
      label: 'Public Pages',
      items: [
        { label: 'About', href: '/admin/about', description: 'Manage the About page copy and sections.', icon: 'building-2' },
        { label: 'Governance', href: '/admin/governance', description: 'Manage governance page information.', icon: 'scroll-text' },
        { label: 'Academic', href: '/admin/academic', description: 'Manage public academic information.', icon: 'graduation-cap' },
        { label: 'Career', href: '/admin/career', description: 'Manage career and entrepreneurship page copy.', icon: 'briefcase-business' },
        { label: 'Culture', href: '/admin/culture', description: 'Manage culture and heritage page copy.', icon: 'handshake' },
        { label: 'Research', href: '/admin/research', description: 'Manage research and policy information.', icon: 'book-open' },
        { label: 'Sports', href: '/admin/sports', description: 'Manage sports and community page copy.', icon: 'award' },
        { label: 'Alumni', href: '/admin/alumni', description: 'Manage public alumni information.', icon: 'users-round' },
        { label: 'Membership Information', href: '/admin/membership-content', description: 'Manage public membership information only.', icon: 'users-round' },
        { label: 'Welfare', href: '/admin/welfare', description: 'Manage student welfare guidance and resources.', icon: 'messages-square' },
        { label: 'Transparency', href: '/admin/transparency', description: 'Manage public transparency information.', icon: 'shield-check' },
      ],
    },
  {
    label: 'Programs',
    items: [
      { label: 'Events', href: '/admin/events', description: 'Create and publish ASAM events.', icon: 'calendar-days' },
      { label: 'Opportunities', href: '/admin/opportunities', description: 'Manage opportunities for the ASAM community.', icon: 'briefcase-business' },
      { label: 'Scholarships', href: '/admin/scholarships', description: 'Manage published scholarship opportunities.', icon: 'award' },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Gallery', href: '/admin/gallery', description: 'Manage albums and published media.', icon: 'images' },
      { label: 'Documents', href: '/admin/documents', description: 'Manage public documents and downloads.', icon: 'files' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'News', href: '/admin/news', description: 'Publish ASAM announcements and stories.', icon: 'newspaper' },
      { label: 'FAQ', href: '/admin/faq', description: 'Manage published questions and answers.', icon: 'circle-help' },
      { label: 'Messages', href: '/admin/messages', description: 'Review private messages submitted through Contact.', icon: 'messages-square' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Members', href: '/admin/members', description: 'View and manage member profiles, applications, and approvals.', icon: 'users-round' },
      { label: 'Applications', href: '/admin/applications', description: 'Review and manage membership applications.', icon: 'file-text' },
      { label: 'Partners', href: '/admin/partners', description: 'Manage official ASAM partner records.', icon: 'handshake' },
      { label: 'Site Settings', href: '/admin/settings', description: 'Manage public organization identity and contact settings.', icon: 'settings-2' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Audit Logs', href: '/admin/audit-logs', description: 'Read-only administrative activity history.', icon: 'scroll-text' },
      { label: 'Admin Users', href: '/admin/users', description: 'Manage existing administrator roles.', icon: 'shield-check' },
    ],
  },
];

export const adminModules = adminNavigation
  .flatMap((group) => group.items)
  .filter((item) => item.href !== '/admin');

export const dashboardQuickActions = [
  { label: 'Create Event', href: '/admin/events', icon: 'calendar-plus-2' },
  { label: 'Create News Article', href: '/admin/news', icon: 'newspaper' },
  { label: 'Add Leadership Member', href: '/admin/leadership', icon: 'user-round-plus' },
  { label: 'Add Chapter', href: '/admin/chapters', icon: 'network' },
  { label: 'Add University', href: '/admin/universities', icon: 'graduation-cap' },
  { label: 'Upload Gallery', href: '/admin/gallery', icon: 'images' },
  { label: 'Add Opportunity', href: '/admin/opportunities', icon: 'briefcase-business' },
];

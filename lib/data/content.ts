export interface FlagshipInitiative {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Planned' | 'Coming Soon';
  department: string;
}

export const flagshipInitiatives: FlagshipInitiative[] = [
  {
    id: 'academic-network',
    name: 'ASAM Academic Network',
    description: 'A nationwide network connecting Afghan students for academic collaboration, mentorship, and research.',
    status: 'Planned',
    department: 'Academic Affairs',
  },
  {
    id: 'career-network',
    name: 'ASAM Career Network',
    description: 'Professional development platform with internship information, job listings, and career resources.',
    status: 'Planned',
    department: 'Career & Entrepreneurship',
  },
  {
    id: 'mentorship',
    name: 'ASAM Mentorship',
    description: 'Matching students with experienced mentors for academic, career, and personal guidance.',
    status: 'Planned',
    department: 'Career & Entrepreneurship',
  },
  {
    id: 'research-initiative',
    name: 'ASAM Research Initiative',
    description: 'Student-led research projects producing data, reports, and policy insights about the Afghan student community.',
    status: 'Planned',
    department: 'Research & Policy',
  },
  {
    id: 'national-conference',
    name: 'ASAM National Conference',
    description: 'Annual national conference bringing together Afghan students from across Malaysia.',
    status: 'Planned',
    department: 'Events & Programs',
  },
  {
    id: 'alumni-network',
    name: 'ASAM Alumni Network',
    description: 'A lifelong community for Afghan graduates of Malaysian universities.',
    status: 'Planned',
    department: 'Alumni Relations',
  },
  {
    id: 'leadership-academy',
    name: 'ASAM Leadership Academy',
    description: 'A multi-week leadership development program for aspiring student leaders.',
    status: 'Planned',
    department: 'Events & Programs',
  },
  {
    id: 'innovation-program',
    name: 'ASAM Student Innovation Program',
    description: 'Supporting student-led innovation, entrepreneurship, and creative projects.',
    status: 'Coming Soon',
    department: 'Career & Entrepreneurship',
  },
  {
    id: 'cultural-forum',
    name: 'ASAM Cultural Forum',
    description: 'Celebrating and preserving Afghan culture, language, and heritage in Malaysia.',
    status: 'Planned',
    department: 'Culture & Heritage',
  },
  {
    id: 'sports-championship',
    name: 'ASAM Sports Championship',
    description: 'Inter-university sports tournaments and recreational competitions.',
    status: 'Coming Soon',
    department: 'Sports & Recreation',
  },
];

export const roadmapPhases = [
  {
    phase: '01',
    title: 'Foundation',
    description: 'Establishing ASAM\u2019s core leadership, governance, and digital platform.',
    status: 'In Progress',
  },
  {
    phase: '02',
    title: 'Membership',
    description: 'Building the membership base and verification system.',
    status: 'In Progress',
  },
  {
    phase: '03',
    title: 'University Network',
    description: 'Establishing university representatives and chapters across Malaysia.',
    status: 'Planned',
  },
  {
    phase: '04',
    title: 'Chapter Expansion',
    description: 'Expanding to state and city-level chapters nationwide.',
    status: 'Planned',
  },
  {
    phase: '05',
    title: 'Programs',
    description: 'Launching academic, career, cultural, and sports programs.',
    status: 'Planned',
  },
  {
    phase: '06',
    title: 'Research & Partnerships',
    description: 'Building research initiatives and institutional partnerships.',
    status: 'Planned',
  },
  {
    phase: '07',
    title: 'National Scale',
    description: 'Achieving national representation and impact.',
    status: 'Planned',
  },
  {
    phase: '08',
    title: 'Alumni Ecosystem',
    description: 'Establishing a self-sustaining alumni community.',
    status: 'Planned',
  },
];

export const coreValues = [
  {
    title: 'Connection',
    description: 'We believe Afghan students in Malaysia are stronger together. We build bridges between universities, communities, and individuals.',
  },
  {
    title: 'Representation',
    description: 'We are working toward a platform that gives Afghan students a collective voice in Malaysian higher education.',
  },
  {
    title: 'Education',
    description: 'We champion academic excellence and support every student\u2019s educational journey.',
  },
  {
    title: 'Opportunity',
    description: 'We create and share opportunities for academic, professional, and personal growth.',
  },
  {
    title: 'Leadership',
    description: 'We develop the next generation of Afghan leaders through mentorship, experience, and responsibility.',
  },
  {
    title: 'Culture',
    description: 'We celebrate Afghan heritage while embracing the richness of Malaysian culture.',
  },
  {
    title: 'Community',
    description: 'We are a family away from home, supporting each other through challenges and successes.',
  },
  {
    title: 'Integrity',
    description: 'We operate with transparency, accountability, and the highest ethical standards.',
  },
];

export const membershipTypes = [
  {
    name: 'Student Member',
    description: 'For Afghan students currently enrolled at a Malaysian university.',
    benefits: [
      'Access to all ASAM events and programs',
      'Member portal access',
      'Academic and career resources',
      'Mentorship program eligibility',
      'Voting rights in chapter elections',
      'Community network access',
    ],
    requirements: 'Current enrollment at a Malaysian university and Afghan nationality.',
  },
  {
    name: 'Alumni Member',
    description: 'For Afghan graduates who completed their studies in Malaysia.',
    benefits: [
      'Alumni network access',
      'Mentorship program participation',
      'Professional networking events',
      'Opportunity sharing',
      'Community event access',
    ],
    requirements: 'Completion of studies at a Malaysian university and Afghan nationality.',
  },
  {
    name: 'Associate Member',
    description: 'For individuals who support ASAM\u2019s mission but are not Afghan students.',
    benefits: [
      'Community event access',
      'Newsletter subscription',
      'Selective program participation',
    ],
    requirements: 'Support for ASAM\u2019s mission and values.',
  },
  {
    name: 'Honorary Member',
    description: 'Extended to individuals who have made significant contributions to the Afghan student community.',
    benefits: [
      'Lifetime recognition',
      'Special event invitations',
      'Community recognition',
    ],
    requirements: 'By invitation of the executive leadership team.',
  },
  {
    name: 'Institutional Partner',
    description: 'For universities, organizations, and companies partnering with ASAM.',
    benefits: [
      'Partnership recognition',
      'Event collaboration opportunities',
      'Access to ASAM network',
      'Joint program development',
    ],
    requirements: 'Formal partnership agreement with ASAM.',
  },
];

export const timelinePhases = [
  { phase: 'Foundation', description: 'Establishing ASAM\u2019s core structure and leadership' },
  { phase: 'Building', description: 'Creating the digital platform and membership system' },
  { phase: 'Connecting', description: 'Linking Afghan students across universities' },
  { phase: 'Expanding', description: 'Growing chapters and programs nationwide' },
  { phase: 'Empowering', description: 'Delivering programs that create real impact' },
  { phase: 'Sustaining', description: 'Building a lasting, self-sustaining community' },
];

export const adminRoles = [
  { name: 'Super Admin', description: 'Full access to all system functions and settings', permissions: 'All permissions' },
  { name: 'President', description: 'Executive oversight and strategic access', permissions: 'All dashboard sections, read-only on settings' },
  { name: 'Deputy President', description: 'Department monitoring and coordination', permissions: 'All dashboard sections except system settings' },
  { name: 'Chief of Staff', description: 'Executive operations and task management', permissions: 'Operations, tasks, communications' },
  { name: 'Vice President', description: 'Strategic initiatives and programs', permissions: 'Programs, events, reports' },
  { name: 'Secretary-General', description: 'Administration and documentation', permissions: 'Members, documents, communications' },
  { name: 'Treasurer', description: 'Financial management', permissions: 'Finance, reports, audit logs' },
  { name: 'Department Director', description: 'Department-specific management', permissions: 'Own department section only' },
  { name: 'Chapter Administrator', description: 'Chapter-level management', permissions: 'Own chapter section only' },
  { name: 'University Representative', description: 'University-level coordination', permissions: 'Own university section only' },
  { name: 'Content Editor', description: 'Content creation and management', permissions: 'News, gallery, publications' },
  { name: 'Event Manager', description: 'Event planning and management', permissions: 'Events section only' },
  { name: 'Volunteer', description: 'Supportive role with limited access', permissions: 'Assigned tasks only' },
];

export const adminSections = [
  { name: 'Overview', description: 'Organization-wide dashboard and key metrics', icon: 'LayoutDashboard' },
  { name: 'Members', description: 'Member management and verification', icon: 'Users' },
  { name: 'Applications', description: 'Membership and volunteer applications', icon: 'FileText' },
  { name: 'Universities', description: 'University network management', icon: 'GraduationCap' },
  { name: 'Chapters', description: 'Chapter administration', icon: 'MapPin' },
  { name: 'Representatives', description: 'University representatives', icon: 'UserCheck' },
  { name: 'Events', description: 'Event planning and management', icon: 'CalendarDays' },
  { name: 'News', description: 'News and content management', icon: 'Newspaper' },
  { name: 'Opportunities', description: 'Opportunity board management', icon: 'Briefcase' },
  { name: 'Scholarships', description: 'Scholarship information management', icon: 'Award' },
  { name: 'Departments', description: 'Department administration', icon: 'Building2' },
  { name: 'Volunteers', description: 'Volunteer coordination', icon: 'HeartHandshake' },
  { name: 'Alumni', description: 'Alumni network management', icon: 'Building2' },
  { name: 'Partners', description: 'Partner relationship management', icon: 'Handshake' },
  { name: 'Media', description: 'Gallery and media management', icon: 'Image' },
  { name: 'Documents', description: 'Document and policy management', icon: 'FolderOpen' },
  { name: 'Notifications', description: 'System notifications and alerts', icon: 'Bell' },
  { name: 'Forms', description: 'Form builder and submissions', icon: 'ClipboardList' },
  { name: 'Analytics', description: 'Data analytics and insights', icon: 'BarChart3' },
  { name: 'Audit Logs', description: 'System activity and audit trail', icon: 'ScrollText' },
  { name: 'Settings', description: 'System configuration and roles', icon: 'Settings' },
];

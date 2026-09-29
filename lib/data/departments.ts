import {
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Handshake,
  CalendarDays,
  Megaphone,
  FlaskConical,
  Users,
  Cpu,
  Palette,
  Trophy,
  Building2,
  type LucideIcon,
} from 'lucide-react';

export const departmentIconByName = {
  GraduationCap, HeartHandshake, Briefcase, Handshake, CalendarDays,
  Megaphone, FlaskConical, Users, Cpu, Palette, Trophy, Building2,
} as const;

export interface Department {
  id: string;
  number: string;
  name: string;
  icon: LucideIcon;
  mission: string;
  responsibilities: string[];
  programs: string[];
  subSections: { title: string; description: string }[];
}

export const departments: Department[] = [
  {
    id: 'academic-affairs',
    number: '01',
    name: 'Academic Affairs',
    icon: GraduationCap,
    mission:
      'Supporting academic excellence among Afghan students through mentorship, research collaboration, and university relations.',
    responsibilities: [
      'Coordinate academic mentorship programs',
      'Maintain university relations',
      'Support scholarship discovery',
      'Organize academic workshops',
      'Facilitate research collaboration',
    ],
    programs: [
      'Academic Mentorship Program',
      'University Relations Initiative',
      'Scholarship Information Network',
      'Academic Workshop Series',
      'Language Support Program',
    ],
    subSections: [
      { title: 'Scholarships', description: 'Information and guidance on scholarship opportunities.' },
      { title: 'Academic Mentorship', description: 'Connecting students with academic mentors.' },
      { title: 'Research', description: 'Facilitating research collaboration among students.' },
      { title: 'University Relations', description: 'Building relationships with Malaysian universities.' },
      { title: 'Language Support', description: 'Support for English and Bahasa Malaysia.' },
      { title: 'Academic Workshops', description: 'Skill-building workshops and seminars.' },
    ],
  },
  {
    id: 'student-welfare',
    number: '02',
    name: 'Student Welfare',
    icon: HeartHandshake,
    mission:
      'Ensuring every Afghan student in Malaysia feels supported, informed, and connected from arrival through graduation.',
    responsibilities: [
      'New student orientation support',
      'Student assistance coordination',
      'Welfare information dissemination',
      'Referral resource management',
      'Peer support facilitation',
    ],
    programs: [
      'New Student Welcome Program',
      'Peer Support Network',
      'Student Assistance Initiative',
      'Welfare Information Hub',
      'Referral Resources Directory',
    ],
    subSections: [
      { title: 'New Student Support', description: 'Helping new students settle in Malaysia.' },
      { title: 'Orientation', description: 'Welcome and orientation programs.' },
      { title: 'Student Assistance', description: 'General support and guidance.' },
      { title: 'Welfare Information', description: 'Important welfare resources and information.' },
      { title: 'Referral Resources', description: 'Connecting students to specialized services.' },
      { title: 'Peer Support', description: 'Student-to-student support network.' },
    ],
  },
  {
    id: 'career-entrepreneurship',
    number: '03',
    name: 'Career & Entrepreneurship',
    icon: Briefcase,
    mission:
      'Building professional pathways for Afghan students through career development, mentorship, and entrepreneurship support.',
    responsibilities: [
      'Career development programming',
      'Internship network management',
      'Professional mentorship coordination',
      'Entrepreneurship support',
      'CV and interview preparation',
    ],
    programs: [
      'Career Development Program',
      'Internship Network',
      'Professional Mentorship Initiative',
      'Entrepreneurship Support Program',
      'CV & Interview Workshop Series',
    ],
    subSections: [
      { title: 'Career Development', description: 'Career planning and development resources.' },
      { title: 'Internship Network', description: 'Connecting students with internship opportunities.' },
      { title: 'Mentorship', description: 'Professional mentorship matching.' },
      { title: 'Entrepreneurship', description: 'Support for student entrepreneurs.' },
      { title: 'Professional Networking', description: 'Building professional connections.' },
      { title: 'CV & Interview Support', description: 'CV reviews and interview preparation.' },
    ],
  },
  {
    id: 'external-relations',
    number: '04',
    name: 'External Relations',
    icon: Handshake,
    mission:
      'Building bridges between ASAM and universities, institutions, corporations, NGOs, and international partners.',
    responsibilities: [
      'University partnership development',
      'Institutional relations management',
      'Corporate relations building',
      'NGO relationship coordination',
      'International relations facilitation',
    ],
    programs: [
      'University Partnership Initiative',
      'Institutional Relations Program',
      'Corporate Relations Network',
      'NGO Partnership Program',
      'International Relations Initiative',
    ],
    subSections: [
      { title: 'University Partnerships', description: 'Partnerships with Malaysian universities.' },
      { title: 'Institutional Relations', description: 'Relations with institutions and embassies.' },
      { title: 'Corporate Relations', description: 'Corporate partnerships and sponsorships.' },
      { title: 'NGO Relations', description: 'Collaboration with non-governmental organizations.' },
      { title: 'International Relations', description: 'International student network connections.' },
    ],
  },
  {
    id: 'events-programs',
    number: '05',
    name: 'Events & Programs',
    icon: CalendarDays,
    mission:
      'Creating memorable, impactful events that bring the Afghan student community together across Malaysia.',
    responsibilities: [
      'Event planning and execution',
      'Conference coordination',
      'Cultural event management',
      'Sports event organization',
      'National program development',
    ],
    programs: [
      'ASAM National Students Conference',
      'Cultural Celebration Series',
      'Sports Tournament Program',
      'Leadership Seminar Series',
      'Community Workshop Program',
    ],
    subSections: [
      { title: 'Conferences', description: 'National and regional student conferences.' },
      { title: 'Seminars', description: 'Educational and professional seminars.' },
      { title: 'Workshops', description: 'Skill-building and knowledge-sharing workshops.' },
      { title: 'Cultural Events', description: 'Celebrating Afghan culture and heritage.' },
      { title: 'Sports Events', description: 'Tournaments and recreational activities.' },
      { title: 'National Programs', description: 'Nationwide ASAM initiatives.' },
    ],
  },
  {
    id: 'communications-media',
    number: '06',
    name: 'Communications & Media',
    icon: Megaphone,
    mission:
      'Telling the story of Afghan students in Malaysia through professional media, public relations, and digital content.',
    responsibilities: [
      'Public relations management',
      'Social media strategy',
      'Content creation',
      'Media relations',
      'Publications coordination',
    ],
    programs: [
      'ASAM Digital Magazine',
      'Social Media Program',
      'Media Relations Initiative',
      'Photography & Videography Team',
      'Publications Program',
    ],
    subSections: [
      { title: 'Public Relations', description: 'Managing ASAM public image and communications.' },
      { title: 'Social Media', description: 'Social media content and community management.' },
      { title: 'Photography', description: 'Event and portrait photography.' },
      { title: 'Videography', description: 'Video content production.' },
      { title: 'Graphic Design', description: 'Visual identity and design assets.' },
      { title: 'Publications', description: 'Newsletters, reports, and digital publications.' },
      { title: 'Media Relations', description: 'Relationships with media outlets.' },
    ],
  },
  {
    id: 'research-policy',
    number: '07',
    name: 'Research & Policy',
    icon: FlaskConical,
    mission:
      'Generating data, research, and policy insights to better understand and serve the Afghan student community in Malaysia.',
    responsibilities: [
      'Student research coordination',
      'Survey design and analysis',
      'Report production',
      'Policy research',
      'Data analysis',
    ],
    programs: [
      'Student Research Initiative',
      'Annual Student Survey',
      'Community Report Series',
      'Policy Research Program',
      'Data Analysis Initiative',
    ],
    subSections: [
      { title: 'Student Research', description: 'Supporting student-led research projects.' },
      { title: 'Surveys', description: 'Community surveys and needs assessments.' },
      { title: 'Reports', description: 'Annual and special reports on the community.' },
      { title: 'Data Analysis', description: 'Data-driven insights for decision-making.' },
      { title: 'Policy Research', description: 'Research on policies affecting students.' },
      { title: 'Publications', description: 'Research publications and working papers.' },
    ],
  },
  {
    id: 'membership-community',
    number: '08',
    name: 'Membership & Community',
    icon: Users,
    mission:
      'Building and nurturing a strong, verified, and engaged membership base across all Malaysian universities.',
    responsibilities: [
      'Membership management',
      'Member verification',
      'University representative coordination',
      'Chapter development support',
      'Volunteer coordination',
    ],
    programs: [
      'Membership Program',
      'Member Verification Initiative',
      'University Representative Network',
      'Chapter Development Program',
      'Volunteer Program',
    ],
    subSections: [
      { title: 'Membership', description: 'Membership registration and management.' },
      { title: 'Member Verification', description: 'Verifying member identities and enrollment.' },
      { title: 'University Representatives', description: 'Representatives at each university.' },
      { title: 'Chapter Development', description: 'Building new university and regional chapters.' },
      { title: 'Volunteers', description: 'Volunteer recruitment and coordination.' },
      { title: 'Community Engagement', description: 'Engaging the broader community.' },
    ],
  },
  {
    id: 'technology-digital',
    number: '09',
    name: 'Technology & Digital',
    icon: Cpu,
    mission:
      'Building and maintaining the digital infrastructure that powers ASAM\u2019s national platform.',
    responsibilities: [
      'Website development and maintenance',
      'Member portal management',
      'Digital services development',
      'Database administration',
      'Cybersecurity oversight',
    ],
    programs: [
      'Website Platform',
      'Member Portal',
      'Digital Services Initiative',
      'Database Program',
      'Cybersecurity Program',
    ],
    subSections: [
      { title: 'Website', description: 'The public-facing ASAM website.' },
      { title: 'Member Portal', description: 'The secure member dashboard.' },
      { title: 'Digital Services', description: 'Digital tools and services for members.' },
      { title: 'Database', description: 'Member and organizational data management.' },
      { title: 'Cybersecurity', description: 'Protecting member data and systems.' },
      { title: 'IT Support', description: 'Technical support for members and chapters.' },
    ],
  },
  {
    id: 'culture-heritage',
    number: '10',
    name: 'Culture & Heritage',
    icon: Palette,
    mission:
      'Celebrating and preserving Afghan culture, language, and heritage within the Malaysian student community.',
    responsibilities: [
      'Cultural event coordination',
      'Heritage programming',
      'Language initiatives',
      'Intercultural programs',
      'Arts promotion',
    ],
    programs: [
      'Afghan Heritage Series',
      'Cultural Festival Program',
      'Language Initiative',
      'Intercultural Exchange Program',
      'Arts & Expression Initiative',
    ],
    subSections: [
      { title: 'Afghan Heritage', description: 'Celebrating Afghan heritage and traditions.' },
      { title: 'Cultural Events', description: 'Cultural festivals and celebrations.' },
      { title: 'Arts', description: 'Showcasing Afghan art and artists.' },
      { title: 'Language', description: 'Preserving Dari and Pashto language.' },
      { title: 'Intercultural Programs', description: 'Building bridges with Malaysian culture.' },
    ],
  },
  {
    id: 'sports-recreation',
    number: '11',
    name: 'Sports & Recreation',
    icon: Trophy,
    mission:
      'Promoting health, teamwork, and community through sports and recreational activities.',
    responsibilities: [
      'Sports program coordination',
      'Team management',
      'Tournament organization',
      'Recreational activities',
      'Fitness initiatives',
    ],
    programs: [
      'ASAM Football League',
      'Cricket Tournament Series',
      'Volleyball Championship',
      'Community Sports Day',
      'Fitness Initiative',
    ],
    subSections: [
      { title: 'Football', description: 'Football teams and tournaments.' },
      { title: 'Cricket', description: 'Cricket teams and competitions.' },
      { title: 'Volleyball', description: 'Volleyball teams and events.' },
      { title: 'Badminton', description: 'Badminton clubs and tournaments.' },
      { title: 'Basketball', description: 'Basketball teams and games.' },
      { title: 'Outdoor Activities', description: 'Hiking, camping, and outdoor events.' },
      { title: 'Recreation', description: 'Recreational and social activities.' },
    ],
  },
  {
    id: 'alumni-relations',
    number: '12',
    name: 'Alumni Relations',
    icon: Building2,
    mission:
      'Building a lifelong connection between ASAM alumni and current students through mentorship, networking, and continued engagement.',
    responsibilities: [
      'Alumni network management',
      'Alumni mentorship coordination',
      'Professional networking facilitation',
      'Alumni event organization',
      'Alumni opportunity sharing',
    ],
    programs: [
      'ASAM Alumni Network',
      'Alumni Mentorship Program',
      'Professional Networking Initiative',
      'Alumni Events Series',
      'Alumni Opportunities Program',
    ],
    subSections: [
      { title: 'Alumni Network', description: 'The alumni community and directory.' },
      { title: 'Alumni Mentorship', description: 'Alumni mentoring current students.' },
      { title: 'Professional Networking', description: 'Alumni professional connections.' },
      { title: 'Alumni Events', description: 'Reunions and alumni gatherings.' },
      { title: 'Alumni Opportunities', description: 'Jobs and opportunities from alumni.' },
    ],
  },
];

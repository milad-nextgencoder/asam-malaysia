export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  format: 'In-Person' | 'Online' | 'Hybrid';
  description: string;
  status: 'upcoming' | 'planned' | 'past';
  featured?: boolean;
  capacity?: number;
  registered?: number;
}

export const events: EventItem[] = [
  {
    id: 'national-conference',
    title: 'ASAM National Students Conference',
    category: 'Academic',
    date: '2026-11-15',
    endDate: '2026-11-16',
    time: '09:00',
    location: 'Kuala Lumpur',
    format: 'In-Person',
    description:
      'A landmark gathering of Afghan students from across Malaysia. The ASAM National Students Conference will feature keynote speakers, panel discussions, academic presentations, cultural showcases, and networking opportunities. This is a planned event and will be officially announced once confirmed.',
    status: 'planned',
    featured: true,
    capacity: 500,
    registered: 0,
  },
  {
    id: 'welcome-orientation',
    title: 'New Student Welcome & Orientation',
    category: 'Community',
    date: '2026-10-05',
    time: '14:00',
    location: 'Online',
    format: 'Online',
    description:
      'A virtual welcome session for new Afghan students arriving in Malaysia. Learn about university life, living in Malaysia, student resources, and how to connect with the ASAM community.',
    status: 'upcoming',
    capacity: 200,
    registered: 0,
  },
  {
    id: 'career-workshop',
    title: 'CV & Interview Preparation Workshop',
    category: 'Career',
    date: '2026-10-12',
    time: '15:00',
    location: 'Online',
    format: 'Online',
    description:
      'A practical workshop on crafting an effective CV and preparing for job interviews in the Malaysian and international job markets.',
    status: 'upcoming',
    capacity: 100,
    registered: 0,
  },
  {
    id: 'cultural-night',
    title: 'Afghan Cultural Night',
    category: 'Cultural',
    date: '2026-11-02',
    time: '18:00',
    location: 'Kuala Lumpur',
    format: 'In-Person',
    description:
      'An evening celebrating Afghan culture, music, food, and traditions. Open to all ASAM members and the broader community.',
    status: 'planned',
    capacity: 300,
    registered: 0,
  },
  {
    id: 'football-tournament',
    title: 'ASAM Football Tournament',
    category: 'Sports',
    date: '2026-12-01',
    endDate: '2026-12-02',
    time: '08:00',
    location: 'Selangor',
    format: 'In-Person',
    description:
      'A two-day football tournament bringing together teams from universities across the Klang Valley and beyond.',
    status: 'planned',
    capacity: 16,
    registered: 0,
  },
  {
    id: 'leadership-seminar',
    title: 'Student Leadership Seminar',
    category: 'Leadership',
    date: '2026-10-20',
    time: '10:00',
    location: 'Online',
    format: 'Online',
    description:
      'A seminar on student leadership, organizational management, and community building for current and aspiring ASAM chapter leaders.',
    status: 'upcoming',
    capacity: 150,
    registered: 0,
  },
];

export const eventCategories = [
  'Academic',
  'Career',
  'Cultural',
  'Leadership',
  'Sports',
  'Networking',
  'Entrepreneurship',
];

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  type: string;
  deadline: string;
  location: string;
  eligibility: string;
  description: string;
  status: 'open' | 'planned' | 'closed';
}

export const opportunities: Opportunity[] = [
  {
    id: 'asam-volunteer',
    title: 'ASAM Volunteer Program',
    category: 'Volunteering',
    type: 'Ongoing',
    deadline: '2026-12-31',
    location: 'Malaysia (Remote / In-Person)',
    eligibility: 'All Afghan students in Malaysia',
    description:
      'Join the ASAM volunteer team and contribute to building the national platform. Volunteers can support events, communications, technology, welfare, and more.',
    status: 'open',
  },
  {
    id: 'mentorship-program',
    title: 'ASAM Mentorship Program',
    category: 'Training',
    type: 'Semester-long',
    deadline: '2026-10-15',
    location: 'Malaysia (Remote)',
    eligibility: 'All ASAM members',
    description:
      'Connect with experienced mentors for academic, career, and personal guidance. The mentorship program matches students with alumni and professionals.',
    status: 'planned',
  },
  {
    id: 'leadership-academy',
    title: 'ASAM Leadership Academy',
    category: 'Training',
    type: 'Multi-week',
    deadline: '2026-11-01',
    location: 'Malaysia (Hybrid)',
    eligibility: 'ASAM members interested in leadership',
    description:
      'A multi-week leadership development program covering organizational management, public speaking, project management, and community building.',
    status: 'planned',
  },
  {
    id: 'research-initiative',
    title: 'ASAM Research Initiative',
    category: 'Fellowships',
    type: 'Project-based',
    deadline: '2026-12-01',
    location: 'Malaysia (Remote)',
    eligibility: 'Graduate and undergraduate students',
    description:
      'Participate in research projects studying the Afghan student community in Malaysia. Outputs include reports, data visualizations, and policy briefs.',
    status: 'planned',
  },
];

export const opportunityCategories = [
  'Scholarships',
  'Internships',
  'Jobs',
  'Competitions',
  'Conferences',
  'Fellowships',
  'Training',
  'Volunteering',
];

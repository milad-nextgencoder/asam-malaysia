export interface LeadershipMember {
  id: string;
  name: string;
  title: string;
  department?: string;
  bio: string;
  responsibilities: string[];
  message: string;
  filled: boolean;
}

export const leadership: LeadershipMember[] = [
  {
    id: 'president',
    name: 'Mohammad Elyas Yamen',
    title: 'President',
    bio: 'Mohammad Elyas Yamen serves as the founding President of the Afghan Students Association of Malaysia. Leading with vision and dedication, he is committed to building a national platform that connects, supports, and empowers Afghan students across all Malaysian universities.',
    responsibilities: [
      'Overall leadership and strategic direction',
      'Representing ASAM externally',
      'Chairing executive meetings',
      'Approving major initiatives',
      'Building institutional partnerships',
    ],
    message:
      'Our vision is simple but powerful: no Afghan student in Malaysia should feel alone. Together, we are building a community that celebrates our heritage, supports our ambitions, and creates opportunities for every student to thrive.',
    filled: true,
  },
  {
    id: 'deputy-president',
    name: 'Milad Sahebi',
    title: 'Deputy President',
    bio: 'Milad Sahebi serves as the founding Deputy President of ASAM. Working closely with the President, he oversees departmental coordination, project execution, and the day-to-day operations that keep the association moving forward.',
    responsibilities: [
      'Supporting the President in all duties',
      'Overseeing departmental operations',
      'Coordinating cross-departmental projects',
      'Managing executive operations',
      'Acting on behalf of the President when needed',
    ],
    message:
      'Building an organization from the ground up requires dedication from every member. I am proud to work alongside a team that believes in the power of community and the potential of every Afghan student in Malaysia.',
    filled: true,
  },
  {
    id: 'chief-of-staff',
    name: 'Position to be announced',
    title: 'Chief of Staff',
    bio: 'The Chief of Staff will serve as a critical link between the executive leadership and the operational teams, ensuring alignment, accountability, and effective execution of ASAM\u2019s strategic priorities.',
    responsibilities: [
      'Managing executive operations',
      'Coordinating leadership schedules',
      'Ensuring strategic alignment',
      'Facilitating executive communication',
      'Overseeing special projects',
    ],
    message: 'This position is currently vacant. Recruitment will open soon.',
    filled: false,
  },
  {
    id: 'vice-president',
    name: 'Position to be announced',
    title: 'Vice President',
    bio: 'The Vice President will support the executive leadership team in driving ASAM\u2019s mission forward, with particular focus on strategic initiatives and program development.',
    responsibilities: [
      'Supporting executive leadership',
      'Leading strategic initiatives',
      'Overseeing program development',
      'Representing ASAM at events',
      'Coordinating with department directors',
    ],
    message: 'This position is currently vacant. Recruitment will open soon.',
    filled: false,
  },
  {
    id: 'secretary-general',
    name: 'Position to be announced',
    title: 'Secretary-General',
    bio: 'The Secretary-General will be responsible for the organizational administration, documentation, records, and official communications of ASAM.',
    responsibilities: [
      'Managing official records and documentation',
      'Coordinating meetings and minutes',
      'Overseeing official communications',
      'Managing organizational correspondence',
      'Maintaining the organizational registry',
    ],
    message: 'This position is currently vacant. Recruitment will open soon.',
    filled: false,
  },
  {
    id: 'treasurer',
    name: 'Position to be announced',
    title: 'Treasurer',
    bio: 'The Treasurer will oversee the financial management, budgeting, and financial transparency of ASAM.',
    responsibilities: [
      'Managing ASAM finances and budget',
      'Overseeing financial reporting',
      'Ensuring financial transparency',
      'Coordinating fundraising activities',
      'Maintaining financial records',
    ],
    message: 'This position is currently vacant. Recruitment will open soon.',
    filled: false,
  },
];

export const orgHierarchy = [
  { level: 'President', description: 'Overall leadership and strategic direction' },
  { level: 'Deputy President', description: 'Supports the President, oversees operations' },
  { level: 'Chief of Staff', description: 'Manages executive operations and alignment' },
  { level: 'Vice President', description: 'Leads strategic initiatives and programs' },
  { level: 'Secretary-General', description: 'Administration, records, and communications' },
  { level: 'Treasurer', description: 'Financial management and transparency' },
  { level: 'Executive Directors', description: 'Lead departments and report to executive team' },
  { level: 'Departments', description: '12 departments covering all areas of ASAM activity' },
  { level: 'Regional / State Chapters', description: 'State-level coordination across Malaysia' },
  { level: 'City Chapters', description: 'City-level community groups' },
  { level: 'University Chapters', description: 'University-level student groups' },
  { level: 'University Representatives', description: 'Representatives at each university' },
  { level: 'Members', description: 'Registered and verified ASAM members' },
  { level: 'Volunteers', description: 'Community volunteers supporting ASAM activities' },
];

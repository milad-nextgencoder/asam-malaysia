export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    id: 'what-is-asam',
    category: 'Membership',
    question: 'What is ASAM?',
    answer:
      'ASAM (Afghan Students Association of Malaysia) is a national platform being built to connect, support, and empower Afghan students studying at universities across Malaysia. We are working toward becoming a comprehensive national student association.',
  },
  {
    id: 'who-can-join',
    category: 'Membership',
    question: 'Who can join ASAM?',
    answer:
      'ASAM membership is open to Afghan students currently enrolled at Malaysian universities, Afghan alumni who studied in Malaysia, and associate members who support our mission. Honorary membership may be extended to individuals who have made significant contributions to the Afghan student community.',
  },
  {
    id: 'how-to-join',
    category: 'Membership',
    question: 'How do I become a member?',
    answer:
      'You can start your membership by visiting the Membership page and clicking Join ASAM. You will need to provide your basic information and university enrollment details. Membership verification will follow to confirm your student status.',
  },
  {
    id: 'membership-cost',
    category: 'Membership',
    question: 'Is there a membership fee?',
    answer:
      'ASAM is being established as a non-profit organization. Membership fee structures, if any, will be determined by the executive team and communicated transparently to all members. Currently, joining ASAM is free.',
  },
  {
    id: 'which-universities',
    category: 'Universities',
    question: 'Which universities are part of ASAM?',
    answer:
      'ASAM is building a network that includes all Malaysian universities where Afghan students are enrolled. We are currently establishing university chapters and representatives. If your university does not yet have a chapter, you can help start one by volunteering as a university representative.',
  },
  {
    id: 'start-chapter',
    category: 'Chapters',
    question: 'How do I start a chapter at my university?',
    answer:
      'If your university does not yet have an ASAM chapter, you can apply to become a University Representative. Visit the Join / Volunteer page to see available roles, or contact us through the Contact page expressing your interest in starting a chapter.',
  },
  {
    id: 'events-frequency',
    category: 'Events',
    question: 'How often does ASAM hold events?',
    answer:
      'ASAM is planning a regular calendar of events including academic workshops, career seminars, cultural celebrations, sports tournaments, and networking sessions. The frequency will increase as chapters are established across more universities.',
  },
  {
    id: 'scholarship-help',
    category: 'Scholarships',
    question: 'Does ASAM offer scholarships?',
    answer:
      'ASAM does not directly offer scholarships at this time. Our Academic Affairs department is building a scholarship information network to help students discover and apply for available scholarships. Visit the Academic Hub for resources and information.',
  },
  {
    id: 'welfare-support',
    category: 'Student Welfare',
    question: 'What kind of welfare support does ASAM provide?',
    answer:
      'ASAM provides informational and community support for new and continuing students, including orientation resources, peer support networks, and referral to appropriate services. ASAM is not a substitute for professional legal, immigration, medical, or emergency services. For urgent matters, please contact the relevant authorities or your university\u2019s international office.',
  },
  {
    id: 'career-help',
    category: 'Careers',
    question: 'How can ASAM help with my career?',
    answer:
      'Our Career & Entrepreneurship department offers CV and interview workshops, internship information, professional mentorship, networking events, and entrepreneurship support. Visit the Career page to explore available resources and programs.',
  },
  {
    id: 'alumni-join',
    category: 'Alumni',
    question: 'I am an alumnus. Can I join ASAM?',
    answer:
      'Absolutely. ASAM has a dedicated Alumni Network for Afghan graduates who studied in Malaysia. Alumni members can mentor current students, share opportunities, and stay connected with the community. Visit the Alumni page to register.',
  },
  {
    id: 'partner-with-asam',
    category: 'Partnerships',
    question: 'How can my organization partner with ASAM?',
    answer:
      'ASAM welcomes partnerships with universities, NGOs, corporations, and community organizations. Visit the Partners page to learn more about partnership opportunities, or contact us through the Contact page with partnership inquiries.',
  },
];

export const faqCategories = [
  'Membership',
  'Universities',
  'Events',
  'Scholarships',
  'Chapters',
  'Careers',
  'Alumni',
  'Student Welfare',
  'Partnerships',
];

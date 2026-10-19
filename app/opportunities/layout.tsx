import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opportunities',
  description: 'Scholarships, internships, and programmes for Afghan students in Malaysia.',
};

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

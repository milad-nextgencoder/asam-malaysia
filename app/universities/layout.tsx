import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Universities',
  description: 'Universities across Malaysia where ASAM members study and chapters are forming.',
};

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { profileProgress, requiredProfileFields } from '@/lib/member/validation';
import type { MemberProfile } from '@/lib/member/types';

export function ProfileCompletion({ profile }: { profile: MemberProfile }) {
  const progress = profileProgress(profile);
  return <section aria-labelledby="profile-progress-title" className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 id="profile-progress-title" className="font-display text-lg font-bold text-navy">Your membership profile</h2>
      <p className="mt-1 text-sm text-gray-600">{progress.completed} of {progress.total} required details complete</p></div>
      <span className="rounded-full bg-navy/5 px-3 py-1 text-sm font-semibold text-navy">{progress.percentage}%</span>
    </div>
    <progress aria-label="Profile completion" value={progress.completed} max={progress.total} className="mt-4 h-2 w-full accent-navy" />
    {progress.missing.length > 0 ? <>
      <p className="mt-3 text-sm text-gray-600">Complete these details before submitting your application:</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{progress.missing.map((key) =>
        <li key={key} className="flex items-center gap-2 text-sm text-gray-700"><Circle aria-hidden="true" className="h-3 w-3 shrink-0 text-amber-600" />{requiredProfileFields[key]}</li>)}</ul>
      <Link href="/member/profile" className="mt-4 inline-flex rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Complete your profile</Link>
    </> : <p className="mt-3 flex items-center gap-2 text-sm text-green-700"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />Your profile is ready for membership review.</p>}
  </section>;
}

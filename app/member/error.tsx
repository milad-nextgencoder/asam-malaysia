'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-2xl items-center py-8">
      <div className="w-full rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8" role="alert">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.15em] text-red-700">
          Member portal error
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-gray-900">
          We couldn&apos;t load this page
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Something went wrong while loading your member data. Your profile and account have not been changed.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-navy px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy/90"
          >
            Try again
          </button>
          <Link
            href="/member"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

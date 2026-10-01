'use client';

import { AlertTriangle } from 'lucide-react';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-2xl items-center py-8">
      <div className="w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm sm:p-8" role="alert">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.15em] text-red-700">Server error</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-[#172436]">We couldn’t load this admin page</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The request failed. Your account and website content have not been changed.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-[#142236] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#20344f]"
        >
          Try again
        </button>
      </div>
    </section>
  );
}

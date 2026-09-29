'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LoaderCircle } from 'lucide-react';

const MEMBER_ID_PATTERN = /^ASAM-\d{4}-\d{6}$/i;

/**
 * Manual membership verification form.
 *
 * The /verify page previously instructed visitors to "enter an official ASAM
 * Member ID" but rendered no input at all, so the instruction could not be
 * followed. This form normalises the input and opens the verification record.
 */
export function MemberVerificationForm() {
  const router = useRouter();
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = memberId.trim().toUpperCase();

    if (!MEMBER_ID_PATTERN.test(value)) {
      setError('Enter a Member ID in the format ASAM-2026-000001.');
      return;
    }

    setError('');
    setBusy(true);
    router.push(`/verify/member/${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="verify-member-id" className="mb-1.5 block text-xs font-semibold text-gray-700">
          ASAM Member ID
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="verify-member-id"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="ASAM-2026-000001"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 font-mono text-sm uppercase tracking-wide text-gray-900 outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
          />
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={busy || !memberId.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:opacity-50"
      >
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {busy ? 'Verifying...' : 'Verify membership'}
      </button>
    </form>
  );
}

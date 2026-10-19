'use client';

import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

/**
 * Shared newsletter subscription form.
 *
 * The homepage and site footer previously rendered newsletter forms with no
 * submit handler at all: submitting reloaded the page and silently discarded
 * the visitor's email address. This component records the subscription in the
 * existing contact_messages table through the anonymous column grant
 * (name, email, subject, message). The status column is deliberately omitted:
 * it defaults to 'new', which satisfies the asam_public_submit_contact_messages
 * RLS check, and the anon role holds no INSERT privilege on it.
 */
export function NewsletterForm({
  buttonLabel = 'Subscribe',
  className,
}: {
  buttonLabel?: string;
  className?: string;
}) {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setState('error');
      return;
    }
    setState('busy');
    try {
      const supabase = createClient();
      const { error } = await supabase.from('contact_messages').insert({
        name: 'Newsletter subscriber',
        email: value,
        subject: 'Newsletter subscription',
        message: 'Please add me to the ASAM newsletter list.',
      });
      if (error) throw error;
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col sm:flex-row gap-3', className)}>
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (state !== 'busy') setState('idle');
        }}
        placeholder="Enter your email"
        disabled={state === 'busy'}
        className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
      />
      <button
        type="submit"
        disabled={state === 'busy'}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-navy text-white font-semibold text-sm shadow-premium hover:shadow-premium-lg transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {state === 'busy' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {buttonLabel}
        {state === 'busy' ? null : <ArrowRight className="h-4 w-4" />}
      </button>
      <div className="sm:basis-full" aria-live="polite">
        {state === 'done' && (
          <p role="status" className="text-sm text-green-700">
            Thank you — you are on the list.
          </p>
        )}
        {state === 'error' && (
          <p role="alert" className="text-sm text-red-600">
            Please enter a valid email address and try again.
          </p>
        )}
      </div>
    </form>
  );
}

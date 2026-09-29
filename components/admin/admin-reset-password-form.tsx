'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export function AdminResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    supabase.auth.getClaims().then(({ data, error }) => {
      if (!active) return;
      setHasRecoverySession(!error && Boolean(data?.claims?.sub));
      setCheckingSession(false);
    }).catch(() => {
      if (!active) return;
      setHasRecoverySession(false);
      setCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMessage('We could not update your password. Request a new reset link and try again.');
        return;
      }

      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/admin/login?notice=password-updated');
      router.refresh();
    } catch {
      setErrorMessage('We could not update your password. Request a new reset link and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-xl border border-border bg-card p-7 shadow-premium-lg sm:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-dark">ASAM</p>
        <h1 className="mt-2 font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a new password for your administrator account.</p>

        {checkingSession ? (
          <p className="mt-6 text-sm text-muted-foreground" role="status">Checking your reset link...</p>
        ) : !hasRecoverySession ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              This reset link is invalid or expired. Request a new one to continue.
            </div>
            <Link className="inline-flex text-sm font-semibold text-gold-dark hover:underline" href="/admin/login">
              Return to admin sign in
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={busy}
              />
            </div>
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

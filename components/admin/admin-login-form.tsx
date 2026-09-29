'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

interface AdminLoginFormProps {
  initialError?: string;
  initialNotice?: string;
}

const loginErrors: Record<string, string> = {
  unauthenticated: 'Please sign in to continue.',
  unauthorized: 'This account does not have an ASAM administrator role.',
  'session-expired': 'Your session expired. Please sign in again.',
  'server-error': 'We could not verify your administrator access. Please try again.',
  callback: 'That password reset link is invalid or expired. Request a new one.',
};

export function AdminLoginForm({ initialError, initialNotice }: AdminLoginFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    initialError ? loginErrors[initialError] ?? loginErrors['server-error'] : ''
  );
  const [notice, setNotice] = useState(
    initialNotice === 'signed-out'
      ? 'You have been signed out.'
      : initialNotice === 'password-updated'
        ? 'Your password has been updated. Sign in with your new password.'
        : ''
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    setNotice('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          error.status === 400 || error.code === 'invalid_credentials'
            ? 'Email or password is incorrect.'
            : 'We could not sign you in right now. Please try again.'
        );
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setErrorMessage('We could not sign you in right now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    setNotice('');

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        setErrorMessage('We could not send a reset email right now. Please try again.');
        return;
      }

      setNotice('If an account exists for this email, a password reset link will be sent.');
    } catch {
      setErrorMessage('We could not send a reset email right now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative flex min-h-[65vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-7 shadow-premium-lg sm:p-9">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-background">
            <Image src="/logo.png" alt="ASAM logo" fill sizes="56px" className="object-cover" priority />
          </div>
          <div>
            <div className="font-display text-2xl font-bold">ASAM</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Afghan Students Association of Malaysia
            </div>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-gold-dark">
          Administration Portal
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          {mode === 'login' ? 'Sign in' : 'Reset your password'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'login'
            ? 'Use your authorized ASAM administrator account.'
            : 'Enter your admin email and we will send a password reset link.'}
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {errorMessage}
          </div>
        )}
        {notice && (
          <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            {notice}
          </div>
        )}

        {mode === 'login' ? (
          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  className="pl-10"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  className="pl-10"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign In'}
              {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            <div className="text-center">
              <button
                type="button"
                className="text-sm font-semibold text-gold-dark underline-offset-4 hover:underline disabled:opacity-50"
                onClick={() => {
                  setMode('forgot');
                  setErrorMessage('');
                  setNotice('');
                }}
                disabled={busy}
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handlePasswordReset}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reset-email"
                  className="pl-10"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? 'Sending...' : 'Send reset link'}
            </Button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setNotice('');
              }}
              disabled={busy}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

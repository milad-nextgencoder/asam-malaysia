'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, LockKeyhole, User, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemberAction } from '@/hooks/use-member-action';
import { resendSignupConfirmation, signUpWithEmail } from '@/app/member/actions/auth';

export function MemberRegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { run, pending: busy, error: errorMessage, notice: successMessage } = useMemberAction();
  const [completion, setCompletion] = useState('');
  const [existingEmail, setExistingEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompletion(''); setExistingEmail(''); setResendMessage(''); setResendError('');
    await run(() => signUpWithEmail(email, password, firstName, lastName), (result) => {
      if (result.ok) {
        if (result.accountExists) setExistingEmail(email.trim()); else setCompletion(result.message);
        if (result.signedIn) { router.replace('/member'); router.refresh(); }
      }
    });
  }

  async function resendConfirmation() {
    if (resending) return;
    setResending(true); setResendError(''); setResendMessage('');
    try { const result = await resendSignupConfirmation(existingEmail || email); if (result.ok) setResendMessage(result.message); else setResendError(result.message); }
    catch { setResendError('The request could not be completed. Check your connection and try again.'); }
    finally { setResending(false); }
  }

  return (
    <div className="w-full space-y-6">
      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </div>
      )}
      {existingEmail && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950" role="status">
          <p className="font-semibold">This email already has an ASAM account.</p>
          <p className="mt-1">Sign in with its original method, or reset the password if you registered by email. We will not create another account or membership ID.</p>
          <div className="mt-3 flex flex-wrap gap-4 font-semibold"><a href="/member/login" className="underline">Sign in</a><a href="/member/forgot-password" className="underline">Reset password</a><button type="button" onClick={resendConfirmation} disabled={resending} className="underline disabled:opacity-60">{resending ? 'Sending...' : 'Resend confirmation email'}</button></div>
          {resendMessage && <p className="mt-3" role="status">{resendMessage}</p>}{resendError && <p className="mt-3 text-red-700" role="alert">{resendError}</p>}
        </div>
      )}
      {(completion || successMessage) && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {completion || successMessage}
          {!existingEmail && !resendMessage && <button type="button" onClick={resendConfirmation} disabled={resending} className="ml-2 font-semibold underline disabled:opacity-60">{resending ? 'Sending confirmation...' : 'Resend confirmation email'}</button>}
          {resendMessage && <span className="ml-2">{resendMessage}</span>}{resendError && <span className="ml-2 text-red-700">{resendError}</span>}
        </div>
      )}

      <p className="rounded-lg border border-navy/10 bg-navy/5 p-3 text-sm text-muted-foreground">Use one email for your ASAM account. If you already registered, sign in or reset your password instead of registering again. Your membership ID is issued once, after approval.</p>
      <form className="space-y-5" onSubmit={handleSubmit} aria-busy={busy}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="first-name"
                className="pl-10"
                type="text"
                autoComplete="given-name"
                maxLength={100}
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={busy}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              type="text"
              autoComplete="family-name"
              maxLength={100}
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-email"
              className="pl-10"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-password"
              className="pl-10"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
            />
          </div>
          <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
        </div>
        <Button className="w-full" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {busy ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href="/member/login" className="font-semibold text-gold-dark hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, LockKeyhole, User, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemberAction } from '@/hooks/use-member-action';
import { signUpWithEmail } from '@/app/member/actions/auth';

export function MemberRegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { run, pending: busy, error: errorMessage, notice: successMessage } = useMemberAction();
  const [completion, setCompletion] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompletion('');
    await run(() => signUpWithEmail(email, password, firstName, lastName), (result) => {
      if (result.ok) {
        setCompletion(result.message);
        if (result.signedIn) { router.replace('/member'); router.refresh(); }
      }
    });
  }
  return (
    <div className="w-full space-y-6">
      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </div>
      )}
      {(completion || successMessage) && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {completion || successMessage}
        </div>
      )}

      <p className="rounded-lg border border-navy/10 bg-navy/5 p-3 text-sm text-muted-foreground">Use one email for your ASAM account. Your membership ID is issued once, after approval.</p>
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

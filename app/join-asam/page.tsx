import Link from 'next/link';
import { ArrowRight, User, Mail, Shield } from 'lucide-react';

export default function JoinAsamPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Join ASAM
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Create your ASAM member account to access the member portal, connect with the community, and stay updated.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
            <User className="h-6 w-6 text-navy" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900">Create Account</h3>
          <p className="mt-2 text-sm text-gray-500">
            Register with your email or Google account to get started.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
            <Mail className="h-6 w-6 text-navy" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900">Verify Email</h3>
          <p className="mt-2 text-sm text-gray-500">
            Confirm your email address to activate your account.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
            <Shield className="h-6 w-6 text-navy" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900">Access Portal</h3>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access your member dashboard and profile.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/member/register"
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-8 py-4 text-base font-bold text-white shadow-premium transition-all hover:shadow-premium-lg"
        >
          Create Account
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href="/member/login"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50"
        >
          Sign In
        </Link>
      </div>

      <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Creating an account does not automatically grant official ASAM membership
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Your account gives you access to the member portal. Official ASAM membership applications, 
              verification, and approval will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

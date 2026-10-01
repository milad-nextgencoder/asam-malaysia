import Link from 'next/link';
import {
  ArrowRight,
  UserPlus,
  LogIn,
  ShieldCheck,
  FileCheck2,
  Clock3,
  Award,
  CheckCircle2,
} from 'lucide-react';

export default function JoinAsamPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/[0.07] via-transparent to-gold/[0.08]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-white shadow-premium">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
              Afghan Students Association in Malaysia
            </p>

            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Join ASAM
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Become part of the Afghan student community in Malaysia. Create
              your account, complete your membership application, and go
              through the official ASAM review process.
            </p>
          </div>

          {/* Main choices */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {/* New applicant */}
            <div className="group rounded-3xl border border-border bg-background p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/10">
                <UserPlus className="h-6 w-6 text-navy" />
              </div>

              <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
                New to ASAM?
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Create your ASAM account first. After registration and email
                verification, you can complete your profile and submit your
                official membership application.
              </p>

              <Link
                href="/member/register"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 text-sm font-bold text-white shadow-premium transition-all hover:scale-[1.01] hover:shadow-premium-lg"
              >
                Create ASAM Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Existing applicant */}
            <div className="group rounded-3xl border border-border bg-background p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <LogIn className="h-6 w-6 text-gold-dark" />
              </div>

              <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
                Already have an account?
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Sign in to access your member portal, complete your profile,
                submit or track your membership application, and view your
                membership status.
              </p>

              <Link
                href="/member/login"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-secondary"
              >
                Sign In to Member Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
            Membership Process
          </p>

          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            How ASAM membership works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Official membership is granted through an application and review
            process. Creating an account alone does not make you an official
            ASAM member.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              number: '01',
              icon: UserPlus,
              title: 'Create Account',
              description:
                'Register your account and verify your email address.',
            },
            {
              number: '02',
              icon: FileCheck2,
              title: 'Complete Profile',
              description:
                'Provide your university, programme, and required membership information.',
            },
            {
              number: '03',
              icon: Clock3,
              title: 'ASAM Review',
              description:
                'Submit your application and wait for the official review process.',
            },
            {
              number: '04',
              icon: Award,
              title: 'Membership',
              description:
                'Once approved, receive your official member ID and membership credentials.',
            },
          ].map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5 text-navy" />
                  </div>

                  <span className="text-xs font-bold tracking-widest text-muted-foreground">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What approval provides */}
      <section className="border-y border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Official Membership
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
                More than just an account
              </h2>

              <p className="mt-5 leading-7 text-muted-foreground">
                Your ASAM account gives you access to the digital portal.
                Official membership begins only after your application has
                been reviewed and approved by ASAM.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Official ASAM member ID',
                'Membership status and records',
                'Access to your member profile',
                'Official membership certificate',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-background p-5"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
                  <span className="text-sm font-medium text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Ready to become part of ASAM?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Start by creating your account, or sign in if you already have one.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/member/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-7 py-3.5 text-sm font-bold text-white shadow-premium transition-all hover:shadow-premium-lg"
          >
            Create Account
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/member/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
          >
            Existing Member? Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}


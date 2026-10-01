import Link from 'next/link';
import { CheckCircle2, ArrowRight, UserRound, FileText } from 'lucide-react';

interface AuthenticatedWelcomeProps {
  emailVerified: boolean;
  profileCompleted: boolean;
  hasApplication: boolean;
}

/**
 * Confirmation shown after a successful email-confirmation or Google sign-in.
 *
 * Previously the callback dropped the member on the public homepage with no
 * message, so there was no visible confirmation that authentication had worked.
 * This states the outcome plainly and then points at whichever step is actually
 * outstanding: completing the profile, submitting the membership application, or
 * simply exploring the portal.
 */
export function AuthenticatedWelcome({
  emailVerified,
  profileCompleted,
  hasApplication,
}: AuthenticatedWelcomeProps) {
  const nextStep = !emailVerified
    ? {
        icon: CheckCircle2,
        title: 'Confirm your email address',
        description:
          'Your account is ready, but your email address is not confirmed yet. Check your inbox for the ASAM confirmation link to finish setting up your account.',
        href: '/member/settings',
        cta: 'Open account settings',
      }
    : !profileCompleted
      ? {
          icon: UserRound,
          title: 'Next step: complete your profile',
          description:
            'Add your name, university, and programme so the ASAM administration can review your details and recognise you as a member.',
          href: '/member/profile',
          cta: 'Complete your profile',
        }
      : !hasApplication
        ? {
            icon: FileText,
            title: 'Next step: apply for membership',
            description:
              'Your account is confirmed and your profile is complete. Submit your membership application to receive your official ASAM Member ID and certificate.',
            href: '/member/membership',
            cta: 'Start membership application',
          }
        : {
            icon: CheckCircle2,
            title: 'You are all set',
            description:
              'Your membership application is already in progress. You can follow its status below and explore the member portal in the meantime.',
            href: '/member/membership',
            cta: 'View membership status',
          };

  const NextIcon = nextStep.icon;

  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-green-900 sm:text-2xl">
            Signed in successfully
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-green-800">
            Welcome to the ASAM member portal. Your email address is confirmed and you are
            now signed in.
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-white/70 p-4">
            <NextIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-700" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-green-900">{nextStep.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-green-800">
                {nextStep.description}
              </p>
              <Link
                href={nextStep.href}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
              >
                {nextStep.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
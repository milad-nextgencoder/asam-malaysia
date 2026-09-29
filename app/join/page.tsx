import Link from 'next/link';
import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  GraduationCap,
  HeartHandshake,
  Heart,
  Info,
  Megaphone,
  Phone,
  Users,
} from 'lucide-react';

export const metadata = {
  title: 'Join ASAM',
  description:
    'Volunteer with ASAM, represent your university, or join one of the twelve departments and help build the community.',
};

const waysToHelp = [
  {
    icon: GraduationCap,
    title: 'University Representative',
    description:
      'Be the point of contact for ASAM at your university, welcome new Afghan students, and report local needs to the executive team.',
  },
  {
    icon: CalendarDays,
    title: 'Events & Programs',
    description:
      'Plan workshops, cultural celebrations, sports tournaments and networking sessions, and support members on event day.',
  },
  {
    icon: HeartHandshake,
    title: 'Student Welfare',
    description:
      'Guide new arrivals, share reliable welfare information, and help students find the right university and community support.',
  },
  {
    icon: Megaphone,
    title: 'Communications & Media',
    description:
      'Manage announcements and social channels so the community always knows what is happening.',
  },
  {
    icon: Camera,
    title: 'Media & Documentation',
    description:
      'Capture event photographs, maintain the gallery, and produce stories that represent the community well.',
  },
  {
    icon: Heart,
    title: 'Community Chapters',
    description:
      'Help establish and run state, city and university chapters so ASAM is present wherever students are.',
  },
];

const steps = [
  {
    phase: '01',
    title: 'Create your account',
    description:
      'Register for an ASAM member account with your email or Google account. This gives you access to the member portal.',
  },
  {
    phase: '02',
    title: 'Complete your profile',
    description:
      'Add your name, university, programme and a short introduction so the team knows who you are and where you are based.',
  },
  {
    phase: '03',
    title: 'Tell us how you want to help',
    description:
      'Send us a message through the contact page describing the role or department you are interested in. We will reply with next steps.',
  },
];

/**
 * /join was linked from the primary navigation, the footer and three page CTAs
 * ("View Volunteer Roles", "Become a Representative", "View Open Roles") but the
 * route did not exist, so every one of those links returned a 404.
 *
 * This page is intentionally static: the database restricts page_sections to the
 * eleven managed page keys, so it must not use the Managed* CMS components.
 */
export default function JoinAsamPage() {
  return (
    <>
      <PageHero
        eyebrow="Join ASAM"
        title="Volunteer, represent, and build with us"
        description="ASAM is run by students for students. Every department, chapter and event depends on volunteers who are willing to give a few hours a week."
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/member/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-8 py-4 text-base font-bold text-white shadow-sm transition hover:bg-navy/90"
          >
            Create your account
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-semibold transition hover:bg-secondary/60"
          >
            Contact the team
          </Link>
        </div>
      </PageHero>

      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Ways to help"
            title="There is a place for you in ASAM"
            description="Whether you have a lot of time or a little, these are the roles that keep the association running."
          />
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {waysToHelp.map((role) => (
              <article
                key={role.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
                  <role.icon className="h-6 w-6 text-navy" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-gray-900">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How to get involved"
            title="Three steps to start"
            description="You do not need prior experience. Tell us what you are interested in and the team will guide you from there."
          />
          <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {steps.map((step) => (
              <article key={step.phase} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 font-display text-sm font-bold text-navy">
                  {step.phase}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Membership"
            title="Accounts and membership are different"
            description="Creating an account gives you access to the member portal. Official ASAM membership is granted after your application is reviewed and approved by the executive team."
          />
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <Users className="h-6 w-6 text-navy" />
              <h3 className="mt-4 font-display text-base font-bold text-gray-900">Member account</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign up to use the member portal, update your profile and register for events.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Info className="h-6 w-6 text-navy" />
              <h3 className="mt-4 font-display text-base font-bold text-gray-900">Membership application</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Submit your application once your profile is complete. The team reviews and approves it.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Phone className="h-6 w-6 text-navy" />
              <h3 className="mt-4 font-display text-base font-bold text-gray-900">Questions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the contact page to reach the team about a role, a chapter or a university representative position.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to get involved?"
        description="Create your account, complete your profile, and tell us how you would like to contribute to the ASAM community in Malaysia."
        primaryLabel="Create your account"
        primaryHref="/member/register"
        secondaryLabel="Explore ASAM"
        secondaryHref="/about"
      />
    </>
  );
}

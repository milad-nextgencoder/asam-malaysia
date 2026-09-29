import { existsSync } from 'node:fs';
import path from 'node:path';

import Link from 'next/link';
import { ArrowRight, GraduationCap, Mail, Phone, User, Code2, LayoutDashboard, Database, Smartphone } from 'lucide-react';

import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';

const developer = {
  name: 'Milad Sahebi',
  role: 'First-Year Computer Science Student',
  university: 'Albukhary International University, Malaysia',
  phone: '+601168560879',
  email: 'miladsahebi6666@gmail.com',
  photo: '/developer/milad-sahebi.jpg',
};

const scope = [
  {
    icon: LayoutDashboard,
    title: 'Public Website',
    description:
      'The full public-facing ASAM website: every information page, section layout and responsive grid across desktop, tablet and mobile.',
  },
  {
    icon: Code2,
    title: 'Design System',
    description:
      'A consistent visual language built from the ASAM identity — navy and gold palette, Playfair Display and Inter typography, and reusable shared components.',
  },
  {
    icon: Database,
    title: 'Content Management',
    description:
      'Page sections, listings and site settings wired to the ASAM data layer, so the team can publish and update content without touching code.',
  },
  {
    icon: Smartphone,
    title: 'Member Experience',
    description:
      'The member-facing experience, built to load quickly and read clearly on the devices students actually use every day.',
  },
];

export const metadata = {
  title: 'Web Developer',
  description:
    'The ASAM website and digital platform was designed and developed by Milad Sahebi.',
};

export default function WebDeveloperPage() {
  // The photo is optional: a clean placeholder is rendered until the image is
  // added at public/developer/milad-sahebi.jpg, so no artwork is fabricated.
  const hasPhoto = existsSync(path.join(process.cwd(), 'public', developer.photo));

  return (
    <>
      <PageHero
        eyebrow="Web Developer"
        title="Web Developer"
        description={`The ASAM website and digital platform was designed and developed by ${developer.name}.`}
      />

      {/* Profile */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Photo */}
            <div className="lg:col-span-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
                <div className="relative aspect-[4/5] w-full bg-secondary/40">
                  {hasPhoto ? (
                    <img
                      src={developer.photo}
                      alt={`${developer.name}, Web Developer of the ASAM platform`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
                        <User className="h-7 w-7 text-navy/40" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{developer.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Profile photo coming soon</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                  Developer Profile
                </span>
              </div>
              <h2 className="font-display text-2xl lg:text-[1.75rem] font-bold mb-4 text-balance">
                {developer.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold">{developer.role}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{developer.university}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold">Role</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Design &amp; Development of the ASAM Platform
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 text-base text-muted-foreground leading-relaxed">
                <p>
                  {developer.name} designed and developed the ASAM website and its digital
                  platform from the ground up. The work covers the visual design, the shared
                  component system that keeps every page consistent, and the engineering behind
                  the pages students and members use.
                </p>
                <p>
                  The platform is built around the ASAM identity — its navy and gold palette,
                  its typography, and the structure of the association&apos;s public information.
                  Every section was designed to stay readable and fast on the devices Afghan
                  students in Malaysia actually use day to day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scope of work */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="What was built"
            title="Scope of the work"
            description="The platform covers the association's public presence and the systems behind it."
          />
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scope.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-5 rounded-xl border border-border bg-card shadow-premium">
                  <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg gradient-navy">
                    <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-base font-bold mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-premium">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="h-px w-8 bg-gold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                    Contact
                  </span>
                </div>
                <h2 className="font-display text-2xl lg:text-[1.75rem] font-bold mb-2.5">
                  Get in touch
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For questions about the ASAM platform, its design or technical structure,
                  please reach out directly.
                </p>
              </div>
              <div className="lg:col-span-6 space-y-3">
                <a
                  href={`tel:${developer.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/60"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="text-sm font-semibold">{developer.phone}</div>
                  </div>
                </a>
                <a
                  href={`mailto:${developer.email}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/60"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="break-words text-sm font-semibold">{developer.email}</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-navy text-white text-sm font-semibold shadow-premium transition-all hover:shadow-premium-lg"
            >
              Contact ASAM
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}



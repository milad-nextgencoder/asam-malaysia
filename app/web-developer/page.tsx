import { existsSync } from 'node:fs';
import path from 'node:path';

import { GraduationCap, Mail, Phone, User } from 'lucide-react';

import { PageHero } from '@/components/site/page-hero';

const developer = {
  name: 'Milad Sahebi',
  title: 'Computer Science Student',
  university: 'Albukhary International University, Malaysia',
  phone: '+601168560879',
  email: 'miladsahebi6666@gmail.com',
  photo: '/developer/milad-sahebi.jpg',
};

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
        description={`The ASAM website was designed and developed by ${developer.name}.`}
      />

      <section className="py-10">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-premium">
            {/* Photo */}
            <div className="mx-auto w-40 overflow-hidden rounded-2xl border border-border bg-secondary/40">
              <div className="relative aspect-[4/5] w-full">
                {hasPhoto ? (
                  <img
                    src={developer.photo}
                    alt={`${developer.name}, Web Developer of the ASAM website`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="h-10 w-10 text-navy/30" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="mt-5 text-center">
              <h1 className="font-display text-2xl lg:text-[1.75rem] font-bold">{developer.name}</h1>
              <p className="mt-1.5 text-sm font-semibold text-gold-dark">{developer.title}</p>
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{developer.university}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-5 border-t border-border pt-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {developer.name} designed and developed the ASAM website. He is a computer
                science student at {developer.university}, and is interested in technology and
                in building digital solutions that are genuinely useful to the people who use
                them.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-5 border-t border-border pt-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Contact
              </h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <a
                  href={`tel:${developer.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3.5 transition-colors hover:bg-secondary/60"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <span className="min-w-0 truncate text-sm font-semibold">{developer.phone}</span>
                </a>
                <a
                  href={`mailto:${developer.email}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3.5 transition-colors hover:bg-secondary/60"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <span className="min-w-0 truncate text-sm font-semibold">{developer.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

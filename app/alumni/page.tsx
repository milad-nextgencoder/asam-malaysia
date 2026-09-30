import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { getPublishedPageSection } from '@/lib/page-sections';
import { ArrowRight, Heart } from 'lucide-react';

export const metadata = {
  title: 'Alumni Network',
  description: 'The ASAM Alumni Network — connecting Afghan graduates of Malaysian universities with the community.',
};

const lifecycle = ['Student', 'Graduate', 'Alumni', 'Mentor', 'Leader', 'Supporter'];

export default async function AlumniPage() {
  const [mentorContent, alumniCta] = await Promise.all([
    getPublishedPageSection('alumni', 'volunteer_as_a_mentor'),
    getPublishedPageSection('alumni', 'join_the_alumni_network'),
  ]);
  const alumniCtaHref = alumniCta?.button_url && ((alumniCta.button_url.startsWith('/') && !alumniCta.button_url.startsWith('//')) || /^https:\/\//i.test(alumniCta.button_url)) ? alumniCta.button_url : '/contact';
  return (
    <>
      <PageHero
        pageKey="alumni"
        eyebrow="ASAM Alumni Network"
        title="A lifelong connection"
        description="ASAM is building an alumni network that keeps Afghan graduates connected to the community — as mentors, supporters, and leaders."
      />

      {/* Lifecycle */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="alumni"
            eyebrow="The Journey"
            title="From student to supporter"
            description="ASAM is designed to be a lifelong community. Your journey doesn't end at graduation — it evolves."
          />
          <div className="mt-6 max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-5">
              <ManagedPageItemCards pageKey="alumni" collectionKey="lifecycle" variant="lifecycle" fallback={lifecycle.map((title) => ({ title }))} />
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Alumni */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="alumni"
            eyebrow="Meet the Alumni"
            title="Afghan graduates of Malaysian universities"
            description="Alumni who have studied in Malaysia and are now making an impact around the world."
          />
          <div className="mt-6">
            <EmptyState
              title="Alumni Directory Coming Soon"
              message="ASAM is building an alumni directory. Alumni profiles, professional stories, and mentorship connections will appear here as alumni register."
            />
          </div>
        </div>
      </section>

      {/* Alumni Programs */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="alumni"
            eyebrow="Alumni Programs"
            title="Ways to stay connected"
            description="ASAM offers multiple ways for alumni to stay engaged with the community."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ManagedPageItemCards pageKey="alumni" collectionKey="programs" fallback={[
              { title: 'Alumni Mentorship', description: 'Mentor current students and share your experience and guidance.', icon: 'Heart' },
              { title: 'Career Network', description: 'Share job opportunities and professional connections with the community.', icon: 'Briefcase' },
              { title: 'Alumni Events', description: 'Reunions, networking events, and alumni gatherings.', icon: 'CalendarDays' },
              { title: 'Professional Stories', description: 'Share your professional journey and inspire current students.', icon: 'Users' },
              { title: 'Alumni Opportunities', description: 'Post jobs, internships, and opportunities for the community.', icon: 'TrendingUp' },
              { title: 'Alumni Recognition', description: 'Recognizing alumni achievements and contributions to the community.', icon: 'Award' },
            ]} cardClassName="group p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300" iconClassName="h-6 w-6 text-navy mb-4" />
          </div>
        </div>
      </section>

      {/* Volunteer as Mentor */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto p-5 lg:p-5 rounded-xl border border-border bg-card shadow-premium text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-navy mx-auto mb-5">
              <Heart className="h-8 w-8 text-gold" />
            </div>
            <h2 className="font-display text-xl lg:text-2xl font-bold mb-4">{mentorContent?.title || 'Volunteer as a Mentor'}</h2>
            <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-5">
              {mentorContent?.body || 'If you are an Afghan alumnus of a Malaysian university, you can make a lasting impact by mentoring current students. Share your knowledge, experience, and network to help the next generation succeed.'}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <ManagedPageItemCards pageKey="alumni" collectionKey="mentorship" fallback={[
                { title: 'Academic', description: 'Guide students academically', icon: 'BookOpen' },
                { title: 'Career', description: 'Share professional insights', icon: 'Briefcase' },
                { title: 'Personal', description: 'Offer personal support', icon: 'Heart' },
              ]} cardClassName="p-4 rounded-xl bg-secondary/40 text-center" iconClassName="mx-auto mb-2 h-6 w-6 text-gold" />
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Registration */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 lg:p-12 text-center">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white text-balance">
                {alumniCta?.title || 'Join the Alumni Network'}
              </h2>
              <p className="mt-4 text-[0.9375rem] text-white/70 max-w-2xl mx-auto leading-relaxed">
                {alumniCta?.body || 'If you are an Afghan graduate of a Malaysian university, register with ASAM’s Alumni Network and stay connected with the community.'}
              </p>
              <div className="mt-6">
                <a
                  href={alumniCtaHref}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold text-navy font-bold text-base shadow-gold hover:scale-[1.03] transition-all"
                >
                  {alumniCta?.button_text || 'Register as Alumni'}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

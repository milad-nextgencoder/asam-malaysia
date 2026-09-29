import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Career & Entrepreneurship',
  description: 'Career development, internships, mentorship, entrepreneurship support, and professional networking for Afghan students in Malaysia.',
};

export default async function CareerPage() {
  const { data: opportunities, error: opportunitiesError } = await createClient()
    .from('opportunities')
    .select('id,title,organization,category,description,eligibility,location,deadline,application_url,image_url')
    .eq('status', 'published')
    .order('deadline', { ascending: true, nullsFirst: false })
    .limit(12);

  return (
    <>
      <PageHero
        pageKey="career"
        eyebrow="Career & Entrepreneurship"
        title="Building professional pathways"
        description="From your first internship to your first startup, ASAM's Career & Entrepreneurship department is here to support your professional journey in Malaysia and beyond."
      />

      {/* Career Network */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="career"
            eyebrow="Career Network"
            title="Your career development hub"
            description="Resources, programs, and connections to help you build a successful career."
          />
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManagedPageItemCards pageKey="career" collectionKey="career_services" fallback={[
              { title: 'Career Development', description: 'Career planning, guidance, and resources to help you navigate your professional path.', icon: 'Briefcase' },
              { title: 'Internship Network', description: 'Information about internship opportunities and how to find them.', icon: 'Network' },
              { title: 'Professional Mentorship', description: 'Connect with experienced professionals who can guide your career.', icon: 'Users' },
              { title: 'Entrepreneurship', description: 'Support for student founders including resources, mentorship, and networking.', icon: 'Rocket' },
              { title: 'CV & Interview Prep', description: 'Workshops, reviews, and mock interviews to help you stand out.', icon: 'BookOpen' },
              { title: 'Professional Networking', description: 'Events and platforms to build your professional network.', icon: 'Network' },
            ]} cardClassName="group p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300" iconClassName="h-6 w-6 text-navy mb-4" />
          </div>
        </div>
      </section>

      {/* Internship Opportunities */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="career"
            eyebrow="Internships"
            title="Internship opportunities"
            description="ASAM is building an internship network to connect students with professional experience opportunities."
          />
          <div className="mt-7">
            {opportunitiesError ? (
              <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                Career opportunities are temporarily unavailable. Please check back soon.
              </p>
            ) : opportunities?.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {opportunities.map((item) => {
                  const applicationUrl = item.application_url;
                  const safeApplicationUrl = typeof applicationUrl === 'string'
                    && ((applicationUrl.startsWith('/') && !applicationUrl.startsWith('//')) || /^https:\/\//i.test(applicationUrl));

                  return (
                    <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-premium">
                      {item.image_url && <img loading="lazy" src={item.image_url} alt="" className="mb-4 h-32 w-full rounded-xl object-cover" />}
                      {item.category && <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">{item.category}</p>}
                      <h3 className="mt-2 font-display text-lg font-bold">{item.title}</h3>
                      {item.organization && <p className="mt-1 text-sm font-medium text-muted-foreground">{item.organization}</p>}
                      {item.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
                      {(item.location || item.deadline || item.eligibility) && (
                        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                          {item.location && <p>Location: {item.location}</p>}
                          {item.deadline && <p>Deadline: {item.deadline}</p>}
                          {item.eligibility && <p>Eligibility: {item.eligibility}</p>}
                        </div>
                      )}
                      {safeApplicationUrl && (
                        <a href={applicationUrl} target={/^https:\/\//i.test(applicationUrl) ? '_blank' : undefined} rel={/^https:\/\//i.test(applicationUrl) ? 'noreferrer' : undefined} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold-dark">
                          View opportunity <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Internship Board Coming Soon"
                message="Published career and internship opportunities will appear here when ASAM adds them through the Admin Panel."
              />
            )}
          </div>
        </div>
      </section>

      {/* Entrepreneurship */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Entrepreneurship</span>
              </div>
              <h2 className="font-display text-2xl lg:text-[1.75rem] font-bold mb-4 text-balance">
                Support for student entrepreneurs
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                If you have an entrepreneurial spirit, ASAM supports your journey. From idea to
                execution, we provide resources, mentorship, and a community of like-minded
                individuals to help you build your venture.
              </p>
              <div className="space-y-3">
                <ManagedPageItemCards pageKey="career" collectionKey="entrepreneurship" variant="list" fallback={[
                  'Founder stories and inspiration from the community',
                  'Mentorship from experienced entrepreneurs',
                  'Networking with potential co-founders and team members',
                  'Resources for business planning, legal structure, and funding',
                  'Showcase opportunities for student ventures',
                ].map((title) => ({ title }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ManagedPageItemCards pageKey="career" collectionKey="entrepreneurship_stages" fallback={[
                { title: 'Start', description: 'Turn your idea into a plan', icon: 'Rocket' },
                { title: 'Build', description: 'Find co-founders and mentors', icon: 'Users' },
                { title: 'Grow', description: 'Scale with resources and support', icon: 'TrendingUp' },
                { title: 'Showcase', description: 'Present at ASAM events', icon: 'Award' },
              ]} cardClassName="p-5 rounded-xl border border-border bg-card shadow-premium" iconClassName="h-5 w-5 text-gold mb-3" />
            </div>
          </div>
        </div>
      </section>

      {/* CV & Interview Support */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="career"
            eyebrow="CV & Interview Support"
            title="Stand out from the crowd"
            description="Practical workshops and resources to help you craft a compelling CV and ace your interviews."
          />
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ManagedPageItemCards pageKey="career" collectionKey="cv_support" fallback={[
              { title: 'CV Writing', description: 'Learn how to structure and write an effective CV for the Malaysian and international job markets.' },
              { title: 'Cover Letters', description: 'Craft compelling cover letters that get noticed by employers.' },
              { title: 'Interview Prep', description: 'Mock interviews and tips for common interview questions and formats.' },
              { title: 'LinkedIn', description: 'Optimize your LinkedIn profile for professional networking and job searching.' },
            ]} cardClassName="p-5 rounded-xl border border-border bg-card shadow-premium" />
          </div>
        </div>
      </section>

      {/* Founder Stories */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="career"
            eyebrow="Founder Stories"
            title="Stories from Afghan entrepreneurs"
            description="Real stories from Afghan students and alumni who have started businesses and ventures."
          />
          <div className="mt-7">
            <EmptyState
              title="Founder Stories Coming Soon"
              message="ASAM will feature stories from Afghan student entrepreneurs and alumni founders. If you have a story to share, contact us."
            />
          </div>
        </div>
      </section>

      <CTASection
        pageKey="career"
        title="Ready to advance your career?"
        description="Join ASAM to access career resources, mentorship, networking events, and professional development programs."
        primaryLabel="Become a Member"
        primaryHref="/membership"
        secondaryLabel="View Opportunities"
        secondaryHref="/opportunities"
      />
    </>
  );
}

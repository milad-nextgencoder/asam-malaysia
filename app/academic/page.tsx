import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { BookOpen, Users, FlaskConical, Languages, Calendar, Award } from 'lucide-react';
import { getPublishedPageSection } from '@/lib/page-sections';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Academic Hub',
  description: 'Scholarships, academic resources, research, mentorship, and study support for Afghan students in Malaysia.',
};

const academicResources = [
  { icon: Award, title: 'Scholarships', desc: 'Information and guidance on scholarship opportunities available to Afghan students in Malaysia.' },
  { icon: Users, title: 'Academic Mentorship', desc: 'Connect with mentors who can guide you through your academic journey at your university.' },
  { icon: FlaskConical, title: 'Research', desc: 'Find research partners, collaborate on projects, and access research resources.' },
  { icon: BookOpen, title: 'Study Resources', desc: 'Access shared study materials, notes, and academic resources from the community.' },
  { icon: Languages, title: 'Language Support', desc: 'Support for English and Bahasa Malaysia language learning.' },
  { icon: Calendar, title: 'Academic Events', desc: 'Workshops, seminars, and academic-focused events.' },
];

export default async function AcademicPage() {
  const supabase = createClient();
  const [{ data: scholarships, error: scholarshipsError }, scholarshipIntro] = await Promise.all([
    supabase.from('scholarships').select('id,title,provider,description,eligibility,deadline,amount,application_url').eq('status', 'published').order('deadline', { ascending: true, nullsFirst: false }).range(0, 2),
    getPublishedPageSection('academic', 'scholarship_information'),
  ]);
  return (
    <>
      <PageHero
        pageKey="academic"
        eyebrow="Academic Hub"
        title="Your academic support center"
        description="ASAM's Academic Affairs department provides resources, mentorship, and information to help you succeed academically at your Malaysian university."
      />

      {/* Resource Cards */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="academic"
            eyebrow="Resources"
            title="Academic resources at your fingertips"
            description="Explore the academic support services available to ASAM members."
          />
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManagedPageItemCards pageKey="academic" collectionKey="academic_resources" fallback={academicResources.map((item) => ({
              title: item.title,
              description: item.desc,
              icon: item.title === 'Scholarships' ? 'Award' : item.title === 'Academic Mentorship' ? 'Users' : item.title === 'Research' ? 'FlaskConical' : item.title === 'Study Resources' ? 'BookOpen' : item.title === 'Language Support' ? 'Languages' : 'CalendarDays',
            }))} cardClassName="group p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300" iconClassName="h-8 w-8 text-gold mb-4" />
          </div>
        </div>
      </section>

      {/* Scholarships Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Scholarships</span>
              </div>
              <h2 className="font-display text-2xl lg:text-[1.75rem] font-bold mb-4 text-balance">
                {scholarshipIntro?.title || 'Discover scholarship opportunities'}
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                {scholarshipIntro?.body || scholarshipIntro?.description || 'ASAM is building a scholarship information network to help Afghan students discover and apply for scholarships available in Malaysia. While ASAM does not directly offer scholarships, we connect our members with opportunities from universities, government programs, and private organizations.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {['University Scholarships', 'Government Programs', 'Private Foundations', 'International Programs'].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {scholarshipsError ? <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Scholarship information is temporarily unavailable.</p> : scholarships?.length ? scholarships.map((item) => {
                const safeUrl = item.application_url && ((item.application_url.startsWith('/') && !item.application_url.startsWith('//')) || /^https:\/\//i.test(item.application_url));
                return <article key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-premium">
                  {item.provider && <p className="text-xs font-bold uppercase tracking-wider text-gold-dark">{item.provider}</p>}
                  <h3 className="mt-1 font-display text-lg font-bold">{item.title}</h3>
                  {item.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
                  {(item.amount || item.deadline) && <p className="mt-3 text-xs text-muted-foreground">{[item.amount && `Amount: ${item.amount}`, item.deadline && `Deadline: ${item.deadline}`].filter(Boolean).join(' · ')}</p>}
                  {safeUrl && <a href={item.application_url!} target={/^https:\/\//i.test(item.application_url!) ? '_blank' : undefined} rel={/^https:\/\//i.test(item.application_url!) ? 'noreferrer' : undefined} className="mt-3 inline-flex text-sm font-semibold text-gold-dark underline">Application details</a>}
                </article>;
              }) : <EmptyState title="No published scholarships yet" message="Scholarship listings published through the Admin Panel will appear here." />}
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="academic"
            eyebrow="Mentorship"
            title="Academic mentorship program"
            description="Connect with experienced students and alumni who can guide you through your academic journey."
          />
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ManagedPageItemCards pageKey="academic" collectionKey="mentorship" fallback={[
              { title: 'Peer Mentors', description: 'Connect with senior students in your field of study who can share their experience and advice.', icon: 'GraduationCap' },
              { title: 'Alumni Mentors', description: 'Learn from graduates who have successfully navigated the Malaysian university system.', icon: 'GraduationCap' },
              { title: 'Faculty Connections', description: 'Get guidance on building relationships with professors and academic advisors.', icon: 'GraduationCap' },
            ]} />
          </div>
        </div>
      </section>

      {/* Research */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="academic"
            eyebrow="Research"
            title="Research collaboration"
            description="Find research partners, collaborate on projects, and contribute to ASAM's research initiatives."
          />
          <div className="mt-7">
            <EmptyState
              title="Research Network Coming Soon"
              message="ASAM is building a research collaboration platform where students can find research partners, share resources, and contribute to community research projects. This feature will be available soon."
            />
          </div>
        </div>
      </section>

      {/* University Resources */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="academic"
            eyebrow="University Resources"
            title="Resources for your university"
            description="ASAM is building a directory of university-specific resources for Afghan students."
          />
          <div className="mt-7">
            <EmptyState
              title="University Resources Coming Soon"
              message="University-specific academic resources, including library guides, writing centers, and academic support services, will be listed here as the network is established."
            />
          </div>
        </div>
      </section>

      <CTASection
        pageKey="academic"
        title="Need academic support?"
        description="Join ASAM to access academic resources, mentorship, and a community that supports your educational journey."
        primaryLabel="Become a Member"
        primaryHref="/membership"
        secondaryLabel="View Opportunities"
        secondaryHref="/opportunities"
      />
    </>
  );
}

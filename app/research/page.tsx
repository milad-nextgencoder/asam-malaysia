import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { MessageSquare } from 'lucide-react';
import { createPublicClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Research & Policy',
  description: 'Published reports, research materials, and policy publications from ASAM.',
};

export const revalidate = 60;

export default async function ResearchPage() {
  const { data: reports, error: reportsError } = await createPublicClient()
    .from('documents')
    .select('id,title,description,category,file_url,published_at')
    .eq('status', 'published')
    .in('category', ['Reports', 'Publications'])
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(0, 19);
  return (
    <>
      <PageHero
        pageKey="research"
        eyebrow="Research & Policy"
        title="Research & policy"
        description="Published reports and research materials from ASAM, when available."
      />

      {/* Research Center */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Research Center"
            title="Research areas"
            description="ASAM identifies student research, surveys, publications, and policy work as areas of interest. Current public materials are listed below."
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ManagedPageItemCards pageKey="research" collectionKey="research_cards" fallback={[]} cardClassName="rounded-xl border border-border bg-card p-5 shadow-premium" />
          </div>
        </div>
      </section>

      {/* Data Visualization */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Data & Insights"
            title="Published community data"
            description="Verified figures from ASAM are shown here when available."
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ManagedPageItemCards pageKey="research" collectionKey="statistics" fallback={[]} cardClassName="rounded-xl border border-border bg-card p-5 shadow-premium" />
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Publications"
            title="Research publications"
            description="Reports, working papers, and policy briefs produced by ASAM."
          />
          <div className="mt-6">
            {reportsError ? <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Research publications are temporarily unavailable.</p> : reports?.length ? <div className="grid gap-5 md:grid-cols-2">{reports.map((report) => <article key={report.id} className="rounded-xl border border-border bg-card p-5 shadow-premium"><p className="text-xs font-bold uppercase tracking-wider text-gold-dark">{report.category || 'Publication'}</p><h3 className="mt-2 font-display text-lg font-bold">{report.title}</h3>{report.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{report.description}</p>}{report.file_url && <a href={report.file_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-gold-dark underline">View document</a>}</article>)}</div> : <EmptyState title="No published research documents yet" message="Reports and publications published through the Documents CMS will appear here." />}
          </div>
        </div>
      </section>

      {/* Student Voices */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Student Voices"
            title="Policy discussions & student input"
            description="A platform for Afghan students to share their perspectives on policies and issues that affect them."
          />
          <div className="mt-6 max-w-3xl mx-auto p-5 rounded-xl border border-border bg-card shadow-premium">
            <MessageSquare className="h-10 w-10 text-gold mb-4" />
            <h3 className="font-display text-xl font-bold mb-3">Share Your Voice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              ASAM is building a platform where students can contribute to policy discussions, share
              their experiences, and help shape the future of the Afghan student community in Malaysia.
              Your voice matters and we want to hear it.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Surveys', 'Focus Groups', 'Open Forums', 'Written Submissions'].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        pageKey="research"
        title="Contribute to research"
        description="If you are interested in research, data, or policy, ASAM welcomes your contribution. Join the Research & Policy department or participate in our surveys."
        primaryLabel="Join ASAM"
        primaryHref="/membership"
        secondaryLabel="View Opportunities"
        secondaryHref="/opportunities"
      />
    </>
  );
}

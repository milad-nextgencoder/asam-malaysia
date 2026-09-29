import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Research & Policy',
  description: 'Research center, student surveys, publications, reports, data analysis, and policy discussions from ASAM.',
};

export default async function ResearchPage() {
  const { data: reports, error: reportsError } = await createClient()
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
        title="The ASAM research center"
        description="Generating data, research, and policy insights to better understand and serve the Afghan student community in Malaysia."
      />

      {/* Research Center */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Research Center"
            title="Understanding our community through data"
            description="ASAM is building a research program to study the needs, challenges, and aspirations of Afghan students in Malaysia."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManagedPageItemCards pageKey="research" collectionKey="research_cards" fallback={[
              { title: 'Student Research', description: 'Supporting student-led research projects about the Afghan student experience in Malaysia.', icon: 'FlaskConical' },
              { title: 'Surveys', description: 'Regular community surveys to understand member needs and gather feedback.', icon: 'BarChart3' },
              { title: 'Publications', description: 'Research publications, working papers, and policy briefs.', icon: 'FileText' },
              { title: 'Reports', description: 'Annual and special reports on the state of the Afghan student community.', icon: 'Database' },
              { title: 'Data Analysis', description: 'Data-driven insights to inform ASAM programs and advocacy.', icon: 'TrendingUp' },
              { title: 'Policy Research', description: 'Research on policies affecting Afghan students in Malaysia.', icon: 'BookOpen' },
            ]} cardClassName="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300" iconClassName="h-6 w-6 text-navy mb-4" />
          </div>
        </div>
      </section>

      {/* Data Visualization */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Data & Insights"
            title="Visualizing our community"
            description="Data visualizations and insights about the Afghan student community in Malaysia will be published here."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ManagedPageItemCards pageKey="research" collectionKey="statistics" fallback={[
              { title: 'Total Members', metric: 'Not published', description: 'Verified members' },
              { title: 'Universities', metric: 'Not published', description: 'With ASAM presence' },
              { title: 'State Chapters', metric: 'Not published', description: 'Active chapters' },
              { title: 'Events Held', metric: 'Not published', description: 'Total events' },
            ]} cardClassName="p-6 rounded-2xl border border-border bg-card shadow-premium" />
          </div>
          <div className="mt-8">
            <EmptyState
              title="Data Visualizations Coming Soon"
              message="ASAM is building a data and analytics platform. Charts, graphs, and interactive visualizations about the community will appear here once data is collected."
            />
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Publications"
            title="Research publications"
            description="Reports, working papers, and policy briefs produced by ASAM."
          />
          <div className="mt-12">
            {reportsError ? <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Research publications are temporarily unavailable.</p> : reports?.length ? <div className="grid gap-5 md:grid-cols-2">{reports.map((report) => <article key={report.id} className="rounded-2xl border border-border bg-card p-6 shadow-premium"><p className="text-xs font-bold uppercase tracking-wider text-gold-dark">{report.category || 'Publication'}</p><h3 className="mt-2 font-display text-lg font-bold">{report.title}</h3>{report.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{report.description}</p>}{report.file_url && <a href={report.file_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-gold-dark underline">View document</a>}</article>)}</div> : <EmptyState title="No published research documents yet" message="Reports and publications published through the Documents CMS will appear here." />}
          </div>
        </div>
      </section>

      {/* Student Voices */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="research"
            eyebrow="Student Voices"
            title="Policy discussions & student input"
            description="A platform for Afghan students to share their perspectives on policies and issues that affect them."
          />
          <div className="mt-12 max-w-3xl mx-auto p-8 rounded-3xl border border-border bg-card shadow-premium">
            <MessageSquare className="h-10 w-10 text-gold mb-4" />
            <h3 className="font-display text-xl font-bold mb-3">Share Your Voice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
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

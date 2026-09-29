import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Transparency',
  description: 'Governance, policies, accountability, and transparency at ASAM.',
};

export default async function TransparencyPage() {
  const { data: documents, error: documentsError } = await createClient().from('documents').select('id,title,description,category,file_url,published_at').eq('status','published').order('published_at',{ascending:false,nullsFirst:false}).range(0,99);
  return (
    <>
      <PageHero
        pageKey="transparency"
        eyebrow="Transparency"
        title="Accountability and openness"
        description="ASAM is committed to operating with full transparency. This page provides information about our governance, policies, and accountability framework."
      />

      {/* Transparency Pillars */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="transparency"
            eyebrow="Our Commitment"
            title="What transparency means to us"
            description="ASAM is built on the principle that members deserve to know how their organization operates."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ManagedPageItemCards pageKey="transparency" collectionKey="pillars" fallback={[
              { title: 'Open Governance', description: 'Clear organizational structure, roles, and decision-making processes.', icon: 'Eye' },
              { title: 'Public Policies', description: 'Constitution, code of conduct, and policies available to all members.', icon: 'FileText' },
              { title: 'Annual Reports', description: 'Regular reports on activities, finances, and impact.', icon: 'ScrollText' },
              { title: 'Data Privacy', description: 'Clear data handling practices and member privacy protections.', icon: 'Lock' },
            ]} cardClassName="p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300" iconClassName="h-6 w-6 text-navy mb-4" />
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="transparency"
            eyebrow="Documents"
            title="Official documents"
            description="ASAM's official documents will be published here once they are finalized and approved."
          />
          {documentsError ? <p role="status" className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Official documents are temporarily unavailable.</p> : documents?.length ? <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((item, i) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl border border-border bg-card hover:border-gold/30 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-4" />
                <h3 className="font-display text-base font-bold mb-2">{item.title}</h3>
                {item.description&&<p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>}
                <div className="mb-3 text-xs text-muted-foreground">{item.category||'Document'}{item.published_at?` · ${new Date(item.published_at).toLocaleDateString()}`:''}</div>
                {typeof item.file_url==='string'&&/^https:\/\//i.test(item.file_url)&&<a href={item.file_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold-dark underline">View / download</a>}
              </div>
            ))}
          </div> : <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No official documents have been published yet.</div>}
        </div>
      </section>

      {/* Privacy Policy */}
      <section id="privacy" className="py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="transparency"
            eyebrow="Privacy Policy"
            title="How we handle your data"
            description="ASAM is committed to protecting member privacy and handling data responsibly."
          />
          <div className="mt-8 p-8 rounded-3xl border border-border bg-card shadow-premium space-y-4">
            <ManagedPageItemCards pageKey="transparency" collectionKey="privacy" variant="sections" fallback={[
              { title: 'Data Collection', description: 'ASAM collects member information necessary for membership management, including name, university enrollment, contact details, and membership preferences. We do not collect sensitive personal information such as passport numbers or financial details through the website.' },
              { title: 'Data Usage', description: 'Member data is used for membership verification, communication, event registration, and community building. We do not sell or share member data with third parties.' },
              { title: 'Data Protection', description: 'ASAM implements appropriate security measures to protect member data. Access to member data is restricted to authorized personnel only. The full privacy policy will be published once finalized.' },
              { title: 'Member Rights', description: 'Members have the right to access, update, and request deletion of their personal data. Members can control the visibility of their profile information through the member portal.' },
              { title: 'Malaysian Data Protection', description: 'ASAM is designed to comply with applicable Malaysian data protection obligations, including the Personal Data Protection Act (PDPA). The full compliance framework will be published once finalized.' },
            ]} />
          </div>
        </div>
      </section>

      {/* Code of Conduct */}
      <section id="conduct" className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="transparency"
            eyebrow="Code of Conduct"
            title="Our community standards"
            description="The standards of behavior expected from all ASAM members and leaders."
          />
          <div className="mt-8 p-8 rounded-3xl border border-border bg-card shadow-premium">
            <div className="space-y-3">
              <ManagedPageItemCards pageKey="transparency" collectionKey="conduct" variant="list" fallback={[
                'Treat all members with respect, dignity, and fairness',
                'Do not discriminate based on ethnicity, gender, religion, or background',
                'Do not use ASAM platforms for personal gain at the community’s expense',
                'Respect the privacy and confidentiality of fellow members',
                'Represent ASAM positively in the broader community',
                'Report violations through appropriate channels',
                'Contribute to a positive, inclusive, and supportive community',
                'Uphold the values and mission of ASAM in all activities',
              ].map((title) => ({ title }))} />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        pageKey="transparency"
        title="Questions about transparency?"
        description="ASAM welcomes questions about our governance, policies, and operations. Contact us for more information."
        primaryLabel="Contact Us"
        primaryHref="/contact"
        secondaryLabel="View Governance"
        secondaryHref="/governance"
      />
    </>
  );
}

import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { orgHierarchy } from '@/lib/data/leadership';
import { cn } from '@/lib/utils';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { Check, Shield, FileText, Users, GitBranch, Scale, RefreshCw, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Governance & Structure',
  description: 'The organizational architecture, governance principles, and decision-making framework of ASAM.',
};

const governancePrinciples = [
  { icon: Shield, title: 'Accountability', description: 'Every leader and member is accountable to the community and the organization\u2019s values.' },
  { icon: FileText, title: 'Transparency', description: 'Decisions, finances, and operations are conducted with openness and clarity.' },
  { icon: Users, title: 'Inclusivity', description: 'Every member has a voice. Decisions consider the needs of the entire community.' },
  { icon: Scale, title: 'Fairness', description: 'All members are treated equitably, regardless of university, background, or status.' },
  { icon: GitBranch, title: 'Clear Structure', description: 'Roles, responsibilities, and reporting lines are clearly defined and communicated.' },
  { icon: RefreshCw, title: 'Succession', description: 'Leadership transitions are planned, orderly, and ensure continuity of the organization.' },
  { icon: MessageSquare, title: 'Participation', description: 'Members are encouraged to participate in decision-making and community building.' },
  { icon: Check, title: 'Integrity', description: 'All actions and decisions are guided by the highest ethical standards.' },
];

export default function GovernancePage() {
  return (
    <>
      <PageHero
        pageKey="governance"
        eyebrow="Governance & Structure"
        title="The architecture of a national association"
        description="ASAM is built on a clear organizational structure, defined governance principles, and a decision-making framework designed to ensure accountability, transparency, and effective coordination."
      />

      {/* Hierarchy */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="governance"
            eyebrow="Organizational Hierarchy"
            title="From President to Volunteers"
            description="Every role in ASAM has a defined place in the organizational structure, ensuring clear reporting lines and accountability."
          />
          <div className="mt-6 max-w-3xl mx-auto">
            <div className="space-y-3">
              {orgHierarchy.map((item, i) => (
                <div
                  key={item.level}
                  className="flex items-center gap-4 p-4 lg:p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl font-display text-sm font-bold flex-shrink-0',
                    i === 0 ? 'gradient-gold text-navy' : 'gradient-navy text-gold'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm lg:text-base">{item.level}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground hidden lg:block">
                    Level {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance Principles */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="governance"
            eyebrow="Governance Principles"
            title="The principles that guide our decisions"
            description="ASAM operates according to a set of governance principles that ensure the organization remains accountable, transparent, and effective."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ManagedPageItemCards pageKey="governance" collectionKey="principles" fallback={governancePrinciples.map((item) => ({
              title: item.title, description: item.description,
              icon: item.title === 'Accountability' ? 'Shield' : item.title === 'Transparency' ? 'FileText' : item.title === 'Inclusivity' ? 'Users' : item.title === 'Fairness' ? 'Scale' : item.title === 'Clear Structure' ? 'Network' : item.title === 'Succession' ? 'RefreshCw' : item.title === 'Participation' ? 'MessageSquare' : 'Check',
            }))} cardClassName="p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300" iconClassName="h-6 w-6 text-navy mb-4" />
          </div>
        </div>
      </section>

      {/* Decision-Making Framework */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="governance"
            eyebrow="Decision-Making Framework"
            title="How decisions are made"
            description="ASAM follows a structured decision-making process that balances efficiency with inclusivity."
          />
          <div className="mt-6 max-w-3xl mx-auto space-y-4">
            <ManagedPageItemCards pageKey="governance" collectionKey="decision_steps" variant="steps" fallback={[
              { phase: '01', title: 'Proposal', description: 'Any member or leader can propose an initiative, event, or policy change.' },
              { phase: '02', title: 'Review', description: 'Proposals are reviewed by the relevant department director and executive team.' },
              { phase: '03', title: 'Consultation', description: 'Affected members and stakeholders are consulted for input and feedback.' },
              { phase: '04', title: 'Decision', description: 'The executive team makes a decision based on input, feasibility, and alignment with ASAM’s mission.' },
              { phase: '05', title: 'Implementation', description: 'Approved proposals are implemented by the responsible department or team.' },
              { phase: '06', title: 'Review & Feedback', description: 'Implemented decisions are reviewed for effectiveness and community feedback is gathered.' },
            ]} cardClassName="p-5 rounded-xl border border-border bg-card shadow-premium" />
          </div>
        </div>
      </section>

      {/* Internal Coordination */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="governance"
            eyebrow="Internal Coordination"
            title="How we stay aligned"
            description="ASAM uses regular meetings, reporting, and communication channels to ensure all departments and chapters stay coordinated."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ManagedPageItemCards pageKey="governance" collectionKey="coordination" fallback={[
              { title: 'Executive Meetings', description: 'Regular meetings of the executive leadership team to review progress, set priorities, and make decisions.' },
              { title: 'Department Reports', description: 'Each department provides regular reports on activities, progress, and challenges.' },
              { title: 'Chapter Coordination', description: 'Chapter leaders meet regularly to share updates and coordinate activities.' },
              { title: 'Member Feedback', description: 'Members can provide feedback and suggestions through the member portal and regular surveys.' },
              { title: 'Annual Review', description: 'A comprehensive annual review of ASAM’s activities, finances, and impact.' },
              { title: 'Strategic Planning', description: 'Regular strategic planning sessions to set direction and priorities for the coming period.' },
            ]} />
          </div>
        </div>
      </section>

      <CTASection
        pageKey="governance"
        title="Transparency is our commitment"
        description="ASAM is committed to operating with full transparency. Visit our transparency page to learn more about our governance, policies, and accountability."
        primaryLabel="View Transparency"
        primaryHref="/transparency"
        secondaryLabel="Meet the Team"
        secondaryHref="/leadership"
      />
    </>
  );
}

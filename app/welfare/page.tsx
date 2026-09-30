import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { ManagedFaqs } from '@/components/site/managed-faqs';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { getPublishedPageSection } from '@/lib/page-sections';
import { Users, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Student Welfare',
  description: 'Support, orientation, resources, and guidance for Afghan students living and studying in Malaysia.',
};

export default async function WelfarePage() {
  const orientation = await getPublishedPageSection('welfare', 'asam_new_student_orientation');
  return (
    <>
      <PageHero
        pageKey="welfare"
        eyebrow="Student Welfare"
        title="Supporting you every step of the way"
        description="ASAM's Student Welfare department provides informational and community support for new and continuing students — from orientation to peer support and referral resources."
      />

      {/* Important Notice */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-amber-900 mb-1">Important Notice</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                ASAM provides informational and community support only. We are not a substitute for
                professional legal, immigration, medical, or emergency services. For urgent matters,
                please contact the relevant authorities, your university&apos;s international office, or
                emergency services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Student Guide */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="welfare"
            eyebrow="New Student Guide"
            title="Welcome to Malaysia"
            description="A guide for new Afghan students arriving in Malaysia — everything you need to know to get started."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ManagedPageItemCards pageKey="welfare" collectionKey="new_student_guide" fallback={[
              { title: 'Arrival', description: 'What to do when you first arrive in Malaysia — airport, transport, accommodation.', icon: 'Home' },
              { title: 'University Enrollment', description: 'Guide to university registration, student ID, and course enrollment.', icon: 'BookOpen' },
              { title: 'Health & Wellbeing', description: 'Information on healthcare, insurance, and mental health resources.', icon: 'Heart' },
              { title: 'Community', description: 'How to connect with the Afghan student community and ASAM.', icon: 'Users' },
              { title: 'Living in Malaysia', description: 'Essential information about daily life, culture, and practicalities.', icon: 'Info' },
              { title: 'Important Contacts', description: 'Key contacts for emergencies, university offices, and embassies.', icon: 'Phone' },
            ]} cardClassName="group p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300" iconClassName="h-6 w-6 text-navy mb-4" />
          </div>
        </div>
      </section>

      {/* Orientation */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="welfare"
            eyebrow="Orientation"
            title="ASAM New Student Orientation"
            description="A virtual welcome session for new Afghan students arriving in Malaysia."
          />
          <div className="mt-6 max-w-3xl mx-auto p-5 rounded-xl border border-border bg-card shadow-premium">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-navy">
                <Users className="h-7 w-7 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">{orientation?.title || 'New Student Welcome & Orientation'}</h3>
                <p className="text-sm text-muted-foreground">{orientation?.subtitle || 'A virtual session for new students'}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {orientation?.body || 'Join our virtual orientation session to learn about university life, living in Malaysia, student resources, and how to connect with the ASAM community. This session is designed for new Afghan students and covers everything you need to know to get started.'}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-3 rounded-xl bg-secondary/40">
                <div className="text-xs font-semibold text-muted-foreground">Format</div>
                <div className="text-sm font-medium">Online (Virtual)</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40">
                <div className="text-xs font-semibold text-muted-foreground">Audience</div>
                <div className="text-sm font-medium">New Afghan Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Living in Malaysia */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="welfare"
            eyebrow="Living in Malaysia"
            title="Practical information for daily life"
            description="Essential information about living in Malaysia as an international student."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ManagedPageItemCards pageKey="welfare" collectionKey="daily_life" fallback={[
              { title: 'Accommodation', description: 'Types of student housing, what to expect, and how to find accommodation.' },
              { title: 'Transportation', description: 'Public transport, student cards, and getting around Malaysian cities.' },
              { title: 'Banking & Finance', description: 'Opening a bank account, managing finances, and money transfer options.' },
              { title: 'Food & Dining', description: 'Halal food availability, Afghan restaurants, and cooking options.' },
              { title: 'Weather & Clothing', description: 'Malaysia’s tropical climate and what to pack.' },
              { title: 'Communication', description: 'Mobile plans, internet, and staying connected with family.' },
              { title: 'Safety', description: 'General safety tips and emergency contacts.' },
              { title: 'Culture & Customs', description: 'Understanding Malaysian culture, customs, and etiquette.' },
            ]} cardClassName="p-5 rounded-xl border border-border bg-card shadow-premium" />
          </div>
        </div>
      </section>

      {/* Peer Support */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="welfare"
            eyebrow="Peer Support"
            title="You are not alone"
            description="ASAM's peer support network connects you with fellow students who understand what you're going through."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <ManagedPageItemCards pageKey="welfare" collectionKey="peer_support" fallback={[
              { title: 'Peer Mentors', description: 'Connect with experienced students who can answer your questions and provide guidance.', icon: 'Heart' },
              { title: 'Community Groups', description: 'Join WhatsApp, Telegram, or other community groups organized by university or city.', icon: 'Heart' },
              { title: 'Welfare Referrals', description: 'If you need specialized support, ASAM can refer you to appropriate services.', icon: 'Heart' },
            ]} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="welfare"
            eyebrow="Welfare FAQ"
            title="Frequently asked questions"
          />
          <ManagedFaqs category="Student Welfare" />
        </div>
      </section>

      <CTASection
        pageKey="welfare"
        title="Need support?"
        description="Join ASAM to connect with a community that cares. Our welfare team is here to help you navigate student life in Malaysia."
        primaryLabel="Join ASAM"
        primaryHref="/membership"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
      />
    </>
  );
}

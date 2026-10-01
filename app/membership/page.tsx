import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { ManagedFaqs } from '@/components/site/managed-faqs';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { membershipTypes } from '@/lib/data/content';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Membership',
  description: 'Join the Afghan Students Association of Malaysia. Explore membership types, benefits, and how to join.',
};

export default function MembershipPage() {
  return (
    <>
      <PageHero
        pageKey="membership"
        eyebrow="Membership"
        title="Join the ASAM community"
        description="Become part of a growing national platform connecting Afghan students across Malaysia. Your journey starts here."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#join"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-navy text-white font-bold text-base shadow-premium hover:shadow-premium-lg hover:scale-[1.02] transition-all"
          >
            Join ASAM
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="#benefits"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border font-semibold text-base hover:bg-secondary/60 transition-all"
          >
            View Benefits
          </a>
        </div>
      </PageHero>

      {/* Why Join */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="membership"
            eyebrow="Why Join"
            title="Five reasons to become a member"
            description="ASAM membership gives you access to a national community, resources, opportunities, and a platform that supports your journey in Malaysia."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <ManagedPageItemCards pageKey="membership" collectionKey="benefits" fallback={[
              { title: 'Community', description: 'Connect with Afghan students across all Malaysian universities', icon: 'Users' },
              { title: 'Academic Support', description: 'Access scholarships, mentorship, and academic resources', icon: 'GraduationCap' },
              { title: 'Opportunities', description: 'Discover internships, jobs, competitions, and training programs', icon: 'Award' },
              { title: 'Welfare Support', description: 'Get orientation support, peer connections, and referral resources', icon: 'Heart' },
              { title: 'Network', description: 'Build professional and social connections for life', icon: 'Handshake' },
            ]} cardClassName="p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300" iconClassName="h-6 w-6 text-gold mb-4" />
          </div>
        </div>
      </section>

      {/* Membership Types */}
      <section id="benefits" className="py-12 sm:py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="membership"
            eyebrow="Membership Types"
            title="Choose the right membership for you"
            description="ASAM offers five membership categories designed to serve different members of the community."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManagedPageItemCards pageKey="membership" collectionKey="membership_types" variant="membership" fallback={membershipTypes.map((type) => ({
              title: type.name,
              description: type.description,
              body: type.benefits.join('\n'),
              phase: type.requirements,
              icon: type.name === 'Student Member' ? 'GraduationCap' : type.name === 'Associate Member' ? 'Heart' : type.name === 'Honorary Member' ? 'Award' : type.name === 'Institutional Partner' ? 'Handshake' : 'Users',
            }))} cardClassName="group p-8 rounded-3xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300" />
          </div>
        </div>
      </section>

      {/* How Membership Works */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="membership"
            eyebrow="How It Works"
            title="The membership process"
            description="Joining ASAM is simple. Here's how the process works."
          />
          <div className="mt-12 max-w-3xl mx-auto space-y-4">
            <ManagedPageItemCards pageKey="membership" collectionKey="process" variant="steps" fallback={[
              { phase: '01', title: 'Register', description: 'Fill out the membership registration form with your details and university information.' },
              { phase: '02', title: 'Verify', description: 'ASAM verifies your enrollment status and Afghan nationality.' },
              { phase: '03', title: 'Activate', description: 'Once verified, your membership is activated and you receive access to the member portal.' },
              { phase: '04', title: 'Engage', description: 'Join events, access resources, connect with the community, and start your ASAM journey.' },
            ]} cardClassName="p-5 rounded-2xl border border-border bg-card shadow-premium" />
          </div>
        </div>
      </section>

      {/* Member Responsibilities & Code of Conduct */}
      <section className="py-12 sm:py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl border border-border bg-card shadow-premium">
              <h3 className="font-display text-xl font-bold mb-4">Member Responsibilities</h3>
              <ul className="space-y-3">
                <ManagedPageItemCards pageKey="membership" collectionKey="responsibilities" variant="list" fallback={[
                  'Uphold ASAM’s values and mission', 'Respect fellow members and the community',
                  'Provide accurate information during registration', 'Participate in community activities when possible',
                  'Represent ASAM positively in the broader community', 'Maintain membership information up to date',
                ].map((title) => ({ title }))} />
              </ul>
            </div>
            <div className="p-8 rounded-3xl border border-border bg-card shadow-premium">
              <h3 className="font-display text-xl font-bold mb-4">Code of Conduct</h3>
              <ul className="space-y-3">
                <ManagedPageItemCards pageKey="membership" collectionKey="member_conduct" variant="list" fallback={[
                  'Treat all members with respect and dignity', 'Do not discriminate based on ethnicity, gender, religion, or background',
                  'Do not use ASAM platforms for personal gain at the community’s expense', 'Respect the privacy of fellow members',
                  'Report violations through appropriate channels', 'Contribute to a positive and inclusive community',
                ].map((title) => ({ title }))} />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="membership"
            eyebrow="Membership FAQ"
            title="Frequently asked questions"
          />
          <ManagedFaqs category="Membership" />
        </div>
      </section>

      {/* Join CTA */}
      <div id="join"><CTASection pageKey="membership" sectionKey="join_asam_today" title="Join ASAM today" description="Your membership is the foundation of our community. Join ASAM and help build a national platform for Afghan students in Malaysia." primaryLabel="Register Now" primaryHref="/join-asam" /></div>
    </>
  );
}


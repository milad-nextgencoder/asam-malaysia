import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { Timeline } from '@/components/site/timeline';
import { coreValues, timelinePhases, roadmapPhases } from '@/lib/data/content';
import { getPublishedPageItems, getPublishedPageSection } from '@/lib/page-sections';
import { Check, Target, Eye, Compass } from 'lucide-react';

export const metadata = {
  title: 'About ASAM',
  description: 'Who we are, why we exist, and where we are going. The story of the Afghan Students Association of Malaysia.',
};

export default async function AboutPage() {
  const [managedValues, managedTimeline, managedRoadmap, whoWeAre, purpose, vision, mission, whyAsam, longTermVision] = await Promise.all([
    getPublishedPageItems('about', 'core_values'),
    getPublishedPageItems('about', 'timeline'),
    getPublishedPageItems('about', 'roadmap'),
    getPublishedPageSection('about', 'who_we_are'),
    getPublishedPageSection('about', 'purpose'),
    getPublishedPageSection('about', 'vision'),
    getPublishedPageSection('about', 'mission'),
    getPublishedPageSection('about', 'why_asam_exists'),
    getPublishedPageSection('about', 'long_term_vision'),
  ]);
  const values = managedValues === null ? coreValues : managedValues.map((item) => ({ title: item.title, description: item.description || '' }));
  const timeline = managedTimeline === null ? timelinePhases : managedTimeline.map((item) => ({ phase: item.title, description: item.description || '' }));
  const roadmap = managedRoadmap === null ? roadmapPhases : managedRoadmap.map((item) => {
    const [phase = '', , ...statusParts] = (item.phase || '').split(' ');
    const status = statusParts.join(' ');
    return { phase, title: item.title, description: item.description || '', status };
  });
  return (
    <>
      <PageHero
        pageKey="about"
        eyebrow="About ASAM"
        title="Building a national platform for Afghan students in Malaysia"
        description="ASAM is being built to connect, support, empower, and develop Afghan students and alumni in Malaysia through academic collaboration, student welfare, professional development, cultural engagement, leadership, networking, events, research, and community building."
      />

      {/* Who We Are */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">{whoWeAre?.eyebrow || 'Who We Are'}</span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6 text-balance">
                {whoWeAre?.title || 'A community-driven national student platform'}
              </h2>
              <div className="space-y-4 text-base lg:text-lg text-muted-foreground leading-relaxed">
                {(whoWeAre?.body ? whoWeAre.body.split(/\n\s*\n/) : [
                  `The Afghan Students Association of Malaysia (ASAM) is a national platform being built by Afghan students, for Afghan students. We are creating a unified community that spans universities, cities, and states — connecting students who might otherwise never meet, and building a support system that extends far beyond any single campus.`,
                  `We are working toward becoming a comprehensive national student association. While we are not yet the official representative body for every Afghan student in Malaysia, we are building the foundation, infrastructure, and community that will make that vision a reality.`,
                  `ASAM serves participating members — students who choose to join, engage, and contribute to the community. Our commitment is to every member, and our goal is to make the Afghan student experience in Malaysia one of connection, growth, and opportunity.`,
                ]).map((paragraph, index) => <p key={index}>
                  {paragraph}
                </p>)}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl border border-border bg-card shadow-premium">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-navy mb-6">
                  <Target className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{purpose?.title || 'Our Purpose'}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {purpose?.body || 'To ensure that no Afghan student in Malaysia is alone — that every student has access to a community, resources, opportunities, and a platform that amplifies their voice and supports their journey.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 lg:p-12 rounded-3xl border border-border bg-card shadow-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-navy mb-6">
                <Eye className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">{vision?.title || 'Our Vision'}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {vision?.body || 'To build a connected, empowered, and thriving Afghan student community across Malaysia — one where every student has access to support, opportunity, and a sense of belonging, regardless of which university they attend.'}
              </p>
            </div>
            <div className="p-8 lg:p-12 rounded-3xl border border-border bg-card shadow-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold mb-6">
                <Compass className="h-7 w-7 text-navy" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">{mission?.title || 'Our Mission'}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {mission?.body || 'To connect Afghan students across Malaysian universities through academic collaboration, student welfare, professional development, cultural engagement, leadership, and community building — creating a national platform that serves and empowers its members.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="about"
            eyebrow="Core Values"
            title="What we stand for"
            description="The principles that guide everything we do."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 mb-4">
                  <Check className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ASAM Exists */}
      <section className="py-16 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Why ASAM Exists</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-6 text-balance">
              {whyAsam?.title || 'Because community is not optional — it is essential'}
            </h2>
            <div className="space-y-4 text-base lg:text-lg text-white/60 leading-relaxed">
              {(whyAsam?.body ? whyAsam.body.split(/\n\s*\n/) : [
                'Afghan students in Malaysia come from diverse backgrounds, study at different universities, and live in different cities. But they share common experiences, challenges, and aspirations. ASAM exists to ensure that these shared experiences become the foundation for a strong, supportive community.',
                'We believe that when students are connected, they are stronger. When they have access to resources, they succeed. When they have a platform, they are heard. And when they have a community, they thrive.',
              ]).map((paragraph, index) => <p key={index}>
                {paragraph}
              </p>)}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="about"
            eyebrow="Our Journey"
            title="The road ahead"
            description="ASAM is being built in phases, each one bringing us closer to a fully realized national platform."
          />
          <div className="mt-16">
            <Timeline items={timeline} />
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="about"
            eyebrow="Strategic Roadmap"
            title="Eight phases to national scale"
            description="Our strategic plan for building ASAM from foundation to a self-sustaining alumni ecosystem."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.map((phase, i) => (
              <div
                key={phase.phase}
                className="p-6 rounded-2xl border border-border bg-card shadow-premium animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="font-display text-3xl font-bold text-gradient-gold mb-2">
                  {phase.phase}
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{phase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{phase.description}</p>
              <span className="text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1 rounded-full">
                  {phase.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-Term Vision */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Long-Term Vision</span>
              <span className="h-px w-8 bg-gold" />
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6 text-balance">
              {longTermVision?.title || 'A self-sustaining community for generations'}
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              {longTermVision?.body || `Our long-term vision is to build an organization that outlives its founders — one that
              continues to serve Afghan students in Malaysia for decades to come. A community where
              today's students become tomorrow's alumni, mentors, and leaders, passing the torch to
              the next generation.`}
            </p>
          </div>
        </div>
      </section>

      <CTASection
        pageKey="about"
        title="Be part of the story"
        description="ASAM is being built by students, for students. Join us and help shape the future of the Afghan student community in Malaysia."
      />
    </>
  );
}

import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { PublicEventList } from '@/components/site/public-event-list';

export const metadata = {
  title: 'Culture & Heritage',
  description: 'Celebrating and preserving Afghan culture, language, arts, and heritage within the Malaysian student community.',
};

export default function CulturePage() {
  return (
    <>
      <PageHero
        pageKey="culture"
        eyebrow="Culture & Heritage"
        title="Celebrating Afghan heritage in Malaysia"
        description="Our culture is our identity. ASAM celebrates Afghan heritage — our language, our traditions, our arts, and our stories — while building bridges with Malaysian culture and the broader international community."
      />

      {/* Heritage */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Afghan Heritage</span>
              </div>
              <h2 className="font-display text-2xl lg:text-[1.75rem] font-bold mb-4 text-balance">
                A rich cultural legacy
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-5">
                Afghanistan has a cultural heritage spanning thousands of years — from the ancient
                Silk Road to the poetry of Rumi, from intricate carpet weaving to the soaring arches
                of Blue Mosque. ASAM celebrates this heritage and ensures it remains alive and vibrant
                within our community in Malaysia.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <ManagedPageItemCards pageKey="culture" collectionKey="heritage" fallback={[
                  { title: 'Literature', description: 'Poetry, stories, and literary traditions', icon: 'BookOpen' },
                  { title: 'Arts & Crafts', description: 'Carpets, calligraphy, and visual arts', icon: 'Lightbulb' },
                  { title: 'Music', description: 'Traditional instruments and melodies', icon: 'Music' },
                  { title: 'Traditions', description: 'Festivals, customs, and celebrations', icon: 'Sparkles' },
                ]} cardClassName="p-4 rounded-xl border border-border bg-card shadow-premium" iconClassName="h-6 w-6 text-gold mb-2" />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl gradient-navy p-8 flex items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="relative">
                  <div className="font-display text-3xl lg:text-4xl font-bold text-gradient-gold mb-4">
                    افغانستان
                  </div>
                  <p className="text-white/60 text-sm">Afghanistan — Our heritage, our identity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Language */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="culture"
            eyebrow="Language"
            title="Preserving Dari and Pashto"
            description="Our languages are the heart of our culture. ASAM supports the preservation and celebration of Dari and Pashto within our community."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ManagedPageItemCards pageKey="culture" collectionKey="language" fallback={[
              { title: 'Dari', description: 'The Persian dialect spoken by many Afghans, rich in poetry and literature.', icon: 'Languages' },
              { title: 'Pashto', description: 'The language of the Pashtun people, with a deep oral tradition and poetry.', icon: 'Languages' },
              { title: 'Language Events', description: 'Poetry readings, storytelling, and language-focused community events.', icon: 'Languages' },
              { title: 'Language Support', description: 'Resources for maintaining your language skills while studying abroad.', icon: 'Languages' },
            ]} />
          </div>
        </div>
      </section>

      {/* Afghan-Malaysian Connection */}
      <section className="py-10 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Afghan-Malaysian Connection</span>
            </div>
            <h2 className="font-display text-2xl lg:text-[1.75rem] font-bold text-white mb-4 text-balance">
              Building bridges between cultures
            </h2>
            <p className="text-[0.9375rem] text-white/60 leading-relaxed mb-5">
              Afghanistan and Malaysia share values of hospitality, community, and faith. ASAM builds
              bridges between Afghan and Malaysian culture — creating opportunities for intercultural
              exchange, mutual understanding, and lasting friendships.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <ManagedPageItemCards pageKey="culture" collectionKey="connection" fallback={[
                { title: 'Intercultural Programs', description: 'Events that celebrate both Afghan and Malaysian culture', icon: 'Globe2' },
                { title: 'Community Exchange', description: 'Connecting with Malaysian student communities', icon: 'Users' },
                { title: 'Shared Values', description: 'Celebrating common values and traditions', icon: 'Heart' },
                { title: 'Cultural Showcases', description: 'Sharing Afghan culture with the Malaysian public', icon: 'Sparkles' },
              ]} cardClassName="p-4 rounded-xl border border-white/10 bg-white/5" iconClassName="h-6 w-6 text-gold mb-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Events */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="culture"
            eyebrow="Cultural Events"
            title="Celebrating together"
            description="ASAM cultural events bring the community together to celebrate Afghan heritage."
          />
          <div className="mt-6"><PublicEventList category="Cultural" /></div>
        </div>
      </section>

      {/* Student Stories */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="culture"
            eyebrow="Student Stories"
            title="From Kabul to Kuala Lumpur"
            description="Real stories from Afghan students about their journey, their culture, and their life in Malaysia."
          />
          <div className="mt-6">
            <EmptyState
              title="Stories Coming Soon"
              message="ASAM will feature authentic stories from Afghan students about their experiences, their culture, and their life in Malaysia. If you have a story to share, contact us."
            />
          </div>
        </div>
      </section>

      <CTASection
        pageKey="culture"
        title="Celebrate your heritage"
        description="Join ASAM to connect with a community that celebrates Afghan culture and heritage while building bridges in Malaysia."
        primaryLabel="Join ASAM"
        primaryHref="/membership"
        secondaryLabel="View Events"
        secondaryHref="/events"
      />
    </>
  );
}

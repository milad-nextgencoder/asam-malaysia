import { ManagedPageHero as PageHero, ManagedSectionHeader as SectionHeader, ManagedCTASection as CTASection } from '@/components/site/managed-page-copy';
import { EmptyState } from '@/components/site/empty-state';
import { ManagedPageItemCards } from '@/components/site/managed-page-items';
import { PublicEventList } from '@/components/site/public-event-list';
import { Trophy, Heart } from 'lucide-react';

export const metadata = {
  title: 'Sports & Community',
  description: 'Sports programs, teams, tournaments, recreation, and community activities for Afghan students in Malaysia.',
};

const sports = [
  { name: 'Football', desc: 'Football teams and inter-university tournaments.', icon: Trophy },
  { name: 'Cricket', desc: 'Cricket teams and competitive matches.', icon: Trophy },
  { name: 'Volleyball', desc: 'Volleyball teams and community games.', icon: Trophy },
  { name: 'Badminton', desc: 'Badminton clubs and tournaments.', icon: Trophy },
  { name: 'Basketball', desc: 'Basketball teams and pickup games.', icon: Trophy },
  { name: 'Outdoor Activities', desc: 'Hiking, camping, and outdoor adventures.', icon: Heart },
];

export default function SportsPage() {
  return (
    <>
      <PageHero
        pageKey="sports"
        eyebrow="Sports & Community"
        title="Healthy body, strong community"
        description="ASAM promotes health, teamwork, and community through sports and recreational activities. From football tournaments to hiking trips, there's something for everyone."
      />

      {/* Sports Programs */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="sports"
            eyebrow="Sports Programs"
            title="Find your sport"
            description="ASAM supports a range of sports and recreational activities for all fitness levels."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ManagedPageItemCards pageKey="sports" collectionKey="programs" fallback={sports.map((sport) => ({ title: sport.name, description: sport.desc, icon: sport.name === 'Outdoor Activities' ? 'Heart' : 'Trophy' }))} cardClassName="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300" iconClassName="h-6 w-6 text-navy mb-4" />
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="sports"
            eyebrow="Tournaments"
            title="Upcoming competitions"
            description="Inter-university sports tournaments and recreational competitions."
          />
          <div className="mt-12"><PublicEventList category="Sports" /></div>
        </div>
      </section>

      {/* Community Activities */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="sports"
            eyebrow="Community Activities"
            title="More than just sports"
            description="Recreational activities that bring the community together."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ManagedPageItemCards pageKey="sports" collectionKey="community_activities" fallback={[
              { title: 'Fitness', description: 'Group fitness sessions and challenges', icon: 'Activity' },
              { title: 'Recreation', description: 'Social and recreational activities', icon: 'Heart' },
              { title: 'Team Building', description: 'Activities that build community bonds', icon: 'Users' },
              { title: 'Community Days', description: 'Regular community sports days', icon: 'CalendarDays' },
            ]} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            pageKey="sports"
            eyebrow="Results"
            title="Tournament results"
            description="Results from past ASAM sports tournaments and competitions."
          />
          <div className="mt-12">
            <EmptyState
              title="No Results Yet"
              message="Tournament results will be documented here once competitions are held."
            />
          </div>
        </div>
      </section>

      <CTASection
        pageKey="sports"
        title="Get in the game"
        description="Join ASAM to participate in sports programs, tournaments, and community activities. All fitness levels welcome."
        primaryLabel="Join ASAM"
        primaryHref="/membership"
        secondaryLabel="View Events"
        secondaryHref="/events"
      />
    </>
  );
}

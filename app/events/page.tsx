import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { EventsBrowser } from '@/components/site/events-browser';
import { createPublicClient } from '@/lib/supabase/server';
import { Calendar, MapPin, Users, Clock, Star } from 'lucide-react';

export const metadata = {
  title: 'Events',
  description:
    'Discover upcoming ASAM events, programs, and gatherings across Malaysia — workshops, conferences, cultural celebrations, and networking for Afghan students.',
};

// Events list is cached with 60s ISR; admin content actions also call
// revalidatePath('/events') on every publish/edit, so updates appear promptly.
export const revalidate = 60;

async function getPublishedEvents() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('events')
    .select('id,title,slug,description,date,time,location,category,featured_image_url,registration_url')
    .eq('status', 'published')
    .order('date', { ascending: true, nullsFirst: false });
  return { events: data ?? [], loadFailed: Boolean(error) };
}

export default async function EventsPage() {
  const { events, loadFailed } = await getPublishedEvents();
  const isPlanned = (event: any) => !event.date;
  const isUpcoming = (event: any) => Boolean(event.date && new Date(`${event.date}T${event.time || '23:59'}`) >= new Date());

  const featured = events[0] ?? null;

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="The ASAM events platform"
        description="Discover upcoming events, programs, and gatherings across the ASAM community. From workshops to conferences, there's something for every student."
      />

      {loadFailed && (
        <div className="container mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            ASAM events could not be loaded. Please refresh in a moment.
          </p>
        </div>
      )}
      {/* Featured Event */}
      {featured && (
        <section className="py-10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-premium-lg">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-gold" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Featured ASAM Event</span>
                  </div>
                  <h2 className="font-display text-xl lg:text-2xl font-bold mb-4">{featured.title}</h2>
                  <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-5">{featured.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">
                        {featured.date
                          ? new Date(featured.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'Date to be announced'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">{featured.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">{featured.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">{featured.category || 'ASAM event'}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold-dark text-sm font-semibold">
                    {isUpcoming(featured) ? 'Upcoming Event' : isPlanned(featured) ? 'Date to be announced' : 'Past Event'}
                  </span>
                </div>
                <div className="bg-navy p-6 lg:p-12 flex items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-5" />
                  <div className="relative">
                    <Calendar className="h-16 w-16 text-gold mx-auto mb-4" />
                    <h3 className="font-display text-xl text-white mb-2">Save the Date</h3>
                    <p className="text-white/60 text-sm">Event information from ASAM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events List: interactive search/filter lives in a client component;
          the events themselves arrive as server-fetched props so they are
          part of the SSR HTML. */}
      <EventsBrowser events={events} />

      {/* Past Events */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Past Events"
            title="Events we've held"
            description="A record of past ASAM events will appear here as events are held."
          />
          <div className="mt-6">
            <EmptyState
              title="No Past Events Yet"
              message="ASAM is a new organization. Past events will be documented here as they are held."
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Have an event idea?"
        description="ASAM welcomes event proposals from members. If you have an idea for an event that would benefit the community, share it with us."
        primaryLabel="Propose an Event"
        primaryHref="/contact"
        secondaryLabel="Join ASAM"
        secondaryHref="/membership"
      />
    </>
  );
}

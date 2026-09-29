'use client';

import { useEffect, useState } from 'react';
import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Users, Clock, ArrowRight, Star, Search } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'planned'>('all');
  const [search, setSearch] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => { const supabase = createClient(); supabase.from('events').select('id,title,slug,description,date,time,location,category,featured_image_url,registration_url').eq('status', 'published').order('date', { ascending: true, nullsFirst: false }).then(({ data, error }) => { setEvents(data ?? []); setLoadFailed(Boolean(error)); }); }, []);
  const eventCategories = Array.from(new Set(events.map((event) => event.category).filter(Boolean))) as string[];
  const isPlanned = (event: any) => !event.date;
  const isUpcoming = (event: any) => Boolean(event.date && new Date(`${event.date}T${event.time || '23:59'}`) >= new Date());
  const isPast = (event: any) => Boolean(event.date && !isUpcoming(event));

  const filtered = events.filter((e) => {
    if (filter !== 'all' && e.category !== filter) return false;
    if (search && !`${e.title} ${e.location ?? ''} ${e.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'upcoming' && !isUpcoming(e)) return false;
    if (statusFilter === 'planned' && !isPlanned(e)) return false;
    return true;
  });

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
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-gold" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">Featured ASAM Event</span>
                  </div>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">{featured.title}</h2>
                  <p className="text-base text-muted-foreground leading-relaxed mb-6">{featured.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gold" />
                      <span className="text-muted-foreground">
                        {new Date(featured.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                <div className="bg-navy p-8 lg:p-12 flex items-center justify-center text-center relative overflow-hidden">
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

      {/* Events List */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="All Events"
            title="Browse events"
            description="Filter by category and status to find events that interest you."
          />

          <div className="relative mx-auto mt-7 max-w-lg">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events..." className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/40" />
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                filter === 'all' ? 'gradient-navy text-white shadow-premium' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              All Categories
            </button>
            {eventCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filter === cat ? 'gradient-navy text-white shadow-premium' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'planned', label: 'Planned' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key as typeof statusFilter)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  statusFilter === f.key ? 'bg-gold/10 text-gold-dark border border-gold/30' : 'border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Event Cards */}
          {filtered.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <div
                  key={event.id}
                  className="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {event.featured_image_url && <img src={event.featured_image_url} alt="" className="mb-4 h-40 w-full rounded-xl object-cover"/>}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                    <span className={cn(
                      'text-xs font-semibold px-3 py-1 rounded-full',
                      isUpcoming(event) ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'
                    )}>
                      {isUpcoming(event) ? 'Upcoming' : isPast(event) ? 'Past' : 'Planned'}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gold" />
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date to be announced'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gold" />
                      {event.time || 'Time to be announced'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      {event.location}
                    </div>
                  </div>
                  {event.registration_url && <a href={event.registration_url} target={event.registration_url.startsWith('http') ? '_blank' : undefined} rel={event.registration_url.startsWith('http') ? 'noreferrer' : undefined} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-dark">Register <ArrowRight className="h-4 w-4"/></a>}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12">
              <EmptyState title="No Events Found" message="No events match your current filters. Try adjusting your search criteria." />
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Past Events"
            title="Events we've held"
            description="A record of past ASAM events will appear here as events are held."
          />
          <div className="mt-12">
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

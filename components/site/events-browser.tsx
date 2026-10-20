'use client';

import { useState } from 'react';
import { SectionHeader } from '@/components/site/section-header';
import { EmptyState } from '@/components/site/empty-state';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Clock, ArrowRight, Search } from 'lucide-react';

/**
 * Interactive events list (search + category/status filters + grid).
 *
 * Data is fetched server-side in app/events/page.tsx and passed in as props,
 * so the initial render of this client component is part of the SSR HTML
 * (search engines see the events) while filtering stays instant and local.
 */
export function EventsBrowser({ events }: { events: any[] }) {
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'planned'>('all');
  const [search, setSearch] = useState('');

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

  return (
    <section className="py-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="All Events"
          title="Browse events"
          description="Filter by category and status to find events that interest you."
        />

        <div className="relative mx-auto mt-6 max-w-lg">
          <label htmlFor="event-search" className="sr-only">Search events</label>
          <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input id="event-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events..." className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-base outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/40" />
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            aria-pressed={filter === 'all'}
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
              type="button"
              aria-pressed={filter === cat}
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
              type="button"
              aria-pressed={statusFilter === f.key}
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
        <p role="status" aria-live="polite" className="sr-only">Showing {filtered.length} of {events.length} events</p>
        {filtered.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event, i) => (
              <div
                key={event.id}
                className="group p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {event.featured_image_url && <img src={event.featured_image_url} alt="" className="mb-4 h-32 w-full rounded-xl object-cover"/>}
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
          <div className="mt-6">
            <EmptyState title="No Events Found" message="No events match your current filters. Try adjusting your search criteria." />
          </div>
        )}
      </div>
    </section>
  );
}

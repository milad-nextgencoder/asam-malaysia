'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Search, GraduationCap, MapPin, Users } from 'lucide-react';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => { const supabase = createClient(); supabase.from('universities').select('id,name,state,city,website,description,logo_url,chapter_status,representative').eq('status', 'published').order('name').then(({ data, error }) => { setUniversities(data ?? []); setLoadFailed(Boolean(error)); }); }, []);
  const states = Array.from(new Set(universities.map((university) => university.state).filter(Boolean))) as string[];
  const filteredUniversities = useMemo(() => universities.filter((u) => (stateFilter === 'all' || u.state === stateFilter) && `${u.name} ${u.city ?? ''} ${u.state ?? ''}`.toLowerCase().includes(search.toLowerCase())), [universities, stateFilter, search]);

  return (
    <>
      <PageHero
        eyebrow="University Network"
        title="The ASAM university directory"
        description="A searchable directory of Malaysian universities where Afghan students are studying. Find your university, check chapter status, and connect with your university representative."
      />

      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loadFailed && <p role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The university directory could not be loaded. Please refresh in a moment.</p>}
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search universities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
              />
            </div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            >
              <option value="all">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* University Directory */}
          {filteredUniversities.length ? <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredUniversities.map((university) => <article key={university.id} className="rounded-xl border border-border bg-card p-5 shadow-premium"><div className="flex items-start gap-4">{university.logo_url ? <img src={university.logo_url} alt="" className="h-14 w-14 rounded-xl object-contain"/> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy/5"><GraduationCap className="h-7 w-7 text-navy"/></div>}<div className="min-w-0"><h2 className="font-display text-lg font-bold">{university.name}</h2><p className="mt-1 text-xs text-muted-foreground">{[university.city, university.state].filter(Boolean).join(', ')}</p></div></div>{university.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{university.description}</p>}<div className="mt-4 flex flex-wrap gap-2">{university.chapter_status && <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-dark">Chapter {university.chapter_status.replace('_',' ')}</span>}{university.representative && <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">Representative: {university.representative}</span>}</div>{university.website && <a className="mt-4 inline-flex text-sm font-semibold text-gold-dark hover:underline" href={university.website} target="_blank" rel="noreferrer">University website</a>}</article>)}</div> : <div className="mt-7">
            <EmptyState
              title={search || stateFilter !== 'all' ? 'No Universities Found' : 'University Directory Coming Soon'}
              message={search || stateFilter !== 'all' ? 'No published university records match these filters.' : 'ASAM is building a comprehensive directory of Malaysian universities with Afghan student enrollment. University profiles, chapter status, and representative information will appear here as the network is established. If you would like to represent ASAM at your university, visit the Join / Volunteer page.'}
            />
          </div>}

          {/* State Quick Links */}
          <div className="mt-7">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Browse by State
            </h3>
            <div className="flex flex-wrap gap-2">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => setStateFilter(state)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    stateFilter === state
                      ? 'gradient-navy text-white'
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MapPin className="h-3 w-3" />
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* University Profile Template */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="University Profile"
            title="What a university profile includes"
            description="When university profiles are published, each one will contain the following information."
          />
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: 'University Information', desc: 'Name, location, programs, and overview' },
              { icon: MapPin, title: 'Location', desc: 'State, city, and campus address' },
              { icon: Users, title: 'ASAM Chapter', desc: 'Chapter status and member count' },
              { icon: Users, title: 'Student Representative', desc: 'Contact person for ASAM at the university' },
              { icon: GraduationCap, title: 'Programs', desc: 'Academic programs and fields of study' },
              { icon: Users, title: 'Events', desc: 'Upcoming and past ASAM events at the university' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="p-5 rounded-xl border border-border bg-card shadow-premium animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 mb-4">
                  <item.icon className="h-6 w-6 text-navy" />
                </div>
                <h3 className="font-display text-base font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Represent ASAM at your university"
        description="If your university does not yet have an ASAM representative, you can apply to become one. Help build the ASAM network at your campus."
        primaryLabel="Become a Representative"
        primaryHref="/join"
        secondaryLabel="View Chapters"
        secondaryHref="/chapters"
      />
    </>
  );
}

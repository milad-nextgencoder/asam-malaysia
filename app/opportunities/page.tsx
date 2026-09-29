'use client';

import { useEffect, useState } from 'react';
import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Search, Calendar, MapPin, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => { const supabase = createClient(); supabase.from('opportunities').select('id,title,organization,category,description,eligibility,location,deadline,application_url,image_url').eq('status', 'published').order('deadline', { ascending: true, nullsFirst: false }).then(({ data, error }) => { setOpportunities(data ?? []); setLoadFailed(Boolean(error)); }); }, []);
  const opportunityCategories = Array.from(new Set(opportunities.map((item) => item.category).filter(Boolean))) as string[];
  const isOpen = (item: any) => !item.deadline || new Date(`${item.deadline}T23:59:59`) >= new Date();

  const filtered = opportunities.filter((o) => {
    if (filter !== 'All' && o.category !== filter) return false;
    if (search && !`${o.title} ${o.organization ?? ''} ${o.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHero
        eyebrow="Opportunities"
        title="The ASAM opportunity board"
        description="A central hub for scholarships, internships, jobs, competitions, conferences, fellowships, training, and volunteering opportunities."
      />

      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {['All', ...opportunityCategories].map((cat) => (
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

          {/* Opportunity Cards */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((opp, i) => (
                <div
                  key={opp.id}
                  className="group p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {opp.image_url && <img src={opp.image_url} alt="" className="mb-4 h-32 w-full rounded-xl object-cover"/>}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1 rounded-full">
                      {opp.category}
                    </span>
                    <span className={cn(
                      'text-xs font-semibold px-3 py-1 rounded-full',
                      isOpen(opp) ? 'bg-green-100 text-green-700'
                        : 'bg-secondary text-muted-foreground'
                    )}>
                      {isOpen(opp) ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{opp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{opp.description}</p>
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gold" />
                      {opp.organization ? `Organization: ${opp.organization}` : `Category: ${opp.category || 'Opportunity'}`}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gold" />
                      Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not specified'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      {opp.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-gold" />
                      {opp.eligibility}
                    </div>
                  </div>
                  {isOpen(opp) && (
                    <a
                      href={opp.application_url || '/contact'}
                      target={opp.application_url?.startsWith('http') ? '_blank' : undefined}
                      rel={opp.application_url?.startsWith('http') ? 'noreferrer' : undefined}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:gap-2 transition-all"
                    >
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Opportunities Found"
              message="No opportunities match your current filters. Try adjusting your search criteria, or check back later as new opportunities are posted."
            />
          )}
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Categories"
            title="Types of opportunities"
            description="ASAM curates opportunities across multiple categories."
          />
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {opportunityCategories.map((cat, i) => (
              <div
                key={cat}
                className="p-4 rounded-xl border border-border bg-card shadow-premium text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <h3 className="font-display text-sm font-bold">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Have an opportunity to share?"
        description="If you have a scholarship, internship, job, or other opportunity for the ASAM community, share it with us and we'll feature it on our opportunity board."
        primaryLabel="Submit Opportunity"
        primaryHref="/contact"
        secondaryLabel="Join ASAM"
        secondaryHref="/membership"
      />
    </>
  );
}

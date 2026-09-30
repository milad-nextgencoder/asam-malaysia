import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { leadership, orgHierarchy } from '@/lib/data/leadership';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { Quote, ArrowRight, ChevronDown } from 'lucide-react';

export const metadata = {
  title: 'Leadership',
  description: 'Meet the founding leadership team of the Afghan Students Association of Malaysia.',
};

export default async function LeadershipPage() {
  const supabase = createClient();
  const { data, error } = await supabase.from('leadership').select('id,name,position,bio,photo_url,department_id,social_links,display_order').eq('status', 'published').order('display_order', { ascending: true });
  const filled: any[] = error ? leadership.filter((member) => member.filled).map((member) => ({ ...member, position: member.title, photo_url: null as string | null })) : (data ?? []).map((row) => {
    const existing = leadership.find((member) => member.filled && member.name === row.name);
    return { ...existing, ...row, title: row.position, bio: row.bio || existing?.bio || '', responsibilities: existing?.responsibilities ?? [], message: existing?.message ?? '', filled: true };
  });
  const vacant: typeof leadership = [];

  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="The team building ASAM"
        description="Meet the founding leadership team responsible for establishing and guiding the Afghan Students Association of Malaysia."
      />

      {/* President & Deputy President Spotlights */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filled.map((member, i) => (
              <div
                key={member.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 gradient-gold opacity-80" />
                <div className="p-6 lg:p-10">
                  <div className="flex items-start gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl gradient-navy flex items-center justify-center shadow-premium">
                        {member.photo_url ? <img src={member.photo_url} alt={member.name} className="absolute inset-0 h-full w-full object-cover" /> : <span className="font-display text-2xl font-bold text-gold">{member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</span>}
                      </div>
                      <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gold text-navy text-xs font-bold shadow-premium">
                        {member.title}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-2xl font-bold">{member.name}</h3>
                      <p className="text-sm text-gold-dark font-semibold mt-1">{member.title}</p>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-4">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                  {member.social_links && <div className="mt-4 flex flex-wrap gap-3">{Object.entries(member.social_links as Record<string, string>).filter(([, url]) => url && (url.startsWith('/') || /^https:\/\//i.test(url))).map(([network, url]) => <a key={network} href={url} target={url.startsWith('http') ? '_blank' : undefined} rel={url.startsWith('http') ? 'noreferrer' : undefined} className="text-xs font-semibold capitalize text-gold-dark hover:underline">{network}</a>)}</div>}

                  {/* Message */}
                  {member.message && <div className="mt-6 p-4 rounded-xl bg-secondary/50 border-l-2 border-gold">
                    <Quote className="h-5 w-5 text-gold/40 mb-2" />
                    <p className="text-sm italic text-muted-foreground leading-relaxed">
                      {member.message}
                    </p>
                  </div>}

                  {/* Responsibilities */}
                  {member.responsibilities.length > 0 && <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {member.responsibilities.map((r: string) => (
                        <li key={r} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vacant Positions */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Open Positions"
            title="Leadership roles to be filled"
            description="These positions are currently vacant. Recruitment will open as ASAM grows and establishes its full leadership team."
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vacant.map((member, i) => (
              <div
                key={member.id}
                className="p-5 rounded-xl border border-dashed border-border bg-card hover:border-gold/30 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/60 mb-4">
                  <span className="font-display text-xl font-bold text-muted-foreground/40">
                    ?
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mb-1">{member.title}</h3>
                <p className="text-xs font-semibold text-gold-dark mb-3">Vacant — Recruitment opening soon</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Organizational Structure"
            title="The ASAM leadership hierarchy"
            description="From the President to volunteers, every role in ASAM has a clear place and purpose in the organizational structure."
          />
          <div className="mt-6 max-w-3xl mx-auto">
            <div className="space-y-2">
              {orgHierarchy.map((item, i) => (
                <div
                  key={item.level}
                  className="flex items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 flex-1 p-4 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-navy text-gold font-display text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.level}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {i < orgHierarchy.length - 1 && (
                    <ChevronDown className="h-5 w-5 text-gold flex-shrink-0 -rotate-90" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Executive Directors & Department Leadership */}
      <section className="py-10 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Department Leadership"
            title="Executive directors & department heads"
            description="Each of ASAM's twelve departments will be led by an executive director. Department leadership will be announced as positions are filled."
          />
          <div className="mt-6">
            <EmptyState
              title="Department Leadership To Be Announced"
              message="ASAM is currently building its department leadership team. Department directors and heads will be announced as they are appointed. If you are interested in a leadership role, visit the Join / Volunteer page."
            />
          </div>
        </div>
      </section>

      {/* University Representatives */}
      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="University Representatives"
            title="Representatives across Malaysia"
            description="University representatives serve as the primary point of contact for ASAM at each university. Representatives will be listed here as they are appointed."
          />
          <div className="mt-6">
            <EmptyState
              title="No Representatives Yet"
              message="ASAM is building its network of university representatives. If you would like to represent ASAM at your university, visit the Join / Volunteer page to apply."
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Join the leadership team"
        description="ASAM is building its leadership team. If you are passionate about serving the Afghan student community, explore available roles and apply."
        primaryLabel="View Open Roles"
        primaryHref="/join"
        secondaryLabel="Learn About Governance"
        secondaryHref="/governance"
      />
    </>
  );
}

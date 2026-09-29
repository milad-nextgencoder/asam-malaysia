import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { Building2, Handshake, ArrowRight, Users, Globe2, Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PartnerDirectory } from '@/components/site/partner-directory';

export const metadata = {
  title: 'Partners',
  description: 'Institutional partnerships with universities, organizations, NGOs, and companies.',
};

export default async function PartnersPage() {
  const { data: partners, error } = await createClient().from('partners').select('id,organization,description,website,logo_url,partner_type').eq('status','published').order('display_order').range(0,99);
  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="Building institutional partnerships"
        description="ASAM is building relationships with universities, organizations, NGOs, and companies. Partner information will appear here as partnerships are established."
      />

      {/* Partner Categories */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Partner Types"
            title="Who we partner with"
            description="ASAM welcomes partnerships across multiple sectors."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Universities', desc: 'Malaysian and international universities hosting Afghan students.' },
              { icon: Users, title: 'Organizations', desc: 'Student organizations and community groups.' },
              { icon: Heart, title: 'NGOs', desc: 'Non-governmental organizations supporting students and communities.' },
              { icon: Building2, title: 'Companies', desc: 'Corporations offering internships, jobs, and sponsorship.' },
              { icon: Users, title: 'Community Organizations', desc: 'Afghan and Malaysian community organizations.' },
              { icon: Globe2, title: 'Professional Partners', desc: 'Professional bodies and industry associations.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:gradient-navy transition-all duration-300 mb-4">
                  <item.icon className="h-6 w-6 text-navy group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our Partners"
            title="Partner directory"
            description="Organizations that have formally partnered with ASAM will be listed here."
          />
          {error ? <p role="status" className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">The partner directory is temporarily unavailable.</p> : partners?.length ? <PartnerDirectory partners={partners} /> : <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center"><Building2 className="mx-auto h-8 w-8 text-muted-foreground/40"/><h3 className="mt-3 font-display text-lg font-semibold">No partners published yet</h3><p className="mt-2 text-sm text-muted-foreground">The directory will list confirmed ASAM partners.</p></div>}
        </div>
      </section>

      {/* Become a Partner */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Become a Partner</span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6 text-balance">
                Partner with ASAM
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                ASAM welcomes partnerships with universities, organizations, NGOs, and companies that
                share our commitment to supporting Afghan students in Malaysia. Partnership
                opportunities include event collaboration, scholarship programs, internship
                pipelines, community initiatives, and more.
              </p>
              <div className="space-y-3">
                {[
                  'Event collaboration and sponsorship',
                  'Scholarship and internship programs',
                  'Community initiatives and outreach',
                  'Research and data partnerships',
                  'Cultural and sports event support',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 rounded-3xl border border-border bg-card shadow-premium">
              <Handshake className="h-12 w-12 text-gold mb-6" />
              <h3 className="font-display text-xl font-bold mb-3">Partnership Inquiry</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Interested in partnering with ASAM? Contact us to discuss how we can work together to
                support the Afghan student community in Malaysia.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-navy text-white font-semibold text-sm shadow-premium hover:shadow-premium-lg transition-all"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Become a Partner"
        description="Join ASAM in building a stronger future for Afghan students in Malaysia. Together, we can create lasting impact."
        primaryLabel="Contact Us"
        primaryHref="/contact"
      />
    </>
  );
}

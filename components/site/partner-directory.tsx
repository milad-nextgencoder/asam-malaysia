'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Building2, X } from 'lucide-react';

type Partner = {
  id: string;
  organization: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  partner_type: string | null;
};

export function PartnerDirectory({ partners }: { partners: Partner[] }) {
  const [selected, setSelected] = useState<Partner | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selected]);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {partners.map((partner, index) => (
          <button
            key={partner.id}
            type="button"
            onClick={() => setSelected(partner)}
            aria-label={`View details for ${partner.organization}`}
            className="group animate-fade-up rounded-xl border border-border bg-card p-4 text-center shadow-premium transition hover:-translate-y-1 hover:shadow-premium-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {partner.logo_url ? (
              <img loading="lazy" src={partner.logo_url} alt={`${partner.organization} logo`} className="mx-auto mb-4 h-20 w-full object-contain" />
            ) : (
              <span className="mb-4 flex h-20 items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground/30" />
              </span>
            )}
            <span className="block break-words font-semibold text-foreground">{partner.organization}</span>
            {partner.partner_type && <span className="mt-1 block break-words text-xs text-gold-dark">{partner.partner_type}</span>}
            <span className="mt-3 block text-xs font-semibold text-muted-foreground group-hover:text-gold-dark">Click to view details</span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0b1728]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-dialog-title"
            className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-[#fffefa] shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
          >
            <header className="flex shrink-0 items-start gap-4 border-b border-border px-5 py-5 sm:px-7">
              {selected.logo_url ? (
                <img src={selected.logo_url} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-border bg-white object-contain p-2" />
              ) : (
                <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-white">
                  <Building2 className="h-7 w-7 text-gold-dark" />
                </span>
              )}
              <div className="min-w-0 flex-1 pt-1">
                {selected.partner_type && <p className="text-[10px] font-bold uppercase tracking-[.16em] text-gold-dark">{selected.partner_type}</p>}
                <h2 id="partner-dialog-title" className="mt-1 break-words font-display text-xl font-semibold leading-snug text-[#172436] sm:text-2xl">{selected.organization}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close partner details" className="rounded-lg p-2 text-[#596273] hover:bg-[#f1efe9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
              <h3 className="text-xs font-bold uppercase tracking-[.14em] text-[#8a6d32]">About this partner</h3>
              {selected.description?.trim() ? (
                <div className="mt-4 space-y-4 text-sm leading-7 text-[#465163] sm:text-base">
                  {selected.description.trim().split(/\n\s*\n/).map((paragraph, index) => (
                    <p key={index} className="break-words [overflow-wrap:anywhere]">{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[#687384]">No description has been added for this partner yet.</p>
              )}
              {selected.website && /^(https?:\/\/|\/(?!\/))/i.test(selected.website) && (
                <a
                  href={selected.website}
                  target={/^https?:\/\//i.test(selected.website) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(selected.website) ? 'noreferrer' : undefined}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#142238] px-4 py-3 text-sm font-semibold text-white hover:bg-[#243750]"
                >
                  Visit website <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <footer className="shrink-0 border-t border-border bg-white/80 px-5 py-3 text-right sm:px-7">
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-[#455064] hover:bg-gray-50">Close</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

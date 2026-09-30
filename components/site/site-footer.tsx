import Link from 'next/link';
import { Mail, MapPin, ArrowRight, Phone } from 'lucide-react';
import { footerNav } from '@/lib/data/navigation';
import { createClient } from '@/lib/supabase/server';

const FOOTER_SETTINGS_TIMEOUT_MS = 10_000;

export async function SiteFooter() {
  let settings = null;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const settingsQuery = createClient()
      .from('site_settings')
      .select('organization_name,tagline,contact_email,phone,social_links,logo_url,footer_text')
      .eq('singleton', true)
      .maybeSingle();

    const result = await Promise.race([
      settingsQuery,
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), FOOTER_SETTINGS_TIMEOUT_MS);
      }),
    ]);

    settings = result?.data ?? null;
  } catch {
    // Keep the static footer available when the CMS query fails.
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const socials = settings?.social_links && typeof settings.social_links === 'object' ? Object.entries(settings.social_links as Record<string,string>).filter(([,url])=>typeof url==='string'&&/^https:\/\//i.test(url)) : [];
  return (
    <footer className="relative mt-16 border-t border-border bg-card">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center">
              <span className="relative block h-16 w-16 overflow-hidden rounded-full">
                <img src={settings?.logo_url || '/logo.png'} alt="ASAM logo" className="absolute inset-0 h-full w-full object-cover" />
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {settings?.tagline || 'Building a national platform to connect, support, empower, and develop Afghan students and alumni in Malaysia through education, leadership, opportunity, culture, and community.'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Malaysia</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-gold" />
                <a href={`mailto:${settings?.contact_email || 'info@asam.org.my'}`}>{settings?.contact_email || 'info@asam.org.my'}</a>
              </div>
              {settings?.phone&&<div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4 text-gold"/><a href={`tel:${settings.phone}`}>{settings.phone}</a></div>}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {Object.entries(footerNav).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                  {category}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      {link.highlight ? (
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-sm font-semibold text-gold-dark transition-colors hover:border-gold/50 hover:bg-gold/20"
                        >
                          {link.label}
                          <span
                            className="text-xs text-gold-dark/70 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          >
                            &rsaquo;
                          </span>
                        </Link>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-gold-dark transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-10 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-xl font-bold mb-2">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe to receive ASAM updates, event announcements, and opportunities.
              </p>
            </div>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-navy text-white text-sm font-semibold shadow-premium hover:shadow-premium-lg hover:scale-[1.02] transition-all"
              >
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {settings?.organization_name || 'Afghan Students Association of Malaysia'} (ASAM). All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socials.map(([social, url]) => (
                <a
                  key={social}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs capitalize text-muted-foreground hover:text-gold-dark transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="font-display text-sm lg:text-base text-muted-foreground italic">
              {settings?.footer_text || 'Built for students. Designed for community. Created for the future.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

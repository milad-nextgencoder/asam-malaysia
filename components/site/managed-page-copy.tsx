import { getPublishedPageSection } from '@/lib/page-sections';
import Link from 'next/link';
import { PageHero, type PageHeroProps } from './page-hero';
import { SectionHeader, type SectionHeaderProps } from './section-header';
import { CTASection, type CTASectionProps } from './cta-section';

type PageSectionProps = { pageKey: string; sectionKey?: string };

function keyFromTitle(title: string) {
  return title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export async function ManagedPageHero({ pageKey, sectionKey = 'hero', ...props }: PageHeroProps & PageSectionProps) {
  const managed = await getPublishedPageSection(pageKey, sectionKey, props.title);
  const primaryUrl = safePageUrl(managed?.button_url);
  const secondaryUrl = safePageUrl(managed?.secondary_button_url);
  const managedButtons = Boolean(managed?.button_text && primaryUrl);
  return <PageHero {...props} eyebrow={managed?.eyebrow || props.eyebrow} title={managed?.title || props.title} description={managed?.description || managed?.subtitle || props.description}>
    {managedButtons ? <div className="flex flex-col gap-4 sm:flex-row">
      <Link href={primaryUrl!} className="inline-flex items-center justify-center rounded-xl gradient-navy px-8 py-4 text-base font-bold text-white shadow-premium transition-all hover:shadow-premium-lg">{managed?.button_text}</Link>
      {managed?.secondary_button_text && secondaryUrl && <Link href={secondaryUrl} className="inline-flex items-center justify-center rounded-xl border border-border px-8 py-4 text-base font-semibold transition-all hover:bg-secondary/60">{managed.secondary_button_text}</Link>}
    </div> : props.children}
    {managed?.image_url && <img src={managed.image_url} alt="" className="mt-8 max-h-80 w-full rounded-2xl object-cover" loading="lazy" />}
  </PageHero>;
}

export async function ManagedSectionHeader({ pageKey, sectionKey, ...props }: SectionHeaderProps & Partial<PageSectionProps> & { pageKey: string }) {
  sectionKey = sectionKey || keyFromTitle(props.title);
  const managed = await getPublishedPageSection(pageKey, sectionKey, props.title);
  return <>
    <SectionHeader {...props} eyebrow={managed?.eyebrow || props.eyebrow} title={managed?.title || props.title} description={managed?.description || managed?.subtitle || props.description} />
    {managed?.body && <div className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground">{managed.body}</div>}
    {managed?.image_url && <img src={managed.image_url} alt="" loading="lazy" className="mx-auto mt-8 max-h-96 w-full max-w-4xl rounded-2xl object-cover" />}
    {managed?.secondary_image_url && <img src={managed.secondary_image_url} alt="" loading="lazy" className="mx-auto mt-5 max-h-96 w-full max-w-4xl rounded-2xl object-cover" />}
  </>;
}

export async function ManagedCTASection({ pageKey, sectionKey = 'cta', ...props }: CTASectionProps & PageSectionProps) {
  const managed = await getPublishedPageSection(pageKey, sectionKey, props.title);
  return <CTASection
    {...props}
    title={managed?.title || props.title}
    description={managed?.description || props.description}
    primaryLabel={managed?.button_text || props.primaryLabel}
    primaryHref={managed?.button_url || props.primaryHref}
    secondaryLabel={managed?.secondary_button_text || props.secondaryLabel}
    secondaryHref={managed?.secondary_button_url || props.secondaryHref}
  />;
}

function safePageUrl(value?: string | null) {
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : null;
  } catch { return null; }
}

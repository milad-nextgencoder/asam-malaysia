import Link from 'next/link';
import {
  ArrowRight, Award, BarChart3, BookOpen, Briefcase, CalendarDays, Check, Compass, Database, FileText, FlaskConical,
  GraduationCap, Handshake, Heart, HeartHandshake, Home, Info, Languages, Lightbulb,
  MapPin, MessageSquare, Music, Network, Phone, RefreshCw, Rocket, Scale, ScrollText, Shield, Sparkles, TrendingUp, Trophy, Users, Globe2, Lock, Eye, Activity,
  type LucideIcon,
} from 'lucide-react';
import { getPublishedPageItems, type ManagedPageItem } from '@/lib/page-sections';

const iconMap: Record<string, LucideIcon> = {
  Award, BarChart3, BookOpen, Briefcase, CalendarDays, Check, Compass, Database, FileText, FlaskConical,
  GraduationCap, Handshake, Heart, HeartHandshake, Home, Info, Languages, Lightbulb,
  MapPin, MessageSquare, Music, Network, Phone, RefreshCw, Rocket, Scale, ScrollText, Shield, Sparkles, TrendingUp, Trophy, Users, Globe2, Lock, Eye, Activity,
};

export type PageItemFallback = Pick<ManagedPageItem, 'title'> & Partial<Pick<ManagedPageItem, 'description' | 'body' | 'phase' | 'metric' | 'icon' | 'image_url' | 'link_text' | 'link_url' | 'button_text' | 'button_url'>>;

export async function ManagedPageItemCards({
  pageKey,
  collectionKey,
  fallback,
  cardClassName = 'p-6 rounded-2xl border border-border bg-card shadow-premium',
  iconClassName = 'h-8 w-8 text-gold mb-4',
  variant = 'cards',
}: {
  pageKey: string;
  collectionKey: string;
  fallback: PageItemFallback[];
  cardClassName?: string;
  iconClassName?: string;
  variant?: 'cards' | 'steps' | 'lifecycle' | 'sections' | 'list' | 'membership';
}) {
  const stored = await getPublishedPageItems(pageKey, collectionKey);
  const items: PageItemFallback[] = stored === null ? fallback : stored;
  if (variant === 'sections') return <>{items.map((item, index) => <div key={`${collectionKey}-${item.title}-${index}`}><h3 className="mb-2 font-display text-base font-bold">{item.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{item.body || item.description}</p></div>)}</>;
  if (variant === 'list') return <>{items.map((item, index) => <div key={`${collectionKey}-${item.title}-${index}`} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold"/><span className="text-muted-foreground">{item.description || item.title}</span></div>)}</>;
  if (variant === 'membership') return <>{items.map((item, index) => {
    const Icon = item.icon ? iconMap[item.icon] || Users : Users;
    return <article key={`${collectionKey}-${item.title}-${index}`} className={`${cardClassName} animate-fade-up`} style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl gradient-navy"><Icon className="h-7 w-7 text-gold" /></div>
      <h3 className="mb-2 font-display text-xl font-bold">{item.title}</h3>
      {item.description && <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
      {item.body && <div className="mb-4 space-y-2"><h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Benefits</h4>{item.body.split(/\r?\n|;\s*/).filter(Boolean).map((benefit) => <div key={benefit} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold"/><span className="text-muted-foreground">{benefit}</span></div>)}</div>}
      {item.phase && <div className="border-t border-border pt-4"><h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Requirements</h4><p className="text-xs text-muted-foreground">{item.phase}</p></div>}
    </article>;
  })}</>;
  if (variant === 'lifecycle') return <>{items.map((item, index) => <div key={`${collectionKey}-${item.title}-${index}`} className="flex items-center gap-4 lg:gap-6">
    <div className="animate-fade-up rounded-2xl border border-border bg-card px-6 py-4 text-center shadow-premium" style={{ animationDelay: `${index * 0.1}s` }}><div className="font-display text-lg font-bold">{item.title}</div></div>
    {index < items.length - 1 && <ArrowRight className="hidden h-5 w-5 text-gold sm:block" />}
  </div>)}</>;
  return <>
    {items.map((item, index) => {
      const Icon = item.icon ? iconMap[item.icon] || Check : null;
      const href = item.button_url || item.link_url;
      const label = item.button_text || item.link_text;
      const safeHref = href && ((href.startsWith('/') && !href.startsWith('//')) || /^https:\/\//i.test(href));
      if (variant === 'steps') return <article key={`${collectionKey}-${item.title}-${index}`} className={`${cardClassName} flex items-start gap-4 animate-fade-up`} style={{ animationDelay: `${index * 0.07}s` }}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-navy font-display text-sm font-bold text-gold">{item.phase || String(index + 1).padStart(2, '0')}</div>
        <div><h3 className="mb-1 font-semibold text-base">{item.title}</h3>{item.description && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.description}</p>}</div>
      </article>;
      return <article key={`${collectionKey}-${item.title}-${index}`} className={`${cardClassName} animate-fade-up`} style={{ animationDelay: `${index * 0.07}s` }}>
        {item.image_url && <img src={item.image_url} alt="" loading="lazy" className="mb-4 max-h-48 w-full rounded-xl object-cover" />}
        {Icon && <Icon className={iconClassName} aria-hidden="true" />}
        {item.phase && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-dark">{item.phase}</p>}
        {item.metric && <p className="mb-2 text-2xl font-bold text-gold-dark">{item.metric}</p>}
        <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
        {item.description && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.description}</p>}
        {item.body && <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.body}</p>}
        {safeHref && label && <Link href={href!} target={/^https:\/\//i.test(href!) ? '_blank' : undefined} rel={/^https:\/\//i.test(href!) ? 'noreferrer' : undefined} className="mt-4 inline-flex text-sm font-semibold text-gold-dark underline">{label}</Link>}
      </article>;
    })}
  </>;
}

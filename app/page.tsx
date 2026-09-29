'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, Briefcase, GraduationCap, Users, Globe2, Sparkles, TrendingUp, BookOpen, Heart, Trophy, Building2 } from 'lucide-react';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { EmptyState } from '@/components/site/empty-state';
import { cn } from '@/lib/utils';
import { departments, departmentIconByName } from '@/lib/data/departments';
import { leadership } from '@/lib/data/leadership';
import { events } from '@/lib/data/events';
import { flagshipInitiatives } from '@/lib/data/content';
import { createClient } from '@/lib/supabase/client';
import type { HomepageSection } from '@/lib/homepage/types';
import { homepageLegacyOrder, homepageSectionGroups } from '@/lib/homepage/types';

const heroPhotos = [
  '/gallery/events/photo%201.jpg',
  '/gallery/events/photo%202.jpg',
  '/gallery/events/photo%203.jpg',
  '/gallery/events/photo%204.jpg',
  '/gallery/events/photo%205.jpg',
  '/gallery/events/photo%206.jpg',
];

export default function Home() {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [primaryHeroImageFailed, setPrimaryHeroImageFailed] = useState(false);
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);
  const [homepageLoaded, setHomepageLoaded] = useState(false);
  const [publicDepartments, setPublicDepartments] = useState<any[]>(departments);
  const [publicLeadership, setPublicLeadership] = useState<any[]>(leadership.filter((item) => item.filled));
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [publicChapters, setPublicChapters] = useState<any[]>([]);
  const [publicNews, setPublicNews] = useState<any[]>([]);
  const [publicPartners, setPublicPartners] = useState<any[]>([]);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const supabase = createClient();
        const [{ data, error }, departmentResult, leadershipResult, eventResult, chapterResult, newsResult, partnerResult] = await Promise.all([
          supabase
          .from('homepage_sections')
          .select('id, section_key, title, subtitle, description, image_url, button_text, button_url, secondary_button_text, secondary_button_url, display_order, visible, status, created_at, updated_at')
          .eq('visible', true)
          .eq('status', 'published')
          .order('display_order', { ascending: true }),
          supabase.from('departments').select('id,name,number,description,mission,icon,display_order').eq('status', 'published').order('display_order', { ascending: true }),
          supabase.from('leadership').select('id,name,position,bio,photo_url,display_order').eq('status', 'published').order('display_order', { ascending: true }),
          supabase.from('events').select('id,title,description,date,time,location,category,featured_image_url').eq('status', 'published').order('date', { ascending: true, nullsFirst: false }).limit(3),
          supabase.from('chapters').select('id,name,state,city,university,status').in('status', ['active','coming_soon']).order('display_order', { ascending: true }).limit(9),
          supabase.from('news').select('id,title,slug,excerpt,featured_image_url,author,publication_date').eq('status', 'published').order('publication_date', { ascending: false, nullsFirst: false }).limit(3),
          supabase.from('partners').select('id,organization,logo_url,partner_type,website').eq('status','published').order('display_order').limit(8),
        ]);
        if (!active) return;
        if (!error && data) setHomepageSections(data as HomepageSection[]);
        if (!departmentResult.error && departmentResult.data) setPublicDepartments(departmentResult.data.map((row) => {
          const existing = departments.find((item) => item.number === row.number);
          const dbIcon = row.icon && row.icon in departmentIconByName ? departmentIconByName[row.icon as keyof typeof departmentIconByName] : null;
          return { ...existing, ...row, id: existing?.id ?? `department-${row.number}`, mission: row.mission || row.description || existing?.mission || '', icon: dbIcon ?? existing?.icon ?? departments[0].icon };
        }));
        if (!leadershipResult.error && leadershipResult.data) setPublicLeadership(leadershipResult.data.map((row) => ({ ...leadership.find((item) => item.filled && item.name === row.name), ...row, title: row.position, bio: row.bio || leadership.find((item) => item.filled && item.name === row.name)?.bio || '' })));
        if (!eventResult.error && eventResult.data) setPublicEvents(eventResult.data.filter((event) => !event.date || new Date(`${event.date}T${event.time || '23:59'}`) >= new Date()));
        if (!chapterResult.error && chapterResult.data) setPublicChapters(chapterResult.data);
        if (!newsResult.error && newsResult.data) setPublicNews(newsResult.data);
        if (!partnerResult.error && partnerResult.data) setPublicPartners(partnerResult.data);
        setHomepageLoaded(!error);
      } catch {
        if (active) setHomepageLoaded(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const sectionRecord = (key: string) => homepageSections.find((section) => section.section_key === key);
  const sectionValue = (key: string, field: keyof HomepageSection, fallback: string) => {
    if (!homepageSections.length) return fallback;
    const value = sectionRecord(key)?.[field];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };
  const sectionHref = (key: string, field: 'button_url' | 'secondary_button_url', fallback: string) => {
    const value = sectionValue(key, field, fallback);
    return (value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//i.test(value) ? value : fallback;
  };
  const sectionDisplayOrder = (key: string) => {
    const group = homepageSectionGroups.find((item) => item.key === key);
    const orders = (group?.keys ?? [key]).map((member) => sectionRecord(member)?.display_order).filter((order): order is number => typeof order === 'number');
    return orders.length ? Math.min(...orders) : homepageLegacyOrder[key] ?? 999;
  };
  const sectionStyle = (key: string) => {
    const group = homepageSectionGroups.find((item) => item.key === key);
    const keys = group?.keys ?? [key];
    const visibleKeys = keys.filter((member) => Boolean(sectionRecord(member)));
    const databaseHasContent = homepageSections.length > 0;
    const missingManagedSection = homepageLoaded && databaseHasContent && visibleKeys.length !== keys.length;
    return { order: sectionDisplayOrder(key), display: missingManagedSection ? 'none' : undefined } as const;
  };

  const heroImage = sectionValue('hero', 'image_url', '');
  useEffect(() => setPrimaryHeroImageFailed(false), [heroImage]);
  const activeHeroPhotos = useMemo(() => heroImage && !primaryHeroImageFailed
    ? [heroImage, ...heroPhotos.filter((photo) => photo !== heroImage)]
    : heroPhotos, [heroImage, primaryHeroImageFailed]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      setActivePhotoIndex((index) => (index + 1) % activeHeroPhotos.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [activeHeroPhotos.length]);

  return (
    <main className="flex flex-col">
      {/* HERO */}
      <section style={sectionStyle('hero')} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-ivory to-secondary/70 pt-20">
        {activeHeroPhotos.map((photo, index) => (
          <Image
            key={photo}
            src={photo}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            onError={() => { if (photo === heroImage) setPrimaryHeroImageFailed(true); }}
            className={cn(
              'object-cover transition-opacity duration-1000',
              activePhotoIndex % activeHeroPhotos.length === index ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/20 to-background/5" />

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-8 animate-fade-down">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-gold-dark uppercase tracking-wider">
                {sectionValue('hero', 'subtitle', 'Afghan Students Association of Malaysia')}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.125rem] font-bold text-foreground leading-tight tracking-tight animate-fade-up">
              {sectionValue('hero', 'title', 'ONE COMMUNITY. MANY UNIVERSITIES. ONE FUTURE.').split(/\n|(?<=\.)\s+/).filter(Boolean).map((line, index) => <span key={`${line}-${index}`} className={cn('block', index === 1 && 'text-gold-dark')}>{line}</span>)}
            </h1>
            <p className="mt-5 text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl animate-fade-up stagger-1">
              {sectionValue('hero', 'description', 'Connecting Afghan students across Malaysia through education, leadership, opportunity, culture, and community.')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up stagger-2">
              <Link
                href={sectionHref('hero', 'button_url', '/membership')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gold text-navy font-bold text-base shadow-gold hover:scale-[1.03] transition-all duration-300"
              >
                {sectionValue('hero', 'button_text', 'Become a Member')}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href={sectionHref('hero', 'secondary_button_url', '/about')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-navy/20 text-navy font-semibold text-base hover:bg-navy/5 transition-all duration-300"
              >
                {sectionValue('hero', 'secondary_button_text', 'Explore ASAM')}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-fade-in stagger-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</div>
          <div className="w-px h-12 bg-gradient-to-b from-navy/30 to-transparent" />
        </div>
      </section>

      {/* INTRODUCTION */}
      <section style={sectionStyle('introduction')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">{sectionValue('introduction', 'subtitle', 'Introduction')}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-5 text-balance">
                {sectionValue('introduction', 'title', 'A national platform for Afghan students in Malaysia')}
              </h2>
              <div className="space-y-4 text-sm lg:text-base text-muted-foreground leading-relaxed">
                {sectionValue('introduction', 'description', 'ASAM is being built to serve as a national platform connecting Afghan students studying at universities across Malaysia. From Kuala Lumpur to Penang, from Johor to Sabah, we are creating a unified community that supports, empowers, and represents its members.').split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
              <Link
                href={sectionHref('introduction', 'button_url', '/about')}
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-gold-dark hover:gap-3 transition-all"
              >
                {sectionValue('introduction', 'button_text', 'Learn more about ASAM')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: GraduationCap, label: 'Academic Support', desc: 'Scholarships, mentorship, research' },
                  { icon: Briefcase, label: 'Career Development', desc: 'Internships, networking, CV support' },
                  { icon: Heart, label: 'Student Welfare', desc: 'Orientation, peer support' },
                  { icon: Users, label: 'Community', desc: 'Events, culture, sports' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 mb-4">
                      <item.icon className="h-6 w-6 text-navy" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section style={sectionStyle('vision')} className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 lg:p-12 rounded-3xl border border-border bg-card shadow-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-navy mb-6">
                <Globe2 className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold mb-4">{sectionValue('vision', 'title', 'Our Vision')}</h3>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">{sectionValue('vision', 'description', 'To build a connected, empowered, and thriving Afghan student community across Malaysia — one where every student has access to support, opportunity, and a sense of belonging, regardless of which university they attend.')}</p>
            </div>
            <div className="p-8 lg:p-12 rounded-3xl border border-border bg-card shadow-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold mb-6">
                <TrendingUp className="h-7 w-7 text-navy" />
              </div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold mb-4">{sectionValue('mission', 'title', 'Our Mission')}</h3>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">{sectionValue('mission', 'description', 'To connect Afghan students across Malaysian universities through academic collaboration, student welfare, professional development, cultural engagement, leadership, and community building — creating a national platform that serves and empowers its members.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT ASAM DOES */}
      <section style={sectionStyle('what_asam_does')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('what_asam_does', 'subtitle', 'What We Do')}
            title={sectionValue('what_asam_does', 'title', 'Building a comprehensive student ecosystem')}
            description={sectionValue('what_asam_does', 'description', 'ASAM operates across twelve key areas, each managed by a dedicated department focused on serving the needs of Afghan students in Malaysia.')}
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicDepartments.slice(0, 6).map((dept, i) => (
              <Link
                key={dept.id}
                href={`/departments#${dept.id}`}
                className="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:gradient-navy transition-all duration-300">
                    <dept.icon className="h-6 w-6 text-navy group-hover:text-gold transition-colors" />
                  </div>
                  <span className="font-display text-2xl font-bold text-border group-hover:text-gold/30 transition-colors">
                    {dept.number}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{dept.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{dept.mission}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-dark group-hover:gap-2 transition-all">
                  Explore Department
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={sectionHref('what_asam_does', 'button_url', '/departments')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary/60 transition-all"
            >
              {sectionValue('what_asam_does', 'button_text', 'View All 12 Departments')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section style={sectionStyle('leadership')} className="py-16 lg:py-20 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold">{sectionValue('leadership', 'subtitle', 'Leadership')}</span>
              <span className="h-px w-8 bg-gold" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance">
              {sectionValue('leadership', 'title', 'Founded by students, for students')}
            </h2>
            <p className="mt-4 text-lg text-white/60 leading-relaxed">
              {sectionValue('leadership', 'description', 'Meet the founding leadership team building ASAM from the ground up.')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {publicLeadership.map((member, i) => (
              <div
                key={member.id}
                className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-start gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                      {member.photo_url ? <img src={member.photo_url} alt={member.name} className="absolute inset-0 h-full w-full object-cover"/> : <span className="font-display text-2xl font-bold text-gold">
                        {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">
                      {member.title}
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-white/60 mt-2 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={sectionHref('leadership', 'button_url', '/leadership')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              {sectionValue('leadership', 'button_text', 'Meet the Full Team')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS OVERVIEW */}
      <section style={sectionStyle('departments_overview')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('departments_overview', 'subtitle', 'Departments')}
            title={sectionValue('departments_overview', 'title', 'Twelve departments, one mission')}
            description={sectionValue('departments_overview', 'description', 'Each department focuses on a specific area of student life, working together to create a comprehensive support system.')}
          />
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {publicDepartments.map((dept, i) => (
              <Link
                key={dept.id}
                href={`/departments#${dept.id}`}
                className="group flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card hover:shadow-premium hover:border-gold/30 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5 group-hover:gradient-navy transition-all duration-300 mb-3">
                  <dept.icon className="h-7 w-7 text-navy group-hover:text-gold transition-colors" />
                </div>
                <span className="text-xs font-bold text-gold-dark mb-1">{dept.number}</span>
                <h3 className="text-sm font-semibold leading-tight">{dept.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT NETWORK */}
      <section style={sectionStyle('student_network')} className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">{sectionValue('student_network', 'subtitle', 'Student Network')}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
                {sectionValue('student_network', 'title', 'From Kabul to Kuala Lumpur')}
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                {sectionValue('student_network', 'description', 'Afghan students in Malaysia are not isolated university-by-university. They are part of a connected community. ASAM is building the network that makes this connection real — through chapters, events, programs, and digital tools.')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <Users className="h-6 w-6 text-gold mb-2" />
                  <div className="text-sm font-semibold">Connected Community</div>
                  <div className="text-xs text-muted-foreground mt-1">Across all Malaysian universities</div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <Globe2 className="h-6 w-6 text-gold mb-2" />
                  <div className="text-sm font-semibold">National Network</div>
                  <div className="text-xs text-muted-foreground mt-1">From coast to coast</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                {!publicChapters.length && <p className="col-span-3 rounded-xl border border-dashed border-border bg-card p-5 text-center text-xs text-muted-foreground">Chapter locations will appear here when published.</p>}
                {publicChapters.map((chapter, i) => (
                  <div
                    key={chapter.id}
                    className="aspect-square p-3 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center hover:border-gold/30 hover:shadow-premium transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <MapPin className="h-4 w-4 text-gold mb-1" />
                    <div className="text-xs font-semibold leading-tight">{chapter.state}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {chapter.status === 'coming_soon' ? 'Coming Soon' : 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      <section style={sectionStyle('chapters')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('chapters', 'subtitle', 'Chapters')}
            title={sectionValue('chapters', 'title', 'A growing national network')}
            description={sectionValue('chapters', 'description', 'ASAM is building state, city, and university chapters across Malaysia. Chapter information will appear here as new chapters are established.')}
          />
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {!publicChapters.length && <p className="col-span-full rounded-xl border border-dashed border-border bg-card p-5 text-center text-sm text-muted-foreground">No published chapter locations yet.</p>}
            {publicChapters.slice(0, 8).map((chapter, i) => (
              <div
                key={chapter.id}
                className="group p-5 rounded-2xl border border-border bg-card hover:shadow-premium transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <MapPin className="h-5 w-5 text-gold" />
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-1 rounded-full',
                    chapter.status === 'coming_soon'
                      ? 'bg-gold/10 text-gold-dark'
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    {chapter.status === 'coming_soon' ? 'Coming Soon' : 'Active'}
                  </span>
                </div>
                <h3 className="font-semibold text-sm">{chapter.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{[chapter.city, chapter.state, chapter.university].filter(Boolean).join(' · ')}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={sectionHref('chapters', 'button_url', '/chapters')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary/60 transition-all"
            >
              {sectionValue('chapters', 'button_text', 'Explore the Chapter Network')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section style={sectionStyle('events')} className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('events', 'subtitle', 'Events')}
            title={sectionValue('events', 'title', 'Upcoming events and programs')}
            description={sectionValue('events', 'description', "Discover what's happening across the ASAM community. From workshops to conferences, there's something for every student.")}
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!publicEvents.length && <div className="col-span-full"><EmptyState title="No Upcoming Events Yet" message="Published ASAM events will appear here when available."/></div>}
            {publicEvents.map((event, i) => (
              <div
                key={event.id}
                className="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {event.featured_image_url && <img src={event.featured_image_url} alt="" className="mb-4 h-40 w-full rounded-xl object-cover"/>}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                  <span className={cn(
                    'text-xs font-semibold px-3 py-1 rounded-full',
                    event.date && new Date(`${event.date}T${event.time || '23:59'}`) >= new Date() ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'
                  )}>
                    {event.date && new Date(`${event.date}T${event.time || '23:59'}`) >= new Date() ? 'Upcoming' : 'Planned'}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location || 'Location TBA'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={sectionHref('events', 'button_url', '/events')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary/60 transition-all"
            >
              {sectionValue('events', 'button_text', 'View All Events')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section style={sectionStyle('opportunities')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">{sectionValue('opportunities', 'subtitle', 'Opportunities')}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
                {sectionValue('opportunities', 'title', 'Your gateway to academic and professional growth')}
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                {sectionValue('opportunities', 'description', 'ASAM is building a central hub for scholarships, internships, jobs, competitions, conferences, and volunteer opportunities. As our network grows, so will the opportunities available to our members.')}
              </p>
              <div className="flex flex-wrap gap-3">
                {['Scholarships', 'Internships', 'Jobs', 'Competitions', 'Conferences', 'Training'].map((cat) => (
                  <span key={cat} className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium">
                    {cat}
                  </span>
                ))}
              </div>
              <Link
                href={sectionHref('opportunities', 'button_url', '/opportunities')}
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-gold-dark hover:gap-3 transition-all"
              >
              {sectionValue('opportunities', 'button_text', 'Explore Opportunities')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, label: 'Academic Support', desc: 'Scholarships, mentorship, resources', href: '/academic' },
                { icon: Briefcase, label: 'Career & Entrepreneurship', desc: 'Jobs, internships, networking', href: '/career' },
                { icon: Heart, label: 'Student Welfare', desc: 'Support, orientation, resources', href: '/welfare' },
                { icon: Building2, label: 'Alumni Network', desc: 'Mentorship, connections, events', href: '/alumni' },
              ].map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 group-hover:gradient-navy transition-all duration-300 mb-4">
                    <item.icon className="h-6 w-6 text-navy group-hover:text-gold transition-colors" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMIC SUPPORT */}
      <section style={sectionStyle('academic_support')} className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('academic_support', 'subtitle', 'Academic Support')}
            title={sectionValue('academic_support', 'title', 'Excelling in your studies')}
            description={sectionValue('academic_support', 'description', "ASAM's Academic Affairs department provides resources, mentorship, and information to help you succeed academically.")}
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Scholarship Information', desc: 'Discover and apply for scholarships available to Afghan students in Malaysia.' },
              { icon: Users, title: 'Academic Mentorship', desc: 'Connect with mentors who can guide you through your academic journey.' },
              { icon: GraduationCap, title: 'Research Collaboration', desc: 'Find research partners and collaborate on academic projects.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-border bg-card shadow-premium animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 mb-4">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={sectionHref('academic_support', 'button_url', '/academic')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary/60 transition-all"
            >
              {sectionValue('academic_support', 'button_text', 'Visit the Academic Hub')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CAREER & ENTREPRENEURSHIP */}
      <section style={sectionStyle('career_entrepreneurship')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Briefcase, label: 'Career Development', desc: 'Career planning and guidance' },
                  { icon: Users, label: 'Professional Mentorship', desc: 'Connect with experienced mentors' },
                  { icon: TrendingUp, label: 'Entrepreneurship', desc: 'Support for student founders' },
                  { icon: BookOpen, label: 'CV & Interview Prep', desc: 'Workshops and reviews' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="p-5 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 mb-3">
                      <item.icon className="h-5 w-5 text-navy" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">{sectionValue('career_entrepreneurship', 'subtitle', 'Career & Entrepreneurship')}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
                {sectionValue('career_entrepreneurship', 'title', 'Building professional pathways')}
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
                {sectionValue('career_entrepreneurship', 'description', "From your first internship to your first startup, ASAM's Career & Entrepreneurship department is here to support your professional journey in Malaysia and beyond.")}
              </p>
              <Link
                href={sectionHref('career_entrepreneurship', 'button_url', '/career')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gold-dark hover:gap-3 transition-all"
              >
                {sectionValue('career_entrepreneurship', 'button_text', 'Explore Career Resources')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CULTURAL COMMUNITY */}
      <section style={sectionStyle('cultural_community')} className="py-16 lg:py-20 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold">{sectionValue('cultural_community', 'subtitle', 'Culture & Community')}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
                {sectionValue('cultural_community', 'title', 'Celebrating Afghan heritage in Malaysia')}
              </h2>
              <p className="text-base lg:text-lg text-white/60 leading-relaxed mb-6">
                {sectionValue('cultural_community', 'description', 'Our culture is our identity. ASAM celebrates Afghan heritage — our language, our traditions, our arts, and our stories — while building bridges with Malaysian culture and the broader international community.')}
              </p>
              <div className="flex flex-wrap gap-3">
                {['Heritage', 'Language', 'Arts', 'Traditions', 'Stories', 'Festivals'].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full border border-white/20 text-sm text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={sectionHref('cultural_community', 'button_url', '/culture')}
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-gold hover:gap-3 transition-all"
              >
                {sectionValue('cultural_community', 'button_text', 'Explore Culture & Heritage')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, title: 'Community', desc: 'A family away from home' },
                { icon: Trophy, title: 'Sports', desc: 'Tournaments and recreation' },
                { icon: Sparkles, title: 'Arts', desc: 'Showcasing Afghan creativity' },
                { icon: Globe2, title: 'Intercultural', desc: 'Building bridges with Malaysia' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 mb-3">
                    <item.icon className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-white/50 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ALUMNI NETWORK */}
      <section style={sectionStyle('alumni_network')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('alumni_network', 'subtitle', 'Alumni Network')}
            title={sectionValue('alumni_network', 'title', 'A lifelong connection')}
            description={sectionValue('alumni_network', 'description', 'ASAM is building an alumni network that keeps Afghan graduates connected to the community — as mentors, supporters, and leaders.')}
          />
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8">
              {['Student', 'Graduate', 'Alumni', 'Mentor', 'Leader', 'Supporter'].map((stage, i) => (
                <div key={stage} className="flex items-center gap-4 lg:gap-8">
                  <div
                    className="px-6 py-3 rounded-xl border border-border bg-card shadow-premium font-display text-base font-bold animate-fade-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {stage}
                  </div>
                  {i < 5 && <ArrowRight className="h-5 w-5 text-gold hidden lg:block" />}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link
              href={sectionHref('alumni_network', 'button_url', '/alumni')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary/60 transition-all"
            >
              {sectionValue('alumni_network', 'button_text', 'Explore the Alumni Network')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST NEWS */}
      <section style={sectionStyle('latest_news')} className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('latest_news', 'subtitle', 'News & Stories')}
            title={sectionValue('latest_news', 'title', 'The latest from ASAM')}
            description={sectionValue('latest_news', 'description', 'Updates, announcements, and stories from the Afghan student community in Malaysia.')}
          />
          {publicNews.length ? <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">{publicNews.map((article) => <article key={article.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">{article.featured_image_url && <img src={article.featured_image_url} alt="" className="h-40 w-full object-cover"/>}<div className="p-5"><h3 className="font-display text-lg font-bold">{article.title}</h3>{article.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>}{article.publication_date && <p className="mt-4 text-xs text-muted-foreground">{new Date(article.publication_date).toLocaleDateString()}</p>}</div></article>)}</div> : <div className="mt-12"><EmptyState title="No Articles Yet" message="ASAM's news and stories will appear here as they are published." /></div>}
          <div className="mt-8 text-center">
            <Link
              href={sectionHref('latest_news', 'button_url', '/news')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary/60 transition-all"
            >
              {sectionValue('latest_news', 'button_text', 'Visit News & Stories')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PROGRAMS */}
      <section style={sectionStyle('featured_programs')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('featured_programs', 'subtitle', 'Flagship Initiatives')}
            title={sectionValue('featured_programs', 'title', 'Programs that define our future')}
            description={sectionValue('featured_programs', 'description', 'ASAM is developing a suite of flagship initiatives designed to create lasting impact for Afghan students in Malaysia.')}
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flagshipInitiatives.slice(0, 6).map((init, i) => (
              <div
                key={init.id}
                className="group p-6 rounded-2xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    'text-xs font-semibold px-3 py-1 rounded-full',
                    init.status === 'Active' ? 'bg-green-100 text-green-700'
                      : init.status === 'Planned' ? 'bg-gold/10 text-gold-dark'
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    {init.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{init.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{init.description}</p>
                <div className="text-xs text-muted-foreground">{init.department}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section style={sectionStyle('partners')} className="py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={sectionValue('partners', 'subtitle', 'Partners')}
            title={sectionValue('partners', 'title', 'Building institutional partnerships')}
            description={sectionValue('partners', 'description', 'ASAM is building relationships with universities, organizations, and companies. Partner information will appear here as partnerships are established.')}
          />
          {publicPartners.length ? <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{publicPartners.map((partner,i)=><div key={partner.id} className="animate-fade-up rounded-2xl border border-border bg-card p-4 text-center shadow-premium" style={{animationDelay:`${i*.05}s`}}>{partner.logo_url?<img loading="lazy" src={partner.logo_url} alt={`${partner.organization} logo`} className="mx-auto h-20 w-full object-contain"/>:<Building2 className="mx-auto my-6 h-8 w-8 text-muted-foreground/30"/>}<div className="mt-2 text-sm font-semibold">{partner.organization}</div>{partner.partner_type&&<div className="mt-1 text-xs text-muted-foreground">{partner.partner_type}</div>}</div>)}</div>:<div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">Confirmed ASAM partners will appear here when published.</div>}
          <div className="mt-8 text-center">
            <Link
              href={sectionHref('partners', 'button_url', '/partners')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-navy text-white font-semibold text-sm shadow-premium hover:shadow-premium-lg transition-all"
            >
              {sectionValue('partners', 'button_text', 'Become a Partner')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CTA */}
      <CTASection
        style={sectionStyle('membership_cta')}
        title={sectionValue('membership_cta', 'title', 'Join the ASAM community')}
        description={sectionValue('membership_cta', 'description', 'Become part of a growing national platform connecting Afghan students across Malaysia. Your journey starts here.')}
        primaryLabel={sectionValue('membership_cta', 'button_text', 'Become a Member')}
        primaryHref={sectionHref('membership_cta', 'button_url', '/membership')}
        secondaryLabel={sectionValue('membership_cta', 'secondary_button_text', 'Explore ASAM')}
        secondaryHref={sectionHref('membership_cta', 'secondary_button_url', '/about')}
      />

      {/* NEWSLETTER */}
      <section style={sectionStyle('newsletter')} className="py-16 lg:py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl lg:text-3xl font-bold mb-3">{sectionValue('newsletter', 'title', 'Stay Connected')}</h2>
            <p className="text-muted-foreground mb-6">
              {sectionValue('newsletter', 'description', 'Subscribe to receive ASAM updates, event announcements, and opportunities directly to your inbox.')}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-navy text-white font-semibold text-sm shadow-premium hover:shadow-premium-lg transition-all"
              >
                {sectionValue('newsletter', 'button_text', 'Subscribe')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
